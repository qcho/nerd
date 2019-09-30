from marshmallow import Schema, fields
from marshmallow_mongoengine import ModelSchema

from nerd.core.document.corpus import Training
from nerd.core.document.snapshot import SnapshotSchemaRequired, Type
from nerd.core.document.spacy import SpacyDocumentSchemaRequired, SpacyEntity


class EntityListSchema(Schema):
    text = fields.String(required=True)
    snapshot = SnapshotSchemaRequired
    entities = SpacyDocumentSchemaRequired


class TrainTextSchema(Schema):
    text_id = fields.String(required=True)
    snapshot = SnapshotSchemaRequired
    spacy_document = SpacyDocumentSchemaRequired


class TrainingSchema(ModelSchema):
    class Meta:
        strict = True
        model = Training


class TypeSchema(ModelSchema):
    class Meta:
        strict = True
        model = Type


class VersionSchema(Schema):
    version = fields.String(required=True)
