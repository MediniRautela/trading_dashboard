"""Position repository for database operations."""
from datetime import datetime, timezone

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from models.position import Position


class PositionRepository:
    """Repository for Position CRUD operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(
        self,
        user_id: str,
        symbol: str,
        quantity: int,
        average_price: float,
    ) -> Position:
        """Create a new position."""
        position = Position(
            user_id=user_id,
            symbol=symbol.upper(),
            quantity=quantity,
            average_price=average_price,
            total_cost=quantity * average_price,
        )
        self.session.add(position)
        await self.session.flush()
        return position
    
    async def get_by_id(self, position_id: str) -> Position | None:
        """Get position by ID."""
        result = await self.session.execute(
            select(Position).where(Position.id == position_id)
        )
        return result.scalar_one_or_none()
    
    async def get_user_position(self, user_id: str, symbol: str) -> Position | None:
        """Get a user's position for a specific symbol."""
        result = await self.session.execute(
            select(Position).where(
                Position.user_id == user_id,
                Position.symbol == symbol.upper(),
            )
        )
        return result.scalar_one_or_none()
    
    async def get_user_positions(self, user_id: str) -> list[Position]:
        """Get all positions for a user."""
        result = await self.session.execute(
            select(Position)
            .where(Position.user_id == user_id, Position.quantity > 0)
            .order_by(Position.symbol)
        )
        return list(result.scalars().all())
    
    async def update_position(
        self,
        position_id: str,
        quantity: int,
        average_price: float,
        total_cost: float,
    ) -> None:
        """Update position quantity and average price."""
        await self.session.execute(
            update(Position)
            .where(Position.id == position_id)
            .values(
                quantity=quantity,
                average_price=average_price,
                total_cost=total_cost,
                updated_at=datetime.now(timezone.utc),
            )
        )
    
    async def delete_position(self, position_id: str) -> None:
        """Delete a position (when fully sold)."""
        await self.session.execute(
            delete(Position).where(Position.id == position_id)
        )
    
    async def get_user_symbols(self, user_id: str) -> list[str]:
        """Get list of symbols user holds."""
        result = await self.session.execute(
            select(Position.symbol)
            .where(Position.user_id == user_id, Position.quantity > 0)
        )
        return [row[0] for row in result.all()]
    
    async def count_user_positions(self, user_id: str) -> int:
        """Count positions for a user."""
        from sqlalchemy import func
        result = await self.session.execute(
            select(func.count(Position.id))
            .where(Position.user_id == user_id, Position.quantity > 0)
        )
        return result.scalar() or 0
