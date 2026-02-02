import argparse
import os
from typing import Tuple

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import yaml

from src.data.preprocessing import load_npz
from src.models.multitask_cnn import MultiTaskCNN


def load_config(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def make_dataloader(
    npz_path: str,
    batch_size: int,
    shuffle: bool,
) -> DataLoader:
    X, y_cls, y_reg = load_npz(npz_path)
    X_tensor = torch.from_numpy(X)  # [N, C, L]
    y_cls_tensor = torch.from_numpy(y_cls).long()  # classification labels 0/1
    y_reg_tensor = torch.from_numpy(y_reg).float().unsqueeze(-1)  # [N, 1]

    dataset = TensorDataset(X_tensor, y_cls_tensor, y_reg_tensor)
    return DataLoader(dataset, batch_size=batch_size, shuffle=shuffle)


def train_epoch(
    model: nn.Module,
    loader: DataLoader,
    optimizer: torch.optim.Optimizer,
    device: torch.device,
    alpha: float = 1.0,
) -> Tuple[float, float, float]:
    """
    alpha: weight for classification loss; regression weight is (1 - alpha) by default.
    """
    model.train()
    cls_loss_fn = nn.CrossEntropyLoss()
    reg_loss_fn = nn.MSELoss()

    total_loss = 0.0
    total_cls_loss = 0.0
    total_reg_loss = 0.0
    total_batches = 0

    for X, y_cls, y_reg in loader:
        X = X.to(device)
        y_cls = y_cls.to(device)
        y_reg = y_reg.to(device)

        optimizer.zero_grad()
        cls_logits, reg_output = model(X)

        loss_cls = cls_loss_fn(cls_logits, y_cls)
        loss_reg = reg_loss_fn(reg_output, y_reg)

        loss = alpha * loss_cls + (1.0 - alpha) * loss_reg
        loss.backward()
        optimizer.step()

        total_loss += loss.item()
        total_cls_loss += loss_cls.item()
        total_reg_loss += loss_reg.item()
        total_batches += 1

    return (
        total_loss / total_batches,
        total_cls_loss / total_batches,
        total_reg_loss / total_batches,
    )


def evaluate(
    model: nn.Module,
    loader: DataLoader,
    device: torch.device,
) -> Tuple[float, float, float]:
    model.eval()
    cls_loss_fn = nn.CrossEntropyLoss()
    reg_loss_fn = nn.MSELoss()

    total_loss = 0.0
    total_cls_loss = 0.0
    total_reg_loss = 0.0
    total_batches = 0

    correct = 0
    total = 0

    with torch.no_grad():
        for X, y_cls, y_reg in loader:
            X = X.to(device)
            y_cls = y_cls.to(device)
            y_reg = y_reg.to(device)

            cls_logits, reg_output = model(X)

            loss_cls = cls_loss_fn(cls_logits, y_cls)
            loss_reg = reg_loss_fn(reg_output, y_reg)
            loss = 0.5 * (loss_cls + loss_reg)

            total_loss += loss.item()
            total_cls_loss += loss_cls.item()
            total_reg_loss += loss_reg.item()
            total_batches += 1

            preds = cls_logits.argmax(dim=1)
            correct += (preds == y_cls).sum().item()
            total += y_cls.size(0)

    accuracy = correct / total if total > 0 else 0.0
    return (
        total_loss / total_batches,
        total_cls_loss / total_batches,
        total_reg_loss / total_batches,
        accuracy,
    )


def main(config_path: str) -> None:
    config = load_config(config_path)
    data_cfg = config["data"]
    train_cfg = config["training"]
    model_cfg = config["model"]

    # Choose device safely: if config requests CUDA but it's unavailable,
    # fall back to CPU instead of raising an error.
    requested_device = train_cfg.get(
        "device", "cuda" if torch.cuda.is_available() else "cpu"
    )
    if requested_device == "cuda" and not torch.cuda.is_available():
        print("CUDA not available, falling back to CPU.")
        requested_device = "cpu"
    device = torch.device(requested_device)

    batch_size = int(train_cfg["batch_size"])
    num_epochs = int(train_cfg["num_epochs"])
    # Ensure numeric hyperparameters are floats, even if loaded as strings
    lr = float(train_cfg["learning_rate"])
    weight_decay = float(train_cfg.get("weight_decay", 0.0))

    data_dir = data_cfg.get("data_dir", "data")
    train_npz = os.path.join(data_dir, "windows", "train.npz")
    val_npz = os.path.join(data_dir, "windows", "val.npz")

    train_loader = make_dataloader(train_npz, batch_size=batch_size, shuffle=True)
    val_loader = make_dataloader(val_npz, batch_size=batch_size, shuffle=False)

    model = MultiTaskCNN(
        num_features=model_cfg["num_features"],
        num_classes=model_cfg["num_classes"],
        conv_channels=tuple(model_cfg["conv_channels"]),
        kernel_size=model_cfg["kernel_size"],
        dropout=model_cfg["dropout"],
    ).to(device)

    optimizer = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=weight_decay)

    best_val_loss = float("inf")
    os.makedirs("checkpoints", exist_ok=True)

    for epoch in range(1, num_epochs + 1):
        train_loss, train_cls_loss, train_reg_loss = train_epoch(
            model, train_loader, optimizer, device
        )
        (
            val_loss,
            val_cls_loss,
            val_reg_loss,
            val_acc,
        ) = evaluate(model, val_loader, device)

        print(
            f"Epoch {epoch}/{num_epochs} "
            f"- train_loss: {train_loss:.4f} (cls {train_cls_loss:.4f}, reg {train_reg_loss:.4f}) "
            f"- val_loss: {val_loss:.4f} (cls {val_cls_loss:.4f}, reg {val_reg_loss:.4f}) "
            f"- val_acc: {val_acc:.4f}"
        )

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            ckpt_path = os.path.join("checkpoints", "best_multitask_cnn.pt")
            torch.save(
                {
                    "model_state_dict": model.state_dict(),
                    "config": config,
                },
                ckpt_path,
            )
            print(f"Saved best model to {ckpt_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--config",
        type=str,
        default="configs/multitask_config.yaml",
        help="Path to YAML config file.",
    )
    args = parser.parse_args()
    main(args.config)

