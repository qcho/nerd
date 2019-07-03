import mongoengine
from apispec.ext.marshmallow import MarshmallowPlugin
from flask import Flask

from nerd.core.schema_registry import register_custom_schemas
from nerd.core.schema_resolver import resolver
from .apis import api
from .apis.auth import blp as auth
from .apis.corpus import blp as corpus
from .apis.ner import blp as ner
from .apis.roles import blp as roles
from .apis.snapshots import blp as snapshots
from .apis.users import blp as users
from .apis.trainings import blp as trainings
from .apis.workers import blp as workers
from .core.cli import setup_cli
from .core.security import jwt
from .core.util import get_logger
from .settings import MONGO_CONFIG, setup_settings
from .tasks import celery

logger = get_logger(__name__)

app = Flask('NERd')
setup_settings(app)

mongoengine.connect(**MONGO_CONFIG)
jwt.init_app(app)
celery.init_app(app)
api.init_app(app, spec_kwargs={
    'marshmallow_plugin': MarshmallowPlugin(resolver)
})
register_custom_schemas(api.spec)
api.register_blueprint(auth, url_prefix='/api/auth')
api.register_blueprint(users, url_prefix='/api/users')
api.register_blueprint(roles, url_prefix='/api/roles')
api.register_blueprint(corpus, url_prefix='/api/corpus')
api.register_blueprint(snapshots, url_prefix='/api/snapshots')
api.register_blueprint(ner, url_prefix='/api/ner')
api.register_blueprint(trainings, url_prefix='/api/trainings')
api.register_blueprint(workers, url_prefix='/api/workers')

setup_cli(app)
