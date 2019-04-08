from werkzeug.exceptions import Conflict, Unauthorized

from apis import BaseSchema, response_error
from core.document.user import User
from flask.views import MethodView
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                get_jwt_identity, jwt_refresh_token_required,
                                jwt_required)
from flask_rest_api import Blueprint
from marshmallow import fields, post_load
from marshmallow_mongoengine import ModelSchema
from mongoengine import DoesNotExist

blp = Blueprint('auth', 'auth', description='Authentication')


class RegisterSchema(ModelSchema):
    class Meta:
        strict = True
        model = User
        exclude = ['roles', 'password']

    @post_load
    def sanitize_fields(self, item):
        item['name'] = item['name'].strip()
        item['email'] = item['email'].lower().strip()
        return item


class UserCredentialsSchema(BaseSchema):
    access_token = fields.String(required=True, description='A temporary JWT')
    refresh_token = fields.String(required=True, description='A refresh token')
    roles = fields.List(fields.String())

    @staticmethod
    def create(user: User):
        return {
            'access_token': create_access_token(identity=user),
            'refresh_token': create_refresh_token(identity=user),
            'roles': user.roles
        }


@blp.route('/register')
class RegisterResource(MethodView):

    @blp.arguments(RegisterSchema)
    @response_error(Conflict('Email exists'))
    @blp.response(UserCredentialsSchema, code=200, description='Registration successful')
    @blp.doc(operationId="registerUser")
    def post(self, register_payload: User):
        """Register a new user

        Returns user credentials to skip login on register
        """
        if User.objects(email=register_payload.email):
            raise Conflict('Email exists')

        return UserCredentialsSchema.create(register_payload.save())


@blp.route('/token')
class TokenResource(MethodView):

    class TokenSchema(BaseSchema):
        grant_type = fields.Constant('password', example='password')
        username = fields.Email()
        password = fields.String()

        @post_load
        def sanitize_fields(self, item):
            item['username'] = item['username'].lower().strip()
            return item

    # TODO: Because SWAGGER-UI password-flow doesn't follow the oauth2 RFC it needs location='form' for it to work.
    #       Rewrite is being discussed in https://github.com/swagger-api/swagger-ui/issues/3227
    #       https://www.oauth.com/oauth2-servers/access-tokens/password-grant/
    @blp.arguments(TokenSchema, location='json')
    @response_error(Unauthorized('Invalid credentials'))
    @blp.response(UserCredentialsSchema)
    @blp.doc(operationId="createAccessToken")
    def post(self, login_payload):
        """Generate new access and refresh tokens with password grant_type"""
        try:
            user = User.objects.get(email=login_payload.get('username'))
            if user.password_matches(login_payload.get('password')):
                return UserCredentialsSchema.create(user)
            else:
                raise DoesNotExist()
        except DoesNotExist:
            raise Unauthorized('Invalid credentials')


@blp.route('/refresh')
class RefreshResource(MethodView):

    class RefreshTokenSchema(BaseSchema):
        grant_type = fields.Constant(
            'refresh_token', example='refresh_token', required=True)

    @jwt_refresh_token_required
    @response_error(Unauthorized("Invalid user"))
    @blp.arguments(RefreshTokenSchema, location='query')
    @blp.response(UserCredentialsSchema, code=200, description='Refresh OK')
    @blp.doc(operationId="refreshAccessToken")
    def post(self, schema):
        """Refresh access token
        """
        try:
            user = User.objects.get(email=get_jwt_identity())
            return UserCredentialsSchema.create(user)
        except DoesNotExist:
            raise Unauthorized("Invalid user")
