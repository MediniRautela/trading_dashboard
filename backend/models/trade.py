"""Trade model for paper trading transactions."""
import uuid
from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class TradeType(str, Enum):
    """Trade type enumeration."""
    BUY = "BUY"
    SELL = "SELL"


class TradeStatus(str, Enum):
    """Trade status enumeration."""
    PENDING = "PENDING"
    EXECUTED = "EXECUTED"
    CANCELLED = "CANCELLED"
    FAILED = "FAILED"


class Trade(Base):
    """Paper trading transaction record."""
    
    __tablename__ = "trades"
    
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
    
    # Trade details
    symbol: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        index=True,
    )
    trade_type: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default=TradeStatus.EXECUTED.value,
        nullable=False,
    )
    
    # Quantity and pricing
    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    price: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    total_value: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    
    # Balance tracking
    balance_before: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    balance_after: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    executed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    def __repr__(self) -> str:
        return f"<Trade {self.trade_type} {self.quantity} {self.symbol} @ ${self.price:.2f}>"
