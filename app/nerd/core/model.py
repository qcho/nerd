import os
import pathlib
import shutil

import spacy
from spacy.language import Language

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

    def nlp(self, text: str):
        return self._nlp(text)

    def train(self):
        with log_perf(f'{self.snapshot} TRAINING'):
            # TODO: perform training logic on self._nlp
            self._nlp = spacy.load(os.environ.get('NERD_SPACY_MODEL'))
            # self._nlp = spacy.blank('en')
        with self.snapshot.training_lock():
            """ Only locking when saving to disk after training is done in memory """
            with log_perf(f'{self.snapshot} SAVING_TO_DISK'):
                if os.path.exists(self._path):
                    shutil.rmtree(self._path)
                self._nlp.to_disk(self._path)

    def un_train(self):
        with self.snapshot.training_lock(un_train=True):
            shutil.rmtree(self._path)
