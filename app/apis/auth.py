from flask.views import MethodView
from flask_jwt_extended import jwt_refresh_token_required, get_jwt_identity, create_access_token, jwt_required, \
    create_refresh_token
from flask_rest_api import Blueprint
from marshmallow_mongoengine import ModelSchema
from mongoengine import DoesNotExist
from werkzeug.exceptions import Unauthorized, Conflict

from apis import BaseSchema, response_error
from core.document.user import User
from marshmallow import fields, post_load

blp = Blueprint('auth', 'auth', description='Authentication')


class RegisterSchema(ModelSchema):
    class Meta:
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

    @staticmethod
    def create(user: User):
        return {
            'access_token': create_access_token(identity=user),
            'refresh_token': create_refresh_token(identity=user),
        }


@blp.route('/register')
class RegisterResource(MethodView):

    @blp.arguments(RegisterSchema)
    @response_error(Conflict('Email exists'))
    @blp.response(UserCredentialsSchema, code=200, description='Registration successful')
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
        grant_type = fields.Constant('password')
        username = fields.Email()
        password = fields.String()

        @post_load
        def sanitize_fields(self, item):
            item['username'] = item['username'].lower().strip()
            return item

    @blp.arguments(TokenSchema, location='form')
    @response_error(Unauthorized('Invalid credentials'))
    @blp.response(UserCredentialsSchema)
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
        grant_type = fields.Constant('refresh_token')

    @jwt_refresh_token_required
    @response_error(Unauthorized("Invalid user"))
    @blp.arguments(RefreshTokenSchema, location='query')
    @blp.response(UserCredentialsSchema, code=200, description='Refresh OK')
    def post(self):
        """Refresh access token
        """
        user = User.objects.get(email=get_jwt_identity())
        if not user:
            raise Unauthorized("Invalid user")
        return UserCredentialsSchema.create(user)
