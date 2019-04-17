from core.document.corpus import SpacyDocument, NERdCorpus, TrainingEntry, Training
from core.document.user import User
from core.schema.corpus import (DocumentModelSchema)
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
    # TODO: check `spacy_trained.errors`
    training_entity = TrainingEntry(
        original=spacy_trained.data,
        trained=[]
    )
    corpus.dataset.append(training_entity)
    corpus.save()
    return training_entity


def add_correction(corpus: NERdCorpus, user: User, correction: SpacyDocument):
    text = Training(
        trained_by=user,
        text=correction
    )
    corpus.save()
