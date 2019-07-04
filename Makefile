start:
	docker-compose start
stop:
	docker-compose stop
nerd-setup-force:
	docker-compose exec app flask setup --drop
up:
	cd ui && yarn build
	docker-compose up --build -d
	docker-compose exec app flask setup
down:
	docker-compose down --volumes --rmi local --remove-orphans

.PHONY: start stop nerd-setup nerd-setup-force up down
