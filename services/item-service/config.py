"""
Item Service — Configuration via pydantic-settings.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    DATABASE_URL: str

    # Base URL of the Auth Service for inter-service communication.
    # In Docker Compose this will be something like http://auth-service:8001
    AUTH_SERVICE_URL: str = "http://localhost:8001"


settings = Settings()
