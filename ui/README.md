# Named entities recognition UI

## Requirements

- [Yarn](https://yarnpkg.com/)
- [OpenAPI generator](https://openapi-generator.tech/)

## Getting started

```bash
yarn install
```

## Running the UI

```bash
yarn start
```

## Update generated API

```bash
openapi-generator generate -i http://127.0.0.1:5000/api/openapi.json -g typescript-axios -o src/trainer/apigen
```
