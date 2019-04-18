import os
import tempfile

import pytest

import nerd


@pytest.fixture
def client():
    db_fd, nerd.app.config['DATABASE'] = tempfile.mkstemp()
    nerd.app.config['TESTING'] = True
    client = nerd.app.test_client()

    yield client

    os.close(db_fd)
    os.unlink(nerd.app.config['DATABASE'])


def test_empty_db(client):
    """Start with a blank database."""

    rv = client.get('/')
    assert b'404' in rv.data
