from datetime import datetime
from io import TextIOWrapper

import flask
from flask.views import MethodView
from flask_jwt_extended import get_jwt_identity
from flask_smorest import Blueprint
from flask_smorest.pagination import PaginationParameters
from marshmallow_mongoengine import ModelSchema
from mongoengine import DoesNotExist
from werkzeug.exceptions import BadRequest, FailedDependency, NotFound

from nerd.apis import response_error
from nerd.apis.schemas import TrainTextSchema, TrainingSchema, TextSchema
from nerd.core.document.corpus import Text, Training
from nerd.core.document.snapshot import Snapshot
from nerd.core.document.spacy import SpacyDocumentSchema
from nerd.core.document.user import Role, User
from nerd.core.importer.text_importer import TextImporter
from nerd.tasks.corpus import nlp as nlp_task
from .roles import jwt_and_role_required

blp = Blueprint("corpus", "corpus", description="Corpus operations")

class ValueOnlyTextSchema(ModelSchema):
    class Meta:
        strict = True
        model = Text
        exclude = ['id', 'trainings', 'created_at']


@blp.route("/<string:text_id>")
class CorpusTextResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="getCorpusText")
    @response_error(NotFound("Corpus text does not exist"))
    @blp.response(TextSchema, code=200, description="Model")
    def get(self, text_id):
        """
        Gets text details for the given id
        """
        try:
            return Text.objects.get(id=text_id)
        except DoesNotExist:
            raise NotFound()

    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="removeCorpusText")
    @response_error(BadRequest("There was a problem deleting the corpus text"))
    def delete(self, text_id):
        """Delete a text from the corpus"""
        try:
            text = Text.objects.get(id=text_id)
            text.delete()
            return
        except DoesNotExist:
            raise NotFound()


@blp.route("/<string:text_id>/trainings")
class TrainingView(MethodView):
    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="trainingsForText")
    @blp.response(TrainingSchema(many=True), code=200, description='Get trainings')
    @blp.paginate()
    def get(self, text_id, pagination_parameters: PaginationParameters):
        """Trainings for a given text"""
        trainings = Training.objects.filter(text_id=text_id)
        pagination_parameters.item_count = trainings.count()
        skip_elements = (pagination_parameters.page - 1) * \
                        pagination_parameters.page_size
        return trainings.skip(skip_elements).limit(pagination_parameters.page_size)

    @jwt_and_role_required(Role.TRAINER)
    @blp.arguments(SpacyDocumentSchema)
    @blp.doc(operationId="addTextTraining")
    @blp.response(code=200, description='Add text training')
    def put(self, payload, text_id):
        """Adds a new training to the given text"""
        user = User.objects.get(email=get_jwt_identity())
        text = Text.objects.get(id=text_id)
        training = Training.objects(user_id=user.pk, text_id=text.pk).update_one(
            upsert=True,
            full_result=True,
            user_id=user.pk,
            text_id=text.pk,
            set__document=payload,
            set__created_at=datetime.now())
        training_pk = training.upserted_id
        user.update(add_to_set__trainings=training_pk)
        text.update(add_to_set__trainings=training_pk)
        return


@blp.route("/upload")
class UploadFileResource(MethodView):
    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="uploadFile", requestBody={
        "content": {
            "multipart/form-data": {
                "schema": {
                    "type": "object",
                    "properties": {
                        "file": {
                            "format": "binary",
                            "type": "string"
                        }
                    }
                }
            }
        }
    })
    def post(self):
        """Upload text files

        Upload UTF-8 .txt files where each line is a text to add to the training corpus"""
        imported = 0
        for f in flask.request.files.getlist('file'):
            imported = imported + \
                       TextImporter(TextIOWrapper(f, encoding='utf-8')).run()
        return '', 200


@blp.route("/")
class IndexResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="getCorpus")
    @blp.response(TextSchema(many=True), code=200, description="Corpus")
    @blp.paginate()
    def get(self, pagination_parameters: PaginationParameters):
        """List of texts part of the training corpus"""
        results = Text.objects
        pagination_parameters.item_count = results.count()
        skip_elements = (pagination_parameters.page - 1) * \
                        pagination_parameters.page_size
        return results.skip(skip_elements).limit(pagination_parameters.page_size)

    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="addNewText")
    @blp.arguments(ValueOnlyTextSchema)
    @blp.response(TextSchema, code=200, description="Ok")
    def post(self, payload: ValueOnlyTextSchema):
        """Add text to the training corpus"""
        text = Text(value=payload.value.strip()).save()
        return text
