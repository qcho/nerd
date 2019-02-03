class ModelMetadata():
    """Contains metadata for a specific model"""

    @staticmethod
    def from_dict(dict_):
        """Load a metadata from a dictionary"""
        metadata = ModelMetadata()
        metadata._entity_types = dict_["entity_types"]
        return metadata

    def __init__(self):
        self._entity_types = {
            'PER': 'Person',
            'LOC': 'Location',
            'ORG': 'Organization',
            'MISC': 'Miscellaneous'
        }

    @property
    def entity_types(self):
        """List of supported entity types"""
        return self._entity_types

    def upsert_entity_type(self, code: str, name: str = None):
        if name is None:
            name = code
        self._entity_types[code] = name

    def to_dict(self):
        """Dictionary representation of the metadata"""
        return {
            "entity_types": self._entity_types,
        }
