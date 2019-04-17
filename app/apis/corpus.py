from flask.views import MethodView
from flask_rest_api import Blueprint
from flask_rest_api.pagination import PaginationParameters
from werkzeug.exceptions import BadRequest, Conflict, NotFound

from apis import (get_current_user, jwt_and_role_required,
                  jwt_optional, response_error)
from core.document.corpus import Type, Version
from core.document.user import Role
from core.schema.corpus import (CreateNERdCorpusSchema, DocumentModelSchema,
                                MetadataFieldsSchema, CorpusSchema,
                                NERTypeSchema, NewTextSchema)
from worker import add_correction, force_training, queue_text

from tasks.ner import add_together

blp = Blueprint("corpus", "corpus", description="Corpus operations")




@blp.route("/<string:corpus_name>")
class CorpusResource(MethodView):
    @jwt_and_role_required(Role.ADMIN)  # TODO: review permission levels
    @blp.doc(operationId="get_corpus")
    @response_error(NotFound("Corpus does not exist"))
    @blp.response(MetadataFieldsSchema, code=200, description="Model")
    def get(self, payload, corpus_name):
        """
        Returns metadata for a given corpus
        """
        corpus = NERdCorpus.objects.get(name=corpus_name)

        queued = len(list_queued(corpus))
        trained = len(list_trained(corpus))
        return {"queued": queued, "trained": trained}

    @jwt_and_role_required(Role.ADMIN)  # TODO: review permission levels
    @blp.doc(operationId="remove_corpus")
    @response_error(BadRequest("There was a problem deleting the corpus"))
    def delete(self, corpus_name=None):
        """
        Deletes a corpus

        :raises Unauthorized: When current user has insufficient permissions
        :raises BadRequest: When couldn't delete the corpus
        """
        try:
            NERdCorpus.objects(name=corpus_name).get().delete()
            return "", 200
        except:
            raise BadRequest("There was a problem deleting the corpus")


@blp.route("/<string:corpus_name>/training")
class CorpusTrainingResource(MethodView):
    @jwt_and_role_required(Role.ADMIN)  # TODO: check permission level
    @blp.arguments(NewTextSchema)
    @blp.doc(operationId="queue_training_text")
    @blp.response(None, code=204)
    def post(self, payload, corpus_name):
        """
        Add a new text to used for training
        """
        corpus = NERdCorpus.objects.get(name=corpus_name)
        text = payload["text"]
        queue_text(corpus, text)
        return None, 204


@blp.route("/<string:corpus_name>/refresh")
class CorpusRefreshResource(MethodView):
    @jwt_and_role_required(Role.ADMIN)  # TODO: check permission level
    @blp.doc(operationId="force_training")
    @blp.response(None, code=204)
    @response_error(NotFound("Corpus not found"))
    def put(self, corpus_name):
        """
        Force a training event
        """
        try:
            corpus = NERdCorpus.objects.get(name=corpus_name)
            force_training(corpus)
        except:
            raise NotFound("Corpus not found")
        return None, 204


@blp.route("/<string:corpus_name>/ner")
class NerDocumentResource(MethodView):
    @jwt_and_role_required(Role.ADMIN)  # TODO: check permission level
    @blp.doc(operationId="upsert_ner_document")
    @blp.arguments(DocumentModelSchema)
    def put(self, payload, model_name):
        """
        Model entity recognition correction
        TODO: Document this
        """
        corpus = NERdCorpus.objects.get(name=model_name)
        user = get_current_user()
        result = add_correction(corpus, user, payload)
        return None, 204

    @jwt_and_role_required(Role.ADMIN)  # TODO: check permission level
    @blp.doc(operationId="get_ner_document")
    @blp.response(DocumentModelSchema, code=200)
    def get(self, model_name):
        """
        Processes given text with SpaCy
        """
        corpus = Corpus.objects.get(name=model_name)
        return parse_text(corpus, request.args["text"])


@blp.route("/qcho")
class QchoResource(MethodView):
    def post(self):
        result = add_together.delay(23, 42)
        result.wait()  # 65


@blp.route("/<string:corpus_name>/entity-types")
class EntityTypesResource(MethodView):
    @jwt_and_role_required(Role.ADMIN)  # TODO: check permission level
    @blp.doc(operationId="upsert_entity_types")
    @blp.arguments(NERTypeSchema)
    def put(self, corpus_name):
        """
        Update or create entity types
        """
        corpus = Corpus.objects.get(name=corpus_name)

        corpus.update(
            "add_to_set__types",
            Type(
                name=blp.payload["name"],
                code=blp.payload["code"],
                color=blp.payload["color"],
            ),
        )
        # TODO: Figure out what we need to return here
        return None, 204

    @jwt_optional
    @blp.doc(operationId="get_entity_types")
    @blp.response(NERTypeSchema(many=True))
    def get(self, corpus_name):
        """
        Returns the list of available entity types
        """
        return []
        corpus = Corpus.objects.get(name=corpus_name)
        return corpus.types + corpus.parent.types
