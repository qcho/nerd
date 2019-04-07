from core.document.corpus import NERdCorpus
from nlp import load_custom_model, train_model


def force_training(corpus_id: id):
    corpus = NERdCorpus.objects(id=corpus_id).get()
    model = load_custom_model(corpus.name)
    train_model(model, [])
    raise NotImplementedError("Qcho terminá lo de Celery")
