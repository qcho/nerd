ARG PYTHON_VERSION=3

FROM python:${PYTHON_VERSION} as python-base

WORKDIR /wheels
COPY ./requirements.txt ./
RUN pip install --upgrade pip gunicorn
RUN pip wheel -r requirements.txt -f /wheels --wheel-dir=/wheels

# Pull base image
FROM python:${PYTHON_VERSION}-alpine as python-final

# Set environment varibles
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV ENVIRONMENT production
ENV DEBUG False

WORKDIR /code

COPY gunicorn /gunicorn

# Install dependencies
COPY --from=python-base /wheels /wheels
RUN ls /wheels
RUN pip install -U pip \
    && pip install \
    -f /wheels \
    --wheel-dir /wheels \
    --no-index \
    -r /wheels/requirements.txt \
    && rm -rf /root/.cache/pip/*

RUN python -m spacy download es

# Copy project
COPY . /code/

COPY ./docker-entrypoint.sh /docker-entrypoint.sh
EXPOSE 80
STOPSIGNAL SIGINT
ENTRYPOINT ["bash", "/docker-entrypoint.sh"]
