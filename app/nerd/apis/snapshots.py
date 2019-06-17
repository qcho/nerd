from datetime import datetime

from flask.views import MethodView
from flask_rest_api import Blueprint
from flask_rest_api.pagination import PaginationParameters
from marshmallow_mongoengine import ModelSchema, fields
from mongoengine import DoesNotExist
from werkzeug.exceptions import NotFound

from nerd.apis import jwt_and_role_required, response_error, BaseSchema
from nerd.core.document.corpus import Text, TrainedText
from nerd.core.document.snapshot import CURRENT_ID, Snapshot, SnapshotSchema
from nerd.core.document.user import Role
from nerd.tasks.corpus import reload as reload_task
from nerd.tasks.corpus import train as train_task

blp = Blueprint("snapshots", "snapshots",
                description="Corpus snapshot operations")


class SnapshotInfoSchema(BaseSchema):
    snapshot = fields.Nested(SnapshotSchema, required=True)
    corpus_size = fields.Integer(required=True)
    trained_texts = fields.Integer(required=True)
    trainings = fields.Integer(required=True)


class CreateCorpusSnapshotSchema(ModelSchema):
    class Meta:
        model = Snapshot
        exclude = ['created_at']


@blp.route("")
class IndexResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(SnapshotSchema(many=True))
    @blp.doc(operationId="listCorpusSnapshots")
    @blp.paginate()
    def get(self, pagination_parameters: PaginationParameters):
        """List available snapshots
        """
        snapshots = Snapshot.objects(id__gt=0)
        pagination_parameters.item_count = snapshots.count()
        skip_elements = (pagination_parameters.page - 1) * \
            pagination_parameters.page_size
        return snapshots.skip(skip_elements).limit(pagination_parameters.page_size)


def snapshot_info(snapshot_id):
    snapshot: Snapshot = Snapshot.objects.get(id=snapshot_id)
    corpus_size = Text.objects(created_at__lte=snapshot.created_at).count()
    tt = TrainedText.objects(created_at__lte=snapshot.created_at)
    trained = tt.count()
    # TODO: Not sure if distinct brings all of the documents to memory.
    #   We may need a better way of doing this if so.
    trained_texts = len(tt.distinct(field="text_id"))
    return dict(
        snapshot=snapshot,
        corpus_size=corpus_size,
        trainings=trained,
        trained_texts=trained_texts
    )


@blp.route("/<int:snapshot_id>")
class SnapshotResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(SnapshotInfoSchema, code=200)
    @response_error(NotFound("Could not find snapshot with given id"))
    @blp.doc(operationId="getSnapshotWithId")
    def get(self, snapshot_id: int = None):
        try:
            return snapshot_info(snapshot_id)
        except DoesNotExist:
            raise NotFound()


@blp.route("/current")
class SnapshotCurrentResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(SnapshotInfoSchema)
    @blp.doc(operationId="getCurrentSnapshot")
    def get(self):
        return snapshot_info(CURRENT_ID)

    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="createCorpusSnapshot")
    @blp.arguments(SnapshotSchema)
    @blp.response(SnapshotSchema)
    def put(self, payload):
        current_snapshot = Snapshot.current()
        new_snapshot = Snapshot(types=current_snapshot.types)
        new_snapshot.save()
        current_snapshot.types = payload.types
        current_snapshot.created_at = datetime.now()
        current_snapshot.save()
        train_task.apply_async([current_snapshot.id])
        return current_snapshot


@blp.route("/force-train")
class ForceTrainingResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(None)
    @blp.doc(operationId="forceTrain")
    def post(self):
        train_task.apply_async([CURRENT_ID], queue='vCURRENT')
        return "", 204


@blp.route("/force-reload")
class ForceReloadResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(None)
    @blp.doc(operationId="forceReload")
    def post(self):
        reload_task.apply_async([CURRENT_ID], queue='broadcast_tasks')
        return "", 204
