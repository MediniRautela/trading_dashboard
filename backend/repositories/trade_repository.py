"""Trade repository for database operations."""
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.trade import Trade, TradeStatus, TradeType


class TradeRepository:
    """Repository for Trade CRUD operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(
        self,
        user_id: str,
        symbol: str,
        trade_type: str,
        quantity: int,
        price: float,
        balance_before: float,
        balance_after: float,
    ) -> Trade:
        """Create a new trade record."""
        total_value = quantity * price
        
        trade = Trade(
            user_id=user_id,
            symbol=symbol.upper(),
            trade_type=trade_type,
            quantity=quantity,
            price=price,
            total_value=total_value,
            balance_before=balance_before,
            balance_after=balance_after,
            status=TradeStatus.EXECUTED.value,
            executed_at=datetime.now(timezone.utc),
        )
        self.session.add(trade)
        await self.session.flush()
        return trade
    
    async def get_by_id(self, trade_id: str) -> Trade | None:
        """Get trade by ID."""
        result = await self.session.execute(
            select(Trade).where(Trade.id == trade_id)
        )
        return result.scalar_one_or_none()
    
    async def get_user_trades(
        self,
        user_id: str,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Trade]:
        """Get trades for a user with pagination."""
        result = await self.session.execute(
            select(Trade)
            .where(Trade.user_id == user_id)
            .order_by(Trade.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())
    
    async def get_user_trades_by_symbol(
        self,
        user_id: str,
        symbol: str,
    ) -> list[Trade]:
        """Get all trades for a user and symbol."""
        result = await self.session.execute(
            select(Trade)
            .where(Trade.user_id == user_id, Trade.symbol == symbol.upper())
            .order_by(Trade.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def count_user_trades(self, user_id: str) -> int:
        """Count total trades for a user."""
        result = await self.session.execute(
            select(func.count(Trade.id)).where(Trade.user_id == user_id)
        )
        return result.scalar() or 0
    
    async def get_user_winning_trades_count(self, user_id: str) -> int:
        """
        Count winning trades for win rate calculation.
        A winning trade is a SELL where the price was higher than avg buy price.
        This is simplified - real implementation would track per-position P&L.
        """
        # Simplified: count sells where we assume profit
        # Real implementation would join with positions or track realized P&L
        result = await self.session.execute(
            select(func.count(Trade.id))
            .where(
                Trade.user_id == user_id,
                Trade.trade_type == TradeType.SELL.value,
                Trade.status == TradeStatus.EXECUTED.value,
            )
        )
        return result.scalar() or 0
