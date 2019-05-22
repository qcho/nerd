import json

from flask.views import MethodView
from flask_jwt_extended import get_jwt_identity
from flask_rest_api import Blueprint
from flask_rest_api.pagination import PaginationParameters
from marshmallow import Schema
from marshmallow import fields
from marshmallow_mongoengine import ModelSchema
from mongoengine import DoesNotExist
from mongoengine.queryset.visitor import Q
from werkzeug.exceptions import NotFound, UnprocessableEntity

from nerd.apis import jwt_and_role_required, response_error
from nerd.apis.corpus import TrainedTextSchema
from nerd.core.document.corpus import TrainedText
from nerd.core.document.user import User, Role

blp = Blueprint('users', 'users', description='User management')


class UserSchema(ModelSchema):
    class Meta:
        model = User
        exclude = ['password', 'plain_password', 'trainings']

    total_trainings = fields.Integer()


class UserPayloadSchema(ModelSchema):
    class Meta:
        model = User
        exclude = ['password', 'email']


class FilterUsersSchema(Schema):
    class Meta:
        strict = True
        ordered = True

    query = fields.String(required=False)


@blp.route('/')
class UserListView(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(UserSchema(many=True))
    @blp.arguments(FilterUsersSchema, location='query')
    @blp.doc(operationId="listUsers")
    @blp.paginate()
    def get(self, query_filter: FilterUsersSchema, pagination_parameters: PaginationParameters):
        """Returns a list of existing users
        """
        results = User.objects if 'query' not in query_filter else User.objects(
            Q(email__icontains=query_filter['query']) | Q(name__icontains=query_filter['query']))
        pagination_parameters.item_count = results.count()
        skip_elements = (pagination_parameters.page - 1) * pagination_parameters.page_size
        return results.aggregate(*[
            {
                '$skip': skip_elements
            },
            {
                '$limit': pagination_parameters.page_size
            },
            {
                '$project': {
                    'id': '$_id',
                    'email': 1,
                    'name': 1,
                    'roles': 1,
                    'total_trainings': {
                        '$cond': {
                            'if': {'$isArray': "$trainings"},
                            'then': {'$size': "$trainings"},
                            'else': 0
                        }
                    }
                }
            }
        ])


def _get_user_trainings(user: User, pagination_params: PaginationParameters):
    texts = TrainedText.objects.filter(user_id=user.pk)
    pagination_params.item_count = texts.count()
    skip_elements = (pagination_params.page - 1) * pagination_params.page_size
    return texts.skip(skip_elements).limit(pagination_params.page_size)


@blp.route('/me/trainings')
class MyTrainings(MethodView):

    @jwt_and_role_required(Role.USER)
    @blp.paginate()
    @blp.doc(operationId="myTrainings")
    @blp.response(TrainedTextSchema(many=True), code=200)
    def get(self, pagination_params: PaginationParameters):
        user = User.objects.get(email=get_jwt_identity())
        return _get_user_trainings(user, pagination_params)


@blp.route('/<string:user_id>/trainings')
class UserTrainings(MethodView):
    @jwt_and_role_required(Role.ADMIN)
    @blp.paginate()
    @blp.doc(operationId="userTrainings")
    @blp.response(TrainedTextSchema(many=True), code=200)
    def get(self, user_email, pagination_params: PaginationParameters):
        user = User.objects.get(email=user_email)
        return _get_user_trainings(user, pagination_params)


@blp.route('/<string:user_id>')
class UserView(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @response_error(NotFound('User does not exist'))
    @blp.response(UserSchema)
    @blp.doc(operationId="userDetails")
    def get(self, user_id: str):
        """Gets user entity by email
        """
        try:
            return User.objects.get(id=user_id)
        except DoesNotExist:
            raise NotFound('User {} does not exist'.format(user_id))

    @jwt_and_role_required(Role.ADMIN)
    @response_error(NotFound('User does not exist'))
    @blp.response(UserSchema)
    @blp.doc(operationId="deleteUser")
    def delete(self, user_id: str):
        """Delete user by id"""
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return user
        except DoesNotExist:
            raise NotFound('User {} does not exist'.format(user_id))

    @jwt_and_role_required(Role.ADMIN)
    @blp.arguments(UserPayloadSchema(partial=True))
    @response_error(NotFound('User does not exist'))
    @response_error(UnprocessableEntity('There was an error processing the payload'))
    @blp.response(UserSchema)
    @blp.doc(operationId="updateUser")
    def patch(self, user_payload: User, user_email: str):
        """Patches the user entity
        """
        try:
            result = UserPayloadSchema().update(
                User.objects.get(email=user_email),
                # TODO: update only accepts JSON objects and doesn't accept Documents
                json.loads(user_payload.to_json())
            )
            if result.errors:
                raise UnprocessableEntity("There was an error processing the payload")
            return result.data.save()
        except DoesNotExist:
            raise NotFound('User {} does not exist'.format(user_email))
