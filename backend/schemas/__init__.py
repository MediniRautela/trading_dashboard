"""Schemas package - Pydantic request/response models."""
from schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserResponse,
)
from schemas.trading import (
    TradeRequest,
    TradeResponse,
    PositionResponse,
    TradeHistoryResponse,
)
from schemas.portfolio import (
    PortfolioSummaryResponse,
    CorrelationMatrixResponse,
    PerformanceResponse,
)
from schemas.predictions import (
    PredictionResponse,
    MarketContextResponse,
    PriceDataResponse,
    StockListResponse,
)
from schemas.community import (
    LeaderboardEntry,
    LeaderboardResponse,
)

__all__ = [
    # Auth
    "LoginRequest",
    "LoginResponse", 
    "RegisterRequest",
    "RegisterResponse",
    "TokenResponse",
    "UserResponse",
    # Trading
    "TradeRequest",
    "TradeResponse",
    "PositionResponse",
    "TradeHistoryResponse",
    # Portfolio
    "PortfolioSummaryResponse",
    "CorrelationMatrixResponse",
    "PerformanceResponse",
    # Predictions
    "PredictionResponse",
    "MarketContextResponse",
    "PriceDataResponse",
    "StockListResponse",
    # Community
    "LeaderboardEntry",
    "LeaderboardResponse",
]
