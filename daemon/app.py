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
api = Api(version='1.0', title='NER Daemon API',
          description='A simple NER Daemon API',
          )

ns = api.namespace('models', description='ner operations')

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

@app.route('/postman.json')
def postman():
    return jsonify(api.as_postman(urlvars=False, swagger=True))


# todo = api.model('Todo', {
#     'id': fields.Integer(readOnly=True, description='The task unique identifier'),
#     'task': fields.String(required=True, description='The task details')
# })


@app.route('/base-models')
class BaseModelResource(Resource):

    # @ns.marshal_list_with(todo)
    @ns.doc('list_base_models', model=[fields.String()])
    def get(self):
        """API endpoint to list available spacy base models"""
        return jsonify(mm.available_base_models())


@ns.route()
class ModelsResource(Resource):
    @ns.doc('list_models')
    def get(self):
        return jsonify(mm.available_models())


@ns.response(404, 'Model not found')
@ns.param('model_name', 'The model name (unique identifier)')
@ns.route('/models/<string:model_name>')
class ModelResource(Resource):

    # @ns.expect(todo)
    # @ns.marshal_with(todo, code=201)
    @ns.doc('get_model')
    def get(self, model_name=None):
        return None, 404

    @ns.doc('remove_model')
    def delete(self, model_name=None):
        result = mm.delete_model(model_name)
        if result == True:
            return

    @ns.doc('upsert_model')
    def put(self, model_name=None):
        json_payload = request.get_json()
        if json_payload is None:
            pass  # TODO: Payload is empty or is an invalid JSON
        base_model, model_name = _parse_model_creation_json(json_payload)
        result = mm.create_model(
            model_name, base_model)  # TODO: return result
        return jsonify(True)


@ns.route('/models/<string:model_name>/ner')
class NerDocumentResource(Resource):
    @ns.doc('upsert_ner_document')
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

    @ns.doc('get_ner_document')
    def get(self, model_name=None):
        nerd_model = mm.load_model(model_name)
        result = parse_text(nerd_model, request.args['text'])
        return jsonify(result)  # TODO: Figure out what we need to return here


@ns.route('/models/<string:model_name>/entity_types')
class EntityTypesResource(Resource):
    @ns.doc('upsert_entity_types')
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

    @ns.doc('get_entity_types')
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
