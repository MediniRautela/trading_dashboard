"""Authentication schemas."""
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    """User registration request."""
    
    email: EmailStr
    username: str = Field(
        min_length=3,
        max_length=50,
        pattern=r"^[a-zA-Z0-9_]+$",
        description="Username (alphanumeric and underscores only)",
    )
    password: str = Field(
        min_length=8,
        max_length=128,
        description="Password (min 8 characters)",
    )
    
    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Ensure password has minimum complexity."""
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class RegisterResponse(BaseModel):
    """User registration response."""
    
    id: str
    email: str
    username: str
    message: str = "Registration successful"


class LoginRequest(BaseModel):
    """User login request."""
    
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT token response."""
    
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(description="Access token expiration in seconds")


class LoginResponse(BaseModel):
    """Login response with tokens and user info."""
    
    user: "UserResponse"
    tokens: TokenResponse


class UserResponse(BaseModel):
    """User information response."""
    
    id: str
    email: str
    username: str
    avatar_url: str | None = None
    paper_balance: float
    initial_balance: float
    total_return_percentage: float
    is_verified: bool
    created_at: datetime
    last_login: datetime | None = None
    
    class Config:
        from_attributes = True


class RefreshTokenRequest(BaseModel):
    """Refresh token request."""
    
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    """Change password request."""
    
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)
    
    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Ensure password has minimum complexity."""
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v
