from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional
from models import User, Category, Ticket, UserRole, UserStatus, UserDepartment, TicketStatus, ApprovalLog, Department
from schemas import (
    UserCreate, CategoryCreate, CategoryUpdate, TicketCreate,
    TicketUpdateEmployee, TicketUpdateAdmin, ApproveUserRequest, RejectUserRequest
)
from sqlalchemy.exc import IntegrityError
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
    query = db.query(User).options(joinedload(User.department_rel))
    # Only show ACTIVE users in Team Member list
    query = query.filter(User.status == UserStatus.active)
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

def update_user_department(db: Session, user_id: int, department_id: int) -> User | None:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    db_user.department_id = department_id
    db.commit()
    db.refresh(db_user)
    return db_user

def create_superadmin(db: Session, email: str, password: str) -> None:
    """Helper specifically for seeding the superadmin based on env variables"""
    existing_admin = db.query(User).filter(User.email == email).first()
    if not existing_admin:
        sa = User(
            email=email,
            name="System Superadmin",
            hashed_password=hash_password(password),
            role=UserRole.superadmin,
            status=UserStatus.active,
            is_active=True,
            must_change_password=True  # Force change at first login
        )
        db.add(sa)
        db.commit()

def change_user_password(db: Session, user: User, new_password: str) -> bool:
    user.hashed_password = hash_password(new_password)
    user.must_change_password = False
    db.commit()
    db.refresh(user)
    return True


# --- APPROVAL WORKFLOW ---
def get_pending_users(db: Session, skip: int = 0, limit: int = 20):
    query = db.query(User).options(joinedload(User.department_rel)).filter(User.status == UserStatus.pending)
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
    db_user.department_id = data.department_id
    db_user.approved_by = admin_id
    db_user.approved_at = now

    # Audit log
    log = ApprovalLog(
        user_id=user_id,
        action="APPROVED",
        department_assigned=None,
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
    return db.query(Category).filter(Category.deleted_at.is_(None)).order_by(Category.name.asc()).all()

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
    
    # 1. Handle not found or already deleted
    if not db_cat or db_cat.deleted_at is not None:
        return False
        
    # 2. Optimized Data Integrity Guard (Using first/exists instead of count)
    ticket_exists = db.query(Ticket).filter(Ticket.category_id == cat_id).first()
    if ticket_exists:
        raise ValueError("Category cannot be deleted because it is still used by existing ticket(s).")
        
    # 3. DB-Level Safety Fallback & Soft Delete
    try:
        db_cat.deleted_at = datetime.now(timezone.utc)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
        
    return True

# --- DEPARTMENT ---
def create_department(db: Session, dept_data) -> Department:
    db_dept = Department(**dept_data.model_dump())
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept

def get_departments(db: Session):
    return db.query(Department).order_by(Department.name.asc()).all()

def update_department(db: Session, dept_id: int, dept_data) -> Department | None:
    db_dept = db.query(Department).filter(Department.id == dept_id).first()
    if not db_dept:
        return None
    update_data = dept_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_dept, field, value)
    db.commit()
    db.refresh(db_dept)
    return db_dept

def delete_department(db: Session, dept_id: int) -> bool:
    db_dept = db.query(Department).filter(Department.id == dept_id).first()
    if not db_dept:
        return False
    db.delete(db_dept)
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
        
    # Prevent edits if ticket is already resolved or closed (only open and in_progress are mutable by employee)
    if db_ticket.status in [TicketStatus.resolved, TicketStatus.closed]:
        raise ValueError("Cannot modify ticket that has been resolved or closed")
        
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
