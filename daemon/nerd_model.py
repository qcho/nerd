from spacy.language import Language
import spacy
import os

from pathlib import Path
from typing import List

class NerdModel():
    def __init__(self, name: str, path: Path):
        self.name = name
        self.path = path
        self.entity_types = ['PER', 'LOC', 'ORG'] # TODO: Load this from somewhere
        self.model = None

    def load(self):
        if not self.model is None:
            return
        self.model = spacy.load(self.model_path())

    def model_path(self):
        return self.path / 'model'

    def data_path(self):
        return self.path / 'data'

    def save(self, model=None):
        if model is not None:
            self.model = model
        os.makedirs(self.path)
        os.makedirs(self.data_path())
        self.model.to_disk(self.model_path())
