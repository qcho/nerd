# Named entity recognition as a service

## Service

See related [README](app/README.md)

## UI

See related [README](ui/README.md)

## Auto-generated API lib

See related [README](apilib/README.md)

## Some deploy notes

How to export image into remote server:
```sh
    docker save nerd/app:latest | gzip > nerd_app.tar.gz
```

Transfer files:
```sh
scp -r docker pf-ner:nerd/
scp -r ui/build pf-ner:nerd/ui/
scp docker-compose* pf-ner:nerd/
scp .env.production pf-ner:nerd/.env
scp Makefile pf-ner:nerd/
scp nerd_app.tar.gz pf-ner:nerd/
```

How to import image in remote sever:
```sh
    zcat nerd_app.tar.gz | docker load
```
