"""Leaderboard Service - Gamified trader rankings."""
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from repositories.trade_repository import TradeRepository
from repositories.user_repository import UserRepository
from schemas.community import LeaderboardEntry, LeaderboardResponse


class LeaderboardService:
    """Service for leaderboard and community features."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)
        self.trade_repo = TradeRepository(session)
    
    async def get_leaderboard(
        self,
        current_user_id: str | None = None,
        period: str = "all_time",
        limit: int = 10,
    ) -> LeaderboardResponse:
        """
        Get leaderboard with top performing traders.
        
        Args:
            current_user_id: ID of current user to highlight
            period: "weekly", "monthly", or "all_time"
            limit: Number of top traders to return
        """
        # Get all users sorted by performance
        users = await self.user_repo.get_all_for_leaderboard(limit=100)
        total_participants = await self.user_repo.count_all()
        
        entries = []
        current_user_rank = None
        
        for rank, user in enumerate(users, start=1):
            # Calculate metrics
            total_trades = await self.trade_repo.count_user_trades(user.id)
            winning_trades = await self.trade_repo.get_user_winning_trades_count(user.id)
            win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
            
            is_current = user.id == current_user_id
            if is_current:
                current_user_rank = rank
            
            entry = LeaderboardEntry(
                rank=rank,
                user_id=user.id,
                username=user.username,
                avatar_url=user.avatar_url,
                return_percentage=round(user.total_return_percentage, 2),
                total_trades=total_trades,
                win_rate=round(win_rate, 1),
                is_current_user=is_current,
            )
            
            # Add to entries if in top N or is current user
            if rank <= limit:
                entries.append(entry)
            elif is_current and rank > limit:
                # Add current user even if not in top N
                entries.append(entry)
        
        return LeaderboardResponse(
            entries=entries,
            period=period,
            total_participants=total_participants,
            current_user_rank=current_user_rank,
            updated_at=datetime.now(timezone.utc).isoformat(),
        )
    
    async def get_user_rank(self, user_id: str) -> int | None:
        """Get a specific user's rank."""
        users = await self.user_repo.get_all_for_leaderboard(limit=1000)
        
        for rank, user in enumerate(users, start=1):
            if user.id == user_id:
                return rank
        
        return None
