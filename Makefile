WORKERS := $(shell echo $$(docker ps | grep nerd_worker | wc -l | tr -d ' '))
MORE_WORKERS := $(shell echo $$(($(WORKERS) + 1)))
LESS_WORKERS := $(shell echo $$(($(WORKERS) - 1)))
define set_random_password
	sed -i.bak 's/$(2)/$(shell echo $$(openssl rand -hex 24))/' $(1)
endef

define prompt_var
	read -s -p "Insert $(2): " value
	sed -i.bak 's/$(2)/$(shell echo $$(openssl rand -hex 24))/' $(1)
endef

build:
	docker-compose build
setup:
	docker volume create --name=nerd_mongodb-data
	docker volume create --name=nerd_models-dir
	docker-compose up --scale worker=2 -d
	sleep 10
	docker-compose exec app flask setup
	docker-compose restart worker
status:
	docker-compose ps
start:
	docker-compose start
stop:
	docker-compose stop
reset-dropping-database:
	docker-compose exec app flask setup --drop
	docker-compose restart worker
mongo:
	docker-compose exec mongodb bash -c 'mongo -u root -p$${MONGODB_ROOT_PASSWORD}'
shell:
	docker-compose exec app bash
down:
	docker-compose down --volumes --rmi local --remove-orphans
mongo-backup:
	docker-compose exec mongodb mongodump --out /bitnami/mongodump-$$(date +'%Y-%m-%d')

prod-setup: ./production/.env ./production/docker-compose.yml
	echo scp -rp ./production pf-nerd:/nerd

prod-publish-new-version:
	docker login docker.pkg.github.com
	docker tag nerd/app:latest docker.pkg.github.com/qcho/nerd/app:latest
	docker tag nerd/ui:latest docker.pkg.github.com/qcho/nerd/ui:latest
	docker push docker.pkg.github.com/qcho/nerd/app:latest
	docker push docker.pkg.github.com/qcho/nerd/ui:latest

./production:
	mkdir ./production

./production/.env: ./production
	cp .env ./production/
	$(call set_random_password,./production/.env,change_me_MONGODB_ROOT_PASSWORD)
	$(call set_random_password,./production/.env,change_me_MONGODB_PASSWORD)
	$(call set_random_password,./production/.env,change_me_RABBITMQ_PASSWORD)
	$(call set_random_password,./production/.env,change_me_JWT_SECRET_KEY)
	sed -i.bak 's/LOG_LEVEL=debug/LOG_LEVEL=info/' ./production/.env
	sed -i.bak 's/RELOAD=True/RELOAD=False/' ./production/.env
	sed -i.bak 's/FLASK_DEBUG=1/FLASK_DEBUG=0/' ./production/.env
	sed -i.bak 's/NERD_WEB_HOST=localhost/NERD_WEB_HOST=nerd.it.itba.edu.ar/' ./production/.env
	sed -i.bak 's/NERD_WEB_HTTP_PORT=8080/NERD_WEB_HTTP_PORT=80/' ./production/.env
	rm ./production/.env.bak

./production/.docker-compose.yml: ./production
	cp ./docker-compose.yml ./production/

dev-backup:
	apt update
	apt install gnupg2
	wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | apt-key add -
	echo "deb http://repo.mongodb.org/apt/debian stretch/mongodb-org/4.2 main" | tee /etc/apt/sources.list.d/mongodb-org-4.2.list
	apt update
	apt install mongodb-org-tools
	mongodump --out /bitnami/mongodump-$(date +'%Y-%m-%d')
	mongorestore --host ${NERD_MONGO_DB_HOST} --db ${MONGODB_DATABASE} --port ${MONGODB_PORT_NUMBER} --username ${MONGODB_USERNAME} --password ${MONGODB_PASSWORD} /opt/backup/mongodump-$(date +'%Y-%m-%d')/nerd
	

.PHONY: dev-status dev-start dev-stop dev-reset dev-mongo dev dev-shell prod prod-shell down scale-up scale-down

