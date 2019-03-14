import json
import logging
import os
from hashlib import sha256
from pathlib import Path
from typing import List, Tuple

import spacy
# from nerd_model import NerdModel
# from nerd_type_aliases import NEREntity

from core.document.corpus import Corpus

logger = logging.getLogger(__name__)


def sanitize_text(text: str):
    return text.strip()


def hash_text(text: str):
    return sha256(sanitize_text(text).encode('utf-8')).hexdigest()


def file_path_for(base_path: Path, text: str):
    file_name = f"{hash_text(text)}.txt"
    return base_path / file_name


def parse_text(model: Corpus, text: str):
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


def train_model(model: Corpus, train_data: any):

    text = train_data['text']
    file_path = file_path_for(model.directories.trained_path(), text)
    with open(file_path, 'w', encoding='utf8') as outf:
        json.dump(train_data, outf)


def queue_text(model: Corpus, text: str):
    file_path = file_path_for(model.directories.queue_path(), text)
    parsed_text = parse_text(model, text)
    with open(file_path, 'w', encoding='utf8') as outf:
        json.dump(parsed_text, outf)
        logger.debug('Serialized {} to {} model', file_path, model)


def list_queued(corpus: Corpus) -> List[Path]:
    return list(filter(lambda t: t.trained, corpus.dataset))


def list_trained(corpus: Corpus) -> List[Path]:
    return list(filter(lambda t: not t.trained, corpus.dataset))