from marshmallow import Schema, fields
from marshmallow_mongoengine import ModelSchema

from nerd.core.document.corpus import TrainedText
from nerd.core.document.snapshot import SnapshotSchema, Type
from nerd.core.document.spacy import SpacyDocumentSchema


class TrainTextSchema(Schema):
    text_id = fields.String(required=True)
    snapshot = fields.Nested(SnapshotSchema, required=True)
    spacy_document = fields.Nested(SpacyDocumentSchema, required=True)


class TrainedTextSchema(ModelSchema):
    class Meta:
        strict = True
        model = TrainedText


class TypeSchema(ModelSchema):
    class Meta:
        strict = True
        model = Type
