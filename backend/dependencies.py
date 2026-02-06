"""
FastAPI dependency injection utilities.
Provides common dependencies for routes.
"""
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from auth import verify_access_token
from database import get_session
from slowapi import Limiter
from slowapi.util import get_remote_address

# Rate limiter instance
limiter = Limiter(key_func=get_remote_address)


# HTTP Bearer token security scheme
security = HTTPBearer(auto_error=False)


async def get_db() -> AsyncSession:
    """Dependency to get database session."""
    async for session in get_session():
        yield session


# Type alias for database dependency
DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> str:
    """
    Dependency to get current authenticated user ID from JWT token.
    
    Raises:
        HTTPException: If token is missing or invalid
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = verify_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_id


# Type alias for authenticated user dependency
CurrentUserId = Annotated[str, Depends(get_current_user_id)]


async def get_optional_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> str | None:
    """
    Dependency to optionally get current user ID.
    Returns None if not authenticated (doesn't raise error).
    """
    if not credentials:
        return None
    
    payload = verify_access_token(credentials.credentials)
    if not payload:
        return None
    
    return payload.get("sub")


# Type alias for optional user dependency
OptionalUserId = Annotated[str | None, Depends(get_optional_user_id)]
