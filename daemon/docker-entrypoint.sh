#!/bin/bash

set -e

cd /code

help_cmd () {
    echo "Help"
}

init () {

}

run () {
    echo "Running ${ENVIRONMENT}"
    case "${ENVIRONMENT}" in
        "production")
        exec gunicorn --config /gunicorn/gunicorn.conf --log-config /gunicorn/logging.conf app:app
        ;;
        *)
        echo "======== STARTING DEV SERVER ========"
        exec python daemon.py
        ;;
        esac
}

train () {
    echo noop... yet.
}


main() {
    command="$1"
    shift;

    echo "command is <${command}>"
    case "${command}" in
        "help")
            help_cmd "$@"
            ;;
        "init")
            init "$@"
            ;;
        "run")
            run "$@"
            ;;
        *)
            echo "Didn't get that... $@"
            exit 1
            ;;
    esac;
}

main "$@"
