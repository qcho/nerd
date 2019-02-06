from spacy.language import Language
import spacy
import os
import io
import json

from pathlib import Path
from typing import List

from model_metadata import ModelMetadata
from model_directories import ModelDirectories

class NerdModel():
    def __init__(self, name: str, path: Path):
        self.name = name
        self.directories = ModelDirectories(path)
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

    def save(self, model=None):
        if self.model is None:
            self.directories.initialize()
        self._save_metadata()
        self._save_model(model)

    def _load_metadata(self):
        self.metadata = ModelMetadata.from_path(self.directories.metadata_file())

    def _save_metadata(self):
        self.metadata.save(self.directories.metadata_file())

    def _load_model(self):
        if not self.model is None:
            return
        self.model = spacy.load(self.directories.model_path())

    def _save_model(self, model: Language = None):
        if model is not None:
            self.model = model
        if self.model is None:
            raise Exception("Saving a model requires having a model")
        self.model.to_disk(self.directories.model_path())
