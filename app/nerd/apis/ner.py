from flask.views import MethodView
from flask_rest_api import Blueprint
from marshmallow import fields
from werkzeug.exceptions import NotFound

from nerd.apis import response_error, BaseSchema
from nerd.apis.schemas import TrainTextSchema
from nerd.core.document.snapshot import Snapshot
from nerd.core.document.user import Role
from nerd.tasks.corpus import nlp as nlp_task
from .roles import jwt_and_role_required

blp = Blueprint("ner", "ner", description="NER operations")


class RawText(BaseSchema):
    text = fields.String(required=True)


@blp.route("/current")
@blp.route("/<int:snapshot_id>")
class NerResource(MethodView):
    @jwt_and_role_required(Role.USER)
    @blp.doc(operationId="parseText")
    @response_error(NotFound("Could not ner"))
    @blp.arguments(RawText, location='query')
    @blp.response(TrainTextSchema, code=200, description="Ner")
    def get(self, raw_text: RawText, snapshot_id=None):
        snapshot = Snapshot.current() if snapshot_id is None else Snapshot.objects.get(id=snapshot_id)
        text = raw_text['text']
        spacy_document = nlp_task.apply_async(
            [text], queue=str(snapshot)).wait()
        return {
            'text_id': None,
            'snapshot': snapshot,
            'spacy_document': spacy_document
        }
