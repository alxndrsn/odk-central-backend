#!/bin/bash -eu
set -o pipefail

log() { echo >&2 "[test/e2e/soak/$(basename "$0")] $*"; }

fail_job() {
  log 'Job failed.'
  exit 1
}

pg_exec() {
  [[ $# = 1 ]] || fail_job
  PGPASSWORD=odktest psql \
      --host=localhost \
      --username=postgres \
      --quiet \
      --tuples-only \
      --command="$1"
}

log "Increasing query log lengths..."

log "  track_activity_query_size: $(pg_exec 'SHOW track_activity_query_size')"
pg_exec "ALTER SYSTEM SET track_activity_query_size = 16384"
pgImg="$(docker ps -q --filter name=postgres)"

log "  restarting service..."
docker restart "$pgImg"
timeout 10 bash -c "while ! docker exec $pgImg pg_isready --timeout=1; do sleep 1; done"
log "  restarted OK."

log "  track_activity_query_size: $(pg_exec 'SHOW track_activity_query_size')"
log "  DONE."

exit 1
