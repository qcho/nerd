#!/bin/env python

# -*- coding: utf-8 -*-

import json
import os
from typing import List, Tuple

from flask import Flask, request, jsonify, url_for
from flask_restplus import Resource, Api, fields

from atp import parse_text, train_model, queue_text
from model_management import ModelManager
from nerd_type_aliases import NEREntity
from entity_type_management import create_entity_type, types_for_model
from invalid_usage import InvalidUsage
import request_parsers
from authentication import UserManager
from user_storage import FileUserStorage
from pathlib import Path

from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token, create_refresh_token,
    get_jwt_identity, jwt_optional, jwt_refresh_token_required, get_jwt_claims,
)


authorizations = {
    'apikey': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization'
    }
}

app = Flask('NERd', static_folder=None)
api = Api(version='1.0', title='NER Daemon API',
          description='A simple NER Daemon API',
          validate=True,
          authorizations=authorizations,
          security='apikey'
          )
model_ns = api.namespace('models', description='NER operations')
auth_ns = api.namespace('auth', description='Authentication')
api.init_app(app)

auth_parser = api.parser()
auth_parser.add_argument('Authorization', location='headers')

# Setup the Flask-JWT-Extended extension
app.config['JWT_TOKEN_LOCATION'] = ('headers', 'json')
app.config['JWT_SECRET_KEY'] = os.environ.get(
    'JWT_SECRET_KEY', 'zekrit dont tell plz')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 24 * 60  # Minutes
app.config['JWT_IDENTITY_CLAIM'] = 'sub'
app.config['JWT_HEADER_TYPE'] = ''

app.config['SWAGGER_UI_JSONEDITOR'] = True
jwt = JWTManager(app)

test_user = {
    'username': 'test',
    'roles': ['admin']
}

users = {
    'test': test_user
}


@app.after_request
def after_request(response):
    # TODO: Remove when done since having CORS is not a good idea.
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response

@app.before_request
def before_request():
    if request.method == "OPTIONS":
        return '', 200

@app.before_first_request
def init_app_context():
    pass

mm = ModelManager('./models/')  # TODO: Extract location to config file
# TODO: Do we want to preload models? Maybe we should specify this in a config file

user_manager = UserManager(FileUserStorage(Path("./users.json")))


# Create a function that will be called whenever create_access_token
# is used. It will take whatever object is passed into the
# create_access_token method, and lets us define what custom claims
# should be added to the access token.
@jwt.user_claims_loader
def add_claims_to_access_token(user):
    return {'roles': user.get('roles', [])}


# Create a function that will be called whenever create_access_token
# is used. It will take whatever object is passed into the
# create_access_token method, and lets us define what the identity
# of the access token should be.
@jwt.user_identity_loader
def user_identity_lookup(user):
    return user.get('username')


DEBUG = os.environ.get('DEBUG', False)
BIND = os.environ.get('GUNICORN_BIND', '0.0.0.0:8000')
(HOST, PORT, *_) = BIND.split(':')


@app.errorhandler(InvalidUsage)
def handle_invalid_api_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


@jwt_optional
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


user_credentials = api.model('UserCredentials', {
    'access_token': fields.String(required=True, description='A temporary JWT'),
    'refresh_token': fields.String(required=True, description='A refresh token'),
    'username': fields.String(required=True, description='The username'),
    'roles': fields.List(fields.String, required=True, description='A list of roles')
})


@auth_ns.route('/register', methods=['POST'])
class RegisterResource(Resource):

    register_payload = api.model('RegisterPayload', {
        'username': fields.String(required=True, description='The username'),
        'password': fields.String(required=True, description='The password'),
    })

    @auth_ns.doc(body=register_payload, security=None)
    @auth_ns.marshal_with(user_credentials, code=200, description='Successful registration')
    def post(self):
        pass

# Provide a method to create access tokens. The create_access_token()
# function is used to actually generate the token, and you can return
# it to the caller however you choose.
@auth_ns.route('/login', methods=['POST'])
class LoginResource(Resource):

    login_payload = api.model('LoginPayload', {
        'username': fields.String(required=True, description='The username'),
        'password': fields.String(required=True, description='The password')
    })

    @auth_ns.doc(body=login_payload, security=None)
    @auth_ns.marshal_with(user_credentials, code=200, description='Login OK')
    def post(self):
        """Perform a login to access restricted API endpoints"""
        username = request.json.get('username', None)
        password = request.json.get('password', None)
        if not username:
            return ({"msg": "Missing username parameter"}), 400
        if not password:
            return ({"msg": "Missing password parameter"}), 400

        if username != 'test' or password != 'test':  # TODO: Hard-coded username/password
            return ({"msg": "Bad username or password"}), 401

        user = users.get(username)
        ret = {
            'access_token': create_access_token(identity=user),
            'refresh_token': create_refresh_token(identity=user),
            'username': user.get('username'),
            'roles': user.get('roles')
        }
        return ret, 200


# The jwt_refresh_token_required decorator insures a valid refresh
# token is present in the request before calling this endpoint. We
# can use the get_jwt_identity() function to get the identity of
# the refresh token, and use the create_access_token() function again
# to make a new access token for this identity.
@auth_ns.route('/refresh', methods=['POST'])
class RefreshResource(Resource):

    refresh_payload = api.model('RefreshPayload', {
        'refresh_token': fields.String(required=True, description='The refresh token'),
    })

    refreshed_tokens = api.model('RefreshedToken', {
        'access_token': fields.String(description='A temporary JWT'),
    })

    @auth_ns.doc(body=refresh_payload, security=None, expect=[auth_parser])
    @auth_ns.marshal_with(refreshed_tokens, code=200, description='Refresh OK')
    @jwt_refresh_token_required
    def post(self):
        """Refresh access token"""
        current_user = users.get(get_jwt_identity())
        print
        ret = {
            'access_token': create_access_token(identity=current_user),
        }
        return (ret), 200


@app.route('/base-models')
class BaseModelResource(Resource):
    # @ns.marshal_list_with(todo)
    @jwt_optional
    @model_ns.doc('list_base_models', model=[fields.String()])
    def get(self):
        """List available SpaCy base models"""
        return jsonify(mm.available_base_models())


@model_ns.route('')
class ModelsResource(Resource):

    model_creation_fields = api.model('ModelCreationData', {
        'base_model_name': fields.String(enum=mm.available_base_models()),
        'model_name': fields.String
    })

    @model_ns.doc('list_models', model=[fields.String()], expect=[auth_parser])
    @jwt_required
    def get(self):
        """List available models"""
        return jsonify(mm.available_models())

    @model_ns.doc('upsert_model', body=model_creation_fields, expect=[auth_parser])
    @api.expect(model_creation_fields)
    @jwt_required
    def post(self):
        """Creates a model from a given SpaCy model"""
        mm.create_model(api.payload['model_name'],
                        api.payload['base_model_name'])
        return None, 200


@model_ns.response(404, 'Model not found')
@model_ns.param('model_name', 'The model name (unique identifier)')
@model_ns.route('/<string:model_name>')
@api.doc(params={'model_name': 'Model to use'})
class ModelResource(Resource):

    # @ns.expect(todo)
    # @ns.marshal_with(todo, code=201)
    @jwt_required
    @model_ns.doc('get_model', expect=[auth_parser])
    def get(self, model_name):
        """Returns metadata for a given model"""
        return None, 404  # TODO: This should return model metadata

    @jwt_required
    @model_ns.doc('remove_model', expect=[auth_parser])
    def delete(self, model_name=None):
        """Deletes a model"""
        if mm.delete_model(model_name):
            return '', 200
        else:
            raise InvalidUsage(f"Couldn't delete model named {model_name}")


@model_ns.route('/<string:model_name>/training')
@model_ns.response(404, 'Model not found')
@model_ns.param('model_name', 'The model name (unique identifier)')
@api.doc(params={'model_name': 'Model to use'})
class ModelTrainingResource(Resource):
    new_text_fields = api.model('NewText', {
        'text': fields.String(required=True)
    })

    @jwt_required
    @model_ns.doc('queue_training_text', body=new_text_fields, expect=[auth_parser])
    @api.expect(new_text_fields)
    def post(self, model_name):
        """Add a new text to used for training"""

        nerd_model = mm.load_model(model_name)
        text = api.payload["text"]
        queue_text(nerd_model, text)


@model_ns.route('/<string:model_name>/ner')
@api.doc(params={'model_name': 'Model to use'})
class NerDocumentResource(Resource):

    entity_model = api.model('DocumentEntity', {
        'start': fields.Integer,
        'end': fields.Integer,
        'label': fields.String
    })

    sentence_model = api.model('DocumentSentence', {
        'start': fields.Integer,
        'end': fields.Integer
    })

    token_model = api.model('DocumentToken', {
        "id": fields.Integer,
        "start": fields.Integer,
        "end": fields.Integer,
        "head": fields.Integer,
        "pos": fields.String,
        "dep": fields.String,
        "tag": fields.String
    })

    document_model = api.model('DocumentModel', {
        'ents': fields.List(fields.Nested(entity_model)),
        'sents': fields.List(fields.Nested(sentence_model)),
        'text': fields.String,
        'tokens': fields.List(fields.Nested(token_model))
    })

    @jwt_required
    @model_ns.doc('upsert_ner_document', body=document_model, expect=[auth_parser])
    @api.expect(document_model)
    def put(self, model_name):
        """Model entity recognition correction
        TODO: Document this
        """
        nerd_model = mm.load_model(model_name)

        if not request.is_json():
            pass  # TODO: POST wasn't a JSON, should error out

        json_payload = request.get_json()
        if json_payload is None:
            pass  # TODO: Payload is empty or is an invalid JSON
        train_model(nerd_model, json_payload)
        return '', 200

    @jwt_optional
    @model_ns.doc('get_ner_document', expect=[auth_parser, request_parsers.ner_request_fields])
    @model_ns.expect(request_parsers.ner_request_fields)
    @model_ns.marshal_with(document_model)
    def get(self, model_name):
        """Infer entities for a given text"""
        nerd_model = mm.load_model(model_name)
        return parse_text(nerd_model, request.args['text'])


@model_ns.route('/<string:model_name>/entity-types')
class EntityTypesResource(Resource):

    entity_type_fields = api.model('EntityType', {
        'name': fields.String,
        'code': fields.String,
        'color': fields.String
    })

    @jwt_required
    @model_ns.doc('upsert_entity_types', body=entity_type_fields, expect=[auth_parser])
    @model_ns.expect(entity_type_fields)
    def put(self, model_name):
        """Update or create entity types"""
        model = mm.load_model(model_name)

        if not request.is_json():
            raise InvalidUsage("Request should be a JSON.")
        json_payload = request.get_json()
        if json_payload is None:
            raise InvalidUsage("Post body shouldn't be empty")
        create_entity_type(
            model, json_payload['name'], json_payload['code'], json_payload['color'])
        # TODO: Figure out what we need to return here
        return '', 200

    @jwt_optional
    @model_ns.doc('get_entity_types', expect=[auth_parser])
    @model_ns.marshal_list_with(entity_type_fields)
    def get(self, model_name):
        """Returns the list of available entity types"""
        model = mm.load_model(model_name)
        return types_for_model(model)


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
