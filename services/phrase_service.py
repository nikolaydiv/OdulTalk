import json
from pathlib import Path
import sys
import os

def resource_path(relative_path: str) -> str:
    base_path = getattr(sys, "_MEIPASS", os.path.abspath("."))
    return str(Path(base_path) / relative_path)

class PhrasesService:
    def __init__(self, json_path: str):
        self.json_path = json_path
        self.phrases = []
        self._load_phrases()

    def _load_phrases(self):
        path = resource_path(self.json_path)

        with open(path, "r", encoding="utf-8") as file:
            self._phrases = json.load(file)

    def get_all(self):
        return self._phrases

    def get_by_id(self, phrase_id: int):
        return next(
            (p for p in self._phrases if p["id"] == phrase_id),
            None
        )