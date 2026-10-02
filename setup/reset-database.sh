#!/usr/bin/env bash
# Reset the local Grafidu database back to a fresh copy of the Supabase dump
# (+ sessions migration). DESTRUCTIVE: wipes everything you changed locally.
set -e
DB_URL="postgres://postgres@127.0.0.1:5432/grafidu_admin_database"
REPO="$(cd "$(dirname "$0")/.." && pwd)"

psql "postgres://postgres@127.0.0.1:5432/postgres" \
  -c "DROP DATABASE IF EXISTS grafidu_admin_database;" \
  -c "CREATE DATABASE grafidu_admin_database;"
psql "$DB_URL" -q -f "$REPO/full-dump.sql"
psql "$DB_URL" -q -f "$REPO/postgres/migrations/001-auth.sql"
echo "Reset done. Profiles (expect 94):"
psql "$DB_URL" -At -c "SELECT count(*) FROM public.profiles;"
