from mongoengine import NotUniqueError
from pymongo.errors import DuplicateKeyError

from nerd.core.document.corpus import Text


class TextImporter:
    def __init__(self, file):
        self.file = file

    def run(self):
        added = 0
        try:
            for line in self.file:
                Text(value=line.rstrip()).save()
                added = added + 1
        except (NotUniqueError, DuplicateKeyError):
            pass
        return added
