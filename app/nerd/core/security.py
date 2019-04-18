from flask_jwt_extended import JWTManager
from werkzeug.exceptions import Unauthorized

from nerd.core.document.user import User

jwt = JWTManager()


@jwt.expired_token_loader
def my_expired_token_callback():
    error = Unauthorized("Access token expired")
    return error.get_response()


@jwt.user_claims_loader
def add_claims_to_access_token(user: User):
    return {'roles': user.roles}


@jwt.user_identity_loader
def user_identity_lookup(user: User):
    return user.email
