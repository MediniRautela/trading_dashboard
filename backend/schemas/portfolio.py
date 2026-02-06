"""Portfolio schemas."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class PortfolioSummaryResponse(BaseModel):
    """Portfolio overview response."""
    
    total_value: float
    cash_balance: float
    invested_value: float
    total_pnl: float
    total_pnl_percentage: float
    day_pnl: float
    day_pnl_percentage: float
    positions_count: int
    total_trades: int
    win_rate: float
    updated_at: datetime


class CorrelationEntry(BaseModel):
    """Single correlation value."""
    
    symbol_x: str
    symbol_y: str
    correlation: float


class CorrelationMatrixResponse(BaseModel):
    """Portfolio correlation matrix for risk heatmap."""
    
    symbols: list[str]
    matrix: list[list[float]]  # NxN correlation values (-1 to 1)
    risk_score: float = Field(ge=0, le=100, description="Overall risk score 0-100")
    diversification_grade: Literal["A", "B", "C", "D", "F"]
    high_correlation_pairs: list[CorrelationEntry]
    recommendation: str


class PerformanceMetric(BaseModel):
    """Single performance metric."""
    
    date: datetime
    value: float
    pnl: float
    pnl_percentage: float


class PerformanceResponse(BaseModel):
    """Portfolio performance over time."""
    
    metrics: list[PerformanceMetric]
    period: str  # "1D", "1W", "1M", "3M", "1Y", "ALL"
    start_value: float
    end_value: float
    total_return: float
    total_return_percentage: float
    max_drawdown: float
    sharpe_ratio: float | None = None
