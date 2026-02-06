import asyncio
import sys
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent
sys.path.insert(0, str(PROJECT_ROOT))

from services.ml_service import MLService
from config import settings

async def verify():
    print(f"Verifying Finnhub API connectivity...")
    print(f"API Key Configured: {'Yes' if settings.finnhub_api_key else 'No'}")
    
    symbols = ["AAPL", "SPY", "BTC-USD"]
    
    for symbol in symbols:
        try:
            print(f"\nFetching {symbol}...")
            data = await MLService.get_current_price(symbol)
            print(f"Success: {symbol} = ${data['price']} ({data['change_percentage']}%)")
            print(f"   Timestamp: {data['timestamp']}")
        except Exception as e:
            print(f"Failed to fetch {symbol}: {e}")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(verify())
