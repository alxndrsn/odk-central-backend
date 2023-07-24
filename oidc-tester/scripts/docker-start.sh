#!/bin/bash -eu

log() {
  echo "[oidc-tester] $*"
}

log "Configuring DNS..."
# N.B. configuring DNS is done at runtime because Docker prevents write access before then.
echo '127.0.0.1 fake-oidc-server.example.net' >> /etc/hosts
echo '127.0.0.1      odk-central.example.org' >> /etc/hosts

log "DNS configured."

log "Waiting for postgres to start..."
./scripts/wait-for-it.sh odk-central-oidc-tester-postgres:5432 --strict --timeout=60 -- echo '[oidc-tester] postgres is UP!'

log "Starting services..."
(cd fake-oidc-server && node index.js) &
(cd .. && make base && NODE_TLS_REJECT_UNAUTHORIZED=0 node lib/bin/run-server.js) &

log "Waiting for odk-central-backend to start..."
./scripts/wait-for-it.sh localhost:8383 --strict --timeout=60 -- echo '[oidc-tester] odk-central-backend is UP!'

log "Creating docker databases..."
node lib/bin/create-docker-databases.js
log "Docker databases created."

log "Running mocha tests..."
cd ..
# FIXME probably don't need NODE_CONFIG_ENV, as config comes from separate file
TEST_AUTH=oidc NODE_CONFIG_ENV=oidc-development make test-integration
cd -
log "Mocha tests passed."

# TODO update the usernames for playwright tests so they don't overlap with integration tests

log "Creating playwright test users..." # _after_ migrations have been run
cd ..
node lib/bin/cli.js --generate-password --email alice@example.com user-create
cd -
log "Playwright test users created."

log "Running playwright tests..."
cd playwright-tests
npx playwright test
log "Playwright tests passed."

log "All OIDC tests completed OK!"
