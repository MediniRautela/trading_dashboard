"""Community router - Leaderboard and social features."""
from fastapi import APIRouter, Query

from dependencies import DbSession, OptionalUserId
from schemas.community import LeaderboardResponse
from services.leaderboard_service import LeaderboardService

router = APIRouter()


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    session: DbSession,
    user_id: OptionalUserId = None,
    period: str = Query(
        default="all_time",
        description="Leaderboard period: weekly, monthly, all_time",
    ),
    limit: int = Query(default=10, ge=1, le=50),
):
    """
    Get trader leaderboard rankings.
    
    Returns top traders sorted by return percentage.
    Current user is highlighted even if not in top N.
    
    - **period**: Time period for rankings
    - **limit**: Number of top traders to return
    """
    service = LeaderboardService(session)
    return await service.get_leaderboard(
        current_user_id=user_id,
        period=period,
        limit=limit,
    )
