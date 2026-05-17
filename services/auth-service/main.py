"""
Auth Service — Microservice for authentication and user management.

Endpoints:
  POST /register  — Create a new user account
  POST /login     — Authenticate and receive a JWT access token
  GET  /verify    — Validate a JWT token (called by other microservices)
  GET  /health    — Liveness probe for deployment smoke tests

This service owns the `auth_db` database and is the single source of truth
for user identity. Other services (e.g. Item Service) call GET /verify
with the user's Bearer token to authenticate requests.
"""

import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from config import settings
from database import Base, engine, get_db, check_db_connection
from models import User
from schemas import UserCreate, UserResponse, TokenResponse, VerifyResponse


# ── Security Utilities ──────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now, "jti": str(uuid.uuid4())})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid atau sudah expired",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── Lifespan ────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


# ── FastAPI Application ────────────────────────────────────────
app = FastAPI(
    title="Auth Service",
    description="Microservice for authentication — register, login, verify",
    version="1.0.0",
    lifespan=lifespan,
)


# ── Endpoints ───────────────────────────────────────────────────
@app.get("/health")
def health_check():
    """Liveness probe for CI/CD smoke tests."""
    db_ok = check_db_connection()
    return {
        "service": "auth-service",
        "status": "healthy" if db_ok else "degraded",
        "checks": {"database": "connected" if db_ok else "disconnected"},
    }


@app.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user account."""
    # Check duplicate email
    existing = db.query(User).filter(User.email == user_data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")

    new_user = User(
        email=user_data.email.lower(),
        name=user_data.name,
        hashed_password=hash_password(user_data.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate user and return JWT access token."""
    user = db.query(User).filter(User.email == form_data.username.lower()).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email atau password salah")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Akun tidak aktif")

    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/verify", response_model=VerifyResponse)
def verify_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Validate a JWT token and return the authenticated user's identity.

    This endpoint is called by other microservices (e.g. Item Service)
    to verify user authentication via inter-service HTTP call.
    """
    payload = decode_token(token)
    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        raise HTTPException(status_code=401, detail="Token tidak valid")

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise HTTPException(status_code=401, detail="Token tidak valid")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User tidak ditemukan")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Akun tidak aktif")

    return VerifyResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
    )
