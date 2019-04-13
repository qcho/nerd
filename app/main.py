import mongoengine
from apis import api
from apis.auth import blp as auth
from apis.corpus.texts import blp as texts
from apis.corpus.versions import blp as versions
from apis.roles import blp as roles
from apis.users import blp as users
from core.cli import setup_cli
from core.security import jwt
from flask import Flask
from settings import MONGO_CONFIG, setup_settings
from tasks import celery
from logit import get_logger

logger = get_logger(__name__)

app = Flask('NERd')
setup_settings(app)

mongoengine.connect(**MONGO_CONFIG)
jwt.init_app(app)

celery.init_app(app)

api.init_app(app)
api.register_blueprint(auth, url_prefix='/api/auth')
api.register_blueprint(users, url_prefix='/api/users')
api.register_blueprint(roles, url_prefix='/api/roles')
api.register_blueprint(texts, url_prefix='/api/corpus/texts')
api.register_blueprint(versions, url_prefix='/api/corpus/version')

setup_cli(app)
