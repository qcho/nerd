FROM tiangolo/meinheld-gunicorn:python3.7

COPY ./app /app

RUN pip install --upgrade pip \
    && pip install pipenv \
    && pipenv install --deploy --system --ignore-pipfile
