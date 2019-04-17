from marshmallow_mongoengine import ModelSchema
from mongoengine import SaveConditionError
import mongoengine as me
from enum import Enum
from marshmallow_enum import EnumField


class Type(me.EmbeddedDocument):
    label = me.StringField()
    color = me.StringField()


class Version(me.Document):
    class Status(Enum):
        UNTRAINED = 'UNTRAINED'
        TRAINING = 'TRAINING'
        TRAINED = 'TRAINED'
        LOADING = 'LOADING'
        ONLINE = 'ONLINE'

    SNAPSHOT = 'vSNAPSHOT'
    id = me.IntField(primary_key=True)
    created_at = me.DateTimeField()
    trained_at = me.DateTimeField()
    types = me.MapField(me.EmbeddedDocumentField(Type))
    status = EnumField(Status)

    def __str__(self):
        return f'v{self.id}'

    def change_status_if_current(self, current_status: Status, new_status: Status):
        old_status = self.status
        try:
            self.status = new_status
            self.save(save_condition={'status': current_status})
        except SaveConditionError:
            raise InvalidVersionStatusTransition(current_status, new_status)
        finally:
            self.status = old_status


class VersionSchema(ModelSchema):
    class Meta:
        model = Version


class InvalidVersionStatusTransition(Exception):
    def __init__(self, from_status: Version.Status, to_status: Version.Status):
        self.from_status = from_status
        self.to_status = to_status
