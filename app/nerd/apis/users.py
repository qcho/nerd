import json

from flask.views import MethodView
from flask_jwt_extended import get_jwt_identity
from flask_smorest import Blueprint
from flask_smorest.pagination import PaginationParameters
from marshmallow import Schema
from marshmallow import fields
from marshmallow_mongoengine import ModelSchema
from mongoengine import DoesNotExist, ValidationError
from mongoengine.queryset.visitor import Q
from werkzeug.exceptions import NotFound, UnprocessableEntity

from nerd.apis import jwt_and_role_required, response_error
from nerd.apis.schemas import TrainingSchema
from nerd.core.document.corpus import Training
from nerd.core.document.user import User, Role

blp = Blueprint('users', 'users', description='User management')


class UserSchema(ModelSchema):
    class Meta:
        model = User
        exclude = ['password', 'plain_password', 'trainings']

    total_trainings = fields.Integer()


class TopContributorSchema(ModelSchema):
    class Meta:
        model = User
        fields = ['name', 'total_trainings']

    total_trainings = fields.Integer(required=True)


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
    @blp.response(UserSchema(many=True), code=200, description='List of users')
    @blp.arguments(FilterUsersSchema, location='query')
    @blp.doc(operationId="listUsers")
    @blp.paginate()
    def get(self, query_filter: FilterUsersSchema, pagination_parameters: PaginationParameters):
        """Returns a list of existing users
        """
        results = User.objects if 'query' not in query_filter else User.objects(
            Q(email__icontains=query_filter['query']) | Q(name__icontains=query_filter['query']))
        pagination_parameters.item_count = results.count()
        skip_elements = (pagination_parameters.page - 1) * \
                        pagination_parameters.page_size
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


@blp.route('/top5')
class TopTrainers(MethodView):
    @blp.response(TopContributorSchema(many=True), code=200, description='Top 5 contributors')
    @blp.doc(operationId='top5')
    def get(self):
        return User.objects.aggregate(*[
            {
                '$project': {
                    'name': 1,
                    'total_trainings': {
                        '$cond': {
                            'if': {'$isArray': "$trainings"},
                            'then': {'$size': "$trainings"},
                            'else': 0
                        }
                    }
                }
            },
            {
                '$match': {
                    'total_trainings': {
                        '$gte': 1
                    }
                }
            },
            {
                '$sort': {'total_trainings': -1}
            },
            {
                '$limit': 5
            }
        ])


def _get_user_trainings(user: User, pagination_params: PaginationParameters):
    texts = Training.objects.filter(user_id=user.pk)
    pagination_params.item_count = texts.count()
    skip_elements = (pagination_params.page - 1) * pagination_params.page_size
    return texts.skip(skip_elements).limit(pagination_params.page_size)


def _patch_user(user: User, payload: UserPayloadSchema):
    result = UserPayloadSchema().update(
        user,
        json.loads(payload.to_json())
    )
    if result.errors:
        raise UnprocessableEntity(
            "There was an error processing the payload")
    return result.data.save()


@blp.route('/me')
class LoggedUserView(MethodView):

    def _logged_user(self):
        return User.objects.get(email=get_jwt_identity())

    @jwt_and_role_required(Role.USER)
    @response_error(NotFound('User does not exist'))
    @blp.response(UserSchema, code=200, description='Logged user details')
    @blp.doc(operationId="loggedUserDetails")
    def get(self):
        """Gets currently logged user's account details"""
        try:
            return self._logged_user()
        except (DoesNotExist, ValidationError):
            raise NotFound()

    @jwt_and_role_required(Role.USER)
    @response_error(NotFound('User does not exist'))
    @blp.response(UserSchema, code=200, description='Logged user details patched')
    @blp.doc(operationId="patchLoggedUserDetails")
    def patch(self, payload: UserPayloadSchema):
        """Patches the user entity"""
        try:
            return _patch_user(self._logged_user(), payload)
        except DoesNotExist:
            raise NotFound('Logged user doesn\'t exist')


@blp.route('/me/trainings')
class MyTrainings(MethodView):

    @jwt_and_role_required(Role.USER)
    @blp.paginate()
    @blp.doc(operationId="myTrainings")
    @blp.response(TrainingSchema(many=True), code=200, description='Own trainings')
    @response_error(NotFound('User does not exist'))
    def get(self, pagination_parameters: PaginationParameters):
        try:
            user = User.objects.get(email=get_jwt_identity())
            return _get_user_trainings(user, pagination_parameters)
        except (DoesNotExist, ValidationError):
            raise NotFound()


@blp.route('/<string:user_id>')
class UserView(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @response_error(NotFound('User does not exist'))
    @blp.response(UserSchema, code=200, description='User details')
    @blp.doc(operationId="userDetails")
    def get(self, user_id: str):
        """Gets specific user account details by a given id
        """
        try:
            return User.objects.get(id=user_id)
        except (DoesNotExist, ValidationError):
            raise NotFound('User {} does not exist'.format(user_id))

    @jwt_and_role_required(Role.ADMIN)
    @response_error(NotFound('User does not exist'))
    @blp.response(UserSchema, code=200, description='User deleted')
    @blp.doc(operationId="deleteUser")
    def delete(self, user_id: str):
        """Delete user by id"""
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return user
        except (DoesNotExist, ValidationError):
            raise NotFound('User with id {} does not exist'.format(user_id))

    @jwt_and_role_required(Role.ADMIN)
    @blp.arguments(UserPayloadSchema(partial=True))
    @response_error(NotFound('User does not exist'))
    @response_error(UnprocessableEntity('There was an error processing the payload'))
    @blp.response(UserSchema, code=200, description='User patched')
    @blp.doc(operationId="updateUser")
    def patch(self, user_payload: UserPayloadSchema, user_id: str):
        """Patches the user entity
        """
        try:
            return _patch_user(User.objects.get(id=user_id), user_payload)
        except DoesNotExist:
            raise NotFound('User with id {} does not exist'.format(user_id))


@blp.route('/<string:user_id>/trainings')
class UserTrainings(MethodView):
    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="userTrainings")
    @blp.response(TrainingSchema(many=True), code=200, description='User\'s trainings')
    @response_error(NotFound('User does not exist'))
    @blp.paginate()
    def get(self, user_id, pagination_parameters: PaginationParameters):
        try:
            user = User.objects.get(id=user_id)
            return _get_user_trainings(user, pagination_parameters)
        except (DoesNotExist, ValidationError):
            raise NotFound()
