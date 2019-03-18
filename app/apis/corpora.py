from flask.views import MethodView
from flask_rest_api import Blueprint
from marshmallow_mongoengine import ModelSchema

from apis import jwt_and_role_required
from core.document.corpus import SystemCorpus, Corpus, NERdCorpus
from core.document.user import Role

blp = Blueprint('corpora', 'corpora', description='NER Corpora operations')


class SystemCorpusSchema(ModelSchema):
    class Meta:
        model = SystemCorpus


@blp.route('/system')
class SystemCorporaResource(MethodView):
    @jwt_and_role_required(Role.ADMIN)
    @blp.response(SystemCorpusSchema(many=True))
    @blp.doc(operationId="listSystemCorpora")
    def get(self):
        """List available SpaCy base corpus
        """
        return SystemCorpus.objects


@blp.route('')
class CorporaResource(MethodView):

    class NERdCorpusSchema(ModelSchema):
        class Meta:
            model = NERdCorpus

    # corpus_creation_fields = api.model('CorpusCreationData', {
    #     'base_corpus_name': fields.String(
    #         enum=list(map(lambda sc: sc.name, SystemCorpus.objects)),
    #         required=True
    #     ),
    #     'corpus_name': fields.String(required=True)
    # })
    #
    # corpus_fields = api.model('NerModel', {
    #     'name': fields.String
    # })

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(NERdCorpusSchema(many=True))
    @blp.doc(operationId="listCorpora")
    def get(self):
        """List available corpora
        """
        return Corpus.objects

    # @api.doc('upsert_corpus', body=corpus_creation_fields, security='api-key')
    # @api.expect(corpus_creation_fields)
    # @api.response(200, "Success")
    # @api.response(409, "Corpus exists", generic_error)
    # @api.response(401, "Access denied", generic_error)
    # @api.response(400, "Missing parameters or Invalid system corpus", generic_error)
    # @jwt_required
    # def post(self):
    #     """
    #     Creates a corpus from a given SpaCy corpus
    #
    #     :raises Conflict: When a corpus exists already
    #     :raises Unauthorized: When current user has insufficient permissions
    #     """
    #     assert_admin()
    #     try:
    #         # TODO: We may be able to make the corpus creation threaded (inside the create_model method)
    #         Corpus(
    #             name=api.payload['corpus_name'],
    #             base=SystemCorpus.objects(name=api.payload['base_corpus_name'])
    #         ).save()
    #     except:
    #         raise Conflict("Corpus exists with that name")
    #     return None, 200

#
# @api.param('corpus_name', 'The corpus name (unique identifier)')
# @api.route('/<string:corpus_name>')
# @api.response(404, "Corpus not found", generic_error)
# @api.doc(params={'corpus_name': 'Corpus to use'})
# class CorpusResource(Resource):
#
#     metadata_fields = api.model('MetadataFields', {
#         'queued': fields.Integer,
#         'trained': fields.Integer
#     })
#
#     @jwt_required
#     @api.doc('get_corpus', security='api-key')
#     @api.marshal_with(metadata_fields, code=200, description="Returns corpus metadata")
#     @api.response(401, "Access denied", generic_error)
#     def get(self, corpus_name):
#         """
#         Returns metadata for a given corpus
#
#         :raises Unauthorized: When current user has insufficient permissions
#         """
#         assert_admin()
#         corpus = Corpus.objects.get(name=corpus_name)
#         queued = len(list_queued(corpus))
#         trained = len(list_trained(corpus))
#         return {
#             "queued": queued,
#             "trained": trained
#         }
#
#     @jwt_required
#     @api.doc('remove_corpus', security='api-key')
#     @api.response(401, "Access denied", generic_error)
#     def delete(self, corpus_name=None):
#         """
#         Deletes a corpus
#
#         :raises Unauthorized: When current user has insufficient permissions
#         :raises BadRequest: When couldn't delete the corpus
#         """
#         assert_admin()
#         try:
#             Corpus.objects(name=corpus_name).delete()
#             return '', 200
#         except:
#             raise BadRequest("There was a problem deleting the corpus")
#
#
# @api.route('/<string:corpus_name>/training')
# @api.param('corpus_name', 'The corpus name (unique identifier)')
# @api.doc(params={'corpus_name': 'Corpus to use'})
# @api.response(404, "Corpus not found", generic_error)
# class CorpusTrainingResource(Resource):
#     new_text_fields = api.model('NewText', {
#         'text': fields.String(required=True)
#     })
#
#     @jwt_required
#     @api.doc('queue_training_text', body=new_text_fields, security='api-key')
#     @api.expect(new_text_fields)
#     @api.response(200, "Success")
#     def post(self, corpus_name):
#         """
#         Add a new text to used for training
#         """
#
#         corpus = Corpus.objects.get(name=corpus_name)
#         text = api.payload["text"]
#         queue_text(corpus, text)
#
#
# @api.route('/<string:corpus_name>/ner')
# @api.doc(params={'corpus_name': 'Corpus to use'})
# @api.response(404, "Corpus not found", generic_error)
# class NerDocumentResource(Resource):
#
#     entity_model = api.model('DocumentEntity', {
#         'start': fields.Integer,
#         'end': fields.Integer,
#         'label': fields.String
#     })
#
#     sentence_model = api.model('DocumentSentence', {
#         'start': fields.Integer,
#         'end': fields.Integer
#     })
#
#     token_model = api.model('DocumentToken', {
#         "id": fields.Integer,
#         "start": fields.Integer,
#         "end": fields.Integer,
#         "head": fields.Integer,
#         "pos": fields.String,
#         "dep": fields.String,
#         "tag": fields.String
#     })
#
#     document_model = api.model('DocumentModel', {
#         'ents': fields.List(fields.Nested(entity_model)),
#         'sents': fields.List(fields.Nested(sentence_model)),
#         'text': fields.String,
#         'tokens': fields.List(fields.Nested(token_model))
#     })
#
#     @jwt_required
#     @api.doc('upsert_ner_document', body=document_model, security='api-key')
#     @api.expect(document_model)
#     @api.response(200, "Success")
#     def put(self, model_name):
#         """Model entity recognition correction
#         TODO: Document this
#         """
#         corpus = Corpus.objects.get(name=model_name)
#
#         # TODO train_model(nerd_model, api.payload)
#         return None, 200
#
#     @jwt_optional
#     @api.doc('get_ner_document', security='api-key', expect=[ner_request_fields])
#     @api.expect(ner_request_fields)
#     @api.marshal_with(document_model)
#     def get(self, model_name):
#         """
#         Processes given text with SpaCy
#         """
#         corpus = Corpus.objects.get(name=model_name)
#         return parse_text(corpus, request.args['text'])
#
#
# @api.route('/<string:model_name>/entity-types')
# @api.response(404, "Model not found", generic_error)
# class EntityTypesResource(Resource):
#
#     entity_type_fields = api.model('EntityType', {
#         'name': fields.String(required=True),
#         'code': fields.String(required=True),
#         'color': fields.String(required=True)
#     })
#
#     @jwt_required
#     @api.doc('upsert_entity_types', body=entity_type_fields, security='api-key')
#     @api.expect(entity_type_fields)
#     @api.response(200, "Success")
#     def put(self, corpus_name):
#         """
#         Update or create entity types
#
#         :raises Unauthorized: When current user has insufficient permissions
#         """
#         assert_admin()
#         corpus = Corpus.objects.get(name=corpus_name)
#
#         corpus.update('add_to_set__types', NERType(
#             name=api.payload['name'],
#             code=api.payload['code'],
#             color=api.payload['color']
#         ))
#         # TODO: Figure out what we need to return here
#         return None, 200
#
#     @jwt_optional
#     @api.doc('get_entity_types', security='api-key')
#     @api.marshal_list_with(entity_type_fields)
#     def get(self, corpus_name):
#         """
#         Returns the list of available entity types
#         """
#         corpus = Corpus.objects.get(name=corpus_name)
#         return corpus.types + corpus.parent.types
