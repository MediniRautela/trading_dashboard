"""Authentication service."""
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from auth import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    verify_refresh_token,
)
from config import settings
from repositories.user_repository import UserRepository
from schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserResponse,
)


class AuthService:
    """Service for authentication operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)
    
    async def register(self, request: RegisterRequest) -> RegisterResponse:
        """Register a new user."""
        # Check if email already exists
        existing_user = await self.user_repo.get_by_email(request.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        
        # Check if username already exists
        existing_username = await self.user_repo.get_by_username(request.username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )
        
        # Create user
        password_hash = hash_password(request.password)
        user = await self.user_repo.create(
            email=request.email,
            username=request.username,
            password_hash=password_hash,
            initial_balance=settings.initial_paper_balance,
        )
        
        return RegisterResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            message="Registration successful. Please log in.",
        )
    
    async def login(self, request: LoginRequest) -> LoginResponse:
        """Authenticate user and return tokens."""
        # Get user by email
        user = await self.user_repo.get_by_email(request.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        
        # Verify password
        if not verify_password(request.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated",
            )
        
        # Update last login
        await self.user_repo.update_last_login(user.id)
        
        # Create tokens
        token_data = {"sub": user.id}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        return LoginResponse(
            user=UserResponse(
                id=user.id,
                email=user.email,
                username=user.username,
                avatar_url=user.avatar_url,
                paper_balance=user.paper_balance,
                initial_balance=user.initial_balance,
                total_return_percentage=user.total_return_percentage,
                is_verified=user.is_verified,
                created_at=user.created_at,
                last_login=datetime.now(timezone.utc),
            ),
            tokens=TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=settings.access_token_expire_minutes * 60,
            ),
        )
    
    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        """Refresh access token using refresh token."""
        payload = verify_refresh_token(refresh_token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )
        
        # Verify user still exists and is active
        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )
        
        # Create new tokens
        token_data = {"sub": user_id}
        new_access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            expires_in=settings.access_token_expire_minutes * 60,
        )
    
    async def get_current_user(self, user_id: str) -> UserResponse:
        """Get current user info."""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        return UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            avatar_url=user.avatar_url,
            paper_balance=user.paper_balance,
            initial_balance=user.initial_balance,
            total_return_percentage=user.total_return_percentage,
            is_verified=user.is_verified,
            created_at=user.created_at,
            last_login=user.last_login,
        )
