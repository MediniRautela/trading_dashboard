"""
Inference module for loading trained model and making predictions on new data.
"""
import os
from typing import Tuple

import numpy as np
import pandas as pd
import torch
import yaml
import yfinance as yf

from src.data.preprocessing import WindowConfig, load_minute_csv, resample_to_15min
from src.models.multitask_cnn import MultiTaskCNN
from src.models.multitask_lstm import MultiTaskLSTM


def load_model(checkpoint_path: str, device: str = "cpu"):
    """
    Load a trained multi-task model (CNN or LSTM) from checkpoint.
    Model type is read from checkpoint config.

    Returns:
        model: Loaded model in eval mode (MultiTaskCNN or MultiTaskLSTM)
        config: Config dict from checkpoint
    """
    checkpoint = torch.load(checkpoint_path, map_location=device)
    config = checkpoint["config"]
    model_cfg = config["model"]
    model_type = model_cfg.get("type", "cnn").lower()

    if model_type == "lstm":
        model = MultiTaskLSTM(
            num_features=model_cfg["num_features"],
            num_classes=model_cfg["num_classes"],
            hidden_size=int(model_cfg.get("hidden_size", 128)),
            num_layers=int(model_cfg.get("num_layers", 2)),
            dropout=float(model_cfg.get("dropout", 0.3)),
            bidirectional=bool(model_cfg.get("bidirectional", False)),
        )
    else:
        model = MultiTaskCNN(
            num_features=model_cfg["num_features"],
            num_classes=model_cfg["num_classes"],
            conv_channels=tuple(model_cfg.get("conv_channels", [32, 64, 128])),
            kernel_size=int(model_cfg.get("kernel_size", 3)),
            dropout=float(model_cfg.get("dropout", 0.3)),
        )

    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()
    model.to(device)

    return model, config


def fetch_latest_data(
    symbol: str, period: str = "60d", interval: str = "15m"
) -> pd.DataFrame:
    """
    Fetch latest intraday OHLCV data for a symbol using yfinance.

    Returns:
        DataFrame with columns: timestamp, open, high, low, close, volume
    """
    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period, interval=interval, auto_adjust=False)

    if df.empty:
        raise ValueError(f"No data returned for symbol {symbol}")

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
    df = df.reset_index()
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True)
    df = df.set_index("timestamp").sort_index()

    return df[["open", "high", "low", "close", "volume"]]


def prepare_prediction_window(
    df: pd.DataFrame, window_length: int = 64
) -> torch.Tensor:
    """
    Prepare the most recent window from OHLCV data for prediction.

    Args:
        df: DataFrame with OHLCV columns
        window_length: Number of 15-min bars to use

    Returns:
        Tensor of shape [1, 5, window_length] ready for model input
    """
    if len(df) < window_length:
        raise ValueError(
            f"Need at least {window_length} bars, but only have {len(df)}"
        )

    feature_cols = ["open", "high", "low", "close", "volume"]
    values = df[feature_cols].values[-window_length:]  # Last window_length bars
    window = values.T  # [5, window_length]

    # Add batch dimension: [1, 5, window_length]
    window_tensor = torch.from_numpy(window).float().unsqueeze(0)

    return window_tensor


def predict(
    model,
    window_tensor: torch.Tensor,
    device: str = "cpu",
) -> Tuple[float, float, float]:
    """
    Run model inference on a window.

    Args:
        model: Trained MultiTaskCNN or MultiTaskLSTM model
        window_tensor: Input tensor [1, 5, window_length]
        device: Device to run on

    Returns:
        Tuple of:
            - up_probability: Probability of upward movement (0-1)
            - down_probability: Probability of downward movement (0-1)
            - predicted_return: Predicted log return (scalar)
    """
    model.eval()
    window_tensor = window_tensor.to(device)

    with torch.no_grad():
        cls_logits, reg_output = model(window_tensor)

        # Classification: apply softmax to get probabilities
        cls_probs = torch.softmax(cls_logits, dim=1)
        up_prob = cls_probs[0, 1].item()  # Class 1 = up
        down_prob = cls_probs[0, 0].item()  # Class 0 = down

        # Regression: predicted log return
        pred_return = reg_output[0, 0].item()

    return up_prob, down_prob, pred_return
