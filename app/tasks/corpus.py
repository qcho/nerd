from datetime import datetime
import os
from abc import ABC
import pprint

import spacy
from mongoengine import SaveConditionError

from core.document.version import Version, VersionSchema
from core.model import Model
from tasks import celery

from celery import Task

from celery.utils.log import get_task_logger
import time

logger = get_task_logger(__name__)


class CorpusTask(Task, ABC):
    _model: Model = None

    @property
    def model(self) -> Model:
        # TODO: get version from request (?)
        version = Version(id='SNAPSHOT')
        if self._model is None:
            # self.backend.client REDIS BACKEND
            self._model = Model(version)

        if version != self._model.version:
            raise EnvironmentError(
                f"This worker has version \"{self._model.version}\" loaded. But \"{version}\" arrived."
                f"Is this worker listening to more than one QUEUE? It's not supported."
            )
        return self._model


@celery.task(base=CorpusTask)
def ping():
    return VersionSchema().dumps(ping.model.version)



class IsTrainingError(Exception):
    pass


@celery.task(base=CorpusTask)
def train(version_id: int) -> Version:
    version = Version.objects.get(id=version_id)

    version.change_status(Version.Status.TRAINED, Version.Status.TRAINING)

    logger.info(f'STARTED  TRAINING {version}')
    import time
    # TODO: spacy train
    time.sleep(5)
    logger.info(f'FINISHED TRAINING {version}')

    version.change_status(Version.Status.TRAINING, Version.Status.TRAINED)

    return version

@celery.task(
    base=CorpusTask,
    autoretry_for=(IsTrainingError,), retry_backoff=True
)
def reload(version: Version):
    pass


@celery.task(base=CorpusTask)
def nlp(text: str):
    return nlp.model.nlp(text).to_json()
