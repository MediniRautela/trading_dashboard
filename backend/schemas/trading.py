"""Trading schemas."""
from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class TradeType(str, Enum):
    """Trade type enumeration."""
    BUY = "BUY"
    SELL = "SELL"


class TradeRequest(BaseModel):
    """Trade execution request."""
    
    symbol: str = Field(
        min_length=1,
        max_length=10,
        description="Stock symbol (e.g., AAPL)",
    )
    trade_type: TradeType
    quantity: int = Field(
        gt=0,
        description="Number of shares",
    )
    
    class Config:
        use_enum_values = True


class TradeResponse(BaseModel):
    """Trade execution response."""
    
    id: str
    symbol: str
    trade_type: str
    quantity: int
    price: float
    total_value: float
    balance_before: float
    balance_after: float
    status: str
    executed_at: datetime
    message: str
    
    class Config:
        from_attributes = True


class PositionResponse(BaseModel):
    """Position (holding) response."""
    
    id: str
    symbol: str
    quantity: int
    average_price: float
    total_cost: float
    current_price: float
    current_value: float
    pnl: float
    pnl_percentage: float
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PositionsListResponse(BaseModel):
    """List of positions response."""
    
    positions: list[PositionResponse]
    total_value: float
    total_pnl: float
    total_pnl_percentage: float


class TradeHistoryItem(BaseModel):
    """Single trade history item."""
    
    id: str
    symbol: str
    trade_type: str
    quantity: int
    price: float
    total_value: float
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class TradeHistoryResponse(BaseModel):
    """Trade history response."""
    
    trades: list[TradeHistoryItem]
    total_count: int
    page: int
    page_size: int


class QuickTradeRequest(BaseModel):
    """Quick trade request from command palette."""
    
    command: str = Field(
        description="Quick trade command like 'buy AAPL 10'",
    )
