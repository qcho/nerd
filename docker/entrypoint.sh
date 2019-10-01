#!/usr/bin/env sh
set -e

main() {
    func="$1"
    shift 1

    echo "Running ${HUPPER} ${func} $@"
    case "${func}" in
        "web")
            exec gunicorn -k egg:meinheld#gunicorn_worker -c /gunicorn_conf.py nerd:app
            return;;
        "worker")
            queue="$1"
            shift 1
            exec celery worker -A "nerd:celery" -E --pool "solo" -Q "nerd,nerd_broadcast,${queue}" $@
            return;;
        "flower")
            exec celery flower -A "nerd:celery" $@
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
