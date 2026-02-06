"""News Service - AI Market Context (The Why Widget)."""
import random
from datetime import datetime, timezone
from typing import Literal


class NewsService:
    """
    Service for AI-generated market context.
    
    Currently returns mocked data. In production, integrate with:
    - OpenAI/Anthropic for LLM summaries
    - News APIs (NewsAPI, Alpha Vantage, Benzinga)
    - Sentiment analysis models
    """
    
    # Mock data for realistic responses
    _bullish_summaries = [
        "Strong institutional buying pressure as {symbol} shows momentum ahead of earnings.",
        "{symbol} rallies on positive analyst upgrades and sector tailwinds.",
        "Technical breakout confirmed for {symbol} with volume supporting the move.",
        "{symbol} benefits from favorable macroeconomic conditions and strong guidance.",
        "Institutional accumulation detected in {symbol} with improving fundamentals.",
    ]
    
    _bearish_summaries = [
        "{symbol} faces headwinds from sector rotation and profit-taking.",
        "Technical breakdown in {symbol} signals potential further downside.",
        "{symbol} under pressure as market sentiment shifts to risk-off mode.",
        "Analyst downgrades weigh on {symbol} amid competitive concerns.",
        "{symbol} shows weakness after missing key technical support levels.",
    ]
    
    _neutral_summaries = [
        "{symbol} consolidates in range-bound trading awaiting catalyst.",
        "Mixed signals for {symbol} as bulls and bears reach equilibrium.",
        "{symbol} trades sideways with low conviction from institutional players.",
        "Market waits for clarity on {symbol} ahead of key economic data.",
        "{symbol} in holding pattern as traders await earnings guidance.",
    ]
    
    _bullish_factors = [
        "Strong earnings beat expectations",
        "Analyst price target raised",
        "Positive product launch reception",
        "Insider buying activity detected",
        "Sector rotation into growth stocks",
        "Technical breakout above resistance",
        "Improving profit margins",
        "Market share gains reported",
    ]
    
    _bearish_factors = [
        "Earnings miss consensus estimates",
        "Multiple analyst downgrades",
        "Competitive pressure intensifying",
        "Insider selling activity",
        "Sector underperformance",
        "Technical breakdown below support",
        "Margin compression concerns",
        "Guidance cut by management",
    ]
    
    _neutral_factors = [
        "Trading in established range",
        "Mixed analyst sentiment",
        "Awaiting catalyst event",
        "Consolidation phase",
        "Low volume indecision",
    ]
    
    @classmethod
    async def get_market_context(cls, symbol: str) -> dict:
        """
        Get AI-generated market context for a symbol.
        
        In production, this would:
        1. Fetch recent news articles for the symbol
        2. Run sentiment analysis
        3. Generate LLM summary
        4. Return structured response
        """
        # Generate realistic mock sentiment
        sentiment_roll = random.random()
        
        if sentiment_roll > 0.6:
            sentiment: Literal["BULLISH", "BEARISH", "NEUTRAL"] = "BULLISH"
            summaries = cls._bullish_summaries
            factors = random.sample(cls._bullish_factors, k=3)
            confidence = random.uniform(0.65, 0.85)
            recommendation = "BUY" if confidence > 0.75 else "HOLD"
        elif sentiment_roll > 0.25:
            sentiment = "NEUTRAL"
            summaries = cls._neutral_summaries
            factors = random.sample(cls._neutral_factors, k=3)
            confidence = random.uniform(0.45, 0.60)
            recommendation = "HOLD"
        else:
            sentiment = "BEARISH"
            summaries = cls._bearish_summaries
            factors = random.sample(cls._bearish_factors, k=3)
            confidence = random.uniform(0.65, 0.85)
            recommendation = "SELL" if confidence > 0.75 else "AVOID"
        
        summary = random.choice(summaries).format(symbol=symbol.upper())
        
        return {
            "symbol": symbol.upper(),
            "sentiment": sentiment,
            "confidence": round(confidence, 2),
            "summary": summary,
            "key_factors": factors,
            "recommendation": recommendation,
            "updated_at": datetime.now(timezone.utc),
        }
    
    @classmethod
    async def get_market_context_llm(cls, symbol: str) -> dict:
        """
        Production implementation with actual LLM integration.
        
        This is a placeholder for future implementation with:
        - OpenAI GPT-4 or Claude API
        - Real-time news fetching
        - Proper sentiment analysis
        """
        # TODO: Implement with actual LLM API
        # For now, return mock data
        return await cls.get_market_context(symbol)
