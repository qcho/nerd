import json
from pathlib import Path

class ModelMetadata():
    """Contains metadata for a specific model"""

    @staticmethod
    def from_dict(dict_):
        """Load a metadata from a dictionary"""
        metadata = ModelMetadata()
        metadata._entity_types = dict_["entity_types"]
        return metadata

    @staticmethod
    def from_path(path: Path):
        with open(path, 'r', encoding='utf8') as inf:
            raw_json = json.load(inf)
            return ModelMetadata.from_dict(raw_json)

    def __init__(self):
        self._entity_types = {
            "PER": {
                "label": "Person",
                "color": "#903d3d"
            },
            "LOC": {
                "label": "Location",
                "color": "#b83ca6"
            },
            "ORG": {
                "label": "Organization",
                "color": "#e1d458"
            },
            "MISC": {
                "label": "Miscellaneous",
                "color": "#38dd9e"
            }
        }

    def save(self, to: Path):
        with open(to, 'w', encoding='utf8') as outf:
            json.dump(self.to_dict(), outf, indent=True)

    @property
    def entity_types(self):
        """List of supported entity types"""
        types = [{"code": code, "name": data["label"], "color": data["color"]} for code, data in self._entity_types.items()]
        return types

    def upsert_entity_type(self, code: str, name: str = None):
        if name is None:
            name = code
        self._entity_types[code] = name

    def to_dict(self):
        """Dictionary representation of the metadata"""
        return {
            "entity_types": self._entity_types,
        }