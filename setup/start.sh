#!/usr/bin/env bash
# Start the portable PostgreSQL 17.6 cluster for Grafidu local debugging.
# Database: grafidu_admin_database @ 127.0.0.1:5432 (trust auth, no password).
# Binaries + data live in ~/pgportable (NOT a system service — run after reboot).
# Safe to run repeatedly: exits early if the server is already up.
pg_isready -h 127.0.0.1 -p 5432 >/dev/null 2>&1 && { echo "PostgreSQL already running."; exit 0; }

export LD_LIBRARY_PATH="$HOME/pgportable/pgbin/lib"
exec "$HOME/pgportable/pgbin/bin/pg_ctl" \
  -D "$HOME/pgportable/data" \
  -l "$HOME/pgportable/server.log" \
  -o "-p 5432 -c listen_addresses=127.0.0.1" \
  -w start
