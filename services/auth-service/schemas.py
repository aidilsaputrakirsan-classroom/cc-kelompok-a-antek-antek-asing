"""
Auth Service — Pydantic schemas for request/response validation.
"""

import re
from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    email: str = Field(..., examples=["user@student.itk.ac.id"])
    name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(pattern, v):
            raise ValueError("Format email tidak valid.")
        return v.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        pattern = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_])[A-Za-z\d@$!%*?&#_]{8,}$"
        if not re.match(pattern, v):
            raise ValueError(
                "Password minimal 8 karakter, mengandung huruf besar, kecil, angka, dan simbol."
            )
        return v


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class VerifyResponse(BaseModel):
    """Response from GET /verify — consumed by other microservices."""
    id: int
    email: str
    name: str
    role: str
