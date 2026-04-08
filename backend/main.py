import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import engine, get_db, SessionLocal
from models import Base, User, UserRole
from schemas import (
    UserCreate, UserResponse, LoginRequest, TokenResponse, UserRoleUpdate,
    CategoryCreate, CategoryUpdate, CategoryResponse,
    TicketCreate, TicketUpdateEmployee, TicketUpdateAdmin, TicketResponse, TicketListResponse
)
from auth import create_access_token, get_current_user, RoleChecker, hash_password
import crud

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Seed default data
    db = SessionLocal()
    try:
        # 1. Superadmin
        superadmin_email = os.getenv("SUPERADMIN_EMAIL", "superadmin@admin.com")
        superadmin_password = os.getenv("SUPERADMIN_PASSWORD", "Superadmin123!")
        
        existing_admin = db.query(User).filter(User.email == superadmin_email).first()
        if not existing_admin:
            sa = User(
                email=superadmin_email,
                name="System Superadmin",
                hashed_password=hash_password(superadmin_password),
                role=UserRole.superadmin
            )
            db.add(sa)
            db.commit()

        # 2. Categories
        from models import Category
        default_categories = [
            {"name": "Hardware", "description": "Isu terkait perangkat keras (Laptop, Mouse, Monitor)"},
            {"name": "Software", "description": "Isu terkait aplikasi dan sistem operasi"},
            {"name": "Network", "description": "Isu terkait koneksi internet dan jaringan kantor"},
            {"name": "Other", "description": "Hal-hal lain di luar kategori yang ada"}
        ]
        
        for cat in default_categories:
            ext = db.query(Category).filter(Category.name == cat["name"]).first()
            if not ext:
                new_cat = Category(name=cat["name"], description=cat["description"])
                db.add(new_cat)
        db.commit()
    finally:
        db.close()
    
    yield

app = FastAPI(
    title="IT Support Ticketing API",
    description="REST API untuk aplikasi Ticketing IT Support",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
# Kita set default-nya untuk Vite (5173) dan React standar (3000)
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins_list = [origin.strip() for origin in allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === DEP: ROLE CHECKERS ===
# Admin & Superadmin & IT_Employee
allow_it_and_admins = RoleChecker([UserRole.superadmin, UserRole.admin, UserRole.it_employee])
# Admin & Superadmin
allow_admins = RoleChecker([UserRole.superadmin, UserRole.admin])

@app.get("/")
def read_root():
    return {"message": "IT Support API Online. Visit /docs"}

# === AUTH ===
@app.post("/auth/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Pendaftaran publik otomatis mendapat role Employee"""
    user = crud.create_user(db=db, user_data=user_data, default_role=UserRole.employee)
    if not user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    return user

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/auth/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db=db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Email atau password salah")
    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}

@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/team")
def team_info():
    return {
        "team": "cloud-team-antek-antek-asing",
        "members": [
            {"name": "Muhammad Athala Romero", "nim": "10231059", "role": "Lead Backend"},
            {"name": "Muhammad Bagas Setiawan", "nim": "10231061", "role": "Lead Frontend"},
            {"name": "Muhammad Fikri Haikal Ariadma", "nim": "10231063", "role": "Lead DevOps"},
            {"name": "Nanda Aulia Putri", "nim": "10231067", "role": "Lead QA & Docs"},
        ]
    }

# === USERS (Admin Only) ===
@app.get("/users", dependencies=[Depends(allow_it_and_admins)])
def list_users(skip: int = Query(0, ge=0), limit: int = Query(20, ge=1), db: Session = Depends(get_db)):
    return crud.get_users(db, skip, limit)

@app.put("/users/{user_id}/role", response_model=UserResponse, dependencies=[Depends(allow_admins)])
def update_user_role(user_id: int, role_update: UserRoleUpdate, db: Session = Depends(get_db)):
    updated = crud.update_user_role(db, user_id, role_update.role)
    if not updated:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    return updated

# === CATEGORIES ===
@app.get("/categories", response_model=list[CategoryResponse])
def get_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Semua user terautentikasi bisa melihat kategori"""
    return crud.get_categories(db)

@app.post("/categories", response_model=CategoryResponse, status_code=201, dependencies=[Depends(allow_admins)])
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """Hanya Admin/Superadmin bisa buat kategori baru"""
    return crud.create_category(db, category)

@app.put("/categories/{cat_id}", response_model=CategoryResponse, dependencies=[Depends(allow_admins)])
def update_category(cat_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    updated = crud.update_category(db, cat_id, category)
    if not updated:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
    return updated

# === TICKETS ===
@app.post("/tickets", response_model=TicketResponse, status_code=201)
def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Semua user (Employee) bisa membuat tiket"""
    return crud.create_ticket(db, ticket, requester_id=current_user.id)

@app.get("/tickets", response_model=TicketListResponse)
def list_tickets(
    skip: int = Query(0, ge=0), limit: int = Query(20, ge=1),
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """
    Jika user adalah Employee, hanya tampilkan tiket miliknya.
    Jika admin/it_employee, tampilkan semua.
    """
    req_id = current_user.id if current_user.role == UserRole.employee else None
    return crud.get_tickets(db, skip=skip, limit=limit, requester_id=req_id)

@app.get("/tickets/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ticket = crud.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Tiket tidak ditemukan")
    # Cek hak akses jika Employee
    if current_user.role == UserRole.employee and ticket.requester_id != current_user.id:
        raise HTTPException(status_code=403, detail="Anda tidak berhak melihat tiket ini")
    return ticket

@app.put("/tickets/{ticket_id}/employee", response_model=TicketResponse)
def update_ticket_by_employee(
    ticket_id: int, ticket: TicketUpdateEmployee, 
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Employee meng-update tiket mereka sendiri (judul/deskripsi/prioritas)"""
    updated = crud.update_ticket_employee(db, ticket_id, ticket, requester_id=current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Tiket tidak ditemukan atau Anda tidak berhak")
    return updated

@app.put("/tickets/{ticket_id}/admin", response_model=TicketResponse, dependencies=[Depends(allow_it_and_admins)])
def update_ticket_by_admin(
    ticket_id: int, ticket: TicketUpdateAdmin, 
    db: Session = Depends(get_db)
):
    """IT Employee/Admin meng-update status atau assignee tiket"""
    updated = crud.update_ticket_admin(db, ticket_id, ticket)
    if not updated:
        raise HTTPException(status_code=404, detail="Tiket tidak ditemukan")
    return updated

@app.delete("/tickets/{ticket_id}", status_code=204, dependencies=[Depends(allow_admins)])
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    success = crud.delete_ticket(db, ticket_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tiket tidak ditemukan")
    return None

# === DASHBOARD ===
@app.get("/dashboard", dependencies=[Depends(allow_it_and_admins)])
def get_dashboard(db: Session = Depends(get_db)):
    """Mengambil metric untuk dashboard (Count & Chart Data)"""
    return crud.get_dashboard_metrics(db)
