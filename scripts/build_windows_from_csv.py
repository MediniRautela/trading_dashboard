import argparse
import os
import sys

# Ensure project root is on PYTHONPATH so `src` can be imported
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.data.preprocessing import (
    WindowConfig,
    load_minute_csv,
    resample_to_15min,
    make_windows,
    save_npz,
)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--csv",
        type=str,
        required=True,
        help="Path to intraday CSV (with 'timestamp', 'open', 'high', 'low', 'close', 'volume').",
    )
    parser.add_argument(
        "--out",
        type=str,
        default="data/windows/train.npz",
        help="Output .npz path for windows.",
    )
    parser.add_argument(
        "--window-length",
        type=int,
        default=64,
        help="Number of 15-min bars per input window.",
    )
    parser.add_argument(
        "--horizon",
        type=int,
        default=1,
        help="Prediction horizon in bars.",
    )
    args = parser.parse_args()

    df_minute = load_minute_csv(args.csv)
    df_15 = resample_to_15min(df_minute)

    cfg = WindowConfig(window_length=args.window_length, prediction_horizon=args.horizon)
    X, y_cls, y_reg = make_windows(df_15, cfg)

    save_npz(args.out, X, y_cls, y_reg)
    print(f"Saved windows to {args.out} (X: {X.shape}, y_cls: {y_cls.shape}, y_reg: {y_reg.shape})")


if __name__ == "__main__":
    main()

