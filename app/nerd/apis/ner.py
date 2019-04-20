from flask.views import MethodView
from flask_rest_api import Blueprint
from nerd.apis import response_error
from nerd.core.document.snapshot import Type
from nerd.core.document.user import Role
from werkzeug.exceptions import BadRequest, NotFound

from .roles import jwt_and_role_required

blp = Blueprint("ner", "ner", description="NER operations")


@blp.route("/current")
@blp.route("/<int:snapshot_id>")
class NerResource(MethodView):
    @jwt_and_role_required(Role.USER)
    @blp.doc(operationId="nerify")
    @response_error(NotFound("Could not ner"))
    @blp.response(..., code=200, description="Ner")
    def get(self, snapshot_id=None):
        ...
