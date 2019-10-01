from flask.views import MethodView
from flask_smorest import Blueprint
from marshmallow import Schema, fields
from werkzeug.exceptions import Forbidden

from nerd.apis import jwt_and_role_required, response_error
from nerd.core.document.user import Role
from nerd.core.util import get_logger
from nerd.tasks import celery
from nerd.tasks.corpus import change_snapshot as change_snapshot_task

blp = Blueprint('workers', 'workers', description='Worker management')
logger = get_logger(__name__)


class WorkerSchema(Schema):
    name = fields.String(required=True)
    snapshot = fields.String(required=True)


class ChangeSnapshotSchema(Schema):
    from_version = fields.String(required=True)
    to_version = fields.String(required=True)


def get_current_snapshot(worker_name):
    queues = celery.control.inspect([worker_name]).active_queues()
    if worker_name not in queues:
        # Shouldn't happen
        return None

    for queue in queues[worker_name]:
        if queue["name"].startswith("v"):
            return queue["name"]
    return None


def get_worker_snapshots():
    workers = celery.control.inspect().ping()
    return [{'name': key, "snapshot": get_current_snapshot(key)} for key, value in workers.items() or []]


@blp.route('/')
class Workers(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="listWorkers")
    @blp.response(WorkerSchema(many=True), code=200, description='Workers list')
    def get(self):
        return get_worker_snapshots()


@blp.route("/reassign")
class Worker(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="reassignWorker")
    @response_error(Forbidden("Cant reassign last worker for current version"))
    @blp.arguments(ChangeSnapshotSchema)
    def post(self, reassign_info: ChangeSnapshotSchema):
        logger.error(reassign_info)
        if reassign_info['from_version'] == reassign_info['to_version']:
            # return
            raise Forbidden(
                "Cant reassign last worker for current version")
        if reassign_info['from_version'] == "vCURRENT":
            current_workers = [
                1 for data in get_worker_snapshots() if data["snapshot"] == "vCURRENT"]
            logger.error(current_workers)
            if len(current_workers) <= 1:
                raise Forbidden(
                    "Cant reassign last worker for current version")
        change_snapshot_task.apply_async(
            [reassign_info['to_version']], queue=reassign_info['from_version'])
        return '', 200
