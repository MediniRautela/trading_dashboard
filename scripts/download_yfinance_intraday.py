import argparse
import os

import pandas as pd
import yfinance as yf


def download_intraday_15m(symbol: str, out_dir: str, period: str = "60d") -> str:
    """
    Download intraday 15-minute OHLCV data for a single US symbol using yfinance.

    NOTE:
    - Yahoo Finance typically provides ~60 days of true intraday history for 15m bars.
    - This is perfect to get your pipeline + model running; for full 2+ years,
      you'll likely need a provider like Polygon flat files.
    """
    os.makedirs(out_dir, exist_ok=True)

    df = yf.download(
        tickers=symbol,
        period=period,      # e.g., "60d"
        interval="15m",
        auto_adjust=False,
        progress=False,
    )

    if df.empty:
        raise RuntimeError(f"No data returned for symbol {symbol}.")

    df = df.rename(
        columns={
            "Open": "open",
            "High": "high",
            "Low": "low",
            "Close": "close",
            "Adj Close": "adj_close",
            "Volume": "volume",
        }
    )

    df.index.name = "timestamp"
    out_path = os.path.join(out_dir, f"{symbol}_15m.csv")
    df.to_csv(out_path)
    return out_path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--symbol", type=str, default="AAPL", help="Ticker symbol, e.g. AAPL")
    parser.add_argument(
        "--out-dir",
        type=str,
        default="data/raw",
        help="Directory to save the CSV file.",
    )
    parser.add_argument(
        "--period",
        type=str,
        default="60d",
        help="Lookback period supported by yfinance for intraday, e.g. 30d, 60d.",
    )
    args = parser.parse_args()

    csv_path = download_intraday_15m(args.symbol, args.out_dir, args.period)
    print(f"Saved {args.symbol} 15m intraday data to {csv_path}")


if __name__ == "__main__":
    main()

