"""Portfolio Service - Analysis and risk metrics."""
import random
from datetime import datetime, timezone
from typing import Literal

import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession

from repositories.position_repository import PositionRepository
from repositories.trade_repository import TradeRepository
from repositories.user_repository import UserRepository
from schemas.portfolio import (
    CorrelationEntry,
    CorrelationMatrixResponse,
    PerformanceMetric,
    PerformanceResponse,
    PortfolioSummaryResponse,
)
from services.ml_service import MLService


class PortfolioService:
    """Service for portfolio analysis and metrics."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)
        self.position_repo = PositionRepository(session)
        self.trade_repo = TradeRepository(session)
    
    async def get_summary(self, user_id: str) -> PortfolioSummaryResponse:
        """Get portfolio summary for a user."""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        positions = await self.position_repo.get_user_positions(user_id)
        total_trades = await self.trade_repo.count_user_trades(user_id)
        
        # Calculate invested value
        invested_value = 0.0
        current_invested_value = 0.0
        
        for pos in positions:
            price_data = await MLService.get_current_price(pos.symbol)
            current_price = price_data["price"]
            invested_value += pos.total_cost
            current_invested_value += pos.quantity * current_price
        
        total_value = user.paper_balance + current_invested_value
        total_pnl = total_value - user.initial_balance
        total_pnl_pct = (total_pnl / user.initial_balance) * 100 if user.initial_balance > 0 else 0
        
        # Mock day P&L (would need historical tracking in production)
        day_pnl = random.uniform(-500, 800)
        day_pnl_pct = (day_pnl / total_value) * 100 if total_value > 0 else 0
        
        # Calculate win rate
        winning_trades = await self.trade_repo.get_user_winning_trades_count(user_id)
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
        
        return PortfolioSummaryResponse(
            total_value=round(total_value, 2),
            cash_balance=round(user.paper_balance, 2),
            invested_value=round(current_invested_value, 2),
            total_pnl=round(total_pnl, 2),
            total_pnl_percentage=round(total_pnl_pct, 2),
            day_pnl=round(day_pnl, 2),
            day_pnl_percentage=round(day_pnl_pct, 2),
            positions_count=len(positions),
            total_trades=total_trades,
            win_rate=round(win_rate, 1),
            updated_at=datetime.now(timezone.utc),
        )
    
    async def get_correlation_matrix(self, user_id: str) -> CorrelationMatrixResponse:
        """
        Get correlation matrix for portfolio risk heatmap.
        
        In production, this would:
        1. Fetch historical price data for all positions
        2. Calculate actual correlation using pandas.DataFrame.corr()
        3. Return real correlation values
        
        For now, returns realistic mock data.
        """
        symbols = await self.position_repo.get_user_symbols(user_id)
        
        if len(symbols) < 2:
            # Need at least 2 positions for correlation
            # Add some default symbols for demo
            symbols = symbols + ["AAPL", "MSFT", "GOOGL", "NVDA", "AMZN"]
            symbols = list(set(symbols))[:5]  # Unique, max 5
        
        n = len(symbols)
        
        # Generate realistic correlation matrix
        # Tech stocks tend to be correlated, diversified portfolios less so
        matrix = self._generate_mock_correlation_matrix(symbols)
        
        # Find high correlation pairs
        high_corr_pairs = []
        for i in range(n):
            for j in range(i + 1, n):
                corr = matrix[i][j]
                if abs(corr) > 0.7:
                    high_corr_pairs.append(CorrelationEntry(
                        symbol_x=symbols[i],
                        symbol_y=symbols[j],
                        correlation=round(corr, 3),
                    ))
        
        # Calculate risk score (higher correlation = higher risk)
        avg_correlation = np.mean([
            matrix[i][j] for i in range(n) for j in range(i + 1, n)
        ])
        risk_score = min(100, max(0, avg_correlation * 100 + 50))
        
        # Determine grade
        if risk_score < 30:
            grade: Literal["A", "B", "C", "D", "F"] = "A"
            recommendation = "Excellent diversification! Your portfolio has low correlation between assets."
        elif risk_score < 50:
            grade = "B"
            recommendation = "Good diversification. Consider adding uncorrelated assets to reduce risk further."
        elif risk_score < 70:
            grade = "C"
            recommendation = "Moderate risk. Your portfolio has significant sector concentration."
        elif risk_score < 85:
            grade = "D"
            recommendation = "High risk. Strong correlation between holdings increases volatility."
        else:
            grade = "F"
            recommendation = "Very high risk! Portfolio is heavily concentrated. Diversify immediately."
        
        return CorrelationMatrixResponse(
            symbols=symbols,
            matrix=matrix,
            risk_score=round(risk_score, 1),
            diversification_grade=grade,
            high_correlation_pairs=high_corr_pairs,
            recommendation=recommendation,
        )
    
    def _generate_mock_correlation_matrix(self, symbols: list[str]) -> list[list[float]]:
        """Generate realistic correlation matrix for given symbols."""
        n = len(symbols)
        
        # Sector classifications for realistic correlations
        tech = {"AAPL", "MSFT", "GOOGL", "META", "NVDA", "AMD", "INTC"}
        consumer = {"AMZN", "TSLA", "HD", "NKE"}
        finance = {"JPM", "BAC", "GS", "V", "MA"}
        
        matrix = [[0.0] * n for _ in range(n)]
        
        for i in range(n):
            for j in range(n):
                if i == j:
                    matrix[i][j] = 1.0
                elif j > i:
                    # Same sector = higher correlation
                    sym_i, sym_j = symbols[i].upper(), symbols[j].upper()
                    
                    same_sector = (
                        (sym_i in tech and sym_j in tech) or
                        (sym_i in consumer and sym_j in consumer) or
                        (sym_i in finance and sym_j in finance)
                    )
                    
                    if same_sector:
                        corr = random.uniform(0.6, 0.9)
                    else:
                        corr = random.uniform(0.1, 0.5)
                    
                    matrix[i][j] = round(corr, 3)
                    matrix[j][i] = round(corr, 3)
        
        return matrix
    
    async def get_performance(
        self,
        user_id: str,
        period: str = "1M",
    ) -> PerformanceResponse:
        """
        Get portfolio performance over time.
        
        In production, this would track daily portfolio values.
        For now, returns mock data.
        """
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        # Generate mock performance data
        start_value = user.initial_balance
        end_value = user.paper_balance  # Simplified, would include positions
        
        # Number of data points based on period
        points_map = {"1D": 24, "1W": 7, "1M": 30, "3M": 90, "1Y": 252, "ALL": 365}
        num_points = points_map.get(period, 30)
        
        metrics = []
        current_value = start_value
        max_value = start_value
        max_drawdown = 0
        
        for i in range(num_points):
            # Random walk with slight upward bias
            change = random.gauss(0.001, 0.02)
            current_value *= (1 + change)
            
            pnl = current_value - start_value
            pnl_pct = (pnl / start_value) * 100
            
            # Track max drawdown
            if current_value > max_value:
                max_value = current_value
            drawdown = (max_value - current_value) / max_value * 100
            if drawdown > max_drawdown:
                max_drawdown = drawdown
            
            metrics.append(PerformanceMetric(
                date=datetime.now(timezone.utc),  # Would be actual dates
                value=round(current_value, 2),
                pnl=round(pnl, 2),
                pnl_percentage=round(pnl_pct, 2),
            ))
        
        total_return = end_value - start_value
        total_return_pct = (total_return / start_value) * 100 if start_value > 0 else 0
        
        return PerformanceResponse(
            metrics=metrics[-num_points:],  # Last N points
            period=period,
            start_value=round(start_value, 2),
            end_value=round(end_value, 2),
            total_return=round(total_return, 2),
            total_return_percentage=round(total_return_pct, 2),
            max_drawdown=round(max_drawdown, 2),
            sharpe_ratio=round(random.uniform(0.5, 2.5), 2),
        )
