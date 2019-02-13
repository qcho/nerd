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

def file_path_for(base_path: Path, text: str):
    file_name = f"{hash_text(text)}.txt"
    return base_path / file_name

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

# TODO: Rename this method to something as queue_trained
def train_model(model: NerdModel, train_data: any):
    text = train_data['text']
    file_path = file_path_for(model.directories.trained_path(), text)
    with open(file_path, 'w', encoding='utf8') as outf:
        json.dump(train_data, outf)

def queue_text(model: NerdModel, text: str):
    import os
    file_path = file_path_for(model.directories.queue_path(), text)
    parsed_text = parse_text(model, text)
    with open(file_path, 'w', encoding='utf8') as outf:
        json.dump(parsed_text, outf)

def list_queued(model: NerdModel) -> List[Path]:
    return list(model.directories.queue_path().glob('*.txt'))

def list_trained(model: NerdModel) -> List[Path]:
    return list(model.directories.trained_path().glob('*.txt'))
