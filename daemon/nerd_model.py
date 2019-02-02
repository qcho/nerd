from spacy.language import Language

from pathlib import Path
from typing import List

class NerdModel():
    def __init__(self, model: Language, path: Path, entity_types: List[str]):
        self.nlp = model
        self.path = path
        self.entity_types = entity_types
