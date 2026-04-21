import re
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime
from models import UserRole, UserStatus, TicketStatus, TicketPriority, UserDepartment

# --- Department ---
class DepartmentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class DepartmentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)

class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)

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
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
    name: str
    role: UserRole
    department_id: Optional[int] = None
    department: Optional[str] = None  # Department name (manually set from relationship in CRUD)
    status: UserStatus
    is_active: bool
    avatar_index: int = 0
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    created_at: datetime

class RegisterResponse(BaseModel):
    user: UserResponse
    message: str

class UserRoleUpdate(BaseModel):
    role: UserRole

class UserDepartmentUpdate(BaseModel):
    department_id: Optional[int] = None

class UserAvatarUpdate(BaseModel):
    avatar_index: int = Field(..., ge=0, le=9)

class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[str] = Field(None)
    
    @field_validator("email")
    @classmethod
    def validate_email_format(cls, value):
        if value is None:
            return value
        email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(email_regex, value):
            raise ValueError("Format email tidak valid.")
        return value.lower()

class ApproveUserRequest(BaseModel):
    department_id: int

class RejectUserRequest(BaseModel):
    notes: Optional[str] = Field(None, max_length=500, examples=["Data tidak valid"])

class ApprovalLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    department_assigned: Optional[UserDepartment] = None
    performed_by: int
    performed_at: datetime
    notes: Optional[str] = None
    class Config:
        from_attributes = True

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8, examples=["NewStrongPassword123!"])

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, value):
        password_regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_])[A-Za-z\d@$!%*?&#_]{8,}$"
        if not re.match(password_regex, value):
            raise ValueError("Katasandi baru terlalu lemah. Minimal 8 karakter mencakup huruf besar, kecil, angka, dan simbol khusus.")
        return value

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
