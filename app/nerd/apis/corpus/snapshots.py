from flask.views import MethodView
from flask_rest_api import Blueprint
from flask_rest_api.pagination import PaginationParameters
from marshmallow_mongoengine import ModelSchema

from nerd.apis import jwt_and_role_required
from nerd.core.document.user import Role
from nerd.core.document.snapshot import Snapshot

blp = Blueprint("corpus_snapshots", "corpus_snapshots", description="Corpus snapshot operations")


class CorpusSnapshotSchema(ModelSchema):
    class Meta:
        model = Snapshot


class CreateCorpusSnapshotSchema(ModelSchema):
    class Meta:
        model = Snapshot
        exclude = ['created_at']


@blp.route("")
class IndexResource(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(CorpusSnapshotSchema(many=True))
    @blp.doc(operationId="listCorpusSnapshots")
    @blp.paginate()
    def get(self, pagination_parameters: PaginationParameters):
        """List available corpora
        """
        pagination_parameters.item_count = Snapshot.objects.count()
        skip_elements = (pagination_parameters.page - 1) * pagination_parameters.page_size
        return Snapshot.objects.skip(skip_elements).limit(pagination_parameters.page_size)

    # @jwt_and_role_required(Role.ADMIN)
    # @blp.doc(operationId="createCorpusSnapshot")
    # @blp.arguments(CreateNERdCorpusSchema)
    # @response_error(Conflict("Corpus exists with that name"))
    # @response_error(Conflict("No such base model"))
    # @blp.response(NERdCorpusSchema, code=200, description="Model created")
    # def post(self, payload):
    #     """
    #     Creates a corpus from a given SpaCy corpus
    #     """
    #     try:
    #         # TODO: We may be able to make the corpus creation threaded (inside the create_model method)
    #         base_corpus = SystemCorpus.objects(
    #             name=payload["base_corpus_name"]).get()
    #         if not base_corpus:
    #             raise Conflict("No such base model")
    #         corpus = NERdCorpus(
    #             name=payload["corpus_name"],
    #             parent=base_corpus
    #         ).save()
    #         return corpus
    #     except:
    #         raise Conflict("Corpus exists with that name")
