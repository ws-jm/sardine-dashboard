#!/usr/bin/env bash
set +e

source ./scripts/config

psql -h localhost -U postgres -f pgsql/db.pgsql
psql -h localhost -U postgres -f pgsql/grant.pgsql
