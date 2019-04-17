import os
import pathlib
import shutil
import time
from datetime import datetime

import spacy

from core.document.version import Version
from logit import get_logger

FS_PATH = pathlib.Path(os.path.abspath(os.path.dirname(__file__))) / '..' / 'models'
DEFAULT_DROP_RATE = 0.35
logger = get_logger(__name__)


class Model:

    def __init__(self, version: Version):
        self.version = version
        self._path = FS_PATH / version.__str__()
        self._nlp = self._load_model()

    # TODO: load custom model based on versiom
    def _load_model(self):
        start = time.perf_counter()
        logger.debug(f'{self.version} LOADING STARTED')
        nlp = spacy.load(os.environ.get('NERD_SPACY_MODEL'))
        # nlp = spacy.blank('en')
        logger.debug(f'{self.version} LOADING FINISHED in {time.perf_counter() - start:10.4f}s')
        return nlp

    def nlp(self, text: str):
        return self._nlp(text)

    def train(self, version: Version) -> Version:
        if self.version.trained_at >= version.trained_at:
            # TODO: we could not allow to train if you trained in the last x hours/minutes
            return version
        version.change_status_if_current(Version.Status.UNTRAINED, Version.Status.TRAINING)

        logger.info(f'STARTED  TRAINING {version}')
        import time
        # TODO: spacy train
        time.sleep(5)
        logger.info(f'FINISHED TRAINING {version}')
        version.trained_at = datetime.now()
        version.change_status_if_current(Version.Status.TRAINING, Version.Status.TRAINED)
        return version

    def un_train(self):
        self.version.change_status_if_current(Version.Status.TRAINED, Version.Status.UNTRAINED)
        shutil.rmtree(self._path)
