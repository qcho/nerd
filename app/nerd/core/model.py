import os
import pathlib
import random
import shutil
from typing import Set, Generator

import spacy
from spacy.language import Language
from spacy.tokens import Doc
from spacy.util import minibatch, compounding

from nerd.core.document.corpus import Text, TrainedText
from nerd.core.document.spacy import SpacyDocument
from nerd.core.util import log_perf, get_logger
from nerd.core.document.snapshot import Snapshot

FS_PATH = pathlib.Path(os.path.abspath(os.path.dirname(__file__))) / '..' / '..' / 'models'
logger = get_logger(__name__)


class Model:
    _spacy_model = None

    @property
    def _nlp(self):
        if self._spacy_model is None:
            with self.snapshot.loading_lock():
                with log_perf(f'{self.snapshot} LOADING'):
                    self._spacy_model = spacy.load(self._path)
        return self._spacy_model

    @_nlp.setter
    def _nlp(self, value: Language):
        self._spacy_model = value

    def __init__(self, snapshot: Snapshot):
        self.snapshot = snapshot
        self._path = FS_PATH / str(snapshot)

    def warm_up(self):
        self._nlp()

    def nlp(self, text: str) -> Doc:
        return self._nlp(text)

    def _add_types(self):
        ner = self._nlp.get_pipe("ner")
        for type_code, _ in self.snapshot.types.items():
            ner.add_label(type_code)
        pass

    def _fetch_training_data(self) -> Generator[SpacyDocument, None, None]:
        for trained_text in TrainedText.objects.filter(created_at__lte=self.snapshot.created_at):
            trained_text.document: SpacyDocument
            # TODO: Should only yield for texts that have entities
            yield trained_text.document.text, trained_text.document.ents

    def _train_snapshot_texts(self, n_iter: int = 30):
        training_data = list(self._fetch_training_data())
        if training_data:
            other_pipes = [pipe for pipe in self._nlp.pipe_names if pipe != "ner"]
            with self._nlp.disable_pipes(*other_pipes):  # only train NER
                optimizer = self._nlp.resume_training()
                for itn in range(n_iter):
                    random.shuffle(training_data)
                    losses = {}
                    # batch up the examples using spaCy's minibatch
                    batches = minibatch(training_data, size=compounding(4.0, 32.0, 1.001))
                    for batch in batches:
                        texts, annotations = zip(*batch)
                        self._nlp.update(
                            texts,  # batch of texts
                            annotations,  # batch of annotations
                            sgd=optimizer,
                            drop=0.5,  # dropout - make it harder to memorise data
                            losses=losses,
                        )
                print("Losses", losses)

    def train(self):
        with log_perf(f'{self.snapshot} TRAINING'):
            self._nlp = spacy.load(os.environ.get('NERD_SPACY_MODEL'))
            self._add_types()
            self._train_snapshot_texts()
        with self.snapshot.training_lock():
            """ Only locking when saving to disk after training is done in memory """
            with log_perf(f'{self.snapshot} SAVING_TO_DISK'):
                if os.path.exists(self._path):
                    shutil.rmtree(self._path)
                self._nlp.to_disk(self._path)

    def un_train(self):
        with self.snapshot.training_lock(un_train=True):
            shutil.rmtree(self._path)
