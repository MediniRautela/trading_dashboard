"""Predictions router - ML predictions and market data."""
from fastapi import APIRouter, Query, Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address

from dependencies import limiter

from schemas.predictions import (
    LivePriceResponse,
    MarketContextResponse,
    PredictionResponse,
    PriceDataResponse,
    StockListResponse,
)
from services.ml_service import MLService
from services.news_service import NewsService

router = APIRouter()


@router.get("/stocks", response_model=StockListResponse)
async def get_available_stocks():
    """
    Get list of available stocks for trading.
    
    Returns symbols that the ML model supports.
    """
    stocks = MLService.get_available_stocks()
    return StockListResponse(
        stocks=[
            {
                "symbol": s["symbol"],
                "name": s["name"],
                "sector": s.get("sector"),
                "is_tradeable": True,
            }
            for s in stocks
        ],
        total=len(stocks),
    )


@router.get("/predictions/{symbol}", response_model=PredictionResponse)
@limiter.limit("20/minute")
async def get_prediction(request: Request, symbol: str):
    """
    Get ML model prediction for a stock symbol.
    Rate limited to 20 requests per minute to protect inference resources.
    
    Returns:
    - **direction**: UP or DOWN
    - **up_probability**: Probability of upward movement (0-1)
    - **predicted_return**: Expected return percentage
    - **confidence**: Model confidence (0-1)
    - **signal_strength**: STRONG, MODERATE, or WEAK
    """
    if not symbol.isalnum():
        raise HTTPException(status_code=400, detail="Invalid symbol format")
        
    prediction = await MLService.get_prediction(symbol.upper())
    return PredictionResponse(**prediction)


@router.get("/market-context/{symbol}", response_model=MarketContextResponse)
async def get_market_context(symbol: str):
    """
    Get AI-generated market context for a stock.
    
    The "Why Widget" - explains market sentiment and key factors.
    
    Returns:
    - **sentiment**: BULLISH, BEARISH, or NEUTRAL
    - **summary**: 1-sentence AI explanation
    - **key_factors**: Top factors driving sentiment
    - **recommendation**: BUY, HOLD, SELL, or AVOID
    """
    context = await NewsService.get_market_context(symbol.upper())
    return MarketContextResponse(**context)


@router.get("/price-data/{symbol}", response_model=PriceDataResponse)
async def get_price_data(
    symbol: str,
    period: str = Query(default="60d", description="Data period: 1d, 5d, 1mo, 3mo, 6mo, 1y"),
    interval: str = Query(default="15m", description="Bar interval: 1m, 5m, 15m, 1h, 1d"),
):
    """
    Get historical OHLCV price data for charting.
    
    Used by TradingView widget and custom charts.
    """
    price_data = await MLService.get_price_data(symbol.upper(), period, interval)
    return PriceDataResponse(**price_data)


@router.get("/live-price/{symbol}", response_model=LivePriceResponse)
async def get_live_price(symbol: str):
    """
    Get current live price for a stock.
    
    Returns current price, change, and change percentage.
    """
    price_data = await MLService.get_current_price(symbol.upper())
    return LivePriceResponse(**price_data)
