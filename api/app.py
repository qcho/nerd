#!/bin/env python

# -*- coding: utf-8 -*-

import json
import logging
import os
from pathlib import Path
from typing import List, Tuple
from user import User

from werkzeug import exceptions

import request_parsers
from atp import parse_text, train_model, queue_text, list_queued, list_trained
from authentication import UserManager
from entity_type_management import create_entity_type, types_for_model
from flask import Flask, jsonify, request, url_for
from flask_cors import CORS as FlaskCors
from flask_jwt_extended import (JWTManager, create_access_token,
                                create_refresh_token, get_jwt_claims,
                                get_jwt_identity, jwt_optional,
                                jwt_refresh_token_required, jwt_required)
from flask_restplus import Api, Resource, fields
from logit import get_logger
from exceptions import BadCredentials
from werkzeug.exceptions import BadRequest, Conflict, Unauthorized, NotFound, HTTPException
from model_management import ModelManager
from nerd_type_aliases import NEREntity
from user_storage import FileUserStorage

authorizations = {
    'apikey': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization'
    }
}

logger = get_logger(__name__)

app = Flask('NERd', static_folder=None)
api = Api(version='1.0', title='NER Daemon API',
          description='A simple NER Daemon API',
          validate=True,
          authorizations=authorizations,
          security='apikey'
          )
model_ns = api.namespace('models', description='NER operations')
auth_ns = api.namespace('auth', description='Authentication')
user_ns = api.namespace('users', description='User management')
api.init_app(app)

auth_parser = api.parser()
auth_parser.add_argument('Authorization', location='headers')

# Setup the Flask-JWT-Extended extension
app.config['JWT_TOKEN_LOCATION'] = ('headers', 'json')
app.config['JWT_ERROR_MESSAGE_KEY'] = "message"
app.config['JWT_SECRET_KEY'] = os.environ.get(
    'JWT_SECRET_KEY', 'zekrit dont tell plz')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 15  # Minutes
app.config['JWT_IDENTITY_CLAIM'] = 'sub'
app.config['JWT_HEADER_TYPE'] = ''

app.config['SWAGGER_UI_JSONEDITOR'] = True
jwt = JWTManager(app)
jwt._set_error_handler_callbacks(api)


def assert_admin():
    current_user = user_manager.get(get_jwt_identity())
    if not current_user or not "admin" in current_user.roles:
        raise Unauthorized("Access denied")


cors = FlaskCors(app)


@app.before_request
def before_request():
    if request.method == "OPTIONS":
        return '', 200


@app.before_first_request
def init_app_context():
    pass


@jwt.expired_token_loader
def my_expired_token_callback(expired_token=None):
    error = Unauthorized("Access token expired")
    return error.get_response()


# TODO: Extract location to config file
mm = ModelManager(os.environ.get('MODELS_DIR', './models/'))

# TODO: Do we want to preload models? Maybe we should specify this in a config file
user_manager = UserManager(FileUserStorage(Path("./users.json")))


user_credentials = api.model('UserCredentials', {
    'access_token': fields.String(required=True, description='A temporary JWT'),
    'refresh_token': fields.String(required=True, description='A refresh token'),
    'email': fields.String(required=True, description='The email'),
    'name': fields.String(required=True, description='The name'),
    'roles': fields.List(fields.String, required=True, description='A list of roles')
})

generic_error = api.model('GenericError', {
    'message': fields.String(required=True, description='A description of the error')
})


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


user_credentials = api.model('UserCredentials', {
    'access_token': fields.String(required=True, description='A temporary JWT'),
    'refresh_token': fields.String(required=True, description='A refresh token'),
    'email': fields.String(required=True, description='The email'),
    'name': fields.String(required=True, description='The name'),
    'roles': fields.List(fields.String, required=True, description='A list of roles')
})


def generate_login_response(user: User):
    if not user:
        return None
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
    @auth_ns.expect(register_payload)
    @auth_ns.response(400, "When any parameter is missing", generic_error)
    @auth_ns.response(409, "When there's a user already exists with given email", generic_error)
    def post(self):
        """
        Register a new user

        """
        name = api.payload.get('name', '').strip()
        email = api.payload.get('email', '').strip().lower()
        password = api.payload.get('password', '').strip()

        for value in [name, email, password]:
            if not value:
                raise BadRequest("Required fields: email, name, password")

        user = user_manager.get(email)
        if user:
            return Conflict("Email exists")

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
    @auth_ns.marshal_with(user_credentials, description='Login OK')
    @auth_ns.response(401, "Invalid credentials", generic_error)
    @api.expect(login_payload)
    def post(self):
        """
        Perform a login to access restricted API endpoints.

        :raises BadCredentials: In case of invalid credentials.
        """

        email = api.payload["email"]
        password = api.payload["password"]

        if not user_manager.check_login(email, password):
            raise BadCredentials()

        user = user_manager.get(email)
        return generate_login_response(user)


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
    @auth_ns.marshal_with(refreshed_tokens, description='Refresh OK')
    @auth_ns.response(401, "Invalid JWT identity", generic_error)
    @jwt_refresh_token_required
    def post(self):
        """
        Refresh access token

        :raises Unauthorized: When JWT identity is invalid
        """
        current_user = user_manager.get(get_jwt_identity())
        if not current_user:
            raise Unauthorized("Invalid user")
        ret = {
            'access_token': create_access_token(identity=current_user),
        }
        return ret


@api.route('/base-models')
class BaseModelResource(Resource):
    @jwt_optional
    @model_ns.doc('list_base_models', model=[fields.String()])
    @model_ns.response(401, "Insufficient permissions", generic_error)
    def get(self):
        """
        List available SpaCy base models
        """
        assert_admin()
        return jsonify(mm.available_base_models())


@model_ns.route('')
class ModelsResource(Resource):

    model_creation_fields = api.model('ModelCreationData', {
        'base_model_name': fields.String(enum=mm.available_base_models(), required=True),
        'model_name': fields.String(required=True)
    })

    model_fields = api.model('NerModel', {
        'name': fields.String
    })

    @model_ns.doc('list_models', expect=[auth_parser])
    @model_ns.marshal_list_with(model_fields, code=200, description="Model list")
    @model_ns.response(401, "Access denied", generic_error)
    @jwt_required
    def get(self):
        """
        List available models
        """
        assert_admin()
        return mm.available_models()

    @model_ns.doc('upsert_model', body=model_creation_fields, expect=[auth_parser])
    @api.expect(model_creation_fields)
    @api.response(200, "Success")
    @api.response(409, "Model exists", generic_error)
    @api.response(401, "Access denied", generic_error)
    @api.response(400, "Missing parameters or Invalid base model", generic_error)
    @jwt_required
    def post(self):
        """
        Creates a model from a given SpaCy model

        :raises Conflict: When a model exists already
        :raises Unauthorized: When current user has insufficient permissions
        """
        assert_admin()
        try:
            # TODO: We may be able to make the model creation threaded (inside the create_model method)
            mm.create_model(api.payload['model_name'],
                            api.payload['base_model_name'])
        except:
            raise Conflict("Model exists with that name")
        return None, 200


@model_ns.param('model_name', 'The model name (unique identifier)')
@model_ns.route('/<string:model_name>')
@model_ns.response(404, "Model not found", generic_error)
@api.doc(params={'model_name': 'Model to use'})
class ModelResource(Resource):

    metadata_fields = api.model('MetadataFields', {
        'queued': fields.Integer,
        'trained': fields.Integer
    })

    @jwt_required
    @model_ns.doc('get_model', expect=[auth_parser])
    @model_ns.marshal_with(metadata_fields, code=200, description="Returns model metadata")
    @model_ns.response(401, "Access denied", generic_error)
    def get(self, model_name):
        """
        Returns metadata for a given model

        :raises Unauthorized: When current user has insufficient permissions
        """
        assert_admin()
        model = mm.load_model(model_name)
        queued = len(list_queued(model))
        trained = len(list_trained(model))
        return {
            "queued": queued,
            "trained": trained
        }

    @jwt_required
    @model_ns.doc('remove_model', expect=[auth_parser])
    @model_ns.response(401, "Access denied", generic_error)
    def delete(self, model_name=None):
        """
        Deletes a model

        :raises Unauthorized: When current user has insufficient permissions
        :raises BadRequest: When couldn't delete the model
        """
        assert_admin()
        try:
            mm.delete_model(model_name)
            return '', 200
        except:
            raise BadRequest("There was a problem deleting the model")


@model_ns.route('/<string:model_name>/training')
@model_ns.param('model_name', 'The model name (unique identifier)')
@api.doc(params={'model_name': 'Model to use'})
@model_ns.response(404, "Model not found", generic_error)
class ModelTrainingResource(Resource):
    new_text_fields = api.model('NewText', {
        'text': fields.String(required=True)
    })

    @jwt_required
    @model_ns.doc('queue_training_text', body=new_text_fields, expect=[auth_parser])
    @api.expect(new_text_fields)
    @model_ns.response(200, "Success")
    def post(self, model_name):
        """
        Add a new text to used for training
        """

        nerd_model = mm.load_model(model_name)
        text = api.payload["text"]
        queue_text(nerd_model, text)


@model_ns.route('/<string:model_name>/ner')
@api.doc(params={'model_name': 'Model to use'})
@model_ns.response(404, "Model not found", generic_error)
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
    @model_ns.response(200, "Success")
    def put(self, model_name):
        """Model entity recognition correction
        TODO: Document this
        """
        nerd_model = mm.load_model(model_name)

        train_model(nerd_model, api.payload)
        return None, 200

    @jwt_optional
    @model_ns.doc('get_ner_document', expect=[auth_parser, request_parsers.ner_request_fields])
    @model_ns.expect(request_parsers.ner_request_fields)
    @model_ns.marshal_with(document_model)
    def get(self, model_name):
        """
        Processes given text with SpaCy
        """
        nerd_model = mm.load_model(model_name)
        return parse_text(nerd_model, request.args['text'])


@model_ns.route('/<string:model_name>/entity-types')
@model_ns.response(404, "Model not found", generic_error)
class EntityTypesResource(Resource):

    entity_type_fields = api.model('EntityType', {
        'name': fields.String(required=True),
        'code': fields.String(required=True),
        'color': fields.String(required=True)
    })

    @jwt_required
    @model_ns.doc('upsert_entity_types', body=entity_type_fields, expect=[auth_parser])
    @model_ns.expect(entity_type_fields)
    @model_ns.response(200, "Success")
    def put(self, model_name):
        """
        Update or create entity types

        :raises Unauthorized: When current user has insufficient permissions
        """
        assert_admin()
        model = mm.load_model(model_name)

        json_payload = api.payload
        create_entity_type(
            model, json_payload['name'], json_payload['code'], json_payload['color'])
        # TODO: Figure out what we need to return here
        return None, 200

    @jwt_optional
    @model_ns.doc('get_entity_types', expect=[auth_parser])
    @model_ns.marshal_list_with(entity_type_fields)
    def get(self, model_name):
        """
        Returns the list of available entity types
        """
        model = mm.load_model(model_name)
        return types_for_model(model)


@user_ns.route('')
class UsersManagement(Resource):

    user_fields = api.model("User", {
        'name': fields.String,
        'email': fields.String,
        'roles': fields.List(fields.String)
    })

    @jwt_required
    @user_ns.marshal_list_with(user_fields)
    @model_ns.response(401, "Access denied", generic_error)
    def get(self):
        """
        Returns a list of existing users

        :raises Unauthorized: When current user has insufficient permissions
        """
        assert_admin()
        return [u.to_json() for u in user_manager.all()]


@user_ns.route('/toggle_admin')
class AdminManagement(Resource):

    admin_toggle_fields = api.model("AdminToggle", {
        'email': fields.String,
        'value': fields.Boolean
    })

    @jwt_required
    @api.expect(admin_toggle_fields)
    @model_ns.response(401, "Access denied", generic_error)
    def put(self):
        """
        Toggles a specific user's 'admin' role

        :raises Unauthorized: When current user has insufficient permissions
        :raises NotFound: When user doesn't exist with given name
        """
        assert_admin()
        email = api.payload["email"]
        user = user_manager.get(email)
        if not user:
            raise NotFound("No user exists with that email")
        isAdmin = api.payload["value"]
        if isAdmin and not "admin" in user.roles:
            user.roles.append("admin")

        if not isAdmin:
            user.roles.remove("admin")

        user_manager.update(user)
        return '', 200


@user_ns.route('/<string:user_email>')
@user_ns.param('user_email', 'The user\'s email (unique identifier)')
@api.doc(params={'user_email': 'User to work with'})
@model_ns.response(404, "User not found", generic_error)
class UserManagement(Resource):

    def get(self):
        """
        Returns details for specific user

        :raises NotFound: When user doesn't exist with given email
        """
        pass


def run():
    import os

    DEBUG = os.environ.get('DEBUG', False)
    BIND = os.environ.get('GUNICORN_BIND', '0.0.0.0:8000')
    (HOST, PORT, *_) = BIND.split(':')

    app.run(debug=DEBUG, host=HOST, port=PORT)


if __name__ == '__main__':
    run()
