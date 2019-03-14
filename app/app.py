import os

from flask import Flask

from core.document.user import Role
from core.security import jwt
from core.cli import setup_cli
from apis import api
from apis.auth import blp as auth
from apis.corpora import blp as corpora
from apis.users import blp as users


app = Flask('NERd')

app.config['JWT_TOKEN_LOCATION'] = ('headers', 'json')
app.config['JWT_ERROR_MESSAGE_KEY'] = "message"
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'zekrit dont tell plz')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 15 * 60
app.config['JWT_IDENTITY_CLAIM'] = 'sub'
jwt.init_app(app)

app.config['OPENAPI_URL_PREFIX'] = 'api'
app.config['OPENAPI_VERSION'] = '3.0.2'
app.config['OPENAPI_REDOC_PATH'] = '/redoc'
app.config['OPENAPI_REDOC_VERSION'] = 'v2.0.0-rc.2'
app.config['OPENAPI_SWAGGER_UI_PATH'] = '/doc'
app.config['OPENAPI_SWAGGER_UI_VERSION'] = '3.21.0'
app.config['API_VERSION'] = '1.0.0'
app.config['API_SPEC_OPTIONS'] = {
    'components': {
        'securitySchemes': {
            'oAuth2Password': {
                'type': 'oauth2',
                'description': 'Some documentation',
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

setup_cli(app)

if __name__ == '__main__':
    app.run(debug=True)
