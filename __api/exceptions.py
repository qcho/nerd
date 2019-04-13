from werkzeug.exceptions import Unauthorized, BadRequest, HTTPException, NotFound, Conflict


class InvalidBaseModel(BadRequest):
    description = "Invalid base model"


class BadCredentials(Unauthorized):
    description = "Invalid credentials"


class ModelExists(Conflict):
    description = "Model exists"


class ModelNotFound(NotFound):
    description = "Model not found"
