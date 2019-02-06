import spacy
from hashlib import sha256
from pathlib import Path
from nerd_model import NerdModel
from nerd_type_aliases import NEREntity
from typing import List, Tuple
import json

def sanitize_text(text: str):
    return text.strip()

def hash_text(text: str):
    return sha256(sanitize_text(text).encode('utf-8')).hexdigest()

def parse_text(model: NerdModel, text: str):
    """Parses a text returning the SpaCy JSON representation of it

    Args:
        model (NerdModel): Model to use to parse the text
        text (str): Text to parse

    Returns:
        JSON: NLP JSON representation of the given text
    """
    doc = model.model(sanitize_text(text))
    return doc.to_json()

def train_model(model: NerdModel, train_data: Tuple[str, List[NEREntity]]):
    return True

def queue_text(model: NerdModel, text: str):
    import os
    file_name = f"{hash_text(text)}.txt"
    file_path = model.directories.queue_path() / file_name
    parsed_text = parse_text(model, text)
    with open(file_path, 'w', encoding='utf8') as outf:
        json.dump(parsed_text, outf)
