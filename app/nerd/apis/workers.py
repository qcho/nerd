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
    name = fields.String(required=False)


def get_queues(worker_name):
    return celery.current_app.control.inspect([worker_name]).active_queues()


# TODO: Uncomment @jwt_and_role_required(Role.ADMIN)


@blp.route('/')
class Workers(MethodView):

    # @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="listWorkers")
    @blp.response(WorkerSchema(many=True))
    def get(self):
        workers = celery.current_app.control.inspect().ping()
        return [{'name': key} for key, value in workers.items()]


@blp.route("/<string:worker_name>")
class Worker(MethodView):

    # @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="workerInfo")
    def get(self, worker_name):
        queues = get_queues(worker_name)
        logger.warning(queues)
        # TODO: Create a model for queues
        return queues, 200

    # @jwt_and_role_required(Role.ADMIN)
    @blp.doc(operationId="updateWorker")
    def post(self, worker_name):
        # TODO: Call cancel_consumer on current queue (get_queues and filter with the ones starting with v*)
        celery.current_app.control.add_consumer(
            queue="vCURRENT",  # TODO: queue should come from the request
            destination=[worker_name]
        )
        # TODO: Send reload to the worker so that it reloads the model
        return '', 200
