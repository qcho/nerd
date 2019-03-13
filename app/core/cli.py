import click
from flask import Flask

from core.setup import NERdSetup


def setup_cli(app: Flask):

    @app.cli.command()
    @click.option('--drop/--no-drop', help='Drop old database information before setup', default=False)
    def setup(drop):
        NERdSetup.setup(drop)
