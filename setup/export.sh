#!/usr/bin/env bash
# Export the local Grafidu database to a .sql file that restores cleanly on a
# FRESH database (roles prelude + schema + data), e.g. on a teammate's machine:
#   psql -U postgres -d grafidu_admin_database -f <file>
# Default output: setup/exports/grafidu-export-<timestamp>.sql
# PRIVACY: the file contains user data + password hashes — private repos only.
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$DIR/exports"
OUT="${1:-$DIR/exports/grafidu-export-$(date +%Y%m%d-%H%M%S).sql}"

{ cat "$DIR/roles-prelude.sql"; echo; echo "-- ==== database dump ==== "; \
  pg_dump "postgres://postgres@127.0.0.1:5432/grafidu_admin_database" \
    --format=plain --no-owner --clean --if-exists; } > "$OUT"

echo "Exported to: $OUT ($(du -h "$OUT" | cut -f1))"
echo "Privacy reminder: contains user data — private repository only."
