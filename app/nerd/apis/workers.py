from flask.views import MethodView
from flask_rest_api import Blueprint
import celery
from marshmallow import Schema, fields

from nerd.core.util import get_logger
from nerd.apis import jwt_and_role_required
from nerd.core.document.user import Role

blp = Blueprint('workers', 'workers', description='Worker management')
logger = get_logger(__name__)


class WorkerSchema(Schema):
    name = fields.String(required=True)
    snapshot = fields.String(required=True)


class WorkerQueue(Schema):
    snapshot = fields.String(required=True)


def get_current_snapshot(worker_name):
    queues = celery.current_app.control.inspect([worker_name]).active_queues()
    if worker_name not in queues:
        # Shouldn't happen
        return None

    for queue in queues[worker_name]:
        if queue["name"].startswith("v"):
            return queue["name"]
    return None


# TODO: Uncomment @jwt_and_role_required(Role.ADMIN)
@blp.route('/')
class Workers(MethodView):

    # @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="listWorkers")
    @blp.response(WorkerSchema(many=True))
    def get(self):
        workers = celery.current_app.control.inspect().ping()
        return [{'name': key, "snapshot": get_current_snapshot(key)} for key, value in workers.items()]


@blp.route("/<string:worker_name>")
class Worker(MethodView):

    # @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="updateWorkerSnapshot")
    @blp.arguments(WorkerQueue)
    def post(self, new_queue: WorkerQueue, worker_name):
        celery.current_app.control.cancel_consumer(queue=get_current_snapshot(worker_name), destination=[worker_name])
        celery.current_app.control.add_consumer(queue=new_queue['snapshot'], destination=[worker_name])
        # TODO: Send reload to the worker so that it reloads the model
        return '', 200
