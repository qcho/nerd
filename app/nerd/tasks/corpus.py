import gc
from abc import ABC

from celery import Task
from celery.utils.log import get_task_logger

from nerd.core.document.snapshot import Snapshot, SnapshotSchema
from nerd.core.model import Model
from nerd.tasks import celery

logger = get_task_logger(__name__)


class CorpusTask(Task, ABC):
    _model: Model = None

    @property
    def model(self) -> Model:
        snapshot = Snapshot.from_string(
            self.request.delivery_info['routing_key'])
        if self._model is None:
            # self.backend.client REDIS BACKEND
            self._model = Model(snapshot)

        if snapshot.id != self._model.snapshot.id:
            raise EnvironmentError(
                f"This worker has snapshot \"{self._model.snapshot}\" loaded. But \"{snapshot}\" arrived."
                f"Is this worker listening to more than one QUEUE? It's not supported."
            )
        return self._model

    @model.setter
    def model(self, value: Model):
        self._model = value


@celery.task(base=CorpusTask)
def ping():
    return SnapshotSchema().dumps(ping.model.snapshot)


class IsTrainingError(Exception):
    pass


@celery.task(base=CorpusTask)
def train(snapshot_id: int = 0):
    snapshot = Snapshot.objects.get(id=snapshot_id)
    if snapshot.trained_at < train.model.snapshot.trained_at:
        # TODO: we could restrict training if it was done x time ago
        return snapshot
    train.model: Model
    train.model.train()
    return snapshot.id


@celery.task(base=CorpusTask)
def un_train():
    un_train.model.un_train()


@celery.task(
    base=CorpusTask,
    autoretry_for=(IsTrainingError,), retry_backoff=True
)
def reload(snapshot_id: int = 0):
    snapshot = Snapshot.objects.get(id=snapshot_id)
    reload.model = None
    gc.collect()
    reload.model.warm_up()
    return snapshot.id


@celery.task(base=CorpusTask)
def nlp(text: str) -> dict:
    nlp.model: Model
    return nlp.model.nlp(text).to_json()
