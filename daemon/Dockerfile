ARG PYTHON_VERSION=3

# FROM python:${PYTHON_VERSION} as python-base

# WORKDIR /wheels
# RUN apk add --update python3 python3-dev py3-pip build-base
# COPY ./requirements.txt ./
# RUN pip install --upgrade pip gunicorn
# RUN pip wheel -r requirements.txt -f /wheels --wheel-dir=/wheels

# Pull base image
FROM python:${PYTHON_VERSION} as python-final

# Set environment varibles
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV ENVIRONMENT production
ENV DEBUG False
ENV GUNICORN_WORKERS 2
ENV GUNICORN_BACKLOG 4096
ENV GUNICORN_BIND 0.0.0.0:8000


WORKDIR /code

COPY gunicorn /gunicorn

# ## Install dependencies
# COPY --from=python-base /wheels /wheels
# RUN pip install -U pip \
#     && pip install \
#     -f /wheels \
#     --no-index \
#     -r /wheels/requirements.txt \
#     && rm -rf /root/.cache/pip/*

# Install dependencies
COPY requirements.txt .
RUN pip install -U pip gunicorn \
    && pip install -r ./requirements.txt \
    && rm -rf /root/.cache/pip/*

RUN python -m spacy download es

# Copy project
COPY . /code/

COPY ./docker-entrypoint.sh /docker-entrypoint.sh
EXPOSE 80
STOPSIGNAL SIGINT
ENTRYPOINT ["bash", "/docker-entrypoint.sh"]
