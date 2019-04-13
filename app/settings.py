
import os

from core.document.user import Role

SERVERS = {
    3000: 'UI endpoint',
    80: 'Production endpoint',
    5000: 'Development endpoint'
}


class BaseConfig(object):
    DEBUG = False
    TESTING = False
    PREFERRED_URL_SCHEME = os.environ.get('NERD_URL_SCHEME', 'http')
    SERVER_NAME = os.environ.get('NERD_SERVER_NAME', 'localhost')
    # SERVER_NAME = os.environ.get('NERD_SERVER_NAME', '127.0.0.1:5000')

    CELERY_RESULT_BACKEND = os.environ.get(
        'CELERY_RESULT_BACKEND', 'redis')
    CELERY_BROKER_URL = os.environ.get(
        'CELERY_BROKER_URL', 'redis://redis:6379')
    JWT_TOKEN_LOCATION = ('headers', 'json')
    JWT_ERROR_MESSAGE_KEY = "message"
    JWT_SECRET_KEY = os.environ.get(
        'JWT_SECRET_KEY', 'zekrit dont tell plz')  # TODO: Change secret key
    JWT_ACCESS_TOKEN_EXPIRES = 15 * 60
    JWT_IDENTITY_CLAIM = 'sub'

    OPENAPI_URL_PREFIX = 'api'
    OPENAPI_VERSION = '3.0.2'
    OPENAPI_REDOC_PATH = '/redoc'
    OPENAPI_REDOC_VERSION = 'v2.0.0-rc.4'
    OPENAPI_SWAGGER_UI_PATH = '/doc'
    OPENAPI_SWAGGER_UI_VERSION = '3.22.0'
    API_VERSION = '1.0.0'
    API_SPEC_OPTIONS = {
        'servers': [
            {
                'url': '{}://{}'.format(
                    PREFERRED_URL_SCHEME,
                    'localhost:3000'
                ),
                'description': 'UI endpoint'
            },
            {
                'url': '{}://{}'.format(
                    PREFERRED_URL_SCHEME,
                    os.environ.get('NERD_SERVER_NAME', '0.0.0.0:80')
                ),
                'description': 'Docker endpoint'
            },
            {
                'url': '{}://{}'.format(
                    PREFERRED_URL_SCHEME,
                    os.environ.get('NERD_SERVER_NAME', '127.0.0.1:5000')
                ),
                'description': 'Local endpoint'
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


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    TESTING = True


class TestingConfig(BaseConfig):
    DEBUG = False
    TESTING = True


class ProductionConfig(BaseConfig):
    PREFERRED_URL_SCHEME = os.environ.get('NERD_URL_SCHEME', 'https')


config = {
    "development": "settings.DevelopmentConfig",
    "testing": "settings.TestingConfig",
    "production": "settings.ProductionConfig"
}


def configure_app(app):
    config_name = os.getenv('FLASK_CONFIGURATION', 'development')
    # object-based default configuration
    app.config.from_object(config[config_name])
    # instance-folders configuration
    app.config.from_pyfile('config.cfg', silent=True)


MONGO_CONFIG = {
    'db': os.environ.get('NERD_MONGO_DB_NAME', 'nerd'),
    'host': os.environ.get('NERD_MONGO_DB_HOST', None),
    'port': os.environ.get('NERD_MONGO_DB_PORT', None),
    'username': os.environ.get('NERD_MONGO_DB_USER', None),
    'password': os.environ.get('NERD_MONGO_DB_PASSWORD', None)
}
