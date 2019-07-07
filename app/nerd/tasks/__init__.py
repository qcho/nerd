import os
import types

from celery import Celery
from flask import Flask
from kombu.common import Broadcast

celery = Celery(
    __name__,
    broker="amqp://{}:{}@{}:{}/{}".format(
        os.environ.get('RABBITMQ_USERNAME'),
        os.environ.get('RABBITMQ_PASSWORD'),
        os.environ.get('NERD_AMQP_HOST'),
        os.environ.get('RABBITMQ_NODE_PORT_NUMBER'),
        os.environ.get('RABBITMQ_VHOST'),
    ),
    backend="rpc://"
)


def init_app(self, app: Flask):
    self.conf.task_result_expires = 18000  # 5 hours.
    self.conf.task_default_queue = 'nerd'
    self.conf.task_queues = (Broadcast('nerd_broadcast'), )
    self.conf.task_routes = {'nerd.tasks.corpus.reload': {'queue': 'nerd_broadcast'}}
    self.conf.update(app.config)

    class ContextTask(self.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    self.Task = ContextTask


celery.init_app = types.MethodType(init_app, celery)
