import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """
    Centralized configuration management for the application.
    Enforces strict validation of critical security parameters.
    """
    def __init__(self):
        self.SECRET_KEY = os.getenv("SECRET_KEY", "").strip()
        self.ALGORITHM = os.getenv("ALGORITHM", "HS256")
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
        
        self.SUPERADMIN_EMAIL = os.getenv("SUPERADMIN_EMAIL", "").strip()
        self.SUPERADMIN_PASSWORD = os.getenv("SUPERADMIN_PASSWORD", "").strip()

        self._validate_settings()

    def _validate_settings(self):
        # 1. Require SECRET_KEY to be set
        if not self.SECRET_KEY:
            raise ValueError(
                "CRITICAL SECURITY ERROR: 'SECRET_KEY' environment variable is missing or empty. "
                "The application cannot start safely. Please define it in your .env file or environment variables."
            )
        
        # 2. Validate SECRET_KEY length/entropy (Bonus)
        # A 256-bit key represented in hex or base64 is typically 32+ characters long.
        if len(self.SECRET_KEY) < 32:
            raise ValueError(
                "CRITICAL SECURITY ERROR: 'SECRET_KEY' is too weak. "
                "It must be at least 32 characters long. "
                "You can generate a secure key using: `python -c \"import secrets; print(secrets.token_urlsafe(32))\"`"
            )

        # 3. Validasi Superadmin Credentials
        if not self.SUPERADMIN_EMAIL or not self.SUPERADMIN_PASSWORD:
            raise ValueError(
                "CRITICAL SECURITY ERROR: 'SUPERADMIN_EMAIL' or 'SUPERADMIN_PASSWORD' is missing. "
                "Default fallbacks have been removed for security reasons. Please provide them in your .env file."
            )
        
        if self.SUPERADMIN_PASSWORD == "Superadmin123!":
            raise ValueError(
                "CRITICAL SECURITY ERROR: Superadmin password is using the old insecure default 'Superadmin123!'. "
                "Please change 'SUPERADMIN_PASSWORD' in your .env to a secure value."
            )

settings = Settings()
