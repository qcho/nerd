import mongoengine as me
from core.document.user import User
from mongoengine import signals
from nlp import create_custom_model, delete_custom_model, load_system_model


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
    name = me.StringField(unique=True)
    types = me.MapField(me.EmbeddedDocumentField(NERType))
    meta = {"allow_inheritance": True}


class SystemCorpus(Corpus):
    spacy_model = me.StringField()


class NERdCorpus(Corpus):
    parent = me.ReferenceField(SystemCorpus)
    dataset = me.ListField(me.EmbeddedDocumentField(TrainingEntry))

    @classmethod
    def post_save(cls, sender, document, *, created=False, **kwargs):
        if created:
            system_model = load_system_model(document.parent.spacy_model)
            create_custom_model(document.name, system_model)

    @classmethod
    def post_delete(cls, sender, document, *args, **kwargs):
        delete_custom_model(document.name)




signals.post_save.connect(NERdCorpus.post_save, sender=NERdCorpus)
signals.post_delete.connect(NERdCorpus.post_delete, sender=NERdCorpus)
