"""User model for authentication and profile."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class User(Base):
    """User account model."""
    
    __tablename__ = "users"
    
    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    
    # Authentication
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    username: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    
    # Profile
    avatar_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    
    # Paper Trading
    paper_balance: Mapped[float] = mapped_column(
        Float,
        default=100000.0,  # $100,000 starting balance
        nullable=False,
    )
    initial_balance: Mapped[float] = mapped_column(
        Float,
        default=100000.0,
        nullable=False,
    )
    
    # Status
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    last_login: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    def __repr__(self) -> str:
        return f"<User {self.username} ({self.email})>"
    
    @property
    def total_return_percentage(self) -> float:
        """Calculate total return percentage from initial balance."""
        if self.initial_balance == 0:
            return 0.0
        return ((self.paper_balance - self.initial_balance) / self.initial_balance) * 100
