"""
Multi-task LSTM for OHLCV sequence prediction (direction + return).
Accepts same input layout as CNN [B, C, L] and transposes to [B, L, C] for LSTM.
"""
from typing import Tuple

import torch
import torch.nn as nn


class MultiTaskLSTM(nn.Module):
    """
    Multi-task LSTM for OHLCV windows.

    Input:  [B, C, L] (same as CNN; transposed to [B, L, C] for LSTM)
    Outputs:
        - cls_logits: [B, num_classes]  (direction classification)
        - reg_output: [B, 1]            (future return regression)
    """

    def __init__(
        self,
        num_features: int = 5,
        num_classes: int = 2,
        hidden_size: int = 128,
        num_layers: int = 2,
        dropout: float = 0.3,
        bidirectional: bool = False,
    ) -> None:
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.bidirectional = bidirectional
        self.num_directions = 2 if bidirectional else 1

        self.lstm = nn.LSTM(
            input_size=num_features,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
            bidirectional=bidirectional,
        )

        feat_dim = hidden_size * self.num_directions
        self.dropout = nn.Dropout(dropout)

        self.cls_head = nn.Sequential(
            nn.Linear(feat_dim, feat_dim // 2),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout),
            nn.Linear(feat_dim // 2, num_classes),
        )

        self.reg_head = nn.Sequential(
            nn.Linear(feat_dim, feat_dim // 2),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout),
            nn.Linear(feat_dim // 2, 1),
        )

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        # x: [B, C, L] -> [B, L, C]
        x = x.transpose(1, 2)

        # LSTM
        out, (h_n, _) = self.lstm(x)
        # Use last time step output
        feats = out[:, -1, :]  # [B, hidden_size * num_directions]
        feats = self.dropout(feats)

        cls_logits = self.cls_head(feats)
        reg_output = self.reg_head(feats)
        return cls_logits, reg_output
