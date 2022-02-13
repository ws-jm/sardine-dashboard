# Sardine Dashboard

Codebase for sardine dashboard

## Development without docker

### NODE

We use `volta` to manage `node` and `npm` version. Install [volta](https://docs.volta.sh/guide/getting-started). After installing, re-open your terminal. Volta will take care of handling required `npm`, and `node` version from now

### Google cloud

- Install gloud CLI SDK https://cloud.google.com/sdk/docs/install
- Execute `gcloud auth application-default login` to login to GCP if you have not, this will give you default credentials file
  on your local.
- Now do `gcloud config set project indigo-computer-272415`
- Then `gcloud auth login`
- To verify if logged in to gcp do `gcloud auth list`

### ENV variables

Add env variables to your profile file (`~/.bash_profile`, `~/.zshrc`, `~/.profile`, or `~/.bashrc`)

```
export GOOGLE_APPLICATION_CREDENTIALS="<path-to-your-service-account>"
export GOOGLE_CLOUD_PROJECT="indigo-computer-272415"
```

### Install dependencies and Link shared package

To install all dependencies, and link the shared `shared` package, from root run

```bash
  sh install.sh
```

### Database setup

If you install Postgresql from Homebrew then you need to create `postgresql` role.

```
/usr/local/opt/postgres/bin/createuser -s postgres
```

You must have postgres server running on localhost:5432
with root user postgres and db postgres. Run following command for one time setup of database

```bash
  sh scripts/setup-db.sh
```

Running migrations

```bash
  cd server && npm run migrate_up_all
```

Manually insert seed data

```
INSERT INTO "public"."superadmin_emails" ("id", "email") VALUES
(1, '<your email>');
INSERT INTO "public"."organisation" ("display_name",  "created_at", "client_id") VALUES
('demo.dev.sardine.ai', now(), 'e149f2c5-4fce-4aef-98fd-90967c6aef5d');
```

To start the development server using concurrently

```bash
  node start-services.js
```

### Connect to proxy servers for local development

You need to set the environment variable `AUTH_SERVICE_ENDPOINT` and `RULE_ENGINE_ENDPOINT` unless you use the auth service and the rule engine service running in your local machine.

Create `local.json` under `./server/config` with this contents:

```
{
  "AUTH_SERVICE_ENDPOINT": "http://34.70.12.90:9000",
  "RULE_ENGINE_ENDPOINT": "http://34.70.12.90:9100"
}
```

If you want to connect to your own Auth service, or Rule service instance, remove the according field in the `local.json` file. Environment variables defined in `./server/config/default.json` are used.

If you are interested in our auth service, please take a look at [sardine-all/auth-service](https://github.com/sardine-ai/sardine-all/tree/master/src/go/cmd/auth-service).

The environment variables are managed by [node-config](https://github.com/lorenwest/node-config).

### Setup above proxy servers (in case they are down)

Above proxy server is running in our GCP project. If it's down for whatever reason, ask someone with GCP project access to do below:

```
# SSH into remote server
gcloud compute ssh --zone "us-central1-a" "giact-staging" --project "indigo-computer-272415"

# In SSH session, check if any screen session is there (expect empty)
screen -ls

# Create new screen session
screen -S authservice-proxy

# Start proxy (once proxy starts, use ctrl+a&d to detach)
mitmdump -p 9000 --set block_global=false --mode reverse:http://as.auth-service-forwarding-rule.il4.us-central1.lb.indigo-computer-272415.internal

# Do same for rules engine
screen -S rules-proxy
mitmdump -p 9100 --set block_global=false --mode reverse:http://re.rules-engine-forwarding-rule.il4.us-central1.lb.indigo-computer-272415.internal

# Now ctrl+a&d to detach, ctrl+d to close SSH
```

## With docker (deprecated)

You need to have docker and docker-compose installed on your system.

To build and run inside docker-container run the following command

```bash
docker-compose up --build
```
