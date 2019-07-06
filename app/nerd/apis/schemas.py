from marshmallow import Schema, fields
from marshmallow_mongoengine import ModelSchema

from nerd.core.document.corpus import Training
from nerd.core.document.snapshot import SnapshotSchema, Type
from nerd.core.document.spacy import SpacyDocumentSchema, SpacyEntity


class SpacyEntitySchema(ModelSchema):
    class Meta:
        model = SpacyEntity


class EntityListSchema(Schema):
    text = fields.String(required=True)
    snapshot = fields.Nested(SnapshotSchema, required=True)
    entities = fields.List(fields.Nested(SpacyEntitySchema), required=True)


class TrainTextSchema(Schema):
    text_id = fields.String(required=True)
    snapshot = fields.Nested(SnapshotSchema, required=True)
    spacy_document = fields.Nested(SpacyDocumentSchema, required=True)


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
