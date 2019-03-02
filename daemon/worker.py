#!/bin/env python

# -*- coding: utf-8 -*-

import argparse
import json
import logging
import os
import random
import sys
import typing

import ptvsd
import request_parsers
from atp import parse_text, queue_text, train_model
from entity_type_management import create_entity_type, types_for_model
from invalid_usage import InvalidUsage
from logit import get_logger
from model_management import (InvalidModelError, InvalidUsage, ModelManager,
                              NerdModel)
from nerd_type_aliases import NEREntity
from spacy.gold import GoldParse, json_to_tuple
from spacy.util import compounding, minibatch

DEFAULT_VERBOSITY = 0
DEFAULT_DROP_RATE = 0.35
# TODO: Extract location to config file
mm = ModelManager(os.environ.get('MODELS_DIR', './models/'))
# TODO: Do we want to preload models? Maybe we should specify this in a config file


logger = get_logger(__name__)


def __build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description='Train the model')
    parser.add_argument('model', type=str, help='model to train')
    parser.add_argument('--verbose', '-v', action='count',
                        dest='log_level', help='debug level')
    return parser


def __set_log_level(verbosity=DEFAULT_VERBOSITY) -> None:
    choices = ['ERROR', 'WARNING', 'INFO', 'DEBUG']
    log_level = choices[verbosity] if verbosity in range(
        0, len(choices)) else choices[DEFAULT_VERBOSITY]
    logger.setLevel(log_level)
    logger.debug('Set log level to %s', log_level)


def _files_to_training_data(base_path='./') -> typing.Generator[object, None, None]:
    for filename in os.listdir(base_path):
        path = os.path.join(base_path, filename)
        with open(path, 'r') as training_file:
            try:
                logger.debug("Loading json training file %s", path)
                payload = json.load(training_file)
                text = payload['text']
                ents = [(it['start'], it['end'], it['label'])
                        for it in payload['ents']]
                yield (text, {"entities": ents})
            except:
                pass


def _load_model(model_name: str) -> NerdModel:
    try:
        logger.info("Loading model %s", model_name)
        model = mm.load_model(model_name)
        logger.debug("Loaded model %s (%s)", model_name, model)
        return model
    except InvalidModelError or InvalidUsage:
        logger.error('Model "%s" not found', model_name)
        exit(1)


def _save_model(nerd_model: NerdModel, spacy_model) -> bool:
    return nerd_model.save(spacy_model)


# REVIEW THIS
def train(model, training_data, n_iter=10):
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


def main(model_name) -> None:
    model = _load_model(model_name)
    base_path = model.directories.trained_path()
    training_data = _files_to_training_data(base_path=base_path)
    trained_model = train(model.model, training_data)
    save_status = _save_model(model, trained_model)


if __name__ == '__main__':
    parser = __build_parser()
    args = parser.parse_args()
    __set_log_level(args.log_level)
    main(model_name=args.model)
