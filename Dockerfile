FROM bitnami/python:3.7

ARG PIPENV_ARGS
ENV ENV_PIPENV_ARGS=$PIPENV_ARGS
ARG NERD_SPACY_MODEL

COPY ./docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY ./docker/gunicorn_conf.py /gunicorn_conf.py

COPY ./app /app
WORKDIR /app/

ENV PYTHONPATH=/app

RUN pip install --no-cache-dir --upgrade pip \
    && rm -r /opt/bitnami/python/lib/python3.7/site-packages/setuptools* \
    && pip install --no-cache-dir --upgrade setuptools \
    && pip install --no-cache-dir pipenv \
    && pipenv install --deploy --system --ignore-pipfile $PIPENV_ARGS \
    && spacy download $NERD_SPACY_MODEL

ENTRYPOINT ["/entrypoint.sh"]
