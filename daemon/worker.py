#!/bin/env python

# -*- coding: utf-8 -*-

import sys
import os
import argparse
import typing
import logging
import json
import random

import ptvsd
import request_parsers

from atp import parse_text, train_model, queue_text
from model_management import ModelManager, InvalidModelError, InvalidUsage, NerdModel
from nerd_type_aliases import NEREntity
from entity_type_management import create_entity_type, types_for_model
from invalid_usage import InvalidUsage
from spacy.gold import json_to_tuple, GoldParse


DEFAULT_VERBOSITY = 1
mm = ModelManager('./models/')  # TODO: Extract location to config file
# TODO: Do we want to preload models? Maybe we should specify this in a config file


def __create_logger() -> logging.Logger:
    logger = logging.Logger(__file__)
    # create console handler and set level to debug
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    # create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    # add formatter to ch
    ch.setFormatter(formatter)
    # add ch to logger
    logger.addHandler(ch)
    return logger


logger = __create_logger()


def __build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description='Train the model')
    parser.add_argument('model', type=str, help='model to train')
    parser.add_argument('--files', type=str, nargs='*', default=[],
                        help='filenames to use in training')
    parser.add_argument('--verbose', '-v', action='count',
                        dest='log_level', help='debug level')
    return parser


def __set_log_level(verbosity=DEFAULT_VERBOSITY) -> None:
    choices = ['', 'WARNING', 'INFO', 'DEBUG']
    log_level = choices[verbosity] if verbosity in range(
        1, len(choices)) else choices[DEFAULT_VERBOSITY]
    logger.setLevel(log_level)
    logger.debug('Set log level to %s', log_level)


def _files_to_training_data(*filenames, base_path='./') -> typing.Generator[object, None, None]:
    for filename in filenames:
        path = os.path.join(base_path, filename)
        with open(path, 'r') as training_file:
            logger.debug("Loading json training file %s", path)
            yield json_to_tuple(json.load(training_file))


def _load_model(model_name) -> NerdModel:
    try:
        logger.info("Loading model %s", model_name)
        model = mm.load_model(model_name)
        logger.debug("Loaded model %s (%s)", model_name, model)
        return model
    except InvalidModelError or InvalidUsage:
        logger.error('Model "%s" not found', model_name)
        exit(1)


# REVIEW THIS
def train(model, training_data, n_iter=10):
    optimizer = model.begin_training()

    training_data = list(training_data)
    if len(training_data) == 0:
        logger.warning('Empty training set')
        return model
    # get names of other pipes to disable them during training
    other_pipes = [pipe for pipe in model.pipe_names if pipe != 'ner']
    with model.disable_pipes(*other_pipes):  # only train NER
        for itn in range(n_iter):
            random.shuffle(training_data)
            losses = {}
            for text, annotations in training_data:
                model.update([text], [annotations], sgd=optimizer,
                             drop=0.35,  losses=losses)
            print(losses)

    return model


def main(model_name, filenames) -> None:
    model = _load_model(model_name)
    base_path = model.directories.queue_path()
    training_data = _files_to_training_data(*filenames, base_path=base_path)
    spacy_model = train(model.model, training_data)


if __name__ == '__main__':
    parser = __build_parser()
    args = parser.parse_args()
    __set_log_level(args.log_level)
    main(model_name=args.model, filenames=args.files)
