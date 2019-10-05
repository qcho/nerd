# https://medium.com/capital-one-tech/multi-stage-builds-and-dockerfile-b5866d9e2f84

# Copies in our code and runs NPM Install
FROM bitnami/node:10 as installer
COPY package.json yarn.lock /app/
WORKDIR /app
# limit network-concurrency until https://github.com/yarnpkg/yarn/issues/2629 is fixed
RUN ["yarn", "install", "--production", "--network-concurrency=1"]

# Build Code
FROM bitnami/node:10 as builder
COPY --from=installer /app /app
COPY . /app
WORKDIR /app
RUN ["yarn", "build"]

# Starts and Serves Web Page
FROM bitnami/nginx:1.16
COPY --from=builder /app/build /app
COPY ./docker/nginx/nerd.conf /opt/bitnami/nginx/conf/server_blocks/nerd.conf
