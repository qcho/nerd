from datetime import datetime

import mongoengine as me

from nerd.core.document.spacy import SpacyDocument


class Text(me.Document):
    value = me.StringField(unique=True)
    created_at = me.DateTimeField(default=datetime.now())
    trainings = me.MapField(me.EmbeddedDocumentField(SpacyDocument))
