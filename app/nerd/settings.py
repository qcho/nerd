import os

from nerd.core.document.user import Role


class BaseConfig(object):
    DEBUG = False
    TESTING = False
    PREFERRED_URL_SCHEME = os.environ.get('NERD_URL_SCHEME', 'http')
    NERD_WEB_NAME = "{}:{}".format(
        os.environ.get('NERD_WEB_HOST'),
        os.environ.get('NERD_WEB_HTTP_PORT'),
    )

    JWT_TOKEN_LOCATION = ('headers', 'json')
    JWT_ERROR_MESSAGE_KEY = "message"
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = 15 * 60
    JWT_IDENTITY_CLAIM = 'sub'

    OPENAPI_URL_PREFIX = 'api'
    OPENAPI_VERSION = '3.0.2'
    OPENAPI_REDOC_PATH = '/redoc'
    OPENAPI_REDOC_VERSION = 'v2.0.0-rc.16'
    OPENAPI_SWAGGER_UI_PATH = '/doc'
    OPENAPI_SWAGGER_UI_VERSION = '3.23.11'
    API_VERSION = '1.0.0'
    API_SPEC_OPTIONS = {
        'servers': [
            {
                'url': '{}://{}'.format(
                    PREFERRED_URL_SCHEME,
                    NERD_WEB_NAME,
                ),
                'description': 'UI endpoint'
            }
        ],
        'components': {
            'securitySchemes': {
                'oAuth2Password': {
                    'type': 'oauth2',
                    'description': 'Oauth endpoint',
                    'flows': {
                        'password': {
                            'tokenUrl': '/api/auth/token',
                            'refreshUrl': '/api/auth/refresh',
                            'scopes': {
                                Role.USER.value: 'User can perform queries',
                                Role.TRAINER.value: 'User can perform training',
                                Role.ADMIN.value: 'Admin user'
                            }
                        }
                    }
                }
            }
        }
    }


def setup_settings(app):
    app.config.from_object(BaseConfig)


MONGO_CONFIG = {
    'db': os.environ.get('MONGODB_DATABASE'),
    'host': os.environ.get('NERD_MONGO_DB_HOST'),
    'port': int(os.environ.get('MONGODB_PORT_NUMBER')),
    'username': os.environ.get('MONGODB_USERNAME'),
    'password': os.environ.get('MONGODB_PASSWORD'),
}
