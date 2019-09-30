from functools import wraps

from apispec.utils import deepupdate
from flask_jwt_extended import (get_jwt_claims, verify_jwt_in_request)
from flask_smorest import Api
from marshmallow import Schema, fields
from werkzeug.exceptions import HTTPException, Unauthorized
from werkzeug.http import HTTP_STATUS_CODES

from nerd.core.document.user import Role

api = Api()


class BaseSchema(Schema):
    class Meta:
        strict = True
        ordered = True


def jwt_and_role_required(role: Role = Role.USER):
    """
    A decorator to protect a Flask endpoint.

    If you decorate an endpoint with this, it will:
    - ensure that the requester has a valid access token.
    - Authenticated user has the provided role
    - Document both auth and possible auth errors
    Won't check the freshness of the access token.
    """

    def decorator(fn):
        doc = {
            "security": [{"oAuth2Password": [role.value]}],
            "responses": {
                str(code): {
                    "schema": HttpErrorSchema(),
                    "description": HTTP_STATUS_CODES[code],
                }
                for code in [401, 422]
            },
        }

        fn._apidoc = deepupdate(getattr(fn, "_apidoc", {}), doc)

        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            if role.value not in get_jwt_claims()["roles"]:
                raise Unauthorized("{} is required".format(role))

            return fn(*args, **kwargs)

        return wrapper

    return decorator


class HttpErrorSchema(BaseSchema):
    status = fields.String(
        required=True, description="A description of the error")


def response_error(error: HTTPException):
    """
    A decorator to protect a Flask endpoint.

    If you decorate an endpoint with this it documents http-exception
    """

    def decorator(fn):
        doc = {
            "responses": {
                str(error.code): {
                    "schema": HttpErrorSchema(),
                    "description": error.description,
                }
            }
        }
        fn._apidoc = deepupdate(getattr(fn, "_apidoc", {}), doc)

        @wraps(fn)
        def wrapper(*args, **kwargs):
            return fn(*args, **kwargs)

        return wrapper

    return decorator
