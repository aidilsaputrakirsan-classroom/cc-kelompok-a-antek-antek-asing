import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from models import UserRole, TicketStatus, TicketPriority

# --- User ---
class UserCreate(BaseModel):
    email: str = Field(..., examples=["user@student.itk.ac.id"])
    name: str = Field(..., min_length=2, max_length=100, examples=["Aidil Saputra"])
    password: str = Field(..., min_length=8, examples=["Password123!"])

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, value):
        email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(email_regex, value):
            raise ValueError("Format email tidak valid.")
        return value

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value):
        password_regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_])[A-Za-z\d@$!%*?&#_]{8,}$"
        if not re.match(password_regex, value):
            raise ValueError("Password terlalu lemah.")
        return value

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    role: UserRole

# --- Category ---
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Ticket ---
class TicketBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str
    priority: TicketPriority = TicketPriority.low
    category_id: int

class TicketCreate(TicketBase):
    pass

class TicketUpdateEmployee(BaseModel):
    """Employee can only update minor details, not status or assignee"""
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TicketPriority] = None

class TicketUpdateAdmin(BaseModel):
    """Admin/IT Employee can update status and assignee"""
    status: Optional[TicketStatus] = None
    assignee_id: Optional[int] = None

class TicketResponse(BaseModel):
    id: int
    title: str
    description: str
    status: TicketStatus
    priority: TicketPriority
    category_id: int
    requester_id: int
    assignee_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    requester: UserResponse
    assignee: Optional[UserResponse] = None
    category: CategoryResponse
    
    class Config:
        from_attributes = True

class TicketListResponse(BaseModel):
    total: int
    items: List[TicketResponse]

# --- Auth ---
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
