import spacy

import subprocess
import os
import sys

from nerd_model import NerdModel

from pathlib import Path

class ModelManager:
    """Handles NER models

    Args:
        model_directory (str): Root directory where all models are stored
    """

    def __init__(self, model_directory: str):
        path = Path(model_directory)
        if not path.is_dir():
            raise Exception(f"{model_directory} isn't a directory")
        self.model_path = path
        self.__model_cache = {}

    def available_base_models(self):
        """List of available SpaCy models to use when creating a new model"""
        return ['es']

    def load_model(self, model_name: str) -> NerdModel:
        """Loads a stored SpaCy model

        Args:
            model_name (str): Name for the model

        Returns:
            NerdModel: Loaded model
        """

        if model_name in self.__model_cache:
            return self.__model_cache[model_name]

        model_path = self.__model_path(model_name)

        if not model_path.exists():
            raise Exception(f"Model named {model_name} doesn't exist")

        model = NerdModel(spacy.load(model_path), model_path)
        self.__model_cache[model_name] = model

        return model

    def create_model(self, model_name: str, base_model: str) -> NerdModel:
        """Creates a new SpaCy model.

        Args:
            model_name (str): Name for the model
            base_model (str): SpaCy model to use as base

        Returns:
            NerdModel: Created model
        """
        if not base_model in self.available_base_models():
            raise Exception(f"Invalid base model: {base_model}")

        model_path = self.__model_path(model_name)

        if model_path.exists():
            raise Exception(f"Model named {base_model} already exists")

        self.__download_base_model(base_model)

        model = spacy.load(base_model) # TODO: Add a base_model cache
        model.to_disk(model_path)
        return NerdModel(model, model_path)

    def __model_path(self, model_name) -> Path:
        """Returns the full Path for a given named model"""
        return self.model_path / model_name

    def __download_base_model(self, model_name):
        """Downloads a model from spacy"""
        cmd = [sys.executable, '-m', 'spacy', 'download', model_name]
        return subprocess.check_call(cmd, env=os.environ.copy())
