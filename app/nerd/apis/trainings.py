from flask.views import MethodView
from flask_smorest import Blueprint
from mongoengine import DoesNotExist, ValidationError
from werkzeug.exceptions import NotFound

from nerd.apis import response_error, jwt_and_role_required
from nerd.apis.schemas import TrainingSchema
from nerd.core.document.corpus import Training, Text
from nerd.core.document.user import Role, User

blp = Blueprint("trainings", "trainings", description="Corpus trainings operations")


@blp.route('/<string:training_id>')
class TrainingView(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @response_error(NotFound("Training doesn't exist"))
    @blp.response(TrainingSchema, code=200, description="Model")
    @blp.doc(operationId="deleteTraining")
    def delete(self, training_id):
        try:
            training = Training.objects.get(id=training_id)
            Text.objects.get(id=training.text_id.id).update(pull__trainings=training_id)
            User.objects.get(id=training.user_id.id).update(pull__trainings=training_id)
            training.delete()
            return training
        except (DoesNotExist, ValidationError):
            raise NotFound()
