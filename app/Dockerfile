FROM bitnami/python:3.7


ENV PYTHONPATH=/app
COPY Pipfile Pipfile.lock /app/
RUN pip install --no-cache-dir --upgrade pip \
    && rm -r /opt/bitnami/python/lib/python3.7/site-packages/setuptools* \
    && pip install --no-cache-dir --upgrade setuptools \
    && pip install --no-cache-dir pipenv \
    && pipenv install --deploy --system --ignore-pipfile

ARG NERD_SPACY_MODEL
RUN spacy download ${NERD_SPACY_MODEL}

COPY ./docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
COPY ./docker/gunicorn_conf.py /gunicorn_conf.py
COPY . /app
WORKDIR /app

ENTRYPOINT ["/entrypoint.sh"]
