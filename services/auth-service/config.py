"""
Centralized configuration management using pydantic-settings.

All environment variables are loaded from a .env file at the project root
and validated at application startup. This guarantees that the app will
fail-fast with clear error messages if a required secret is missing or
malformed — critical for safe Continuous Deployment.
"""

from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    pydantic-settings will:
      1. Read values from the .env file (via model_config).
      2. Override them with real environment variables when present
         (e.g. in Docker / CI / VPS).
      3. Apply type coercion and validators automatically.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",          # ignore env vars that don't match a field
        case_sensitive=True,
    )

    # ── Application ──────────────────────────────────────────────
    ENVIRONMENT: str = "development"

    # ── Database ─────────────────────────────────────────────────
    DATABASE_URL: str

    # ── JWT / Auth ───────────────────────────────────────────────
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── CORS ─────────────────────────────────────────────────────
    # Accepts a comma-separated string (e.g. "http://localhost:5173,http://localhost:3000")
    # and converts it to a Python list for CORSMiddleware.
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Allow CORS_ORIGINS to be passed as a comma-separated string."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # ── Superadmin Seeding ───────────────────────────────────────
    SUPERADMIN_EMAIL: str
    SUPERADMIN_PASSWORD: str

    # ── SMTP / Email ─────────────────────────────────────────────
    SMTP_HOST: str = "smtp.hostinger.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    MAIL_FROM: str = ""
    MAIL_FROM_NAME: str = "Antick Async IT Support"

    # ── Custom Validators ────────────────────────────────────────
    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError(
                "CRITICAL SECURITY ERROR: 'SECRET_KEY' environment variable is missing or empty. "
                "The application cannot start safely. Please define it in your .env file or environment variables."
            )
        if len(v) < 32:
            raise ValueError(
                "CRITICAL SECURITY ERROR: 'SECRET_KEY' is too weak. "
                "It must be at least 32 characters long. "
                'You can generate a secure key using: `python -c "import secrets; print(secrets.token_urlsafe(32))"`'
            )
        return v

    @field_validator("SUPERADMIN_PASSWORD")
    @classmethod
    def validate_superadmin_password(cls, v: str) -> str:
        if v == "Superadmin123!":
            raise ValueError(
                "CRITICAL SECURITY ERROR: Superadmin password is using the old insecure default 'Superadmin123!'. "
                "Please change 'SUPERADMIN_PASSWORD' in your .env to a secure value."
            )
        return v


# Singleton — imported by other modules as `from config import settings`
settings = Settings()
