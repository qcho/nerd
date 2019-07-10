from flask.views import MethodView
from flask_rest_api import Blueprint
from marshmallow import fields

from nerd.apis import BaseSchema
from nerd.apis.schemas import TrainTextSchema, EntityListSchema
from nerd.core.document.snapshot import Snapshot
from nerd.core.document.user import Role
from nerd.tasks.corpus import nlp as nlp_task
from .roles import jwt_and_role_required

blp = Blueprint("ner", "ner", description="NER operations")


class RawText(BaseSchema):
    text = fields.String(required=True)


def parse_text(snapshot_id, text: str):
    snapshot = Snapshot.current() if snapshot_id is None else Snapshot.objects.get(id=snapshot_id)
    document = nlp_task.apply_async([text], queue=str(snapshot)).wait()
    return [snapshot, document]


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
