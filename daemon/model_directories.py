import os
from pathlib import Path

class ModelDirectories():
    def __init__(self, base_path: Path):
        self.path = base_path

    def metadata_file(self):
        return self.path / 'metadata.json'

    def model_path(self) -> Path:
        return self.path / 'model'

    def queue_path(self) -> Path:
        return self.path / 'queue'

    def trained_path(self) -> Path:
        return self.path / 'trained'

    def initialize(self):
        self._create_dir(self.model_path())
        self._create_dir(self.queue_path())
        self._create_dir(self.trained_path())

    def _create_dir(self, directory):
        os.makedirs(directory, exist_ok=True)
