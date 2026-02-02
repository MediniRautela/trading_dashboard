from typing import Tuple

import torch
import torch.nn as nn


class MultiTaskCNN(nn.Module):
    """
    Multi-task 1D CNN for OHLCV windows.

    Input:  [B, C, L] where
        C = num_features (e.g., 5 for OHLCV)
        L = window_length

    Outputs:
        - cls_logits: [B, num_classes]  (direction classification)
        - reg_output: [B, 1]            (future return regression)
    """

    def __init__(
        self,
        num_features: int = 5,
        num_classes: int = 2,
        conv_channels=(32, 64, 128),
        kernel_size: int = 3,
        dropout: float = 0.3,
    ) -> None:
        super().__init__()

        layers = []
        in_channels = num_features
        for out_channels in conv_channels:
            layers.append(
                nn.Conv1d(
                    in_channels,
                    out_channels,
                    kernel_size=kernel_size,
                    padding=kernel_size // 2,
                )
            )
            layers.append(nn.BatchNorm1d(out_channels))
            layers.append(nn.ReLU(inplace=True))
            layers.append(nn.MaxPool1d(kernel_size=2))
            in_channels = out_channels

        self.feature_extractor = nn.Sequential(*layers)
        self.global_pool = nn.AdaptiveAvgPool1d(1)
        self.dropout = nn.Dropout(dropout)

        hidden_dim = conv_channels[-1]

        # Classification head
        self.cls_head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim // 2, num_classes),
        )

        # Regression head
        self.reg_head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim // 2, 1),
        )

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        # x: [B, C, L]
        feats = self.feature_extractor(x)  # [B, C', L']
        feats = self.global_pool(feats).squeeze(-1)  # [B, C']
        feats = self.dropout(feats)

        cls_logits = self.cls_head(feats)  # [B, num_classes]
        reg_output = self.reg_head(feats)  # [B, 1]
        return cls_logits, reg_output

