"""
Item Service — Microservice for item/inventory management.

Endpoints:
  GET    /items        — List items owned by the authenticated user
  POST   /items        — Create a new item
  GET    /items/stats  — Get inventory statistics (Tugas Terstruktur)
  GET    /items/{id}   — Get a single item by ID
  PUT    /items/{id}   — Update an item
  DELETE /items/{id}   — Delete an item
  GET    /health       — Liveness probe

All endpoints (except /health) are protected by the Auth Service
via inter-service HTTP call through auth_client.get_current_user.
"""

from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy import func as sql_func
from sqlalchemy.orm import Session

from config import settings
from database import Base, engine, get_db, check_db_connection
from models import Item
from schemas import ItemCreate, ItemUpdate, ItemResponse, ItemStatsResponse
from auth_client import get_current_user
from shared.logging_config import setup_logging
from shared.logging_middleware import RequestLoggingMiddleware
from shared.metrics import metrics

setup_logging()


# ── Lifespan ────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


# ── FastAPI Application ────────────────────────────────────────
app = FastAPI(
    title="Item Service",
    description="Microservice for item/inventory CRUD — protected by Auth Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(RequestLoggingMiddleware)


# ── Health Check ────────────────────────────────────────────────
@app.get("/health")
def health_check():
    """Liveness probe for CI/CD smoke tests."""
    db_ok = check_db_connection()
    return {
        "service": "item-service",
        "status": "healthy" if db_ok else "degraded",
        "checks": {"database": "connected" if db_ok else "disconnected"},
    }


@app.get("/metrics")
def metrics_endpoint():
    return {"service": "item-service", **metrics.get_metrics()}


# ── CRUD Endpoints ─────────────────────────────────────────────
@app.post("/items", response_model=ItemResponse, status_code=201)
async def create_item(
    item_data: ItemCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create a new item owned by the authenticated user."""
    new_item = Item(
        name=item_data.name,
        description=item_data.description,
        price=item_data.price,
        quantity=item_data.quantity,
        owner_id=current_user["id"],
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@app.get("/items", response_model=list[ItemResponse])
async def list_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """List all items owned by the authenticated user."""
    items = (
        db.query(Item)
        .filter(Item.owner_id == current_user["id"])
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items


@app.get("/items/stats", response_model=ItemStatsResponse)
async def get_item_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Tugas Terstruktur — Inventory statistics for the authenticated user.

    Returns:
      - total_items:   jumlah item milik user
      - total_value:   sum(price * quantity) dari semua item user
      - highest_price: harga tertinggi dari item user
      - lowest_price:  harga terendah dari item user
    """
    query = db.query(Item).filter(Item.owner_id == current_user["id"])

    total_items = query.count()

    if total_items == 0:
        return ItemStatsResponse(
            total_items=0,
            total_value=0.0,
            highest_price=None,
            lowest_price=None,
        )

    # Aggregate stats in a single query for efficiency
    stats = db.query(
        sql_func.sum(Item.price * Item.quantity).label("total_value"),
        sql_func.max(Item.price).label("highest_price"),
        sql_func.min(Item.price).label("lowest_price"),
    ).filter(
        Item.owner_id == current_user["id"]
    ).first()

    return ItemStatsResponse(
        total_items=total_items,
        total_value=round(stats.total_value or 0.0, 2),
        highest_price=stats.highest_price,
        lowest_price=stats.lowest_price,
    )


@app.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get a single item by ID (must belong to the authenticated user)."""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item tidak ditemukan")
    if item.owner_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Anda tidak berhak mengakses item ini")
    return item


@app.put("/items/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: int,
    item_data: ItemUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Update an existing item (must belong to the authenticated user)."""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item tidak ditemukan")
    if item.owner_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Anda tidak berhak mengubah item ini")

    update_data = item_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item


@app.delete("/items/{item_id}", status_code=204)
async def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Delete an item (must belong to the authenticated user)."""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item tidak ditemukan")
    if item.owner_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Anda tidak berhak menghapus item ini")

    db.delete(item)
    db.commit()
    return None
