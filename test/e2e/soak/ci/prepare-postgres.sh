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

log "track_activity_query_size: $(pg_exec 'SHOW track_activity_query_size')"
pg_exec "ALTER SYSTEM SET track_activity_query_size = 16384"
pgImg="$(docker ps -q --filter name=postgres)"

# Postgres must be restarted to apply change to track_activity_query_size
# See: https://www.postgresql.org/docs/14/runtime-config-statistics.html#GUC-TRACK-ACTIVITY-QUERY-SIZE
log "Restarting postgres..."
docker restart "$pgImg"
timeout 10 bash -c "while ! docker exec $pgImg pg_isready --timeout=1; do sleep 1; done"
log "Restarted OK."

finalQuerySize="$(pg_exec 'SHOW track_activity_query_size')"
log "track_activity_query_size: $finalQuerySize"

expectedFinalQuerySize=16kb
if [[ $finalQuerySize != $expectedFinalQuerySize ]]; then
  log "!!!"
  log "!!! Failed to set final query size."
  log "!!!"
  log "!!!   expected: $expectedFinalQuerySize"
  log "!!!     actual: $finalQuerySize"
  log "!!!"
  exit 1
fi

log "DONE."

exit 1
