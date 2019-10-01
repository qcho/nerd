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
from nerd.apis.schemas import TrainTextSchema, TrainingSchema
from nerd.core.document.corpus import Text, Training
from nerd.core.document.snapshot import Snapshot
from nerd.core.document.spacy import SpacyDocumentSchema
from nerd.core.document.user import Role, User
from nerd.core.importer.text_importer import TextImporter
from nerd.tasks.corpus import nlp as nlp_task
from .roles import jwt_and_role_required

blp = Blueprint("corpus", "corpus", description="Corpus operations")


class TextSchema(ModelSchema):
    class Meta:
        strict = True
        model = Text


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


@blp.route("/<string:text_id>/trainings")
class TrainingView(MethodView):
    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="trainingsForText")
    @blp.response(TrainingSchema(many=True), code=200, description='Get trainings')
    @blp.paginate()
    def get(self, text_id, pagination_parameters: PaginationParameters):
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
    """Upload text file"""

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
        imported = 0
        for f in flask.request.files.getlist('file'):
            imported = imported + \
                       TextImporter(TextIOWrapper(f, encoding='utf-8')).run()
        return '', 200


@blp.route("/train-new")
class TrainResource(MethodView):
    """Returns a random text"""

    @jwt_and_role_required(Role.TRAINER)
    @blp.doc(operationId="trainNew", responses={
        '204': {'description': "No documents left to train"}
    })
    @blp.response(TrainTextSchema, code=200, description="Training entity")
    @response_error(NotFound("Corpus not found"))
    @response_error(FailedDependency("Failed to infer entities"))
    def get(self):
        try:
            user = User.objects.get(email=get_jwt_identity())
            texts = list(
                Text.objects.aggregate(*[
                    {
                        '$lookup': {
                            'from': Training._get_collection_name(),
                            'localField': '_id',
                            'foreignField': 'text_id',
                            'as': 'trainings'
                        }
                    }, {
                        '$project': {
                            '_id': 1,
                            'value': 1,
                            'trainings': {
                                '$filter': {
                                    'input': '$trainings',
                                    'cond': {
                                        'user_id': {
                                            '$eq': [
                                                'user_id', user.pk
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }, {
                        '$match': {
                            'trainings.0': {
                                '$exists': False
                            }
                        }
                    }, {
                        '$sample': {
                            'size': 1
                        }
                    }
                ])
            )
            if not texts:
                return '', 204
            text = texts[0]
            snapshot = Snapshot.current()
            spacy_document = nlp_task.apply_async(
                [text['value']], queue=str(snapshot)).wait()
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
        skip_elements = (pagination_parameters.page - 1) * \
                        pagination_parameters.page_size
        return results.skip(skip_elements).limit(pagination_parameters.page_size)

    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="addNewText")
    @blp.arguments(ValueOnlyTextSchema)
    @blp.response(TextSchema, code=200, description="Ok")
    def post(self, payload: ValueOnlyTextSchema):
        text = Text(value=payload.value.strip()).save()
        return text
