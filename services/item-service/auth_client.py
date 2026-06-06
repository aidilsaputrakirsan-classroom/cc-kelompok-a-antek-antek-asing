"""
Item Service — Auth Client (Inter-Service Communication).

This module handles authentication by calling the Auth Service's
GET /verify endpoint over HTTP. It acts as a FastAPI dependency
(Depends) to protect Item Service endpoints.

Flow:
  1. Extract Bearer token from the incoming request header.
  2. Forward the token to Auth Service: GET {AUTH_SERVICE_URL}/verify
  3. If Auth Service returns 200, parse the user data and return it.
  4. If Auth Service returns 4xx, raise HTTPException to reject the request.

This pattern ensures that the Item Service NEVER handles JWT secrets
directly — all token validation is delegated to the Auth Service,
following the Single Responsibility Principle of microservices.
"""

import httpx
import logging
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer

from config import settings

logger = logging.getLogger(__name__)

# Points to Auth Service's /login for Swagger UI compatibility,
# but actual token validation goes through /verify.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.AUTH_SERVICE_URL}/login")


async def get_current_user(request: Request, token: str = Depends(oauth2_scheme)) -> dict:
    """
    FastAPI dependency that verifies the user's Bearer token
    by calling the Auth Service's /verify endpoint.

    Returns:
        dict: User data from Auth Service (id, email, name, role).

    Raises:
        HTTPException 401: If token is invalid or Auth Service rejects it.
        HTTPException 503: If Auth Service is unreachable.
    """
    correlation_id = getattr(request.state, "correlation_id", "unknown")
    logger.info("Calling Auth Service for token verification", extra={"correlation_id": correlation_id})
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.AUTH_SERVICE_URL}/verify",
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-Correlation-ID": correlation_id
                },
                timeout=5.0,
            )
    except httpx.ConnectError:
        logger.error("Auth Service connection error", extra={"correlation_id": correlation_id})
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth Service tidak dapat dihubungi. Silakan coba lagi nanti.",
        )
    except httpx.TimeoutException:
        logger.error("Auth Service timeout", extra={"correlation_id": correlation_id})
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Auth Service timeout. Silakan coba lagi nanti.",
        )

    if response.status_code == 200:
        logger.info("Auth Service token verified successfully", extra={"correlation_id": correlation_id})
        return response.json()

    # Forward the error from Auth Service
    detail = "Token tidak valid"
    try:
        detail = response.json().get("detail", detail)
    except Exception:
        pass

    logger.warning(f"Auth Service rejected token: {detail}", extra={"correlation_id": correlation_id})
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )
