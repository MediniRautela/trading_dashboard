"""Paper Trading Service - Buy/Sell execution and position management."""
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from models.trade import TradeType
from repositories.position_repository import PositionRepository
from repositories.trade_repository import TradeRepository
from repositories.user_repository import UserRepository
from schemas.trading import (
    PositionResponse,
    PositionsListResponse,
    TradeHistoryItem,
    TradeHistoryResponse,
    TradeRequest,
    TradeResponse,
)
from services.ml_service import MLService


class PaperTradingService:
    """Service for paper trading operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)
        self.trade_repo = TradeRepository(session)
        self.position_repo = PositionRepository(session)
    
    async def execute_trade(self, user_id: str, request: TradeRequest) -> TradeResponse:
        """Execute a paper trade (buy or sell)."""
        # Get current user
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        # Get current price
        price_data = await MLService.get_current_price(request.symbol)
        current_price = price_data["price"]
        total_value = request.quantity * current_price
        
        balance_before = user.paper_balance
        
        if request.trade_type == TradeType.BUY.value or request.trade_type == "BUY":
            # Execute BUY
            balance_after = await self._execute_buy(
                user_id=user_id,
                symbol=request.symbol,
                quantity=request.quantity,
                price=current_price,
                total_value=total_value,
                current_balance=balance_before,
            )
            message = f"Successfully bought {request.quantity} shares of {request.symbol}"
        else:
            # Execute SELL
            balance_after = await self._execute_sell(
                user_id=user_id,
                symbol=request.symbol,
                quantity=request.quantity,
                price=current_price,
                total_value=total_value,
                current_balance=balance_before,
            )
            message = f"Successfully sold {request.quantity} shares of {request.symbol}"
        
        # Create trade record
        trade = await self.trade_repo.create(
            user_id=user_id,
            symbol=request.symbol,
            trade_type=request.trade_type if isinstance(request.trade_type, str) else request.trade_type.value,
            quantity=request.quantity,
            price=current_price,
            balance_before=balance_before,
            balance_after=balance_after,
        )
        
        return TradeResponse(
            id=trade.id,
            symbol=trade.symbol,
            trade_type=trade.trade_type,
            quantity=trade.quantity,
            price=trade.price,
            total_value=trade.total_value,
            balance_before=balance_before,
            balance_after=balance_after,
            status=trade.status,
            executed_at=trade.executed_at or datetime.now(timezone.utc),
            message=message,
        )
    
    async def _execute_buy(
        self,
        user_id: str,
        symbol: str,
        quantity: int,
        price: float,
        total_value: float,
        current_balance: float,
    ) -> float:
        """Execute a buy order."""
        # Check balance
        if current_balance < total_value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient balance. Need ${total_value:.2f}, have ${current_balance:.2f}",
            )
        
        # Update or create position
        position = await self.position_repo.get_user_position(user_id, symbol)
        
        if position:
            # Update existing position with new average price
            new_quantity = position.quantity + quantity
            new_total_cost = position.total_cost + total_value
            new_avg_price = new_total_cost / new_quantity
            
            await self.position_repo.update_position(
                position_id=position.id,
                quantity=new_quantity,
                average_price=new_avg_price,
                total_cost=new_total_cost,
            )
        else:
            # Create new position
            await self.position_repo.create(
                user_id=user_id,
                symbol=symbol,
                quantity=quantity,
                average_price=price,
            )
        
        # Deduct from balance
        new_balance = current_balance - total_value
        await self.user_repo.update_balance(user_id, new_balance)
        
        return new_balance
    
    async def _execute_sell(
        self,
        user_id: str,
        symbol: str,
        quantity: int,
        price: float,
        total_value: float,
        current_balance: float,
    ) -> float:
        """Execute a sell order."""
        # Check position exists
        position = await self.position_repo.get_user_position(user_id, symbol)
        
        if not position:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No position in {symbol} to sell",
            )
        
        if position.quantity < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient shares. Have {position.quantity}, trying to sell {quantity}",
            )
        
        # Update position
        new_quantity = position.quantity - quantity
        
        if new_quantity == 0:
            # Fully sold - delete position
            await self.position_repo.delete_position(position.id)
        else:
            # Partially sold - update position
            # Keep same average price, reduce quantity and total cost proportionally
            ratio = new_quantity / position.quantity
            new_total_cost = position.total_cost * ratio
            
            await self.position_repo.update_position(
                position_id=position.id,
                quantity=new_quantity,
                average_price=position.average_price,
                total_cost=new_total_cost,
            )
        
        # Add to balance
        new_balance = current_balance + total_value
        await self.user_repo.update_balance(user_id, new_balance)
        
        return new_balance
    
    async def get_positions(self, user_id: str) -> PositionsListResponse:
        """Get all positions for a user with current values."""
        positions = await self.position_repo.get_user_positions(user_id)
        
        position_responses = []
        total_value = 0.0
        total_cost = 0.0
        
        for pos in positions:
            # Get current price
            price_data = await MLService.get_current_price(pos.symbol)
            current_price = price_data["price"]
            current_value = pos.quantity * current_price
            pnl, pnl_pct = pos.calculate_pnl(current_price)
            
            total_value += current_value
            total_cost += pos.total_cost
            
            position_responses.append(PositionResponse(
                id=pos.id,
                symbol=pos.symbol,
                quantity=pos.quantity,
                average_price=round(pos.average_price, 2),
                total_cost=round(pos.total_cost, 2),
                current_price=round(current_price, 2),
                current_value=round(current_value, 2),
                pnl=round(pnl, 2),
                pnl_percentage=round(pnl_pct, 2),
                updated_at=pos.updated_at,
            ))
        
        total_pnl = total_value - total_cost
        total_pnl_pct = (total_pnl / total_cost * 100) if total_cost > 0 else 0
        
        return PositionsListResponse(
            positions=position_responses,
            total_value=round(total_value, 2),
            total_pnl=round(total_pnl, 2),
            total_pnl_percentage=round(total_pnl_pct, 2),
        )
    
    async def get_trade_history(
        self,
        user_id: str,
        page: int = 1,
        page_size: int = 20,
    ) -> TradeHistoryResponse:
        """Get trade history for a user."""
        offset = (page - 1) * page_size
        trades = await self.trade_repo.get_user_trades(user_id, limit=page_size, offset=offset)
        total_count = await self.trade_repo.count_user_trades(user_id)
        
        trade_items = [
            TradeHistoryItem(
                id=t.id,
                symbol=t.symbol,
                trade_type=t.trade_type,
                quantity=t.quantity,
                price=t.price,
                total_value=t.total_value,
                status=t.status,
                created_at=t.created_at,
            )
            for t in trades
        ]
        
        return TradeHistoryResponse(
            trades=trade_items,
            total_count=total_count,
            page=page,
            page_size=page_size,
        )
