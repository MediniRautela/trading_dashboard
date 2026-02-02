"""
Streamlit frontend for the multi-task CNN stock prediction dashboard.
"""
import os
import sys

# Ensure src can be imported
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import yaml

from src.inference import (
    load_model,
    fetch_latest_data,
    prepare_prediction_window,
    predict,
)


# Page config
st.set_page_config(
    page_title="Stock Prediction Dashboard",
    page_icon="📈",
    layout="wide",
)

# Title
st.title("📈 Stock Prediction Dashboard")
st.markdown(
    "Multi-task CNN predictor for intraday stock direction and return forecasting"
)

# Sidebar for user inputs
st.sidebar.header("⚙️ Configuration")

# Load available stocks from config
@st.cache_data
def load_available_stocks():
    """Load list of available stocks from config."""
    try:
        with open("configs/multitask_config.yaml", "r") as f:
            config = yaml.safe_load(f)
            return config.get("data", {}).get("symbols", ["AAPL", "MSFT", "AMZN"])
    except Exception:
        return ["AAPL", "MSFT", "AMZN", "GOOGL", "META", "TSLA", "NVDA", "SPY"]


available_stocks = load_available_stocks()
selected_stock = st.sidebar.selectbox(
    "Select Stock Symbol",
    options=available_stocks,
    index=0,
)

prediction_horizon = st.sidebar.selectbox(
    "Prediction Horizon",
    options=[1, 2, 3, 4],
    index=0,
    help="Number of 15-minute bars ahead to predict",
)

# Model checkpoint path
checkpoint_path = st.sidebar.text_input(
    "Model Checkpoint Path",
    value="checkpoints/best_multitask_cnn.pt",
    help="Path to trained model checkpoint",
)

# Load model (cached)
@st.cache_resource
def get_model(checkpoint_path: str):
    """Load and cache the model."""
    if not os.path.exists(checkpoint_path):
        st.error(f"Checkpoint not found at {checkpoint_path}")
        return None, None

    try:
        device = "cpu"  # Use CPU for inference
        model, config = load_model(checkpoint_path, device=device)
        return model, config
    except Exception as e:
        st.error(f"Error loading model: {e}")
        return None, None


model, config = get_model(checkpoint_path)

if model is None:
    st.stop()

# Main content area
col1, col2 = st.columns([2, 1])

with col1:
    st.subheader(f"📊 Recent Price Data: {selected_stock}")

    # Fetch latest data
    with st.spinner(f"Fetching latest data for {selected_stock}..."):
        try:
            df = fetch_latest_data(selected_stock, period="60d", interval="15m")
            st.success(f"Loaded {len(df)} bars of 15-minute data")

            # Display recent data table
            st.dataframe(
                df.tail(20).style.format(
                    {
                        "open": "{:.2f}",
                        "high": "{:.2f}",
                        "low": "{:.2f}",
                        "close": "{:.2f}",
                        "volume": "{:,.0f}",
                    }
                ),
                use_container_width=True,
                height=400,
            )

        except Exception as e:
            st.error(f"Error fetching data: {e}")
            st.stop()

with col2:
    st.subheader("🎯 Prediction")

    # Prepare window and predict
    try:
        window_length = config.get("data", {}).get("window_length", 64)
        window_tensor = prepare_prediction_window(df, window_length=window_length)

        with st.spinner("Running prediction..."):
            up_prob, down_prob, pred_return = predict(model, window_tensor, device="cpu")

        # Debug: show raw model outputs
        st.write(
            "Raw model outputs:",
            {
                "up_prob": up_prob,
                "down_prob": down_prob,
                "pred_return": pred_return,
            },
        )

        # Display results
        st.metric(
            "Predicted Direction",
            "📈 UP" if up_prob > 0.5 else "📉 DOWN",
        )

        st.progress(up_prob, text=f"Up Probability: {up_prob:.1%}")
        st.progress(down_prob, text=f"Down Probability: {down_prob:.1%}")

        # Convert log return to percentage
        pred_return_pct = (np.exp(pred_return) - 1) * 100

        st.metric(
            "Predicted Return",
            f"{pred_return_pct:+.2f}%",
            help=f"Predicted log return: {pred_return:.4f}",
        )

        # Interpretation
        if up_prob > 0.6:
            st.success("Strong upward signal")
        elif down_prob > 0.6:
            st.warning("Strong downward signal")
        else:
            st.info("Neutral signal")

    except Exception as e:
        st.error(f"Error making prediction: {e}")

# Price chart
st.subheader("📈 Price Chart (Last 100 Bars)")
try:
    chart_df = df.tail(100).copy()

    fig = go.Figure()

    # Candlestick chart
    fig.add_trace(
        go.Candlestick(
            x=chart_df.index,
            open=chart_df["open"],
            high=chart_df["high"],
            low=chart_df["low"],
            close=chart_df["close"],
            name="Price",
        )
    )

    fig.update_layout(
        xaxis_rangeslider_visible=False,
        height=500,
        xaxis_title="Time",
        yaxis_title="Price ($)",
        template="plotly_white",
    )

    st.plotly_chart(fig, use_container_width=True)

except Exception as e:
    st.error(f"Error creating chart: {e}")

# Footer
st.markdown("---")
st.markdown(
    """
    **Model Info:**
    - Architecture: Multi-task 1D CNN
    - Input: 64 bars × 5 features (OHLCV)
    - Outputs: Direction probability + Expected return
    """
)
