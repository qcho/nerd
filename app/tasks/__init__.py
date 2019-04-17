import os
import types

from celery import Celery
from flask import Flask

from core.document.version import Version


def assert_redis_env(env_var: str):
    value = os.environ.get(env_var, '')
    if not value.startswith('redis://'):
        raise EnvironmentError('{} is not redis. Got "{}"'.format(env_var, value))


assert_redis_env('NERD_REDIS_BROKER_URL')
assert_redis_env('NERD_REDIS_RESULT_URL')

celery = Celery(
    __name__,
    broker=os.environ.get('NERD_REDIS_BROKER_URL'),
    backend=os.environ.get('NERD_REDIS_RESULT_URL')
)


def init_app(self, app: Flask):
    # TODO: probably default queue should be something like 'nerd' for control operations in workers
    self.conf.task_default_queue = Version.SNAPSHOT
    self.conf.update(app.config)

    class ContextTask(self.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    self.Task = ContextTask


celery.init_app = types.MethodType(init_app, celery)


# TODO: warmup model load on init based on queues being listen
# @worker_init.connect
# def setup_snapshot_queue(sender, instance, **kwargs):
