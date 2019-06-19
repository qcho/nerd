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
@blp.route("/<int:snapshot_id>/parse")
class NerResource(MethodView):
    @jwt_and_role_required(Role.USER)
    @blp.doc(operationId="textParse")
    @blp.arguments(RawText, location='query')
    @blp.response(TrainTextSchema, code=200, description="Ner")
    def get(self, raw_text: RawText, snapshot_id=None):
        # TODO: Error handling
        snapshot, document = parse_text(snapshot_id, raw_text['text'])
        return {
            'text_id': None,
            'snapshot': snapshot,
            'spacy_document': document
        }


@blp.route("/current/entities")
@blp.route("/<int:snapshot_id>/entities")
class NerResource(MethodView):
    @jwt_and_role_required(Role.USER)
    @blp.doc(operationId="textEntities")
    @blp.arguments(RawText, location='query')
    @blp.response(EntityListSchema, code=200, description="Ner")
    def get(self, raw_text: RawText, snapshot_id=None):
        # TODO: Error handling
        snapshot, document = parse_text(snapshot_id, raw_text['text'])
        return {
            'text': raw_text,
            'entities': document['ents'],
            'snapshot': snapshot
        }
