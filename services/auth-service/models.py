"""
Auth Service — Database models.

This service owns the `users` table exclusively.
Other services must call the /verify endpoint to authenticate users.
"""

import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from database import Base


class UserRole(str, enum.Enum):
    superadmin = "superadmin"
    admin = "admin"
    it_employee = "it_employee"
    employee = "employee"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.employee.value, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
