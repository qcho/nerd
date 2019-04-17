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

import hashlib
import os
import pathlib
import random
import subprocess
import sys
import types

import spacy
from spacy.gold import minibatch
from spacy.util import compounding

from logit import get_logger
from spacy.language import Language

logger = get_logger(__name__)

FS_PATH = pathlib.Path(os.path.abspath(
    os.path.dirname(__file__))) / '..' / 'models'
MODEL_VERSION = 1
DEFAULT_DROP_RATE = 0.35


def __get_model_directory(name):
    hashed_name = hashlib.sha256(
        f'nerd-{name}-v{MODEL_VERSION}'.encode('utf-8'))
    filename = f'spacy-{hashed_name.hexdigest()}'
    filepath = FS_PATH / filename
    filepath.mkdir(parents=True, exist_ok=True)
    return filepath


def load_custom_model(name) -> Language:
    return spacy.load(__get_model_directory(name))


def save_custom_model(name: str, model):
    folder = __get_model_directory(name)
    model.to_disk(folder)


def create_custom_model(name: str, base_model) -> Language:
    save_custom_model(name, base_model)
    return load_custom_model(name)


# REVIEW THIS
def train_model(model, training_data, n_iter=10):
    optimizer = model.begin_training()

    training_data = list(training_data)
    if len(training_data) == 0:
        logger.warning('Empty training set')
        return model
    if len(training_data) < 10:
        logger.warning('Training with less than ten documents. This is bad.')

    # get names of other pipes to disable them during training
    other_pipes = [pipe for pipe in model.pipe_names if pipe != 'ner']
    with model.disable_pipes(*other_pipes):  # only train NER
        for itn in range(n_iter):
            logger.info('Iteration %d', itn + 1)
            random.shuffle(training_data)
            losses = {}
            batches = minibatch(
                training_data, size=compounding(4.0, 32.0, 1.001))
            for batch_number, batch in enumerate(batches):
                logger.info('Batch %d', batch_number + 1)
                for text, annotations in batch:
                    model.update([text], [annotations], drop=DEFAULT_DROP_RATE, sgd=optimizer, losses=losses)
            logger.info('Losses %s', losses)
    return model
