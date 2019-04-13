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
from settings import MONGO_CONFIG, configure_app
from tasks import make_celery

app = Flask('NERd')
configure_app(app)

mongoengine.connect(**MONGO_CONFIG)
jwt.init_app(app)

api.init_app(app)
api.register_blueprint(auth, url_prefix='/api/auth')
api.register_blueprint(corpora, url_prefix='/api/corpora')
api.register_blueprint(users, url_prefix='/api/users')
api.register_blueprint(roles, url_prefix='/api/roles')

setup_cli(app)

celery = make_celery(app)

if __name__ == '__main__':
    app.run()
