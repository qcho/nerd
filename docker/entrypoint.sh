#!/usr/bin/env sh
set -e

case "$ENV_PIPENV_ARGS" in
  "--dev"*) HUPPER="hupper -m";;
  *)    HUPPER="";;
esac

main() {
    func="$1"
    shift 1

    echo "Running ${HUPPER} ${func}"
    case "${func}" in
        "web")
            export GUNICORN_CONF=""
            exec $HUPPER gunicorn.app.wsgiapp -k egg:meinheld#gunicorn_worker -c "/gunicorn_conf.py" "nerd:app"
            return;;
        "worker")
            exec $HUPPER celery worker -A "nerd:celery"
            return;;
        "flower")
            exec $HUPPER celery flower -A "nerd:celery"
            return;;
        "setup")
            exec flask setup "$@"
            return;;
        *)
            exec "$@"
            return;;
    esac
}

main "$@"
