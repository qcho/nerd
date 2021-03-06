from marshmallow import Schema, fields
from marshmallow_mongoengine import ModelSchema

from nerd.core.document.corpus import Training, Text
from nerd.core.document.snapshot import SnapshotSchema, Type
from nerd.core.document.spacy import SpacyDocumentSchema, SpacyEntitySchema
from nerd.apis import BaseSchema

class TextSchema(ModelSchema):
    class Meta:
        strict = True
        model = Text

class EntityListSchema(BaseSchema):
    text = fields.String(required=True)
    snapshot = fields.Nested(SnapshotSchema, required=True)
    entities = fields.List(fields.Nested(SpacyEntitySchema), required=True)


class TrainTextSchema(BaseSchema):
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


class NerCompareSchema(BaseSchema):
    text_id = fields.String(required=True)
    first = fields.Nested(SpacyDocumentSchema, required=True)
    second = fields.Nested(SpacyDocumentSchema, required=True)


class NerCompareResultSchema(BaseSchema):
    first_snapshot = fields.Nested(SnapshotSchema, required=True)
    second_snapshot = fields.Nested(SnapshotSchema, required=True)
    results = fields.List(fields.Nested(NerCompareSchema), required=True)

class VersionSchema(BaseSchema):
    version = fields.String(required=True)
