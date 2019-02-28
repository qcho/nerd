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
        self._model = None
        self.metadata = ModelMetadata()

    @property
    def entity_types(self):
        return self.metadata.entity_types

    @property
    def model(self):
        self._load_model()
        return self._model

    def upsert_entity_type(self, code, name=None):
        self.metadata.upsert_entity_type(code, name)
        self._save_metadata()

    def load(self):
        self._load_metadata()

    def save(self, model=None):
        if self._model is None:
            self.directories.initialize()
        self._save_metadata()
        self._save_model(model)

    def _load_metadata(self):
        self.metadata = ModelMetadata.from_path(self.directories.metadata_file())

    def _save_metadata(self):
        self.metadata.save(self.directories.metadata_file())

    def _load_model(self):
        if not self._model is None:
            return
        self._model = spacy.load(self.directories.model_path())

    def _save_model(self, model: Language = None):
        if model is not None:
            self._model = model
        if self._model is None:
            raise Exception("Saving a model requires having a model")
        self._model.to_disk(self.directories.model_path())
