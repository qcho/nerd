from flask.views import MethodView
from flask_rest_api import Blueprint
from flask_rest_api.pagination import PaginationParameters
from marshmallow_mongoengine import ModelSchema

from nerd.apis import response_error
from nerd.core.document.corpus import Text
from nerd.core.document.snapshot import Type
from nerd.core.document.user import Role
from werkzeug.exceptions import BadRequest, NotFound

from .roles import jwt_and_role_required

blp = Blueprint("corpus", "corpus", description="Corpus operations")


@blp.route("/<string:text_id>")
class CorpusTextResource(MethodView):
    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="getCorpusText")
    @response_error(NotFound("Corpus text does not exist"))
    @blp.response(...   , code=200, description="Model")
    def get(self, payload, text_id):
        ...

    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="removeCorpusText")
    @response_error(BadRequest("There was a problem deleting the corpus text"))
    def delete(self, text_id):
        ...


@blp.route("/<string:text_id>/trainings/me")
@blp.route("/<string:text_id>/trainings/<int:user_id>")
class TrainingView(MethodView):
    @jwt_and_role_required(Role.ADMIN)
    @blp.arguments(...)
    @blp.doc(operationId="getTraining")
    @blp.response(..., code=...)
    def get(self, text_id, user_id=None):
        ...

    @jwt_and_role_required(Role.ADMIN)
    @blp.arguments(...)
    @blp.doc(operationId="upsertTraining")
    @blp.response(..., code=...)
    def put(self, payload, text_id, user_id=None):
        ...


@blp.route("/train")
class TrainResource(MethodView):
    @jwt_and_role_required(Role.USER)
    @blp.doc(operationId="getTrainingInfo")
    @blp.response(..., code=...)
    @response_error(NotFound("Corpus not found"))
    def get(self):
        ...


class AddTextSchema(ModelSchema):
    class Meta:
        strict = True
        model = Text
        exclude = ['trainings', 'created_at']


class TextSchema(ModelSchema):
    class Meta:
        strict = True
        model = Text


@blp.route("/")
class IndexResource(MethodView):
    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="getCorpus")
    @blp.response(TextSchema(many=True), code=200)
    @blp.paginate()
    def get(self, pagination_parameters: PaginationParameters):
        results = Text.objects
        pagination_parameters.item_count = results.count()
        skip_elements = (pagination_parameters.page - 1) * pagination_parameters.page_size
        return results.skip(skip_elements).limit(pagination_parameters.page_size)

    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="addNewText")
    @blp.arguments(AddTextSchema)
    @blp.response(code=200)
    def post(self, payload: AddTextSchema):
        # TODO: We should avoid adding equal texts
        Text(
           value=payload.value,
        ).save()
