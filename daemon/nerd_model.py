from spacy.language import Language

from pathlib import Path

class NerdModel():
    def __init__(self, model: Language, path: Path):
        self.nlp = model
        self.path = path
