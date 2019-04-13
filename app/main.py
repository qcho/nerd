import os

import mongoengine
from apis import api
from apis.auth import blp as auth
from apis.corpora import blp as corpora
from apis.roles import blp as roles
from apis.users import blp as users
from core.cli import setup_cli
from core.security import jwt
from flask import Flask
from logit import get_logger
from settings import MONGO_CONFIG, setup_settings
from tasks import make_celery

logger = get_logger(__name__)

app = Flask('NERd')
setup_settings(app)
celery = make_celery(app)

mongoengine.connect(**MONGO_CONFIG)
jwt.init_app(app)

api.init_app(app)
api.register_blueprint(auth, url_prefix='/api/auth')
api.register_blueprint(corpora, url_prefix='/api/corpora')
api.register_blueprint(users, url_prefix='/api/users')
api.register_blueprint(roles, url_prefix='/api/roles')

setup_cli(app)

if __name__ == '__main__':
    app.run()
