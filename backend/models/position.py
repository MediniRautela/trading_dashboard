"""Position model for tracking user holdings."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Position(Base):
    """User stock position (holdings)."""
    
    __tablename__ = "positions"
    
    # Unique constraint: one position per user per symbol
    __table_args__ = (
        UniqueConstraint("user_id", "symbol", name="uq_user_symbol"),
    )
    
    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    
    # Foreign key to user
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    # Position details
    symbol: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        index=True,
    )
    quantity: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    average_price: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    total_cost: Mapped[float] = mapped_column(
        Float,
        default=0.0,
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
    
    def __repr__(self) -> str:
        return f"<Position {self.quantity} {self.symbol} @ avg ${self.average_price:.2f}>"
    
    def calculate_pnl(self, current_price: float) -> tuple[float, float]:
        """
        Calculate profit/loss for this position.
        
        Args:
            current_price: Current market price
            
        Returns:
            Tuple of (absolute P&L, percentage P&L)
        """
        if self.quantity == 0 or self.average_price == 0:
            return 0.0, 0.0
        
        current_value = self.quantity * current_price
        pnl = current_value - self.total_cost
        pnl_percentage = (pnl / self.total_cost) * 100 if self.total_cost > 0 else 0.0
        
        return pnl, pnl_percentage
    
    @property
    def current_value(self) -> float:
        """Get total cost basis (for display when current price unknown)."""
        return self.total_cost
