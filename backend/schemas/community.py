"""Community schemas."""
from pydantic import BaseModel, Field


class LeaderboardEntry(BaseModel):
    """Single leaderboard entry."""
    
    rank: int
    user_id: str
    username: str
    avatar_url: str | None = None
    return_percentage: float
    total_trades: int
    win_rate: float = Field(ge=0, le=100)
    is_current_user: bool = False


class LeaderboardResponse(BaseModel):
    """Leaderboard response."""
    
    entries: list[LeaderboardEntry]
    period: str  # "weekly", "monthly", "all_time"
    total_participants: int
    current_user_rank: int | None = None
    updated_at: str
