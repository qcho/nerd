class ModelMetadata():
    """Contains metadata for a specific model"""

    @staticmethod
    def from_dict(dict_):
        """Load a metadata from a dictionary"""
        metadata = ModelMetadata()
        metadata._entity_types = dict_["entity_types"]
        return metadata

    def __init__(self):
        self._entity_types = [
            {"id": "PER", "label": "Person"},
            {"id": "LOC", "label": "Location"},
            {"id": "ORG", "label": "Organization"},
            {"id": "MISC", "label": "Miscellaneous"}
            ]

    @property
    def entity_types(self):
        """List of supported entity types"""
        return self._entity_types

    def to_dict(self):
        """Dictionary representation of the metadata"""
        return {
            "entity_types": self._entity_types,
        }
