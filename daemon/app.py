#!/bin/env python

# -*- coding: utf-8 -*-

import json
import os
from typing import List, Tuple

from flask import Flask, request, jsonify, url_for
from flask_restplus import Resource, Api

from atp import parse_text, train_model
from model_management import ModelManager
from nerd_type_aliases import NEREntity
from entity_type_management import create_entity_type, types_for_model
from invalid_usage import InvalidUsage

app = Flask('NERd', static_folder=None)
api = Api()
api.init_app(app)

DEBUG = os.environ.get('DEBUG', False)
BIND = os.environ.get('GUNICORN_BIND', '0.0.0.0:8000')
(HOST, PORT, *_) = BIND.split(':')


mm = ModelManager('./models/')  # TODO: Extract location to config file
# TODO: Do we want to preload models? Maybe we should specify this in a config file


@app.errorhandler(InvalidUsage)
def handle_invalid_api_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


@app.route("/")
def index():
    """Lists all of the available endpoints"""
    # TODO: Check if this is working correctly
    import sys
    current_module = sys.modules[__name__]
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            'url': rule.rule,
            'doc': getattr(current_module, rule.endpoint).__doc__
        })
    return jsonify(routes)


@api.route('/base-models')
class BaseModelResource(Resource):
    def get(self):
        """API endpoint to list available spacy base models"""
        return jsonify(mm.available_base_models())


@api.route()
class ModelsResource(Resource):
    def get(self):
        return jsonify(mm.available_models())


@api.route('/models/<string:model_name>')
class ModelResource(Resource):
    def get(self, model_name=None):
        pass  # TODO: Get model information

    def delete(self, model_name=None):
        result = mm.delete_model(model_name)
        if result == True:
            return

    def put(self, model_name=None):
        json_payload = request.get_json()
        if json_payload is None:
            pass  # TODO: Payload is empty or is an invalid JSON
        base_model, model_name = _parse_model_creation_json(json_payload)
        result = mm.create_model(
            model_name, base_model)  # TODO: return result
        return jsonify(True)


@api.route('/models/<string:model_name>/ner')
class NerDocumentResource(Resource):
    def put(self, model_name=None):
        nerd_model = mm.load_model(model_name)

        if not request.is_json():
            pass  # TODO: POST wasn't a JSON, should error out

        json_payload = request.get_json()
        if json_payload is None:
            pass  # TODO: Payload is empty or is an invalid JSON
        train_result = train_model(nerd_model, json_payload)
        # TODO: Figure out what we need to return here
        return jsonify(train_result)

    def get(self, model_name=None):
        result = parse_text(nerd_model, request.args['text'])
        return jsonify(result)  # TODO: Figure out what we need to return here


@api.route('/models/<string:model_name>/entity_types')
class EntityTypesResource(Resource):
    def put(self, model_name):
        """NER entity type management
        TODO: Document this
        """
        model = mm.load_model(model_name)

        if not request.is_json():
            raise InvalidUsage("Request should be a JSON.")
        json_payload = request.get_json()
        if json_payload is None:
            raise InvalidUsage("Post body shouldn't be empty")
        creation_result = create_entity_type(
            model, json_payload['name'], json_payload['code'])
        # TODO: Figure out what we need to return here
        return jsonify(creation_result)

    def get(self, model_name):
        model = mm.load_model(model_name)
        return jsonify(types_for_model(model))


def _parse_model_creation_json(json_payload) -> Tuple[str, str]:
    """ Decodes the JSON for creating new models

    Args:
        json_payload (json): JSON payload containing model creation information

    Returns:
        - base model name
        - new model name
    """

    if not 'base_model_name' in json_payload or not 'model_name' in json_payload:
        raise InvalidUsage("Invalid API", payload={"required": {
                           "model_name": "str", "base_model_name": "str"}})

    return json_payload['base_model_name'], json_payload['model_name']


def _parse_training_json(json_payload) -> Tuple[str, List[NEREntity]]:
    """Decodes the training JSON payload

    Args:
        json_payload (json): JSON payload containing training information

    Returns:
        - the training text
        - a list of entities present in it
    """
    text = json_payload['text']
    ents = [(it['start'], it['end'], it['label'])
            for it in json_payload['ents']]
    return text, ents


if __name__ == '__main__':
    app.run(debug=DEBUG, host=HOST, port=PORT)
