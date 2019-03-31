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
openapi-generator generate -i http://localhost:3000/api/openapi.json -g typescript-axios -o src/trainer/apigen -c openapi_config.json
```
