# File: app/model_loader.py

import os
from pathlib import Path
from typing import List

import torch
from transformers import AutoTokenizer

from .model_definition import IndoBERTClassifier, MODEL_NAME

LABELS = ["tidak_layak_anak", "layak_anak"]  # Sesuaikan dgn label trainingmu

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_FILE = MODEL_DIR / "best_model.pth"

CLASSIFIER_TYPE = "cnn"  # Sesuaikan dgn training (kamu pakai CNN)

class ChildSafeClassifier:
    def __init__(self, device=None):
        print("[ModelLoader] Initializing classifier ...")

        if device is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
        self.device = torch.device(device)
        print("[ModelLoader] Device:", self.device)

        # Load tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

        # Build model
        self.model = IndoBERTClassifier(
            num_labels=len(LABELS),
            classifier_type=CLASSIFIER_TYPE,
            use_dropout=False,
            dropout_rate=0.0,
        )

        # Load weights
        print(f"[ModelLoader] Loading weights from {MODEL_FILE}")
        state = torch.load(MODEL_FILE, map_location=self.device)

        state_dict = state["model_state_dict"]
        missing, unexpected = self.model.load_state_dict(state_dict, strict=False)

        print("[ModelLoader] Loaded state_dict.")
        print("  Missing keys:", missing)
        print("  Unexpected keys:", unexpected)

        self.model.to(self.device)
        self.model.eval()
        print("[ModelLoader] Model ready.")

    @torch.inference_mode()
    def predict(self, texts: List[str]):
        enc = self.tokenizer(
            texts,
            padding=True,
            truncation=True,
            max_length=512,
            return_tensors="pt"
        )

        enc = {k: v.to(self.device) for k, v in enc.items()}

        outputs = self.model(**enc)
        logits = outputs["logits"]
        probs = torch.softmax(logits, dim=-1)

        results = []
        for prob in probs:
            score, idx = torch.max(prob, dim=-1)
            results.append({
                "label": LABELS[int(idx)],
                "score": float(score)
            })

        return results


_classifier = None

def get_classifier():
    global _classifier
    if _classifier is None:
        _classifier = ChildSafeClassifier()
    return _classifier
