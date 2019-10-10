from flask.views import MethodView
from flask_smorest import Blueprint
from marshmallow import fields
from werkzeug.exceptions import FailedDependency, NotFound
from flask_smorest.pagination import PaginationParameters
from flask_jwt_extended import get_jwt_identity

from nerd.apis import BaseSchema
from nerd.apis import response_error
from nerd.apis.schemas import TrainTextSchema, EntityListSchema
from nerd.core.document.snapshot import Snapshot
from nerd.core.document.corpus import Text, Training
from nerd.core.document.user import Role, User
from nerd.tasks.corpus import nlp as nlp_task
from .roles import jwt_and_role_required

blp = Blueprint("ner", "ner", description="NER operations")


class RawText(BaseSchema):
    text = fields.String(required=True)


def parse_text(snapshot_id, text: str):
    snapshot = Snapshot.current() if snapshot_id is None else Snapshot.objects.get(id=snapshot_id)
    document = nlp_task.apply_async([text], queue=str(snapshot)).wait()
    return [snapshot, document]

@blp.route("/train")
class TrainResource(MethodView):
    """Returns a random text"""

    @jwt_and_role_required(Role.TRAINER)
    @blp.doc(operationId="trainNer", responses={
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

@blp.route("/current/parse")
class NerParserResource(MethodView):
    @jwt_and_role_required(Role.USER)
    @blp.doc(operationId="currentSnapshotTextParse")
    @blp.arguments(RawText)
    @blp.response(TrainTextSchema, code=200, description="Ner")
    def post(self, raw_text: RawText):
        snapshot, document = parse_text(None, raw_text['text'])
        return {'text_id': None, 'snapshot': snapshot, 'spacy_document': document}


@blp.route("/<int:snapshot_id>/parse")
class NerParserResource(MethodView):
    @jwt_and_role_required(Role.USER)
    @blp.doc(operationId="snapshotTextParse")
    @blp.arguments(RawText)
    @blp.response(TrainTextSchema, code=200, description="Ner")
    def post(self, raw_text: RawText, snapshot_id: int):
        snapshot, document = parse_text(snapshot_id, raw_text['text'])
        return {'text_id': None, 'snapshot': snapshot, 'spacy_document': document}


@blp.route("/current/entities")
class NerEntitiesResource(MethodView):
    @jwt_and_role_required(Role.USER)
    @blp.doc(operationId="currentSnapshotTextEntities")
    @blp.arguments(RawText)
    @blp.response(EntityListSchema, code=200, description="Ner")
    def post(self, raw_text: RawText):
        snapshot, document = parse_text(None, raw_text['text'])
        return {'text': raw_text, 'entities': document['ents'], 'snapshot': snapshot}


@blp.route("/<int:snapshot_id>/entities")
class NerEntitiesResource(MethodView):
    @jwt_and_role_required(Role.USER)
    @blp.doc(operationId="snapshotTextEntities")
    @blp.arguments(RawText)
    @blp.response(EntityListSchema, code=200, description="Ner")
    def post(self, raw_text: RawText, snapshot_id: int):
        snapshot, document = parse_text(snapshot_id, raw_text['text'])
        return {'text': raw_text, 'entities': document['ents'], 'snapshot': snapshot}
