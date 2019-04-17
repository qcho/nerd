FROM python:3.7

ARG PIPENV_ARGS
ENV ENV_PIPENV_ARGS=$PIPENV_ARGS

COPY ./docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY ./docker/gunicorn_conf.py /gunicorn_conf.py

COPY ./app /app
WORKDIR /app/

ENV PYTHONPATH=/app

RUN pip install --upgrade pip \
    && pip install pipenv \
    && pipenv install --deploy --system --ignore-pipfile $PIPENV_ARGS

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
