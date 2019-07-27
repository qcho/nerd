WORKERS := $(shell echo $$(docker ps | grep nerd_worker | wc -l | tr -d ' '))
MORE_WORKERS := $(shell echo $$(($(WORKERS) + 1)))
LESS_WORKERS := $(shell echo $$(($(WORKERS) - 1)))

start:
	docker-compose start
stop:
	docker-compose stop
nerd-setup-force:
	docker-compose exec app flask setup --drop
up:
	cd ui && yarn install && yarn build
	docker-compose up --build --scale worker=2 -d
	docker-compose exec app flask setup
	docker-compose restart worker
down:
	docker-compose down --volumes --rmi local --remove-orphans

scale-up:
	docker-compose up --scale worker=$(MORE_WORKERS) --no-recreate -d worker

scale-down:
	docker-compose up --scale worker=$(LESS_WORKERS) --no-recreate -d worker

.PHONY: start stop nerd-setup nerd-setup-force up down
