from pprint import pprint

import click
from flask import Flask

from nerd.core.document.snapshot import Snapshot
from nerd.core.setup import NERdSetup
from nerd.tasks import celery
from nerd.tasks.corpus import ping as ping_task, nlp as nlp_task


def setup_cli(app: Flask):
    @app.cli.command()
    @click.option('--drop/--no-drop', help='Drop old database information before setup', default=False)
    def setup(drop):
        NERdSetup.setup(drop)

    @app.cli.command()
    @click.option('--drop/--no-drop', help='Drop old database information before setup', default=False)
    def dev_setup(drop):
        NERdSetup.dev_setup(drop)

    @app.cli.group()
    @click.pass_context
    @click.option('-Q', '--queue', default='vCURRENT')
    def worker(ctx, queue):
        ctx.ensure_object(dict)
        ctx.obj['QUEUE'] = queue

    @worker.command()
    @click.pass_context
    def ping(ctx):
        pprint(ping_task.apply_async(queue=ctx.obj['QUEUE']).wait())

    @worker.command()
    @click.pass_context
    def stop(ctx):
        return celery.control.cancel_consumer(ctx.obj['QUEUE'], reply=True)

    @worker.command()
    @click.pass_context
    @click.argument('text')
    def nlp(ctx, text):
        pprint(nlp_task.apply_async([text], queue=ctx.obj['QUEUE']).wait())
