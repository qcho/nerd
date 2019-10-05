WORKERS := $(shell echo $$(docker ps | grep nerd_worker | wc -l | tr -d ' '))
MORE_WORKERS := $(shell echo $$(($(WORKERS) + 1)))
LESS_WORKERS := $(shell echo $$(($(WORKERS) - 1)))
define set_random_password
    sed -i.bak 's/$(2)/$(shell echo $$(openssl rand -hex 24))/' $(1)
endef

dev-start:
	docker-compose start
dev-stop:
	docker-compose stop
dev-reset:
	docker-compose exec app flask setup --drop
	docker-compose restart worker
dev-mongo:
	docker-compose exec mongodb bash -c 'mongo -u root -p$${MONGODB_ROOT_PASSWORD}'
dev:
	rm -Rf -- .docker/*/
	mkdir -p .docker/mongodb-data
	mkdir -p .docker/models-dir
	docker-compose up --scale worker=2 -d
	docker-compose exec app flask setup
	docker-compose restart worker
dev-shell:
	docker-compose exec app bash
prod: .env.production
	rm .env
	ln -s .env.production .env
	docker volume create --name=mongodb-data
	docker volume create --name=models-dir
	docker-compose -f docker-compose.yml up --build --scale worker=2 -d
	docker-compose -f docker-compose.yml exec app flask setup
	docker-compose -f docker-compose.yml restart worker
	rm .env
	ln -s ./app/.env
prod-shell:
	docker-compose -f docker-compose.yml exec app bash
down:
	docker-compose down --volumes --rmi local --remove-orphans
scale-up:
	docker-compose up --scale worker=$(MORE_WORKERS) --no-recreate -d worker
scale-down:
	docker-compose up --scale worker=$(LESS_WORKERS) --no-recreate -d worker
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

.PHONY: dev-start dev-stop dev-reset dev-mongo dev dev-shell prod prod-shell down scale-up scale-down
