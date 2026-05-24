from typing import Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import engine, get_db, SessionLocal, check_db_connection
from models import Base, User, UserRole, UserStatus, UserDepartment, Department, NotificationType
from schemas import (
    UserCreate, UserResponse, RegisterResponse, LoginRequest, TokenResponse,
    UserRoleUpdate, UserDepartmentUpdate, UserAvatarUpdate, UserProfileUpdate, ChangePasswordRequest,
    ApproveUserRequest, RejectUserRequest, ApprovalLogResponse,
    DepartmentResponse, DepartmentCreate, DepartmentUpdate,
    CategoryCreate, CategoryUpdate, CategoryResponse,
    TicketCreate, TicketUpdateEmployee, TicketUpdateAdmin, TicketResponse, TicketListResponse,
    NotificationResponse, NotificationListResponse, VerifyResponse
)
from fastapi.security.utils import get_authorization_scheme_param
from auth import create_access_token, get_current_user, get_current_unverified_user, RoleChecker, hash_password, verify_password, oauth2_scheme, token_blacklist, decode_token
import crud
from config import settings



@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        crud.create_superadmin(db, settings.SUPERADMIN_EMAIL, settings.SUPERADMIN_PASSWORD)

        from models import Department
        default_departments = [
            {"name": "IT", "description": "Information Technology - System & Network Support"},
            {"name": "Finance", "description": "Finance & Accounting"},
            {"name": "HR", "description": "Human Resources"},
            {"name": "Operations", "description": "Operations & Logistics"},
            {"name": "Sales", "description": "Sales & Marketing"}
        ]
        for dept in default_departments:
            existing_dept = db.query(Department).filter(Department.name == dept["name"]).first()
            if not existing_dept:
                new_dept = Department(name=dept["name"], description=dept["description"])
                db.add(new_dept)
        db.commit()

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
    title="Auth & Ticket Service",
    description="Microservice for Authentication, Users, and Ticketing",
    version="1.0.0",
    lifespan=lifespan
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

allow_it_and_admins = RoleChecker([UserRole.superadmin, UserRole.admin, UserRole.it_employee])
allow_admins = RoleChecker([UserRole.superadmin, UserRole.admin])

@app.get("/")
def read_root():
    return {"message": "Auth & Ticket Service API Online. Visit /docs"}

# === AUTH & USER IDENTITY (No /auth prefix due to Gateway stripping) ===
@app.post("/register", response_model=RegisterResponse, status_code=201)
@limiter.limit("3/minute")
def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    user = crud.create_user(db=db, user_data=user_data, default_role=UserRole.employee)
    if not user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    return {
        "user": user,
        "message": "Registrasi berhasil. Akun Anda menunggu persetujuan admin."
    }

@app.get("/health")
def health_check():
    db_healthy = check_db_connection()
    overall_status = "healthy" if db_healthy else "degraded"
    return {
        "status": overall_status,
        "environment": settings.ENVIRONMENT,
        "version": app.version,
        "checks": {
            "database": "connected" if db_healthy else "disconnected",
        },
    }

@app.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db=db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Email atau password salah")
    
    if user.status == UserStatus.pending:
        raise HTTPException(status_code=403, detail="Your account is awaiting approval.")
    if user.status == UserStatus.rejected:
        raise HTTPException(status_code=403, detail="Your account has been rejected. Please contact admin.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Akun tidak aktif. Hubungi admin.")
    
    token = create_access_token(data={"sub": str(user.id)})
    
    message = "Login berhasil."
    if user.must_change_password:
        message = "WARNING: You are using the default credentials. You must change your password immediately."
        
    return {"access_token": token, "token_type": "bearer", "user": user, "detail": message}

@app.post("/change-password")
def change_password(
    data: ChangePasswordRequest, 
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_unverified_user)
):
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Password lama salah")
    
    crud.change_user_password(db, current_user, data.new_password)
    payload = decode_token(token)
    jti = payload.get("jti")
    if jti:
        token_blacklist.add(jti)
    return {"message": "Password berhasil diubah. Silakan login kembali dengan password baru."}

@app.get("/verify", response_model=VerifyResponse)
def verify_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Validate a JWT token and return the authenticated user's identity."""
    payload = decode_token(token)
    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        raise HTTPException(status_code=401, detail="Token tidak valid")
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise HTTPException(status_code=401, detail="Token tidak valid")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User tidak ditemukan")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Akun tidak aktif")

    return VerifyResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role.value if isinstance(user.role, UserRole) else user.role,
    )

@app.post("/logout")
def logout(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    jti = payload.get("jti")
    if jti:
        token_blacklist.add(jti)
    return {"message": "Logout berhasil"}

@app.put("/me", response_model=UserResponse)
def update_profile(
    profile_update: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        update_data = profile_update.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="Tidak ada data yang diubah")
            
        updated = crud.update_user_profile(db, current_user.id, update_data)
        if not updated:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Email sudah digunakan oleh pengguna lain.")

@app.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# === USERS (Admin Only or Self) ===
@app.get("/users", dependencies=[Depends(allow_it_and_admins)])
def list_users(
    skip: int = Query(0, ge=0), 
    limit: int = Query(20, ge=1), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.superadmin:
        result = crud.get_users(db, skip, limit)
    else:
        result = crud.get_users(db, skip, limit, allowed_roles=[UserRole.employee, UserRole.it_employee])
    
    items = []
    for user in result["items"]:
        user_response = UserResponse.model_validate(user)
        user_dict = user_response.model_dump(exclude={"department_rel", "hashed_password", "approver", "tickets_requested", "tickets_assigned"})
        items.append(user_dict)
    
    return {"total": result["total"], "items": items}

@app.put("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int, 
    role_update: UserRoleUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admins)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    if target_user.id == current_user.id:
        raise HTTPException(status_code=403, detail="Anda tidak dapat mengubah role akun Anda sendiri")

    if current_user.role == UserRole.superadmin:
        if role_update.role == UserRole.superadmin:
            raise HTTPException(status_code=403, detail="Superadmin tidak dapat menaikkan user lain menjadi superadmin")

    elif current_user.role == UserRole.admin:
        if target_user.role in [UserRole.superadmin, UserRole.admin]:
            raise HTTPException(status_code=403, detail="Admin tidak dapat mengubah role dari admin lain atau superadmin")
        if role_update.role in [UserRole.superadmin, UserRole.admin]:
            raise HTTPException(status_code=403, detail="Admin tidak dapat memberikan role admin atau superadmin kepada user")

    updated = crud.update_user_role(db, user_id, role_update.role)
    return updated

@app.put("/users/me/department", response_model=UserResponse)
def assign_department(
    dept_update: UserDepartmentUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    updated = crud.update_user_department(db, current_user.id, dept_update.department_id)
    if not updated:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    return updated

@app.put("/users/me/avatar", response_model=UserResponse)
def update_avatar(
    avatar_update: UserAvatarUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        updated = crud.update_user_avatar(db, current_user.id, avatar_update.avatar_index)
        if not updated:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# === ADMIN: USER APPROVAL WORKFLOW ===
@app.get("/admin/pending-users", dependencies=[Depends(allow_admins)])
def list_pending_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1),
    db: Session = Depends(get_db)
):
    result = crud.get_pending_users(db, skip, limit)
    
    items = []
    for user in result["items"]:
        user_response = UserResponse.model_validate(user)
        user_dict = user_response.model_dump(exclude={"department_rel", "hashed_password", "approver", "tickets_requested", "tickets_assigned"})
        items.append(user_dict)
    
    return {"total": result["total"], "items": items}

@app.post("/admin/approve-user/{user_id}", response_model=UserResponse)
def approve_user(
    user_id: int,
    data: ApproveUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admins)
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    if target.status != UserStatus.pending:
        raise HTTPException(status_code=400, detail="User tidak dalam status PENDING")
    
    result = crud.approve_user(db, user_id, data, admin_id=current_user.id)
    if not result:
        raise HTTPException(status_code=400, detail="Gagal meng-approve user")
    return result

@app.post("/admin/reject-user/{user_id}", response_model=UserResponse)
def reject_user(
    user_id: int,
    data: RejectUserRequest = RejectUserRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admins)
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    if target.status != UserStatus.pending:
        raise HTTPException(status_code=400, detail="User tidak dalam status PENDING")
    
    result = crud.reject_user(db, user_id, admin_id=current_user.id, notes=data.notes)
    if not result:
        raise HTTPException(status_code=400, detail="Gagal me-reject user")
    return result

@app.put("/admin/users/{user_id}/department", response_model=UserResponse)
def update_user_department_admin(
    user_id: int,
    data: UserDepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admins)
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    
    if data.department_id is not None:
        dept = db.query(Department).filter(Department.id == data.department_id).first()
        if not dept:
            raise HTTPException(status_code=404, detail="Department tidak ditemukan")
    
    updated = crud.update_user_department(db, user_id, data.department_id)
    return updated

@app.post("/admin/departments", response_model=DepartmentResponse, status_code=201)
def create_department_endpoint(
    dept_data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admins)
):
    new_dept = crud.create_department(db, dept_data)
    return new_dept

@app.get("/admin/departments", response_model=list[DepartmentResponse], dependencies=[Depends(allow_it_and_admins)])
def list_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.get_departments(db)

@app.put("/admin/departments/{dept_id}", response_model=DepartmentResponse)
def update_department_endpoint(
    dept_id: int,
    dept_data: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admins)
):
    updated = crud.update_department(db, dept_id, dept_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Department tidak ditemukan")
    return updated

@app.delete("/admin/departments/{dept_id}", status_code=204)
def delete_department_endpoint(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admins)
):
    success = crud.delete_department(db, dept_id)
    if not success:
        raise HTTPException(status_code=404, detail="Department tidak ditemukan")

@app.get("/admin/approval-logs")
def get_approval_logs(
    user_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admins)
):
    return crud.get_approval_logs(db, user_id=user_id, skip=skip, limit=limit)

# === CATEGORIES ===
@app.get("/categories", response_model=list[CategoryResponse])
def get_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.get_categories(db)

@app.post("/categories", response_model=CategoryResponse, status_code=201, dependencies=[Depends(allow_admins)])
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db, category)

@app.put("/categories/{cat_id}", response_model=CategoryResponse, dependencies=[Depends(allow_admins)])
def update_category(cat_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    updated = crud.update_category(db, cat_id, category)
    if not updated:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
    return updated

@app.delete("/categories/{cat_id}", status_code=204, dependencies=[Depends(allow_admins)])
def delete_category(cat_id: int, db: Session = Depends(get_db)):
    try:
        deleted = crud.delete_category(db, cat_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Database integrity constraint failed. Category cannot be modified safely.")
    return None

# === TICKETS ===
@app.post("/tickets", response_model=TicketResponse, status_code=201)
def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.create_ticket(db, ticket, requester_id=current_user.id)

@app.get("/tickets", response_model=TicketListResponse)
def list_tickets(
    skip: int = Query(0, ge=0), limit: int = Query(20, ge=1),
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    req_id = current_user.id if current_user.role == UserRole.employee else None
    return crud.get_tickets(db, skip=skip, limit=limit, requester_id=req_id)

@app.get("/tickets/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ticket = crud.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Tiket tidak ditemukan")
    if current_user.role == UserRole.employee and ticket.requester_id != current_user.id:
        raise HTTPException(status_code=403, detail="Anda tidak berhak melihat tiket ini")
    return ticket

@app.put("/tickets/{ticket_id}/employee", response_model=TicketResponse)
def update_ticket_by_employee(
    ticket_id: int, ticket: TicketUpdateEmployee, 
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    try:
        updated = crud.update_ticket_employee(db, ticket_id, ticket, requester_id=current_user.id)
        if not updated:
            raise HTTPException(status_code=404, detail="Tiket tidak ditemukan atau Anda tidak berhak")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

@app.put("/tickets/{ticket_id}/admin", response_model=TicketResponse, dependencies=[Depends(allow_it_and_admins)])
def update_ticket_by_admin(
    ticket_id: int, ticket: TicketUpdateAdmin, 
    db: Session = Depends(get_db)
):
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

# === NOTIFICATIONS ===
@app.get("/notifications", response_model=NotificationListResponse)
def get_notifications(
    skip: int = Query(0, ge=0), limit: int = Query(20, ge=1),
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return crud.get_user_notifications(db, current_user.id, skip, limit)

@app.put("/notifications/{notif_id}/read")
def read_notification(
    notif_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    success = crud.mark_notification_read(db, notif_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Notifikasi tidak ditemukan")
    return {"message": "Notifikasi ditandai sudah dibaca"}

@app.put("/notifications/read-all")
def read_all_notifications(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    updated_count = crud.mark_all_notifications_read(db, current_user.id)
    return {"message": f"{updated_count} notifikasi ditandai sudah dibaca"}

# === DASHBOARD ===
@app.get("/dashboard", dependencies=[Depends(allow_it_and_admins)])
def get_dashboard(db: Session = Depends(get_db)):
    return crud.get_dashboard_metrics(db)

@app.get("/dashboard/department-analytics", dependencies=[Depends(allow_it_and_admins)])
def get_department_analytics(db: Session = Depends(get_db)):
    return crud.get_department_analytics(db)

@app.get("/dashboard/response-time-analytics", dependencies=[Depends(allow_it_and_admins)])
def get_response_time_analytics(db: Session = Depends(get_db)):
    return crud.get_response_time_analytics(db)
