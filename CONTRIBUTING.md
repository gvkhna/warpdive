# Setup/Install

```sh
asdf plugin add nodejs
asdf plugin add pnpm
asdf plugin add protoc
asdf install

pnpm i
```

## Compile protos

```sh
pnpm proto
```

## Run Storybook

```sh
pnpm storybook
```

### Local Database Setup

```sh
pnpm db:create # create local sqlite db in .wrangler/
pnpm db:generate # create schemas/migrations as needed
pnpm db:migrate # run migrations on local sqlite db
pnpm db:seed # create a test user

pnpm db:destroy # reset local sqlite db
pnpm db:open # open/use DB Browser for sqlite
```

### Localtunnel development for webhooks

```sh
# Install localtunnel
pnpx localtunnel --port PORT_TO_PROXY || 8000
```

### Run proxy to server

```sh
# NOTE: Change env PUBLIC_SERVER_HOSTNAME to http://localhost:3001
mitmproxy -p 3001 --mode reverse:http://localhost:3000
mitmproxy -p 3001 --mode reverse:http://localhost:3000 --modify-headers /~q/Host/192.168.1.5.xip.io:3001
```
