"""Prediction and market data schemas."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class PredictionResponse(BaseModel):
    """ML model prediction response."""
    
    symbol: str
    direction: Literal["UP", "DOWN"]
    up_probability: float = Field(ge=0, le=1)
    down_probability: float = Field(ge=0, le=1)
    predicted_return: float
    predicted_return_percentage: float
    confidence: float = Field(ge=0, le=1)
    signal_strength: Literal["STRONG", "MODERATE", "WEAK"]
    prediction_horizon: str  # e.g., "15min", "1hour"
    model_version: str
    generated_at: datetime


class MarketContextResponse(BaseModel):
    """AI-generated market context (The Why Widget)."""
    
    symbol: str
    sentiment: Literal["BULLISH", "BEARISH", "NEUTRAL"]
    confidence: float = Field(ge=0, le=1)
    summary: str = Field(description="1-sentence AI summary")
    key_factors: list[str] = Field(max_length=5, description="Top factors driving sentiment")
    recommendation: Literal["BUY", "HOLD", "SELL", "AVOID"] | None = None
    updated_at: datetime


class OHLCVBar(BaseModel):
    """Single OHLCV bar."""
    
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int


class PriceDataResponse(BaseModel):
    """Historical price data response."""
    
    symbol: str
    interval: str  # "1m", "5m", "15m", "1h", "1d"
    bars: list[OHLCVBar]
    last_updated: datetime


class LivePriceResponse(BaseModel):
    """Real-time price update."""
    
    symbol: str
    price: float
    change: float
    change_percentage: float
    volume: int
    timestamp: datetime


class StockInfo(BaseModel):
    """Stock information."""
    
    symbol: str
    name: str
    sector: str | None = None
    industry: str | None = None
    is_tradeable: bool = True


class StockListResponse(BaseModel):
    """List of available stocks."""
    
    stocks: list[StockInfo]
    total: int
