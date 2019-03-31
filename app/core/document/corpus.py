import mongoengine as me

from core.document.user import User


class NERType(me.EmbeddedDocument):
    label = me.StringField()
    code = me.StringField()
    color = me.StringField()


class TrainedText(me.EmbeddedDocument):
    trained_by = me.ReferenceField(User)
    text = me.DictField()


class TrainingEntry(me.EmbeddedDocument):
    original_text = me.DictField()
    trained = me.ListField(me.EmbeddedDocumentField(TrainedText))


class Corpus(me.Document):
    name = me.StringField(required=True)
    types = me.MapField(me.EmbeddedDocumentField(NERType))

    meta = {'allow_inheritance': True}


class SystemCorpus(Corpus):
    spacy_model = me.StringField()


class NERdCorpus(Corpus):
    parent = me.ReferenceField(SystemCorpus)
    dataset = me.ListField(me.EmbeddedDocumentField(TrainingEntry))
