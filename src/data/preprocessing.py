import os
from dataclasses import dataclass
from typing import List, Tuple

import numpy as np
import pandas as pd


@dataclass
class WindowConfig:
    window_length: int = 64
    prediction_horizon: int = 1


def load_minute_csv(path: str) -> pd.DataFrame:
    """
    Load raw 1-minute OHLCV CSV with at least:
    ['timestamp', 'open', 'high', 'low', 'close', 'volume'].
    """
    df = pd.read_csv(path)

    # Special case: yfinance CSV saved with an extra "Price/Ticker/timestamp" header block
    # like:
    #   Price,adj_close,close,high,low,open,volume
    #   Ticker,AAPL,AAPL,AAPL,AAPL,AAPL,AAPL
    #   timestamp,,,,,,
    #   2025-... , ...
    if "Price" in df.columns and "adj_close" in df.columns:
        df = pd.read_csv(
            path,
            header=None,
            skiprows=3,
            names=["timestamp", "adj_close", "close", "high", "low", "open", "volume"],
        )

    # Handle different timestamp/index conventions (e.g. yfinance CSV)
    if "timestamp" in df.columns:
        ts_col = "timestamp"
    elif "Datetime" in df.columns:
        ts_col = "Datetime"
    elif "Date" in df.columns:
        ts_col = "Date"
    else:
        # Fallback: assume first column is the timestamp index
        ts_col = df.columns[0]

    df[ts_col] = pd.to_datetime(df[ts_col], utc=True)
    df = df.set_index(ts_col).sort_index()

    # Standardize expected columns
    rename_map = {
        "Open": "open",
        "High": "high",
        "Low": "low",
        "Close": "close",
        "Adj Close": "adj_close",
        "Volume": "volume",
    }
    df = df.rename(columns=rename_map)

    return df[["open", "high", "low", "close", "volume"]]


def resample_to_15min(df_minute: pd.DataFrame) -> pd.DataFrame:
    """
    Resample minute OHLCV to 15-minute OHLCV.
    """
    ohlc_dict = {
        "open": "first",
        "high": "max",
        "low": "min",
        "close": "last",
        "volume": "sum",
    }
    df_15 = df_minute.resample("15min").agg(ohlc_dict).dropna()
    return df_15


def compute_features(df_ohlcv: pd.DataFrame) -> pd.DataFrame:
    """
    Basic feature engineering:
    - log returns of close
    - normalized volume (z-score)
    For now keep raw OHLCV as channels; you can extend later.
    """
    df = df_ohlcv.copy()
    df["log_return"] = np.log(df["close"]).diff()
    df["volume_z"] = (df["volume"] - df["volume"].mean()) / (df["volume"].std() + 1e-8)
    df = df.dropna()
    return df


def make_windows(
    df: pd.DataFrame,
    config: WindowConfig,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Build sliding windows and multi-task targets.

    X shape: [num_samples, num_features, window_length]
    y_cls shape: [num_samples]           (0/1 direction)
    y_reg shape: [num_samples]           (future return)

    Targets:
      - Regression: future log return over prediction_horizon
      - Classification: 1 if future return > 0, else 0
    """
    feature_cols = ["open", "high", "low", "close", "volume"]
    df = df.copy()

    # future log return using close price
    log_price = np.log(df["close"])
    future_log_price = log_price.shift(-config.prediction_horizon)
    future_ret = future_log_price - log_price
    df["future_ret"] = future_ret

    df = df.dropna()

    values = df[feature_cols].values
    future_ret_vals = df["future_ret"].values

    num_features = values.shape[1]
    X_list: List[np.ndarray] = []
    y_cls_list: List[float] = []
    y_reg_list: List[float] = []

    for end in range(config.window_length, len(df)):
        start = end - config.window_length
        window = values[start:end]
        target_ret = future_ret_vals[end - 1]  # align target with last step in window
        X_list.append(window.T)  # [features, window_length]
        y_reg_list.append(target_ret)
        y_cls_list.append(1.0 if target_ret > 0 else 0.0)

    if not X_list:
        raise ValueError("Not enough data to create any windows.")

    X = np.stack(X_list, axis=0).astype(np.float32)
    y_cls = np.array(y_cls_list, dtype=np.float32)
    y_reg = np.array(y_reg_list, dtype=np.float32)

    return X, y_cls, y_reg


def save_npz(path: str, X: np.ndarray, y_cls: np.ndarray, y_reg: np.ndarray) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    np.savez_compressed(path, X=X, y_cls=y_cls, y_reg=y_reg)


def load_npz(path: str) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    data = np.load(path)
    return data["X"], data["y_cls"], data["y_reg"]

