import enum
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class UserStatus(str, enum.Enum):
    pending = "PENDING"
    active = "ACTIVE"
    rejected = "REJECTED"

class UserRole(str, enum.Enum):
    superadmin = "superadmin"
    admin = "admin"
    it_employee = "it_employee"
    employee = "employee"

class UserDepartment(str, enum.Enum):
    it = "IT"
    hc = "HC"
    finance = "Finance"
    marketing = "Marketing"
    sales = "Sales"
    operations = "Operations"
    procurement = "Procurement"
    legal = "Legal"
    rd = "R&D"
    qc = "QC"
    pr = "PR"

class TicketStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"

class TicketPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="department_rel")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.employee, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    status = Column(SQLEnum(UserStatus), default=UserStatus.pending, nullable=False)
    is_active = Column(Boolean, default=False)
    must_change_password = Column(Boolean, default=False, nullable=False)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # relationships
    approver = relationship("User", remote_side="User.id", foreign_keys=[approved_by])
    department_rel = relationship("Department", back_populates="users")
    tickets_requested = relationship("Ticket", foreign_keys="[Ticket.requester_id]", back_populates="requester")
    tickets_assigned = relationship("Ticket", foreign_keys="[Ticket.assignee_id]", back_populates="assignee")
    
    @property
    def department(self):
        """Return department name from relationship"""
        return self.department_rel.name if self.department_rel else None

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True, index=True)

    tickets = relationship("Ticket", back_populates="category")

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(SQLEnum(TicketStatus), default=TicketStatus.open, nullable=False)
    priority = Column(SQLEnum(TicketPriority), default=TicketPriority.low, nullable=False)
    
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("Category", back_populates="tickets")
    requester = relationship("User", foreign_keys=[requester_id], back_populates="tickets_requested")
    assignee = relationship("User", foreign_keys=[assignee_id], back_populates="tickets_assigned")


class ApprovalLog(Base):
    """Audit trail untuk semua aksi approval/rejection"""
    __tablename__ = "approval_logs"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(20), nullable=False)  # "APPROVED" or "REJECTED"
    department_assigned = Column(SQLEnum(UserDepartment), nullable=True)
    performed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    performed_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text, nullable=True)

    user = relationship("User", foreign_keys=[user_id])
    performer = relationship("User", foreign_keys=[performed_by])
