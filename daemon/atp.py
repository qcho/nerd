import spacy
from nerd_model import NerdModel
from nerd_types import NEREntity
from typing import List, Tuple

def parse_text(model: NerdModel, text: str):
    """Parses a text returning the SpaCy JSON representation of it

    Args:
        model (NerdModel): Model to use to parse the text
        text (str): Text to parse

    Returns:
        JSON: NLP JSON representation of the given text
    """
    doc = model.nlp(text)
    return doc.to_json()

def train_model(model: NerdModel, train_data: Tuple[str, List[NEREntity]]):
    return True
