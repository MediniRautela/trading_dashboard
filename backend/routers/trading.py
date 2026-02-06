"""Trading router - Paper trading operations."""
from fastapi import APIRouter, Query

from dependencies import CurrentUserId, DbSession
from schemas.trading import (
    PositionsListResponse,
    QuickTradeRequest,
    TradeHistoryResponse,
    TradeRequest,
    TradeResponse,
    TradeType,
)
from services.paper_trading_service import PaperTradingService

router = APIRouter()


@router.post("/buy", response_model=TradeResponse)
async def buy_stock(
    request: TradeRequest,
    user_id: CurrentUserId,
    session: DbSession,
):
    """
    Execute a paper buy order.
    
    - **symbol**: Stock symbol (e.g., AAPL)
    - **quantity**: Number of shares to buy
    
    Requires sufficient cash balance.
    """
    # Force trade type to BUY
    request.trade_type = TradeType.BUY
    
    service = PaperTradingService(session)
    return await service.execute_trade(user_id, request)


@router.post("/sell", response_model=TradeResponse)
async def sell_stock(
    request: TradeRequest,
    user_id: CurrentUserId,
    session: DbSession,
):
    """
    Execute a paper sell order.
    
    - **symbol**: Stock symbol (e.g., AAPL)
    - **quantity**: Number of shares to sell
    
    Requires sufficient position in the stock.
    """
    # Force trade type to SELL
    request.trade_type = TradeType.SELL
    
    service = PaperTradingService(session)
    return await service.execute_trade(user_id, request)


@router.get("/positions", response_model=PositionsListResponse)
async def get_positions(
    user_id: CurrentUserId,
    session: DbSession,
):
    """
    Get all current positions (holdings).
    
    Returns positions with current prices and P&L calculated.
    """
    service = PaperTradingService(session)
    return await service.get_positions(user_id)


@router.get("/history", response_model=TradeHistoryResponse)
async def get_trade_history(
    user_id: CurrentUserId,
    session: DbSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """
    Get trade history with pagination.
    
    Returns executed trades in reverse chronological order.
    """
    service = PaperTradingService(session)
    return await service.get_trade_history(user_id, page, page_size)


@router.post("/quick", response_model=TradeResponse)
async def quick_trade(
    request: QuickTradeRequest,
    user_id: CurrentUserId,
    session: DbSession,
):
    """
    Execute a quick trade from command palette.
    
    Command format: "buy AAPL 10" or "sell MSFT 5"
    """
    # Parse command
    parts = request.command.strip().lower().split()
    
    if len(parts) < 3:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid command format. Use: 'buy AAPL 10' or 'sell MSFT 5'",
        )
    
    action = parts[0]
    symbol = parts[1].upper()
    
    try:
        quantity = int(parts[2])
    except ValueError:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid quantity. Must be a number.",
        )
    
    if action not in ("buy", "sell"):
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action. Use 'buy' or 'sell'.",
        )
    
    trade_request = TradeRequest(
        symbol=symbol,
        trade_type=TradeType.BUY if action == "buy" else TradeType.SELL,
        quantity=quantity,
    )
    
    service = PaperTradingService(session)
    return await service.execute_trade(user_id, trade_request)
