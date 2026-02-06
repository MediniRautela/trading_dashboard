"""ML Service - Wraps existing inference.py for predictions."""
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

import numpy as np

from config import settings

# Add project root to path for ML imports
PROJECT_ROOT = Path(__file__).parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


class MLService:
    """Service for ML model predictions."""
    
    _model = None
    _config = None
    _initialized = False
    
    @classmethod
    def initialize(cls) -> bool:
        """Initialize the ML model (lazy loading)."""
        if cls._initialized:
            return True
        
        try:
            from src.inference import load_model
            
            checkpoint_path = PROJECT_ROOT / settings.model_checkpoint_path
            if not checkpoint_path.exists():
                print(f"⚠️ Model checkpoint not found at {checkpoint_path}")
                return False
            
            cls._model, cls._config = load_model(str(checkpoint_path), device="cpu")
            cls._initialized = True
            print("✅ ML model loaded successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to load ML model: {e}")
            return False
    
    @classmethod
    async def get_prediction(cls, symbol: str) -> dict:
        """
        Get ML prediction for a symbol.
        
        Returns prediction with direction, probabilities, and return estimate.
        """
        from src.inference import fetch_latest_data, predict, prepare_prediction_window
        
        # Ensure model is loaded
        # Ensure model is loaded
        if not cls._initialized:
            if not cls.initialize():
                # STRICT MODE: Raise error if model is missing instead of using mock
                raise Exception("CRITICAL: ML Model failed to load. Mock fallback disabled.")
        
        try:
            # Fetch latest data
            df = fetch_latest_data(symbol, period="60d", interval="15m")
            
            # Prepare prediction window
            window_length = cls._config.get("data", {}).get("window_length", 64)
            window_tensor = prepare_prediction_window(df, window_length=window_length)
            
            # Get prediction
            up_prob, down_prob, pred_return = predict(cls._model, window_tensor, device="cpu")
            
            # Determine direction and signal strength
            direction: Literal["UP", "DOWN"] = "UP" if up_prob > 0.5 else "DOWN"
            confidence = max(up_prob, down_prob)
            
            if confidence > 0.7:
                signal_strength = "STRONG"
            elif confidence > 0.55:
                signal_strength = "MODERATE"
            else:
                signal_strength = "WEAK"
            
            # Convert log return to percentage
            pred_return_pct = (np.exp(pred_return) - 1) * 100
            
            return {
                "symbol": symbol.upper(),
                "direction": direction,
                "up_probability": round(up_prob, 4),
                "down_probability": round(down_prob, 4),
                "predicted_return": round(pred_return, 6),
                "predicted_return_percentage": round(pred_return_pct, 4),
                "confidence": round(confidence, 4),
                "signal_strength": signal_strength,
                "prediction_horizon": "15min",
                "model_version": "multitask_cnn_v1",
                "generated_at": datetime.now(timezone.utc),
            }
            
        except Exception as e:
            print(f"Prediction error for {symbol}: {e}")
            # STRICT MODE: Re-raise exception
            raise e
    
    @classmethod
    def _get_mock_prediction(cls, symbol: str) -> dict:
        """Return mock prediction when model is unavailable."""
        import random
        
        up_prob = random.uniform(0.4, 0.75)
        down_prob = 1 - up_prob
        direction = "UP" if up_prob > 0.5 else "DOWN"
        confidence = max(up_prob, down_prob)
        
        return {
            "symbol": symbol.upper(),
            "direction": direction,
            "up_probability": round(up_prob, 4),
            "down_probability": round(down_prob, 4),
            "predicted_return": round(random.uniform(-0.02, 0.02), 6),
            "predicted_return_percentage": round(random.uniform(-2, 2), 4),
            "confidence": round(confidence, 4),
            "signal_strength": "MODERATE",
            "prediction_horizon": "15min",
            "model_version": "mock_v1",
            "generated_at": datetime.now(timezone.utc),
        }
    
    @classmethod
    async def get_price_data(cls, symbol: str, period: str = "60d", interval: str = "15m") -> dict:
        """Fetch historical price data for a symbol."""
        try:
            from src.inference import fetch_latest_data
            
            df = fetch_latest_data(symbol, period=period, interval=interval)
            
            bars = []
            for timestamp, row in df.iterrows():
                bars.append({
                    "timestamp": timestamp.isoformat(),
                    "open": round(row["open"], 2),
                    "high": round(row["high"], 2),
                    "low": round(row["low"], 2),
                    "close": round(row["close"], 2),
                    "volume": int(row["volume"]),
                })
            
            return {
                "symbol": symbol.upper(),
                "interval": interval,
                "bars": bars,
                "last_updated": datetime.now(timezone.utc),
            }
        except Exception as e:
            print(f"Error fetching price data for {symbol}: {e}")
            raise
    
    @classmethod
    async def get_current_price(cls, symbol: str) -> dict:
        """Get current price for a symbol using Finnhub API."""
        import httpx
        from config import settings
        
        # Fallback to mock if no key
        if not settings.finnhub_api_key:
            print(f"⚠️ No Finnhub API key found. Using mock data for {symbol}.")
            return cls._get_mock_prediction(symbol)
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://finnhub.io/api/v1/quote",
                    params={"symbol": symbol.upper(), "token": settings.finnhub_api_key},
                    timeout=5.0
                )
                
                if response.status_code != 200:
                    print(f"Finnhub API error: {response.status_code} {response.text}")
                    raise Exception("API Error")
                    
                data = response.json()
                
                # Finnhub response format: 
                # c: Current price, d: Change, dp: Percent change, h: High, l: Low, o: Open, pc: Previous close
                current_price = float(data["c"])
                change = float(data["d"])
                change_pct = float(data["dp"])
                prev_close = float(data["pc"])
                
                # Handle cases where price is 0 (market closed/invalid symbol)
                if current_price == 0:
                     raise Exception("Invalid price data (0)")
                
                return {
                    "symbol": symbol.upper(),
                    "price": round(current_price, 2),
                    "change": round(change, 2),
                    "change_percentage": round(change_pct, 2),
                    "volume": 0, # Finnhub quote doesn't allow volume in free tier easily without extra calls
                    "timestamp": datetime.now(timezone.utc),
                }
                
        except Exception as e:
            print(f"Error getting current price for {symbol} from Finnhub: {e}")
            # Fallback to mock data on error (rate limit, etc)
            return cls._get_mock_prediction(symbol)
    
    @classmethod
    def get_available_stocks(cls) -> list[dict]:
        """Get list of available stocks for trading."""
        # These are the stocks the model was trained on + popular additions
        stocks = [
            {"symbol": "AAPL", "name": "Apple Inc.", "sector": "Technology"},
            {"symbol": "MSFT", "name": "Microsoft Corporation", "sector": "Technology"},
            {"symbol": "AMZN", "name": "Amazon.com Inc.", "sector": "Consumer Cyclical"},
            {"symbol": "GOOGL", "name": "Alphabet Inc.", "sector": "Technology"},
            {"symbol": "META", "name": "Meta Platforms Inc.", "sector": "Technology"},
            {"symbol": "TSLA", "name": "Tesla Inc.", "sector": "Consumer Cyclical"},
            {"symbol": "NVDA", "name": "NVIDIA Corporation", "sector": "Technology"},
            {"symbol": "SPY", "name": "SPDR S&P 500 ETF", "sector": "ETF"},
            {"symbol": "QQQ", "name": "Invesco QQQ Trust", "sector": "ETF"},
            {"symbol": "AMD", "name": "Advanced Micro Devices", "sector": "Technology"},
            {"symbol": "NFLX", "name": "Netflix Inc.", "sector": "Communication Services"},
            {"symbol": "INTC", "name": "Intel Corporation", "sector": "Technology"},
            {"symbol": "IBM", "name": "International Business Machines", "sector": "Technology"},
            {"symbol": "QCOM", "name": "Qualcomm Inc.", "sector": "Technology"},
            {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "sector": "Financial Services"},
            {"symbol": "BAC", "name": "Bank of America Corp", "sector": "Financial Services"},
            {"symbol": "WFC", "name": "Wells Fargo & Company", "sector": "Financial Services"},
            {"symbol": "C", "name": "Citigroup Inc.", "sector": "Financial Services"},
            {"symbol": "GS", "name": "Goldman Sachs Group", "sector": "Financial Services"},
            {"symbol": "V", "name": "Visa Inc.", "sector": "Financial Services"},
            {"symbol": "MA", "name": "Mastercard Inc.", "sector": "Financial Services"},
            {"symbol": "JNJ", "name": "Johnson & Johnson", "sector": "Healthcare"},
            {"symbol": "PFE", "name": "Pfizer Inc.", "sector": "Healthcare"},
            {"symbol": "MRK", "name": "Merck & Co. Inc.", "sector": "Healthcare"},
            {"symbol": "ABBV", "name": "AbbVie Inc.", "sector": "Healthcare"},
            {"symbol": "UNH", "name": "UnitedHealth Group", "sector": "Healthcare"},
            {"symbol": "PG", "name": "Procter & Gamble Co.", "sector": "Consumer Defensive"},
            {"symbol": "KO", "name": "Coca-Cola Company", "sector": "Consumer Defensive"},
            {"symbol": "PEP", "name": "PepsiCo Inc.", "sector": "Consumer Defensive"},
            {"symbol": "WMT", "name": "Walmart Inc.", "sector": "Consumer Defensive"},
            {"symbol": "COST", "name": "Costco Wholesale Corp", "sector": "Consumer Defensive"},
            {"symbol": "XOM", "name": "Exxon Mobil Corp", "sector": "Energy"},
            {"symbol": "CVX", "name": "Chevron Corp", "sector": "Energy"},
            {"symbol": "HD", "name": "Home Depot Inc.", "sector": "Consumer Cyclical"},
            {"symbol": "MCD", "name": "McDonald's Corp", "sector": "Consumer Cyclical"},
            {"symbol": "NKE", "name": "Nike Inc.", "sector": "Consumer Cyclical"},
            {"symbol": "SBUX", "name": "Starbucks Corp", "sector": "Consumer Cyclical"},
            {"symbol": "DIS", "name": "Walt Disney Company", "sector": "Communication Services"},
            {"symbol": "VZ", "name": "Verizon Communications", "sector": "Communication Services"},
            {"symbol": "T", "name": "AT&T Inc.", "sector": "Communication Services"},
            {"symbol": "CRM", "name": "Salesforce Inc.", "sector": "Technology"},
            {"symbol": "ORCL", "name": "Oracle Corp", "sector": "Technology"},
            {"symbol": "ADBE", "name": "Adobe Inc.", "sector": "Technology"},
            {"symbol": "BA", "name": "Boeing Company", "sector": "Industrials"},
            {"symbol": "MMM", "name": "3M Company", "sector": "Industrials"},
            {"symbol": "CAT", "name": "Caterpillar Inc.", "sector": "Industrials"},
            {"symbol": "GE", "name": "General Electric", "sector": "Industrials"},
            {"symbol": "F", "name": "Ford Motor Company", "sector": "Consumer Cyclical"},
            {"symbol": "GM", "name": "General Motors", "sector": "Consumer Cyclical"},
            {"symbol": "UBER", "name": "Uber Technologies", "sector": "Technology"},
            {"symbol": "PYPL", "name": "PayPal Holdings", "sector": "Financial Services"},
            {"symbol": "SQ", "name": "Block Inc.", "sector": "Financial Services"},
            {"symbol": "COIN", "name": "Coinbase Global", "sector": "Financial Services"},
            {"symbol": "PLTR", "name": "Palantir Technologies", "sector": "Technology"},
            {"symbol": "DKNG", "name": "DraftKings Inc.", "sector": "Consumer Cyclical"},
            {"symbol": "ROKU", "name": "Roku Inc.", "sector": "Communication Services"},
            {"symbol": "ARKK", "name": "ARK Innovation ETF", "sector": "ETF"},
            {"symbol": "GME", "name": "GameStop Corp", "sector": "Consumer Cyclical"},
            {"symbol": "AMC", "name": "AMC Entertainment", "sector": "Communication Services"},
        ]
        return stocks
