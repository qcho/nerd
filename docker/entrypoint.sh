#!/usr/bin/env sh
set -e

case "$ENV_PIPENV_ARGS" in
  "--dev"*)
    HUPPER="hupper -m"
    WEB_CMD="$HUPPER flask run --host ${NERD_APP_HOST} --port ${NERD_APP_HTTP_PORT}"
  ;;
  *)
    HUPPER=""
    export GUNICORN_CONF=""
    WEB_CMD="gunicorn.app.wsgiapp -k egg:meinheld#gunicorn_worker -c '/gunicorn_conf.py' 'nerd:app'"
  ;;
esac

main() {
    func="$1"
    shift 1

    echo "Running ${HUPPER} ${func} $@"
    case "${func}" in
        "web")
            exec $WEB_CMD
            return;;
        "worker")
            queue="$1"
            shift 1
            exec $HUPPER celery worker -A "nerd:celery" -E --pool "solo" -Q "nerd,nerd_broadcast,${queue}" $@
            return;;
        "flower")
            exec $HUPPER celery flower -A "nerd:celery" $@
            return;;
        "setup")
            exec flask setup $@
            return;;
        *)
            exec $1 $@
            return;;
    esac
}

main "$@"
