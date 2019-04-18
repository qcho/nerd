import mongoengine as me

from nerd.core.document.spacy import SpacyDocument
from nerd.core.document.user import User


class Training(me.EmbeddedDocument):
    trained_by = me.ReferenceField(User)
    document = me.EmbeddedDocumentField(SpacyDocument)


class Text(me.Document):
    value = me.StringField()
    trainings = me.ListField(me.EmbeddedDocumentField(Training))
