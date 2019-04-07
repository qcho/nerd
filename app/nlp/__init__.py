import hashlib
import os
import pathlib
import random
import subprocess
import sys
import types

import spacy
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


def __download_base_model(model_name: str):
    """Downloads a model from spacy"""
    cmd = [sys.executable, '-m', 'spacy', 'download', model_name]
    subprocess.check_call(cmd, env=os.environ.copy())


def load_system_model(name) -> Language:
    try:
        return spacy.load(name)
    except OSError:
        __download_base_model(name)
        return spacy.load(name)


def load_custom_model(name) -> Language:
    return spacy.load(__get_model_directory(name))


def save_custom_model(name: str, model):
    folder = __get_model_directory(name)
    model.to_disk(folder)


def create_custom_model(name: str, base_model) -> Language:
    save_custom_model(name, base_model)
    return load_custom_model(name)


def rmtree(root):
    for p in root.iterdir():
        if p.is_dir():
            rmtree(p)
        else:
            p.unlink()
    root.rmdir()


def delete_custom_model(name: str):
    directory = __get_model_directory(name)
    path = pathlib.Path(directory)
    if path.exists():
        rmtree(path)


# REVIEW THIS
def train_model(model, training_data, n_iter=10):
    optimizer = model.begin_training()

    training_data = list(training_data)
    if len(training_data) == 0:
        logger.warning('Empty training set')
        return model
    if (len(training_data) < 10):
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
                    model.update([text], [annotations], drop=DEFAULT_DROP_RATE,
                                 sgd=optimizer, losses=losses)
            logger.info('Losses %s', losses)
    return model
