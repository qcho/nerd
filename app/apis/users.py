from flask.views import MethodView
from flask_rest_api import Blueprint
from marshmallow_mongoengine import ModelSchema
from mongoengine import DoesNotExist
from werkzeug.exceptions import NotFound

from apis import jwt_and_role_required, response_error
from core.document.user import User, Role

blp = Blueprint('users', 'users', description='User management')


class UserSchema(ModelSchema):
    class Meta:
        model = User
        exclude = ['password', 'plain_password']


class UserPayloadSchema(ModelSchema):
    class Meta:
        model = User
        exclude = ['password']


@blp.route('/')
class UserListView(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(UserSchema(many=True))
    @blp.doc(operationId="listUsers")
    def get(self):  # TODO: Paginate
        """Returns a list of existing users
        """
        return User.objects


@blp.route('/<string:user_email>')
class UserView(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @response_error(NotFound('User does not exist'))
    @blp.response(UserSchema)
    @blp.doc(operationId="userDetails")
    def get(self, user_email: str):
        """Gets user entity by email
        """
        try:
            return User.objects.get(email=user_email)
        except DoesNotExist:
            raise NotFound('User {} does not exist'.format(user_email))

    @jwt_and_role_required(Role.ADMIN)
    @response_error(NotFound('User does not exist'))
    @blp.response(UserSchema)
    @blp.doc(operationId="deleteUser")
    def delete(self, user_email: str):
        """Delete user by email"""
        try:
            user = User.objects.get(email=user_email)
            user.delete()
            return user
        except DoesNotExist:
            raise NotFound('User {} does not exist'.format(user_email))

    @jwt_and_role_required(Role.ADMIN)
    @blp.arguments(UserPayloadSchema)
    @response_error(NotFound('User does not exist'))
    @blp.response(UserSchema)
    @blp.doc(operationId="updateUser")
    def patch(self, user_payload: User, user_email: str):
        """Patches the user entity
        """
        try:
            return UserPayloadSchema().update(
                User.objects.get(email=user_email),
                user_payload
            ).data.save()
        except DoesNotExist:
            raise NotFound('User {} does not exist'.format(user_email))
