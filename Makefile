WORKERS := $(shell echo $$(docker ps | grep nerd_worker | wc -l | tr -d ' '))
MORE_WORKERS := $(shell echo $$(($(WORKERS) + 1)))
LESS_WORKERS := $(shell echo $$(($(WORKERS) - 1)))
define set_random_password
    sed -i.bak 's/$(2)/$(shell echo $$(openssl rand -hex 24))/' $(1)
endef

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
up-prod: .env.production
	mv .env .env.development
	cp .env.production .env
	docker volume create --name=mongodb-data
	cd ui && yarn install && yarn build
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build --scale worker=2 -d
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec app flask setup
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart worker
	rm .env
	mv .env.development .env
down:
	docker-compose down --volumes --rmi local --remove-orphans
scale-up:
	docker-compose up --scale worker=$(MORE_WORKERS) --no-recreate -d worker
scale-down:
	docker-compose up --scale worker=$(LESS_WORKERS) --no-recreate -d worker
bash-prod:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec app bash

.env.production:
	cp .env .env.production
	$(call set_random_password,.env.production,change_me_MONGODB_ROOT_PASSWORD)
	$(call set_random_password,.env.production,change_me_MONGODB_PASSWORD)
	$(call set_random_password,.env.production,change_me_RABBITMQ_PASSWORD)
	$(call set_random_password,.env.production,change_me_JWT_SECRET_KEY)
	sed -i.bak 's/LOG_LEVEL=debug/LOG_LEVEL=info/' .env.production
	sed -i.bak 's/RELOAD=True/RELOAD=False/' .env.production
	sed -i.bak 's/FLASK_DEBUG=1/FLASK_DEBUG=0/' .env.production
	rm .env.production.bak
.PHONY: start stop nerd-setup nerd-setup-force up down
