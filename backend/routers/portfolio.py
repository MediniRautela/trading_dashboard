"""Portfolio router - Analytics and risk management."""
from fastapi import APIRouter, Query

from dependencies import CurrentUserId, DbSession
from schemas.portfolio import (
    CorrelationMatrixResponse,
    PerformanceResponse,
    PortfolioSummaryResponse,
)
from services.portfolio_service import PortfolioService

router = APIRouter()


@router.get("/summary", response_model=PortfolioSummaryResponse)
async def get_portfolio_summary(
    user_id: CurrentUserId,
    session: DbSession,
):
    """
    Get portfolio overview with key metrics.
    
    Returns:
    - Total value, cash balance, invested value
    - Total P&L and day P&L
    - Position count, trade count, win rate
    """
    service = PortfolioService(session)
    return await service.get_summary(user_id)


@router.get("/analysis", response_model=CorrelationMatrixResponse)
async def get_portfolio_analysis(
    user_id: CurrentUserId,
    session: DbSession,
):
    """
    Get correlation matrix for portfolio risk heatmap.
    
    Returns:
    - **symbols**: List of symbols in portfolio
    - **matrix**: NxN correlation matrix (-1 to 1)
    - **risk_score**: Overall risk score (0-100)
    - **diversification_grade**: A, B, C, D, or F
    - **high_correlation_pairs**: Pairs with correlation > 0.7
    - **recommendation**: Text advice for diversification
    """
    service = PortfolioService(session)
    return await service.get_correlation_matrix(user_id)


@router.get("/performance", response_model=PerformanceResponse)
async def get_portfolio_performance(
    user_id: CurrentUserId,
    session: DbSession,
    period: str = Query(
        default="1M",
        description="Performance period: 1D, 1W, 1M, 3M, 1Y, ALL",
    ),
):
    """
    Get portfolio performance over time.
    
    Returns time series of portfolio value with P&L,
    plus summary metrics like max drawdown and Sharpe ratio.
    """
    service = PortfolioService(session)
    return await service.get_performance(user_id, period)
