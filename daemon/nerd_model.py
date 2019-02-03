from spacy.language import Language
import spacy
import os
import io
import json

from pathlib import Path
from typing import List

from model_metadata import ModelMetadata

class NerdModel():
    def __init__(self, name: str, path: Path):
        self.name = name
        self.path = path
        self.model = None
        self.metadata = ModelMetadata()

    @property
    def entity_types(self):
        return self.metadata.entity_types

    def upsert_entity_type(self, code, name=None):
        self.metadata.upsert_entity_type(code, name)
        self._save_metadata()

    def load(self):
        self._load_metadata()
        self._load_model()

    def _metadata_path(self):
        return self.path / 'metadata.json'

    def model_path(self):
        return self.path / 'model'

    def data_path(self):
        return self.path / 'data'

    def save(self, model=None):
        self._save_metadata()
        self._save_model(model)

    def _load_metadata(self):
        with open(self._metadata_path(), 'r', encoding='utf8') as inf:
            raw_json = json.load(inf)
            self.metadata = ModelMetadata.from_dict(raw_json)

    def _save_metadata(self):
        with open(self._metadata_path(), 'w', encoding='utf8') as outf:
            json.dump(self.metadata.to_dict(), outf, indent=True)

    def _load_model(self):
        if not self.model is None:
            return
        self.model = spacy.load(self.model_path())

    def _save_model(self, model: Language = None):
        if model is not None:
            self.model = model
        if self.model is None:
            raise Exception("Saving a model requires having a model")
        os.makedirs(self.path)
        os.makedirs(self.data_path())
        self.model.to_disk(self.model_path())
