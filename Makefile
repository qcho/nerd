serve:
	docker-compose up --remove-orphans

setup:
	docker-compose exec app flask setup

setup-force:
	docker-compose exec app flask setup --drop

stop:
	docker-compose down -v

purge: stop
	docker-compose rm --force

.PHONY: setup setup-force serve stop purge
