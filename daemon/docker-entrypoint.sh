#!/bin/bash

set -e


function help_cmd {
    echo "Help"
}

function run {
    echo "Running ${ENVIRONMENT}"
    case "${ENVIRONMENT}" in
        "production")
        # exec gunicorn --config /gunicorn/gunicorn.conf --log-config /gunicorn/logging.conf app:app
        exec gunicorn --config /gunicorn/gunicorn.conf app:app
        ;;
        *)
        echo "======== STARTING DEV SERVER ========"
        exec python app.py "$@"
        ;;
        esac
}

function worker {
    exec python worker.py "$@"
}


function main() {
    command="$1"
    shift;

    echo "command is <${command}>"
    case "${command}" in
        "help")
            help_cmd "$@"
            ;;
        "run")
            run "$@"
            ;;
        "worker")
            worker "$@"
            ;;
        *)
            echo "Didn't get that... $@"
            exit 1
            ;;
    esac;
}

main "$@"
