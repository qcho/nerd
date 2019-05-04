from contextlib import contextmanager
from datetime import datetime

import mongoengine as me
from marshmallow_mongoengine import ModelSchema

from nerd.core.util import get_logger

logger = get_logger(__name__)


class Type(me.EmbeddedDocument):
    label = me.StringField(required=True)
    color = me.StringField(required=True)


class Snapshot(me.Document):
    id = me.SequenceField(primary_key=True)
    created_at = me.DateTimeField(default=datetime.now(), required=True)
    trained_at = me.DateTimeField()
    types = me.MapField(me.EmbeddedDocumentField(Type), required=True)
    semaphore = me.IntField(default=0)

    meta = {
        'indexes': [
            'semaphore'
        ]
    }

    @staticmethod
    def from_string(version_string):
        if 'CURRENT' in version_string:
            return Snapshot.current()
        return Snapshot.objects.get(id=int(version_string[1:]))

    @staticmethod
    def current():
        return Snapshot.objects.get(id=0)

    def __str__(self):
        return f'v{"CURRENT" if self.id == 0 else self.id}'

    @contextmanager
    def training_lock(self, un_train: bool = False):
        if Snapshot.objects(id=self.id, semaphore=0).update_one(dec__semaphore=1) == 1:
            try:
                yield self
            finally:
                if Snapshot.objects(id=self.id, semaphore=-1).update_one(
                        inc__semaphore=1, trained_at=None if un_train else datetime.now()
                ) == 1:
                    self.reload()
                else:
                    raise TrainingLockFreeError
        else:
            raise TrainingLockAcquireError

    @contextmanager
    def loading_lock(self):
        if Snapshot.objects(id=self.id, semaphore__gte=0).update_one(inc__semaphore=1) == 1:
            try:
                yield self
            finally:
                if Snapshot.objects(id=self.id, semaphore__gt=0).update_one(dec__semaphore=1) == 1:
                    self.reload()
                else:
                    raise LoadingLockFreeError
        else:
            raise LoadingLockAcquireError


class SnapshotSchema(ModelSchema):
    class Meta:
        model = Snapshot
        exclude = ['semaphore']
        model_fields_kwargs = {
            'types': {
                'metadata': {
                    'type': 'object',
                    'additionalProperties': {
                        '$ref': '#/components/schemas/Type'
                    }
                }
            }
        }


class TrainingLockAcquireError(Exception):
    pass


class TrainingLockFreeError(Exception):
    pass


class LoadingLockAcquireError(Exception):
    pass


class LoadingLockFreeError(Exception):
    pass
