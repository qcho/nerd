from datetime import datetime

import mongoengine as me
from nerd.core.document.spacy import SpacyDocument


class Text(me.Document):
    value = me.StringField(unique=True, required=True)
    created_at = me.DateTimeField(default=datetime.now(), required=True)
    # This is a mapping between user_id and document
    trainings = me.ListField(me.LazyReferenceField('TrainedText'))


class TrainedText(me.Document):
    meta = {
        'indexes': [[('text_id', 1), ('user_id', 1)]],
        'cascade': True
    }
    text_id = me.LazyReferenceField('Text', required=True)
    user_id = me.LazyReferenceField('User', required=True)
    created_at = me.DateTimeField(default=datetime.now(), required=True)
    document = me.EmbeddedDocumentField(SpacyDocument, required=True)
