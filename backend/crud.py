from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from models import User, Category, Ticket, UserRole, UserStatus, UserDepartment, TicketStatus, ApprovalLog
from schemas import (
    UserCreate, CategoryCreate, CategoryUpdate, TicketCreate,
    TicketUpdateEmployee, TicketUpdateAdmin, ApproveUserRequest, RejectUserRequest
)
from auth import hash_password, verify_password

# --- USER ---
def create_user(db: Session, user_data: UserCreate, default_role: UserRole = UserRole.employee, auto_active: bool = False) -> User:
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        return None
    db_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hash_password(user_data.password),
        role=default_role,
        status=UserStatus.active if auto_active else UserStatus.pending,
        is_active=auto_active
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

def get_users(db: Session, skip: int = 0, limit: int = 20, allowed_roles: Optional[list[UserRole]] = None):
    query = db.query(User)
    if allowed_roles:
        query = query.filter(User.role.in_(allowed_roles))
    total = query.count()
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": users}

def update_user_role(db: Session, user_id: int, new_role: UserRole) -> User | None:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    db_user.role = new_role
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_department(db: Session, user_id: int, new_department: UserDepartment) -> User | None:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    db_user.department = new_department
    db.commit()
    db.refresh(db_user)
    return db_user


# --- APPROVAL WORKFLOW ---
def get_pending_users(db: Session, skip: int = 0, limit: int = 20):
    query = db.query(User).filter(User.status == UserStatus.pending)
    total = query.count()
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": users}


def approve_user(db: Session, user_id: int, data: ApproveUserRequest, admin_id: int) -> User | None:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    if db_user.status != UserStatus.pending:
        return None  # hanya user PENDING yang bisa di-approve

    now = datetime.now(timezone.utc)
    db_user.status = UserStatus.active
    db_user.is_active = True
    db_user.department = data.department
    db_user.approved_by = admin_id
    db_user.approved_at = now

    # Audit log
    log = ApprovalLog(
        user_id=user_id,
        action="APPROVED",
        department_assigned=data.department,
        performed_by=admin_id,
        performed_at=now,
    )
    db.add(log)
    db.commit()
    db.refresh(db_user)
    return db_user


def reject_user(db: Session, user_id: int, admin_id: int, notes: Optional[str] = None) -> User | None:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    if db_user.status != UserStatus.pending:
        return None  # hanya user PENDING yang bisa di-reject

    now = datetime.now(timezone.utc)
    db_user.status = UserStatus.rejected
    db_user.is_active = False

    # Audit log
    log = ApprovalLog(
        user_id=user_id,
        action="REJECTED",
        performed_by=admin_id,
        performed_at=now,
        notes=notes,
    )
    db.add(log)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_approval_logs(db: Session, user_id: Optional[int] = None, skip: int = 0, limit: int = 50):
    query = db.query(ApprovalLog)
    if user_id:
        query = query.filter(ApprovalLog.user_id == user_id)
    total = query.count()
    logs = query.order_by(ApprovalLog.performed_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": logs}

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
