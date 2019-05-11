from datetime import datetime
from typing import List

import mongoengine as me

from nerd.core.document.spacy import SpacyDocument


class Text(me.Document):
    value = me.StringField(unique=True, required=True)
    created_at = me.DateTimeField(default=datetime.now(), required=True)
    trainings = me.MapField(me.EmbeddedDocumentField(SpacyDocument), default={})
