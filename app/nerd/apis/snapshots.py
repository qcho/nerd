from datetime import datetime

from celery import chain
from flask.views import MethodView
from flask_smorest import Blueprint
from flask_smorest.pagination import PaginationParameters
from marshmallow_mongoengine import ModelSchema, fields
from mongoengine import DoesNotExist, ValidationError
from werkzeug.exceptions import Forbidden
from werkzeug.exceptions import NotFound

from nerd.apis import jwt_and_role_required, response_error, BaseSchema
from nerd.core.document.corpus import Text, Training
from nerd.core.document.snapshot import CURRENT_ID, Snapshot, SnapshotSchema
from nerd.core.document.user import Role
from nerd.core.model import Model
from nerd.tasks import corpus as corpus_tasks

blp = Blueprint("snapshots", "snapshots",
                description="Corpus snapshot operations")


class SnapshotInfoSchema(BaseSchema):
    snapshot = fields.Nested(SnapshotSchema, required=True)
    corpus_size = fields.Integer(required=True)
    trained = fields.Integer(required=True)
    trained_distinct = fields.Integer(required=True)
    available = fields.Integer(required=True)
    available_distinct = fields.Integer(required=True)


class CreateCorpusSnapshotSchema(ModelSchema):
    class Meta:
        model = Snapshot
        exclude = ['created_at']


@blp.route("")
class IndexResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(SnapshotSchema(many=True), code=200, description='List of corpus snapshots')
    @blp.doc(operationId="listCorpusSnapshots")
    @blp.paginate()
    def get(self, pagination_parameters: PaginationParameters):
        """List available snapshots"""
        snapshots = Snapshot.objects
        pagination_parameters.item_count = snapshots.count()
        skip_elements = (pagination_parameters.page - 1) * \
                        pagination_parameters.page_size
        return snapshots.skip(skip_elements).limit(pagination_parameters.page_size)


def snapshot_info(snapshot_id):
    is_current = snapshot_id is CURRENT_ID
    snapshot: Snapshot = Snapshot.objects.get(id=snapshot_id)
    corpus_size = Text.objects().count() if is_current else Text.objects(
        created_at__lte=snapshot.created_at).count()
    trained = Training.objects()
    available = Training.objects() if is_current else Training.objects(
        created_at__lte=snapshot.created_at)
    trained_texts = len(trained.distinct(field="text_id"))
    available_trainings = len(available.distinct(field="text_id"))
    return dict(
        snapshot=snapshot,
        corpus_size=corpus_size,
        trained=trained.count(),  # Trainings included up until snapshot.trained_at
        trained_distinct=trained_texts,  # Same as above but distinct
        available=available.count(),  # Total available trainings
        available_distinct=available_trainings  # Total distinct available trainings
    )


@blp.route("/<int:snapshot_id>")
class SnapshotResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(SnapshotInfoSchema, code=200, description='Get snapshot')
    @response_error(NotFound("Could not find snapshot with given id"))
    @blp.doc(operationId="getSnapshot")
    def get(self, snapshot_id: int):
        try:
            return snapshot_info(snapshot_id)
        except (ValidationError, DoesNotExist):
            raise NotFound()

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(SnapshotInfoSchema, code=200, description='Snapshot information')
    @response_error(NotFound("Could not find snapshot with given id"))
    @blp.doc(operationId="deleteSnapshot")
    def delete(self, snapshot_id: int):
        try:
            snapshot = Snapshot.objects.get(id=snapshot_id)
            model = Model(snapshot=snapshot)
            model.un_train()
            #  TODO: We need to stop the related worker (if there's one)
            #        And remove everything from the hard drive.
            #   - un train model
            #   - move workers to vCurrent
            #   ALL ASYNC
            snapshot.delete()

            chain(
                corpus_tasks.un_train.s(snapshot_id)
            ).apply_async().wait()
            return snapshot
        except (ValidationError, DoesNotExist):
            raise NotFound()


@blp.route("/<int:snapshot_id>/force-train")
class ForceTrainingResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(code=204, description='Trained')
    @blp.doc(operationId="forceTrain")
    def post(self, snapshot_id: int):
        snapshot = Snapshot.objects.get(id=snapshot_id)
        corpus_tasks.train.apply_async(queue=str(snapshot))
        return "", 204


@blp.route("/<int:snapshot_id>/force-untrain")
class ForceUntrainResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(code=204, description='Untrained')
    @response_error(Forbidden("Can't untrain current snapshot"))
    @blp.doc(operationId="forceUntrain")
    def post(self, snapshot_id: int):
        if snapshot_id == CURRENT_ID:
            raise Forbidden("Can't untrain current snapshot")
        corpus_tasks.un_train.apply_async([snapshot_id])
        return "", 204


@blp.route("/current")
class SnapshotCurrentResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(SnapshotInfoSchema, code=200, description='Current snapshot')
    @blp.doc(operationId="getCurrentSnapshot")
    def get(self):
        return snapshot_info(CURRENT_ID)

    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="createCorpusSnapshot")
    @blp.arguments(SnapshotSchema)
    @blp.response(SnapshotSchema, code=200, description='Snapshot created')
    def put(self, payload):
        current_snapshot = Snapshot.current()
        new_snapshot = Snapshot(types=current_snapshot.types)
        new_snapshot.save()
        current_snapshot.types = payload.types
        current_snapshot.created_at = datetime.now()
        current_snapshot.save()
        return current_snapshot
