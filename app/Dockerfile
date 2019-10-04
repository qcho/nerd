FROM bitnami/python:3.7 as release

ARG NERD_SPACY_MODEL

COPY ./docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY ./docker/gunicorn_conf.py /gunicorn_conf.py

COPY . /app
WORKDIR /app

ENV PYTHONPATH=/app

RUN pip install --no-cache-dir --upgrade pip \
    && rm -r /opt/bitnami/python/lib/python3.7/site-packages/setuptools* \
    && pip install --no-cache-dir --upgrade setuptools \
    && pip install --no-cache-dir pipenv \
    && pipenv install --deploy --system --ignore-pipfile \
    && spacy download ${NERD_SPACY_MODEL}

ENTRYPOINT ["/entrypoint.sh"]

FROM release as development
    RUN pipenv install --deploy --system --ignore-pipfile --dev

FROM release
