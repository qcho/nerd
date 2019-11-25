# Named Entity Recognition as a service

[TOC]

## Requirements

- [docker](https://www.docker.com/)
- [docker-compose](https://docs.docker.com/compose/)
- [GNU make](https://www.gnu.org/software/make/)
- [OpenSSL cli tools](https://wiki.openssl.org/index.php/Command_Line_Utilities)

## Development environment

To create a local environment, run:

```bash
make setup
```

After that's done, you'll have all of the required containers correctly setup and _NERd_ available at `localhost:8080`.

### Making changes
When you want to do any change there are different procedures for each of the sub-projects.
#### API & Workers

Any changes done to the `app` directory will be automatically synchronized and you should see changes instantly in the back-end.

#### UI

The UI is a bit trickier due to React not using the build directory when in dev mode ([1](https://github.com/facebook/create-react-app/issues/1070)). So there are two alternatives.

##### React Build
After every change, trigger a build:

```bash
yarn build
```

This will compile de UI, which will update it within the container.

It has the advantage of requiring only a command, but the disadvantage that it has to be run for every change that you want to test.

##### Development server

When you run `yarn start`, _React_ will initialize a development server that refreshes after each change. Since the 3000 port will be used by the UI container, you'll have to use the next available port.

There's an `.env.development` file with the required variables for the UI to work.

## Deployment

### Make sure _pf-nerd_ host is well configured locally

_pf-nerd_ is the default endpoint for deployment, and since it's an SSH alias, you'll need to create it in your `~/.ssh/config`.

An example `~/.ssh/config` fragment (You need to replace `<VAR>`):

```sshconfig

Host pf-nerd-proxy
    Hostname <PROXY_URL>
    User <ITBA_USER>

Host pf-nerd
    Hostname <MACHINE_IP>
    User <MACHINE_USER>
    # Uncomment the next line to use a proxy.
    # ProxyCommand ssh pf-nerd-proxy nc %h %p
    ControlMaster auto
    ControlPath ~/.ssh/sockets/%r@%h-%p
    ControlPersist 600
```

### Docker image creation

To create new Docker images, run:

```bash
make build
```

### Docker image upload

You'll need to have the required credentials to this repository to upload new images to the GitHub package server. Once you do, run the following command:

```bash
make prod-publish-new-version
```

### Production deployment

Once you have the latest images uploaded (or if you are initializing a new server), run:

```bash
make prod-setup
```

Once this command finishes, you'll have the server configured with a full instance of _NERd_.

### One-command deploy

If you want to do everything using a single command, run:

```bash
make build prod-publish-new-version prod-setup
```
