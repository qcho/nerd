from typing import Optional

import gc
from abc import ABC

from celery import Task
from celery.signals import celeryd_after_setup
from celery.utils.log import get_task_logger

from nerd.core.document.snapshot import Snapshot, SnapshotSchema
from nerd.core.model import Model
from nerd.tasks import celery

logger = get_task_logger(__name__)
snapshot: Optional[Snapshot]


class CorpusTask(Task, ABC):
    _model: Optional[Model] = None

    @property
    def model(self) -> Model:
        global snapshot
        db_snapshot = Snapshot.objects.get(id=snapshot.id)
        if db_snapshot.trained_at > snapshot.trained_at:
            self._model = None
            snapshot = db_snapshot
        if self._model is None or snapshot.id != self._model.snapshot.id:
            self._model = Model(snapshot)
        return self._model

    @model.setter
    def model(self, value: Model):
        self._model = value


class IsTrainingError(Exception):
    pass


@celery.task(base=CorpusTask)
def train():
    global snapshot
    db_snapshot = Snapshot.objects.get(id=snapshot)
    # TODO(QCHO): WTF is with this condition? Shouldn't it be greater?
    if db_snapshot.trained_at < train.model.snapshot.trained_at:
        # TODO(QCHO): we could restrict training if it was done x time ago
        return
    train.model: Model
    train.model.train()


@celery.task()
def un_train(snapshot_id: int):
    Model(snapshot=Snapshot.objects.get(snapshot_id)).un_train()


@celery.task(
    base=CorpusTask,
    autoretry_for=(IsTrainingError,), retry_backoff=True
)
def reload(snapshot_id: Optional[int]):
    global snapshot
    if snapshot_id is None or snapshot.id == snapshot_id:
        reload.model = None
        gc.collect()
        reload.model: Model
        reload.model.warm_up()


@celery.task(base=CorpusTask)
def nlp(text: str) -> dict:
    nlp.model: Model
    return nlp.model.nlp(text).to_json()


@celeryd_after_setup.connect
def configure_workers(sender, instance, **kwargs):
    global snapshot
    for queue in instance.app.amqp.queues:
        if queue.startswith("v"):
            snapshot = Snapshot.from_string(queue)
            logger.info('Worker initialized for {}'.format(queue))
            return
    logger.error('Error initializing worker! It should be listening to a vXXXX queue')


@celery.task(bind=True, base=CorpusTask)
def change_snapshot(self, snapshot_code: str):
    global snapshot
    new_snapshot = Snapshot.from_string(snapshot_code)
    celery.control.cancel_consumer(queue=str(snapshot), destination=[self.request.hostname])
    snapshot = new_snapshot
    celery.control.add_consumer(queue=str(new_snapshot), destination=[self.request.hostname])
