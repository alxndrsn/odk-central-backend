#!/bin/bash -eu
set -o pipefail

log() { echo "[$(basename "$0")] $*"; }

log "Checking connection..."
curl -v http://localhost:8383/v1/

log "pyodk.conf.toml:"
cat pyodk.conf.toml

log "Starting python..."
exec python test.py
