#!/bin/env python

# -*- coding: utf-8 -*-

import json
import os
from typing import List, Tuple

from flask import Flask, request, jsonify, url_for
from flask_restplus import Resource, Api, fields, errors

from atp import parse_text, train_model, queue_text
from model_management import ModelManager
from nerd_type_aliases import NEREntity
from entity_type_management import create_entity_type, types_for_model
from invalid_usage import InvalidUsage
import request_parsers
from authentication import UserManager
from user_storage import FileUserStorage
from pathlib import Path
from user import User
from werkzeug import exceptions

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
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 15  # Minutes
app.config['JWT_IDENTITY_CLAIM'] = 'sub'
app.config['JWT_HEADER_TYPE'] = ''

app.config['PROPAGATE_EXCEPTIONS'] = True
app.config['SWAGGER_UI_JSONEDITOR'] = True
jwt = JWTManager(app)
jwt._set_error_handler_callbacks(api)


def assert_admin():
    current_user = user_manager.get(get_jwt_identity())
    if not current_user or not "admin" in current_user.roles:
        errors.abort(401, "Access denied")


@app.after_request
def after_request(response):
    # TODO: Remove when done since having CORS is not a good idea.
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type, Authorization')
    return response


@app.errorhandler(exceptions.HTTPException)
def on_http_exception(error):
    # TODO: Remove when done since having CORS is not a good idea.
    response = error.response
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type, Authorization')
    return response


@app.before_request
def before_request():
    if request.method == "OPTIONS":
        return '', 200


@app.before_first_request
def init_app_context():
    pass


@jwt.expired_token_loader
def my_expired_token_callback(expired_token=None):
    # return errors.abort(401, "Access token expired")
    # TODO: Remove when done since having CORS is not a good idea.
    response = jsonify({"message": "Access token expired"})
    response.status_code = 401
    # response.headers.add('Access-Control-Allow-Origin', '*')
    # response.headers.add('Access-Control-Allow-Headers',
    #                      'Content-Type, Authorization')
    return response


mm = ModelManager('./models/')  # TODO: Extract location to config file
# TODO: Do we want to preload models? Maybe we should specify this in a config file

user_manager = UserManager(FileUserStorage(Path("./users.json")))


# Create a function that will be called whenever create_access_token
# is used. It will take whatever object is passed into the
# create_access_token method, and lets us define what custom claims
# should be added to the access token.
@jwt.user_claims_loader
def add_claims_to_access_token(user: User):
    return {'roles': user.roles}


# Create a function that will be called whenever create_access_token
# is used. It will take whatever object is passed into the
# create_access_token method, and lets us define what the identity
# of the access token should be.
@jwt.user_identity_loader
def user_identity_lookup(user: User):
    return user.email


DEBUG = os.environ.get('DEBUG', False)
BIND = os.environ.get('GUNICORN_BIND', '0.0.0.0:8000')
(HOST, PORT, *_) = BIND.split(':')


@app.errorhandler(InvalidUsage)
def handle_invalid_api_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


user_credentials = api.model('UserCredentials', {
    'access_token': fields.String(required=True, description='A temporary JWT'),
    'refresh_token': fields.String(required=True, description='A refresh token'),
    'email': fields.String(required=True, description='The email'),
    'name': fields.String(required=True, description='The name'),
    'roles': fields.List(fields.String, required=True, description='A list of roles')
})


def generate_login_response(user: User):
    return {
        'access_token': create_access_token(identity=user),
        'refresh_token': create_refresh_token(identity=user),
        'email': user.email,
        'name': user.name,
        'roles': user.roles
    }


@auth_ns.route('/register', methods=['POST'])
class RegisterResource(Resource):

    register_payload = api.model('RegisterPayload', {
        'name': fields.String(required=True, description='The user\'s name'),
        'email': fields.String(required=True, description='The email'),
        'password': fields.String(required=True, description='The password'),
    })

    @auth_ns.doc(body=register_payload, security=None)
    @auth_ns.marshal_with(user_credentials, code=200, description='Successful registration')
    @api.expect(register_payload)
    def post(self):
        name = api.payload.get('name', '').strip()
        email = api.payload.get('email', '').strip().lower()
        password = api.payload.get('password', '').strip()

        for value, valueName in [[name, 'name'], [email, 'email'], [password, 'password']]:
            if not value:
                return ({"msg": f"Missing {valueName}"}), 400

        user = user_manager.get(email)
        if user:
            return errors.abort(400, "Email exists")

        user = user_manager.register(name, email, password)
        return generate_login_response(user), 200


# Provide a method to create access tokens. The create_access_token()
# function is used to actually generate the token, and you can return
# it to the caller however you choose.
@auth_ns.route('/login', methods=['POST'])
class LoginResource(Resource):

    login_payload = api.model('LoginPayload', {
        'email': fields.String(required=True, description='The email'),
        'password': fields.String(required=True, description='The password')
    })

    @auth_ns.doc(body=login_payload, security=None)
    @auth_ns.marshal_with(user_credentials, code=200, description='Login OK')
    def post(self):
        """Perform a login to access restricted API endpoints"""
        email = request.json.get('email', None)
        password = request.json.get('password', None)
        if not email:
            return ({"msg": "Missing email parameter"}), 400
        if not password:
            return ({"msg": "Missing password parameter"}), 400

        if user_manager.check_login(email, password):
            return ({"msg": "Bad username or password"}), 401

        ret = generate_login_response(user_manager.get(email))
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
        current_user = user_manager.get(get_jwt_identity())
        if not current_user:
            errors.abort(401, "Invalid user")
        ret = {
            'access_token': create_access_token(identity=current_user),
        }
        return (ret), 200


@api.route('/base-models')
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
        assert_admin()
        return jsonify(mm.available_models())

    @model_ns.doc('upsert_model', body=model_creation_fields, expect=[auth_parser])
    @api.expect(model_creation_fields)
    @jwt_required
    def post(self):
        """Creates a model from a given SpaCy model"""
        assert_admin()
        try:
            mm.create_model(api.payload['model_name'],
                            api.payload['base_model_name'])
        except:
            errors.abort(409, "Model exists with that name")
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
        errors.abort(404)  # TODO: This should return model metadata

    @jwt_required
    @model_ns.doc('remove_model', expect=[auth_parser])
    def delete(self, model_name=None):
        """Deletes a model"""
        assert_admin()
        try:
            mm.delete_model(model_name)
            return '', 200
        except:
            errors.abort(409, "There was a problem deleting the model")


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
