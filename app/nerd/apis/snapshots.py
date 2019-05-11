from datetime import datetime

from flask.views import MethodView
from flask_rest_api import Blueprint
from flask_rest_api.pagination import PaginationParameters
from marshmallow_mongoengine import ModelSchema
from nerd.apis import jwt_and_role_required
from nerd.core.document.snapshot import CURRENT_ID, Snapshot
from nerd.core.document.user import Role
from nerd.tasks.corpus import train as train_task

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


@blp.route("/current")
class SnapshotCurrentResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(CorpusSnapshotSchema)
    @blp.doc(operationId="")
    def get(self):
        return Snapshot.objects.get(id=CURRENT_ID)

    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="createCorpusSnapshot")
    @blp.arguments(CorpusSnapshotSchema)
    @blp.response(CorpusSnapshotSchema)
    def put(self, payload):
        current_snapshot = Snapshot.current()
        new_snapshot = Snapshot(types=current_snapshot.types)
        new_snapshot.save()
        current_snapshot.types = payload.types
        current_snapshot.created_at = datetime.now()
        current_snapshot.save()
        return current_snapshot


@blp.route("/current")
@blp.route("/<int:snapshot_id>")
class SnapshotResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(CorpusSnapshotSchema)
    @blp.doc(operationId="")
    def get(self, snapshot_id: int = None):
        try:
            return Snapshot.objects.get(id=snapshot_id)
        except DoesNotExist:
            raise NotFound()


@blp.route("/force-train")
class ForceTrainingResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(None)
    @blp.doc(operationId="forceTrain")
    def post(self, payload):
        snapshot = Snapshot.current()
        train_task.apply_async([snapshot], queue='vCURRENT')
        return "", 204
