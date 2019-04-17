import mongoengine as me
from marshmallow_mongoengine import ModelSchema


class SpacyEntity(me.EmbeddedDocument):
    start = me.IntField()
    end = me.IntField()
    label = me.StringField()


class SpacySentence(me.EmbeddedDocument):
    start = me.IntField()
    end = me.IntField()


class SpacyToken(me.EmbeddedDocument):
    id = me.IntField()
    start = me.IntField()
    end = me.IntField()
    head = me.IntField()
    pos = me.StringField()
    dep = me.StringField()
    tag = me.StringField()


class SpacyDocument(me.EmbeddedDocument):
    ents = me.ListField(me.EmbeddedDocumentField(SpacyEntity))
    sents = me.ListField(me.EmbeddedDocumentField(SpacySentence))
    text = me.StringField()
    tokens = me.ListField(me.EmbeddedDocumentField(SpacyToken))


class SpacyDocumentSchema(ModelSchema):
    class Meta:
        model = SpacyDocument
