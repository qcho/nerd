import spacy
from spacy.language import Language

import subprocess
import os
import sys
from shutil import rmtree
from pathlib import Path

from nerd_model import NerdModel
from exceptions import ModelNotFound, InvalidBaseModel, ModelExists

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
        self.__base_model_cache = {}

    def available_base_models(self):
        """List of available SpaCy models to use when creating a new model"""
        return ['es']

    def available_models(self):
        """List of all available models"""
        return [x.name for x in self.model_path.iterdir() if x.is_dir()]

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
            raise ModelNotFound()

        model = NerdModel(model_name, model_path)
        model.load()
        self.__model_cache[model_name] = model

        return model

    def create_model(self, model_name: str, base_model: str) -> NerdModel:
        """Creates a new SpaCy model.

        Args:
            model_name (str): Name for the model
            base_model (str): SpaCy model to use as base

        Returns:
            NerdModel: Created model

        Raises:
            ModelExists: When a model exists with given name
            InvalidBaseModel: When specified base model is invialid
        """
        if not base_model in self.available_base_models():
            raise InvalidBaseModel()

        model_path = self.__model_path(model_name)

        if model_path.exists():
            raise ModelExists()

        model = self.load_base_model(base_model) # TODO: Add a base_model cache
        nerd_model = NerdModel(model_name, model_path)
        nerd_model.save(model=model)
        nerd_model.load()
        return nerd_model

    def delete_model(self, model_name: str):
        """Deletes a model

        Args:
            model_name (str): Model to delete

        Returns:
            True if model could be deleted

        Raises:
            ModelNotFound: When given model doesn't exist
        """

        model_path = self.__model_path(model_name)
        if not model_path.exists():
            raise ModelNotFound()
        rmtree(model_path)
        return True

    def __model_path(self, model_name: str) -> Path:
        """Returns the full Path for a given named model"""
        return self.model_path / model_name

    def load_base_model(self, model_name: str) -> Language:
        if model_name in self.__base_model_cache:
            return self.__base_model_cache[model_name]

        self.__download_base_model(model_name)
        model = spacy.load(model_name)
        self.__base_model_cache[model_name] = model
        return model


    def __download_base_model(self, model_name: str):
        """Downloads a model from spacy"""
        cmd = [sys.executable, '-m', 'spacy', 'download', model_name]
        subprocess.check_call(cmd, env=os.environ.copy())
