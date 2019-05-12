from flask.views import MethodView
from flask_jwt_extended import get_jwt_identity
from flask_rest_api import Blueprint
from flask_rest_api.pagination import PaginationParameters
from marshmallow_mongoengine import ModelSchema
from mongoengine import DoesNotExist
from marshmallow import fields, Schema
from werkzeug.exceptions import BadRequest, NotFound, FailedDependency

from nerd.apis import response_error
from nerd.core.document.corpus import Text
from nerd.core.document.snapshot import Snapshot, Type, SnapshotSchema
from nerd.core.document.spacy import SpacyDocumentSchema
from nerd.tasks.corpus import nlp as nlp_task
from nerd.core.document.user import Role, User
from .roles import jwt_and_role_required

blp = Blueprint("corpus", "corpus", description="Corpus operations")


class TextSchema(ModelSchema):
    class Meta:
        strict = True
        model = Text
        model_fields_kwargs = {
            'trainings': {
                'metadata': {
                    'type': 'object',
                    'additionalProperties': {
                        '$ref': '#/components/schemas/SpacyDocument'
                    }
                }
            }
        }


class TypeSchema(ModelSchema):
    class Meta:
        strict = True
        model = Type


class ValueOnlyTextSchema(ModelSchema):
    class Meta:
        strict = True
        model = Text
        exclude = ['id', 'trainings', 'created_at']


class TrainTextSchema(Schema):
    text_id = fields.String(required=True)
    snapshot = fields.Nested(SnapshotSchema, required=True)
    spacy_document = fields.Nested(SpacyDocumentSchema, required=True)


@blp.route("/<string:text_id>")
class CorpusTextResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="getCorpusText")
    @response_error(NotFound("Corpus text does not exist"))
    @blp.response(TextSchema, code=200, description="Model")
    def get(self, text_id):
        try:
            return Text.objects.get(id=text_id)
        except DoesNotExist:
            raise NotFound()

    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="removeCorpusText")
    @response_error(BadRequest("There was a problem deleting the corpus text"))
    def delete(self, text_id):
        try:
            text = Text.objects.get(id=text_id)
            text.delete()
            return
        except DoesNotExist:
            raise NotFound()


@blp.route("/<string:text_id>/trainings/me")
@blp.route("/<string:text_id>/trainings/<int:user_id>")
class TrainingView(MethodView):
    #     @jwt_and_role_required(Role.ADMIN)
    #     @blp.arguments(...)
    #     @blp.doc(operationId="getTraining")
    #     @blp.response(..., code=...)
    #     def get(self, text_id, user_id=None):
    #         ...
    #
    @jwt_and_role_required(Role.USER)
    @blp.arguments(SpacyDocumentSchema)
    @blp.doc(operationId="upsertTraining")
    @blp.response(code=200)
    def put(self, payload, text_id, user_id=None):
        if user_id is None:
            user = User.objects.get(email=get_jwt_identity())
            user_id = str(user.pk)
        text = Text.objects.get(id=text_id)
        text.trainings[user_id] = payload
        text.save()


@blp.route("/train")
class TrainResource(MethodView):

    @jwt_and_role_required(Role.USER)
    @blp.doc(operationId="train")
    @blp.response(TrainTextSchema, code=200, description="Training entity")
    @response_error(NotFound("Corpus not found"))
    @response_error(FailedDependency("Failed to infer entities"))
    def get(self):
        try:
            # FIXME: This should sample only from the texts that the user hasn't trained yet.
            texts = list(Text.objects.aggregate({"$sample": {'size': 1}}))
            if not texts:
                pass  # User has trained all available texts
            text = texts[0]
            snapshot = Snapshot.current()
            spacy_document = nlp_task.apply_async([text['value']], queue=str(snapshot)).wait()
            return {
                'text_id': str(text['_id']),
                'snapshot': snapshot,
                'spacy_document': spacy_document
            }
        except TimeoutError:
            raise FailedDependency()


@blp.route("/")
class IndexResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="getCorpus")
    @blp.response(TextSchema(many=True), code=200, description="Corpus")
    @blp.paginate()
    def get(self, pagination_parameters: PaginationParameters):
        results = Text.objects
        pagination_parameters.item_count = results.count()
        skip_elements = (pagination_parameters.page - 1) * pagination_parameters.page_size
        return results.skip(skip_elements).limit(pagination_parameters.page_size)

    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="addNewText")
    @blp.arguments(ValueOnlyTextSchema)
    @blp.response(code=200, description="Ok")
    def post(self, payload: ValueOnlyTextSchema):
        # TODO: We should avoid adding equal texts
        Text(
           value=payload.value,
        ).save()
