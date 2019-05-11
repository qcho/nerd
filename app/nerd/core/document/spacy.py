from datetime import datetime

import mongoengine as me
from marshmallow_mongoengine import ModelSchema


class SpacyEntity(me.EmbeddedDocument):
    start = me.IntField(required=True)
    end = me.IntField(required=True)
    label = me.StringField(required=True)


class SpacySentence(me.EmbeddedDocument):
    start = me.IntField(required=True)
    end = me.IntField(required=True)


class SpacyToken(me.EmbeddedDocument):
    id = me.IntField(required=True)
    start = me.IntField(required=True)
    end = me.IntField(required=True)
    head = me.IntField()
    pos = me.StringField()
    dep = me.StringField()
    tag = me.StringField()


class SpacyDocument(me.EmbeddedDocument):
    ents = me.ListField(me.EmbeddedDocumentField(SpacyEntity, required=True))
    sents = me.ListField(me.EmbeddedDocumentField(SpacySentence, required=True))
    text = me.StringField(required=True)
    tokens = me.ListField(me.EmbeddedDocumentField(SpacyToken, required=True))
    _created_at = me.DateTimeField(default=datetime.now(), required=True)


class SpacyDocumentSchema(ModelSchema):
    class Meta:
        model = SpacyDocument
