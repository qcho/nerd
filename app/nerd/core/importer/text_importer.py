from mongoengine import NotUniqueError

from nerd.core.document.corpus import Text


class TextImporter:
    def __init__(self, file):
        self.file = file

    def run(self):
        added = 0
        try:
            for line in self.file:
                Text(value=line).save()
                added = added + 1
        except NotUniqueError:
            pass
        return added
