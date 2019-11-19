WORKERS := $(shell echo $$(docker ps | grep nerd_worker | wc -l | tr -d ' '))
MORE_WORKERS := $(shell echo $$(($(WORKERS) + 1)))
LESS_WORKERS := $(shell echo $$(($(WORKERS) - 1)))
TODAY := $(shell date +'%Y-%m-%d')
RESTORE_DATE := 2019-10-19
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
	docker-compose exec mongodb bash -c 'mongo --username $${MONGODB_USERNAME} --password $${MONGODB_PASSWORD} $${MONGODB_DATABASE}'
shell:
	docker-compose exec app bash
down:
	docker-compose down --volumes --rmi local --remove-orphans
mongo-backup:
	docker-compose exec mongodb mongodump --out /bitnami/mongodump-$$(date +'%Y-%m-%d')

scale-up:
	docker-compose up --scale worker=$(MORE_WORKERS) --no-recreate -d worker
scale-down:
	docker-compose up --scale worker=$(LESS_WORKERS) --no-recreate -d worker

prod-setup: ./production/.env ./production/docker-compose.yml
	echo scp -rp ./production pf-nerd:/nerd

prod-publish-new-version:
	docker login docker.pkg.github.com
	docker tag nerd/app:latest docker.pkg.github.com/qcho/nerd/app:latest
	docker tag nerd/ui:latest docker.pkg.github.com/qcho/nerd/ui:latest
	docker push docker.pkg.github.com/qcho/nerd/app:latest
	docker push docker.pkg.github.com/qcho/nerd/ui:latest

release-pull:
	docker pull docker.pkg.github.com/qcho/nerd/app:latest
	docker pull docker.pkg.github.com/qcho/nerd/ui:latest

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
	mongodump --out /bitnami/mongodump-${TODAY}

dev-restore:
	tar xvzf mongodump-${RESTORE_DATE}.tar.gz
	docker cp mongodump-${RESTORE_DATE} nerd_mongodb_1:/bitnami/
	docker-compose exec mongodb bash -c 'mongorestore --host $${NERD_MONGO_DB_HOST} --db $${MONGODB_DATABASE} --port $${MONGODB_PORT_NUMBER} --username $${MONGODB_USERNAME} --password $${MONGODB_PASSWORD} /bitnami/mongodump-${RESTORE_DATE}/nerd'

train-with-results: results/.clean
	cd results && rm .clean
	cd results && docker-compose exec mongodb bash -c 'mongoexport --collection=training --host $${NERD_MONGO_DB_HOST} --db $${MONGODB_DATABASE} --port $${MONGODB_PORT_NUMBER} --username $${MONGODB_USERNAME} --password $${MONGODB_PASSWORD} --out=/bitnami/results.json'
	cd results && docker cp nerd_mongodb_1:/bitnami/results.json results_from_db.jsonl
	cd results && sort -R results_from_db.jsonl | jq -c '.document | .+{"entities": .ents} | del(.ents)' > results_to_convert.jsonl
	cd results && python -m spacy convert --lang es results_to_convert.jsonl - > results_for_spacy.json
	cd results && jq -c '.[0:0]'       results_for_spacy.json > results_for_spacy_000_train.json
	cd results && jq -c '.[0:4000]'    results_for_spacy.json > results_for_spacy_000_dev.json
	cd results && jq -c '.[0:3000]'    results_for_spacy.json > results_for_spacy_075_train.json
	cd results && jq -c '.[3000:4000]' results_for_spacy.json > results_for_spacy_075_dev.json
	cd results && jq -c '.[0:3200]'    results_for_spacy.json > results_for_spacy_080_train.json
	cd results && jq -c '.[3200:4000]' results_for_spacy.json > results_for_spacy_080_dev.json
	cd results && jq -c '.[0:3400]'    results_for_spacy.json > results_for_spacy_085_train.json
	cd results && jq -c '.[3400:4000]' results_for_spacy.json > results_for_spacy_085_dev.json
	cd results && jq -c '.[0:3600]'    results_for_spacy.json > results_for_spacy_090_train.json
	cd results && jq -c '.[3600:4000]' results_for_spacy.json > results_for_spacy_090_dev.json
	cd results && jq -c '.[0:4000]'    results_for_spacy.json > results_for_spacy_100_train.json
	cd results && jq -c '.[4000:4000]' results_for_spacy.json > results_for_spacy_100_dev.json
	cd results && python -m spacy debug-data es --pipeline 'ner' -b 'es_core_news_md' results_for_spacy_000_train.json results_for_spacy_000_dev.json > train_000.log
	cd results && python -m spacy debug-data es --pipeline 'ner' -b 'es_core_news_md' results_for_spacy_075_train.json results_for_spacy_075_dev.json > train_075.log
	cd results && python -m spacy debug-data es --pipeline 'ner' -b 'es_core_news_md' results_for_spacy_080_train.json results_for_spacy_080_dev.json > train_080.log
	cd results && python -m spacy debug-data es --pipeline 'ner' -b 'es_core_news_md' results_for_spacy_085_train.json results_for_spacy_085_dev.json > train_085.log
	cd results && python -m spacy debug-data es --pipeline 'ner' -b 'es_core_news_md' results_for_spacy_090_train.json results_for_spacy_090_dev.json > train_090.log
	cd results && python -m spacy debug-data es --pipeline 'ner' -b 'es_core_news_md' results_for_spacy_100_train.json results_for_spacy_100_dev.json > train_100.log
	cd results && time python -m spacy train es model000 --pipeline 'ner' -b 'es_core_news_md' -g0 results_for_spacy_000_train.json results_for_spacy_000_dev.json >> train_000.log
	cd results && time python -m spacy train es model075 --pipeline 'ner' -v 'es_core_news_md' -g0 results_for_spacy_075_train.json results_for_spacy_075_dev.json >> train_075.log
	cd results && time python -m spacy train es model080 --pipeline 'ner' -v 'es_core_news_md' -g0 results_for_spacy_080_train.json results_for_spacy_080_dev.json >> train_080.log
	cd results && time python -m spacy train es model085 --pipeline 'ner' -v 'es_core_news_md' -g0 results_for_spacy_085_train.json results_for_spacy_085_dev.json >> train_085.log
	cd results && time python -m spacy train es model090 --pipeline 'ner' -v 'es_core_news_md' -g0 results_for_spacy_090_train.json results_for_spacy_090_dev.json >> train_090.log
	cd results && time python -m spacy train es model100 --pipeline 'ner' -v 'es_core_news_md' -g0 results_for_spacy_100_train.json results_for_spacy_100_dev.json >> train_100.log

results/.clean:
	cd results && rm -r model*/ results_*.json results_*.jsonl
	touch results/.clean

.PHONY: dev-status dev-start dev-stop dev-reset dev-mongo dev dev-shell prod prod-shell down scale-up scale-down
