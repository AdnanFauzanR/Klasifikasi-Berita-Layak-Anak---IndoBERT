# File: app/model_definition.py
# Tujuan: Definisi IndoBERTClassifier persis dengan training.

import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import AutoModel

MODEL_NAME = "indobenchmark/indobert-base-p1"

class IndoBERTClassifier(nn.Module):
    def __init__(
        self,
        model_name=MODEL_NAME,
        num_labels=2,
        classifier_type="cnn",  # "ann", "lstm", or "cnn"
        use_dropout=False,
        dropout_rate=0.1,
        hidden_dim=256
    ):
        super().__init__()
        self.bert = AutoModel.from_pretrained(model_name)
        self.classifier_type = classifier_type.lower()

        self.dropout = nn.Dropout(dropout_rate) if use_dropout else nn.Identity()

        if self.classifier_type == "ann":
            self.classifier = nn.Linear(self.bert.config.hidden_size, num_labels)

        elif self.classifier_type == "lstm":
            self.lstm = nn.LSTM(
                input_size=self.bert.config.hidden_size,
                hidden_size=hidden_dim,
                num_layers=1,
                batch_first=True,
                bidirectional=True
            )
            self.classifier = nn.Linear(hidden_dim * 2, num_labels)

        elif self.classifier_type == "cnn":
            self.conv1 = nn.Conv1d(
                in_channels=self.bert.config.hidden_size,
                out_channels=hidden_dim,
                kernel_size=3,
                padding=1
            )
            self.pool = nn.AdaptiveMaxPool1d(1)
            self.classifier = nn.Linear(hidden_dim, num_labels)

        else:
            raise ValueError(f"Unsupported classifier type: {classifier_type}")

    def forward(self, input_ids, attention_mask, token_type_ids=None, labels=None):
        outputs = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask,
            token_type_ids=token_type_ids
        )

        if self.classifier_type == "ann":
            pooled_output = outputs.last_hidden_state[:, 0]
            pooled_output = self.dropout(pooled_output)
            logits = self.classifier(pooled_output)

        elif self.classifier_type == "lstm":
            lstm_output, _ = self.lstm(outputs.last_hidden_state)
            pooled_output = self.dropout(lstm_output[:, -1, :])
            logits = self.classifier(pooled_output)

        elif self.classifier_type == "cnn":
            x = outputs.last_hidden_state.transpose(1, 2)
            x = F.relu(self.conv1(x))
            x = self.pool(x).squeeze(-1)
            x = self.dropout(x)
            logits = self.classifier(x)

        loss = None
        if labels is not None:
            loss = F.cross_entropy(logits, labels)

        return {"loss": loss, "logits": logits}
