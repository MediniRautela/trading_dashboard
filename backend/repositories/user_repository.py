"""User repository for database operations."""
from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User


class UserRepository:
    """Repository for User CRUD operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(
        self,
        email: str,
        username: str,
        password_hash: str,
        initial_balance: float = 100000.0,
    ) -> User:
        """Create a new user."""
        user = User(
            email=email,
            username=username,
            password_hash=password_hash,
            paper_balance=initial_balance,
            initial_balance=initial_balance,
        )
        self.session.add(user)
        await self.session.flush()
        return user
    
    async def get_by_id(self, user_id: str) -> User | None:
        """Get user by ID."""
        result = await self.session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_email(self, email: str) -> User | None:
        """Get user by email."""
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_by_username(self, username: str) -> User | None:
        """Get user by username."""
        result = await self.session.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()
    
    async def update_last_login(self, user_id: str) -> None:
        """Update user's last login timestamp."""
        await self.session.execute(
            update(User)
            .where(User.id == user_id)
            .values(last_login=datetime.now(timezone.utc))
        )
    
    async def update_balance(self, user_id: str, new_balance: float) -> None:
        """Update user's paper trading balance."""
        await self.session.execute(
            update(User)
            .where(User.id == user_id)
            .values(
                paper_balance=new_balance,
                updated_at=datetime.now(timezone.utc),
            )
        )
    
    async def get_all_for_leaderboard(self, limit: int = 100) -> list[User]:
        """Get all users ordered by return percentage for leaderboard."""
        result = await self.session.execute(
            select(User)
            .where(User.is_active == True)
            .order_by(
                ((User.paper_balance - User.initial_balance) / User.initial_balance).desc()
            )
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def count_all(self) -> int:
        """Count total active users."""
        from sqlalchemy import func
        result = await self.session.execute(
            select(func.count(User.id)).where(User.is_active == True)
        )
        return result.scalar() or 0
