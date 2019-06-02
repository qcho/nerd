from datetime import datetime
from flask.views import MethodView
from flask_jwt_extended import get_jwt_identity
from flask_rest_api import Blueprint
from flask_rest_api.pagination import PaginationParameters
from marshmallow_mongoengine import ModelSchema
from mongoengine import DoesNotExist
from werkzeug.exceptions import BadRequest, FailedDependency, NotFound

from nerd.apis import response_error
from nerd.apis.schemas import TrainTextSchema
from nerd.core.document.corpus import Text, TrainedText
from nerd.core.document.snapshot import Snapshot
from nerd.core.document.spacy import SpacyDocumentSchema
from nerd.core.document.user import Role, User
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


# TODO: Seems that this route isn't necessary since we access own trainings from /users/me/trainings
@blp.route("/<string:text_id>/trainings/me")
class TrainingView(MethodView):
    @jwt_and_role_required(Role.USER)
    @blp.doc(operationId="getTrainingsForMyself")
    @blp.response(SpacyDocumentSchema(many=True), code=200)
    @blp.paginate()
    def get(self, text_id, pagination_parameters: PaginationParameters):
        user = User.objects.get(email=get_jwt_identity())
        user_id = str(user.pk)
        trainings = TrainedText.objects.filter(text_id=text_id, user_id=user_id)
        pagination_parameters.item_count = trainings.count()
        skip_elements = (pagination_parameters.page - 1) * pagination_parameters.page_size
        return trainings.skip(skip_elements).limit(pagination_parameters.page_size)

    @jwt_and_role_required(Role.USER)
    @blp.arguments(SpacyDocumentSchema)
    @blp.doc(operationId="upsertMyTraining")
    @blp.response(code=200)
    def put(self, payload, text_id):
        user = User.objects.get(email=get_jwt_identity())
        text = Text.objects.get(id=text_id)
        trained_text = TrainedText.objects(user_id=user.pk, text_id=text.pk).update_one(
            upsert=True,
            full_result=True,
            user_id=user.pk,
            text_id=text.pk,
            set__document=payload,
            set__created_at=datetime.now())
        trained_text_pk = trained_text.upserted_id
        user.update(add_to_set__trainings=trained_text_pk)
        text.update(add_to_set__trainings=trained_text_pk)
        return


@blp.route("/<string:text_id>/trainings/<string:user_id>")
class TrainingAdminView(MethodView):
    @jwt_and_role_required(Role.ADMIN)
    @blp.paginate()
    @blp.doc(operationId="getTraining")
    @blp.response(TextSchema(many=True), code=200)
    def get(self, text_id, user_id, pagination_parameters: PaginationParameters):
        trainings = TrainedText.objects.filter(text_id=text_id, user_id=user_id)
        pagination_parameters.item_count = trainings.count()
        skip_elements = (pagination_parameters.page - 1) * pagination_parameters.page_size
        return trainings.skip(skip_elements).limit(pagination_parameters.page_size)

    @jwt_and_role_required(Role.ADMIN)
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
    """Returns a random text"""

    @jwt_and_role_required(Role.USER)
    @blp.doc(operationId="train", responses={
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
                            'from': TrainedText._get_collection_name(),
                            'localField': '_id',
                            'foreignField': 'text_id',
                            'as': 'trained_texts'
                        }
                    }, {
                        '$project': {
                            '_id': 1,
                            'value': 1,
                            'trained_texts': {
                                '$filter': {
                                    'input': '$trained_texts',
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
                            'trained_texts.0': {
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
    @blp.response(code=200, description="Ok")
    def post(self, payload: ValueOnlyTextSchema):
        # TODO: We should avoid adding equal texts
        Text(
            value=payload.value,
        ).save()
