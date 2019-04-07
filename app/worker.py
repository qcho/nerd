import spacy
from core.document.corpus import DocumentModel, NERdCorpus, TrainingEntry
from core.document.user import User
from core.schema.corpus import (CreateNERdCorpusSchema, DocumentModelSchema,
                                MetadataFieldsSchema, NERdCorpusSchema,
                                NERTypeSchema, NewTextSchema,
                                SystemCorpusSchema)
from nlp import load_custom_model, train_model


def sanitize_text(text: str):
    return text.strip()


def get_entities():
    ...


def force_training(corpus: NERdCorpus):
    model = load_custom_model(corpus.name)
    train_model(model, [])
    raise NotImplementedError("Qcho terminá lo de Celery")


def queue_text(corpus: NERdCorpus, text: str):
    model = load_custom_model(corpus.name)
    doc = model(sanitize_text(text))
    spacy_trained = DocumentModelSchema().load(doc.to_json())
    training_entity = TrainingEntry(
        original=spacy_trained,
        trained=[]
    )
    corpus.dataset.append(training_entity)
    corpus.save()
    return training_entity


def add_correction(corpus: NERdCorpus, user: User, correction: DocumentModel):
    text = TrainedText(
        trained_by=user,
        text=correction
    )
    corpus.save()
