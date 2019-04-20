from flask.views import MethodView
from flask_rest_api import Blueprint
from flask_rest_api.pagination import PaginationParameters
from marshmallow_mongoengine import ModelSchema
from nerd.apis import jwt_and_role_required
from nerd.core.document.snapshot import Snapshot
from nerd.core.document.user import Role

blp = Blueprint("snapshots", "snapshots",
                description="Corpus snapshot operations")


class CorpusSnapshotSchema(ModelSchema):
    class Meta:
        model = Snapshot


class CreateCorpusSnapshotSchema(ModelSchema):
    class Meta:
        model = Snapshot
        exclude = ['created_at']


@blp.route("")
class IndexResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(CorpusSnapshotSchema(many=True))
    @blp.doc(operationId="listCorpusSnapshots")
    @blp.paginate()
    def get(self, pagination_parameters: PaginationParameters):
        """List available corpora
        """
        pagination_parameters.item_count = Snapshot.objects.count()
        skip_elements = (pagination_parameters.page - 1) * \
            pagination_parameters.page_size
        return Snapshot.objects.skip(skip_elements).limit(pagination_parameters.page_size)

    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="listCorpusSnapshots")
    @blp.response(...)
    @blp.arguments(...)
    def post(self, payload):
        ...


@blp.route("/current")
@blp.route("/<int:snapshot_id>")
class SnapshotResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(...)
    @blp.doc(operationId="")
    def get(self, snapshot_id: int = None):
        ...



@blp.route("/current/entity-types")
@blp.route("/<int:snapshot_id>/entity-types")
class EntityTypesResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(...)
    @blp.doc(operationId="")
    def get(self, snapshot_id: int = None):
        ...


@blp.route("/current/entity-types/<string:type_name>")
@blp.route("/<int:snapshot_id>/entity-types/<string:type_name>")
class EntityTypeResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(...)
    @blp.doc(operationId="")
    def delete(self, snapshot_id: int = None, type_name: str = None):
        ...


@blp.route("/force-train")
class ForceTrainingResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(...)
    @blp.doc(operationId="")
    def post(self, payload):
        ...
