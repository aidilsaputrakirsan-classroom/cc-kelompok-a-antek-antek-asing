from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from models import User, Category, Ticket, UserRole, TicketStatus
from schemas import UserCreate, CategoryCreate, CategoryUpdate, TicketCreate, TicketUpdateEmployee, TicketUpdateAdmin
from auth import hash_password, verify_password

# --- USER ---
def create_user(db: Session, user_data: UserCreate, default_role: UserRole = UserRole.employee) -> User:
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        return None
    db_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hash_password(user_data.password),
        role=default_role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def get_users(db: Session, skip: int = 0, limit: int = 20):
    total = db.query(User).count()
    users = db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": users}

def update_user_role(db: Session, user_id: int, new_role: UserRole) -> User | None:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    db_user.role = new_role
    db.commit()
    db.refresh(db_user)
    return db_user

# --- CATEGORY ---
def create_category(db: Session, cat_data: CategoryCreate) -> Category:
    db_cat = Category(**cat_data.model_dump())
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

def get_categories(db: Session):
    return db.query(Category).order_by(Category.name.asc()).all()

def update_category(db: Session, cat_id: int, cat_data: CategoryUpdate) -> Category | None:
    db_cat = db.query(Category).filter(Category.id == cat_id).first()
    if not db_cat:
        return None
    update_data = cat_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_cat, field, value)
    db.commit()
    db.refresh(db_cat)
    return db_cat

def delete_category(db: Session, cat_id: int) -> bool:
    db_cat = db.query(Category).filter(Category.id == cat_id).first()
    if not db_cat:
        return False
    db.delete(db_cat)
    db.commit()
    return True

# --- TICKET ---
def create_ticket(db: Session, ticket_data: TicketCreate, requester_id: int) -> Ticket:
    db_ticket = Ticket(
        **ticket_data.model_dump(),
        requester_id=requester_id
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

def get_tickets(db: Session, skip: int = 0, limit: int = 20, requester_id: Optional[int] = None):
    query = db.query(Ticket)
    if requester_id is not None:
        query = query.filter(Ticket.requester_id == requester_id)
        
    total = query.count()
    tickets = query.order_by(Ticket.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": tickets}

def get_ticket(db: Session, ticket_id: int) -> Ticket | None:
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()

def update_ticket_employee(db: Session, ticket_id: int, ticket_data: TicketUpdateEmployee, requester_id: int) -> Ticket | None:
    db_ticket = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.requester_id == requester_id).first()
    if not db_ticket:
        return None
    update_data = ticket_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_ticket, field, value)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

def update_ticket_admin(db: Session, ticket_id: int, ticket_data: TicketUpdateAdmin) -> Ticket | None:
    db_ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not db_ticket:
        return None
    update_data = ticket_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_ticket, field, value)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

def delete_ticket(db: Session, ticket_id: int) -> bool:
    db_ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not db_ticket:
        return False
    db.delete(db_ticket)
    db.commit()
    return True

# --- DASHBOARD ---
def get_dashboard_metrics(db: Session):
    # Total tickets by status
    status_counts = db.query(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status).all()
    status_dict = {status.value: count for status, count in status_counts}
    
    # Total tickets by category
    category_counts = db.query(Category.name, func.count(Ticket.id)).join(Ticket, Category.id == Ticket.category_id).group_by(Category.name).all()
    category_dict = {name: count for name, count in category_counts}
    
    # Optional additions: priority counts
    priority_counts = db.query(Ticket.priority, func.count(Ticket.id)).group_by(Ticket.priority).all()
    priority_dict = {priority.value: count for priority, count in priority_counts}

    total_tickets = db.query(Ticket).count()

    return {
        "total_tickets": total_tickets,
        "by_status": status_dict,
        "by_category": category_dict,
        "by_priority": priority_dict
    }
