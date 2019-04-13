import os

import mongoengine
from flask import Flask

from core.document.user import Role
from core.security import jwt
from core.cli import setup_cli
from apis import api
from apis.auth import blp as auth
from apis.corpora import blp as corpora
from apis.users import blp as users
from apis.roles import blp as roles
from tasks import make_celery

app = Flask('NERd')
app.config['PREFERRED_URL_SCHEME'] = os.environ.get('NERD_URL_SCHEME', 'http')
# app.config['SERVER_NAME'] = os.environ.get('NERD_SERVER_NAME', '127.0.0.1:5000')

app.config['broker_url'] = os.environ.get('BROKER_URL', 'redis://redis:6379/0')

mongoengine.connect(
    db=os.environ.get('NERD_MONGO_DB_NAME', 'nerd'),
    host=os.environ.get('NERD_MONGO_DB_HOST', None),
    port=os.environ.get('NERD_MONGO_DB_PORT', None),
    username=os.environ.get('NERD_MONGO_DB_USER', None),
    password=os.environ.get('NERD_MONGO_DB_PASSWORD', None)
)

app.config['JWT_TOKEN_LOCATION'] = ('headers', 'json')
app.config['JWT_ERROR_MESSAGE_KEY'] = "message"
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'zekrit dont tell plz')  # TODO: Change secret key
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 15 * 60
app.config['JWT_IDENTITY_CLAIM'] = 'sub'
jwt.init_app(app)

app.config['OPENAPI_URL_PREFIX'] = 'api'
app.config['OPENAPI_VERSION'] = '3.0.2'
app.config['OPENAPI_REDOC_PATH'] = '/redoc'
app.config['OPENAPI_REDOC_VERSION'] = 'v2.0.0-rc.4'
app.config['OPENAPI_SWAGGER_UI_PATH'] = '/doc'
app.config['OPENAPI_SWAGGER_UI_VERSION'] = '3.22.0'
app.config['API_VERSION'] = '1.0.0'
app.config['API_SPEC_OPTIONS'] = {
    'servers': [
        {
            'url': '{}://{}'.format(
                app.config['PREFERRED_URL_SCHEME'],
                os.environ.get('NERD_SERVER_NAME', '0.0.0.0:80')
            ),
            'description': 'Default api endpoint'
        },
        {
            'url': '{}://{}'.format(
                app.config['PREFERRED_URL_SCHEME'],
                'localhost:3000'
            ),
            'description': 'Docker endpoint'
        },
{
            'url': '{}://{}'.format(
                app.config['PREFERRED_URL_SCHEME'],
                os.environ.get('NERD_SERVER_NAME', '127.0.0.1:5000')
            ),
            'description': 'UI endpoint'
        }
    ],
    'components': {
        'securitySchemes': {
            'oAuth2Password': {
                'type': 'oauth2',
                'description': 'Some documentation',  # TODO: Complete this
                'flows': {
                    'password': {
                        'tokenUrl': '/api/auth/token',
                        'refreshUrl': '/api/auth/refresh',
                        'scopes': {
                            Role.USER.value: 'User can perform queries and training',
                            Role.ADMIN.value: 'Admin user'
                        }
                    }
                }
            }
        }
    }
}
api.init_app(app)
api.register_blueprint(auth, url_prefix='/api/auth')
api.register_blueprint(corpora, url_prefix='/api/corpora')
api.register_blueprint(users, url_prefix='/api/users')
api.register_blueprint(roles, url_prefix='/api/roles')

setup_cli(app)

app.config['CELERY_RESULT_BACKEND'] = os.environ.get('CELERY_RESULT_BACKEND', 'redis')
app.config['CELERY_BROKER_URL'] = os.environ.get('CELERY_BROKER_URL', 'redis://redis:6379')

celery = make_celery(app)

if __name__ == '__main__':
    app.run()
