import mongoengine as me
from core.document.user import User


class DocumentEntity(me.EmbeddedDocument):
    start = me.IntField()
    end = me.IntField()
    label = me.StringField()


class DocumentSentence(me.EmbeddedDocument):
    start = me.IntField()
    end = me.IntField()


class DocumentToken(me.EmbeddedDocument):
    id = me.IntField()
    start = me.IntField()
    end = me.IntField()
    head = me.IntField()
    pos = me.StringField()
    dep = me.StringField()
    tag = me.StringField()


class DocumentModel(me.EmbeddedDocument):
    ents = me.ListField(me.EmbeddedDocumentField(DocumentEntity))
    sents = me.ListField(me.EmbeddedDocumentField(DocumentSentence))
    text = me.StringField()
    tokens = me.ListField(me.EmbeddedDocumentField(DocumentToken))


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
    name = me.StringField()
    types = me.MapField(me.EmbeddedDocumentField(NERType))

    meta = {"allow_inheritance": True}


class SystemCorpus(Corpus):
    spacy_model = me.StringField()


class NERdCorpus(Corpus):
    parent = me.ReferenceField(SystemCorpus)
    dataset = me.ListField(me.EmbeddedDocumentField(TrainingEntry))
