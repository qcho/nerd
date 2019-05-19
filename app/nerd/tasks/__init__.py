import os
import types

from celery import Celery
from flask import Flask
from kombu.common import Broadcast


def assert_redis_env(env_var: str):
    value = os.environ.get(env_var, '')
    if value and not value.startswith('redis://'):
        raise EnvironmentError('{} is not redis. Got "{}"'.format(env_var, value))

def assert_amqp_env(env_var: str):
    value = os.environ.get(env_var, '')
    if value and not value.startswith('amqp://'):
        raise EnvironmentError('{} is not AMQP. Got "{}"'.format(env_var, value))


assert_redis_env('NERD_REDIS_BROKER_URL')
assert_redis_env('NERD_REDIS_RESULT_URL')
assert_amqp_env('NERD_AMQP_BROKER_URL')
assert_amqp_env('NERD_AMQP_RESULT_URL')

BROKER = os.environ.get('NERD_AMQP_BROKER_URL') or os.environ.get(
    'NERD_REDIS_BROKER_URL')

BACKEND = os.environ.get('NERD_AMQP_RESULT_URL') or os.environ.get(
    'NERD_REDIS_RESULT_URL')

celery = Celery(
    __name__,
    broker=os.environ.get('NERD_REDIS_BROKER_URL'),
    backend=os.environ.get('NERD_REDIS_RESULT_URL')
)


def init_app(self, app: Flask):
    self.conf.task_default_queue = 'nerd'
    self.conf.task_queues = (Broadcast('broadcast_tasks'), )
    self.conf.task_routes = {'corpus.reload': {'queue': 'broadcast_tasks'}}
    self.conf.update(app.config)

    class ContextTask(self.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    self.Task = ContextTask


celery.init_app = types.MethodType(init_app, celery)

# TODO: warmup model load on init based on queues being listened
# @worker_init.connect
# def setup_snapshot_queue(sender, instance, **kwargs):
