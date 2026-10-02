#!/usr/bin/env bash
# Stop the portable PostgreSQL cluster.
export LD_LIBRARY_PATH="$HOME/pgportable/pgbin/lib"
exec "$HOME/pgportable/pgbin/bin/pg_ctl" \
  -D "$HOME/pgportable/data" \
  -m fast -w stop
