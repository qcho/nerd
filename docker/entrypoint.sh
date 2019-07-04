#!/usr/bin/env sh
set -e

case "$ENV_PIPENV_ARGS" in
  "--dev"*) HUPPER="hupper -m";;
  *)    HUPPER="";;
esac

main() {
    func="$1"
    shift 1

    echo "Running ${HUPPER} ${func} $@"
    case "${func}" in
        "web")
            export GUNICORN_CONF=""
            exec $HUPPER gunicorn.app.wsgiapp -k egg:meinheld#gunicorn_worker -c "/gunicorn_conf.py" "nerd:app"
            return;;
        "worker")
            queue="$1"
            shift 1
            exec $HUPPER celery worker -A "nerd:celery" -E --pool "solo" -Q "nerd,${queue},broadcast_tasks" $@
            return;;
        "flower")
            exec $HUPPER celery flower -A "nerd:celery" $@
            return;;
        "setup")
            exec flask setup $@
            return;;
        *)
            exec $@
            return;;
    esac
}

main "$@"
