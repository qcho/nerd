from werkzeug.exceptions import Unauthorized, BadRequest, HTTPException, NotFound, Conflict

class InvalidBaseModel(BadRequest):
    description = "Invalid base model"

class BadCredentials(Unauthorized):
    description = "Invalid credentials"


class MissingParameters(BadRequest):
    def __init__(self, message):
        super().__init__(self, description=message)

    @classmethod
    def param_check_failed(cls, key=None, got=None):
        return cls('Parameter {0} got {1}'.format(key, got))


class ModelExists(Conflict):
    description = "Model exists"

class ModelNotFound(NotFound):
    description = "Model not found"
