
from core.document.corpus import (Corpus, DocumentModel, NERdCorpus, NERType,
                                  SystemCorpus)
from core.schema import BaseSchema
from marshmallow import fields
from marshmallow_mongoengine import ModelSchema


class SystemCorpusSchema(BaseSchema, ModelSchema):
    class Meta:
        model = SystemCorpus


class NERdCorpusSchema(BaseSchema, ModelSchema):
    class Meta:
        model = NERdCorpus


class DocumentModelSchema(BaseSchema, ModelSchema):
    class Meta:
        model = DocumentModel


class NERTypeSchema(BaseSchema, ModelSchema):
    class Meta:
        model = NERType


class MetadataFieldsSchema(BaseSchema):
    queued = fields.Integer(required=True)
    trained = fields.Integer(required=True)


class NewTextSchema(BaseSchema):
    text = fields.String(required=True)


class CreateNERdCorpusSchema(BaseSchema):
    base_corpus_name = fields.String(required=True)
    corpus_name = fields.String(required=True)
