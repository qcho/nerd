import json
from pprint import pprint

import click
from flask import Flask

from nerd.core.importer.text_importer import TextImporter
from nerd.core.news import NewsApi
from nerd.core.setup import NERdSetup
from nerd.tasks import celery
from nerd.tasks.corpus import change_snapshot as change_snapshot_task, nlp as nlp_task, reload as reload_task


def setup_cli(app: Flask):
    @app.cli.command()
    @click.option('--drop/--no-drop', help='Drop old database information before setup', default=False)
    def setup(drop):
        NERdSetup.setup(drop)

    @app.cli.command()
    @click.option('--drop/--no-drop', help='Drop old database information before setup', default=False)
    def dev_setup(drop):
        NERdSetup.dev_setup(drop)

    @app.cli.command()
    @click.argument('filename')
    def import_file(filename):
        with open(filename, 'rb') as file:
            TextImporter(file).run()

    @app.cli.command()
    @click.option('--api-key', type=str)
    @click.option('--pages', type=int, default=1)
    def fetch_news(api_key: str, pages: int):
        NewsApi(api_key).fetch_news(pages)

    @app.cli.group()
    @click.pass_context
    @click.option('-Q', '--queue', default='vCURRENT')
    def worker(ctx, queue):
        ctx.ensure_object(dict)
        ctx.obj['QUEUE'] = queue

    @worker.command()
    @click.pass_context
    def ping(ctx):
        pprint(celery.control.ping())

    @worker.command()
    @click.pass_context
    def stop(ctx):
        return celery.control.cancel_consumer(ctx.obj['QUEUE'], reply=True)

    @worker.command()
    @click.pass_context
    @click.argument('text')
    def nlp(ctx, text: str):
        result = nlp_task.apply_async([text], queue=ctx.obj['QUEUE']).wait()
        json_result = json.dumps(result)
        print(json_result)

    @worker.command()
    @click.pass_context
    def train(ctx):
        pprint(celery.control.inspect().active_queues())

    @worker.command()
    def reload_all():
        reload_task.apply_async([None]).wait()

    @worker.command()
    @click.pass_context
    @click.argument('code')
    def change_snapshot(ctx, code: str):
        change_snapshot_task.apply_async([code], queue=ctx.obj['QUEUE']).wait()
