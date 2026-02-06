"""Authentication router."""
from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from dependencies import CurrentUserId, DbSession
from schemas.auth import (
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserResponse,
)
from services.auth_service import AuthService

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=RegisterResponse)
@limiter.limit("5/minute")
async def register(
    request: Request,
    data: RegisterRequest,
    session: DbSession,
):
    """
    Register a new user account.
    
    - **email**: Valid email address
    - **username**: 3-50 characters, alphanumeric and underscores only
    - **password**: Min 8 characters, must contain uppercase, lowercase, and digit
    """
    service = AuthService(session)
    return await service.register(data)


@router.post("/login", response_model=LoginResponse)
@limiter.limit("10/minute")
async def login(
    request: Request,
    data: LoginRequest,
    session: DbSession,
):
    """
    Authenticate and get access tokens.
    
    Returns access token (15 min) and refresh token (7 days).
    """
    service = AuthService(session)
    return await service.login(data)


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("20/minute")
async def refresh_token(
    request: Request,
    data: RefreshTokenRequest,
    session: DbSession,
):
    """
    Refresh access token using refresh token.
    
    Use this to get a new access token before the current one expires.
    """
    service = AuthService(session)
    return await service.refresh_tokens(data.refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_id: CurrentUserId,
    session: DbSession,
):
    """
    Get current authenticated user's information.
    
    Requires valid access token in Authorization header.
    """
    service = AuthService(session)
    return await service.get_current_user(user_id)
