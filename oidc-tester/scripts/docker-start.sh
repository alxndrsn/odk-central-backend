#!/bin/bash -eu

log() {
  echo "[oidc-tester] $*"
}

log "---------- CERTS ---------"
ls /odk-central-backend/certs
log "--------------------------"

log "Configuring DNS..."
# N.B. configuring DNS is done at runtime because Docker prevents write access before then.
echo '127.0.0.1 fake-oidc-server.example.net' >> /etc/hosts
echo '127.0.0.1      odk-central.example.org' >> /etc/hosts

log "DNS configured."

log "Starting services..."
#npx nf start
npx nf start &

# install playwright deps here, because it doesn't work at docker build-time
log "Installing playwright deps..."
#npx playwright install --with-deps
log "Playwright deps installed."

./scripts/wait-for-it.sh localhost:8383 --strict --timeout=60 -- echo '[oidc-tester] odk-central-backend is UP!'

log "Running playwright tests..."
npx playwright test oidc.spec.js
log "Tests completed OK!"
