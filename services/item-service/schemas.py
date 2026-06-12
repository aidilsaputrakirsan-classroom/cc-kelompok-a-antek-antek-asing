"""
Item Service — Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class ItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=300)
    description: Optional[str] = Field(None, max_length=2000)
    price: float = Field(..., ge=0)
    quantity: int = Field(..., ge=0, le=10000)


class ItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=300)
    description: Optional[str] = Field(None, max_length=2000)
    price: Optional[float] = Field(None, ge=0)
    quantity: Optional[int] = Field(None, ge=0, le=10000)


class ItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    quantity: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ItemStatsResponse(BaseModel):
    """Response for GET /items/stats — Tugas Terstruktur Modul 12."""
    total_items: int
    total_value: float  # sum(price * quantity)
    highest_price: Optional[float] = None
    lowest_price: Optional[float] = None
