--
-- Grafidu: full database dump from Supabase (project jjtwrsygezwvogkbihfy)
-- Generated 2026-10-02 with pg_dump 18.6 from PostgreSQL 17.6 (via session pooler).
--
-- Contents:
--   1. Supabase roles referenced by grants/RLS (anon, authenticated, service_role, ...)
--   2. Guarded auth bootstrap: auth schema + auth.users table + auth.uid()/role()/jwt()/email()
--      compatibility functions reading request.jwt.claims
--   3. The 94 auth users (INSERTs; run on an empty auth.users)
--   4. Full public schema: tables, indexes, constraints, functions, triggers, RLS policies + ALL data
--
-- Restore into your own Postgres (run as superuser / database owner):
--   createdb grafidu && psql -d grafidu -f full-dump.sql
-- psql continues past non-fatal errors by default; check output for "ERROR".
--
-- Note for vanilla Postgres: RLS policies call auth.role()/auth.uid(), which read
-- request.jwt.claims — set it per request/transaction from your API layer, e.g.:
--   SET LOCAL request.jwt.claims = '{"sub":"<uuid>","role":"authenticated"}';
-- On self-hosted Supabase those functions already exist and are NOT touched.
--

SET check_function_bodies = off;
DO $role$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'dashboard_user') THEN
    CREATE ROLE dashboard_user NOSUPERUSER CREATEDB CREATEROLE INHERIT NOLOGIN REPLICATION NOBYPASSRLS;
  END IF;
END $role$;
DO $role$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT NOLOGIN NOREPLICATION NOBYPASSRLS;
  END IF;
END $role$;
DO $role$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT NOLOGIN NOREPLICATION NOBYPASSRLS;
  END IF;
END $role$;
DO $role$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT NOLOGIN NOREPLICATION BYPASSRLS;
  END IF;
END $role$;
DO $role$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_admin') THEN
    CREATE ROLE supabase_admin SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN REPLICATION BYPASSRLS;
  END IF;
END $role$;
DO $role$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT LOGIN NOREPLICATION NOBYPASSRLS;
  END IF;
END $role$;
-- PostgREST-style role memberships (harmless on vanilla Postgres)
GRANT anon, authenticated, service_role TO authenticator;
