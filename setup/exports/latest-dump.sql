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

-- ==== database dump (auto-export saat dev exit) ====
--
-- PostgreSQL database dump
--

\restrict dvzTt5hBTZvWgA2umgJPwBXNFioy8LuHNFDI9332g3bcJrPQ9GQrU1n2Ti9TuR2

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP POLICY IF EXISTS "update own status" ON public.task_statuses;
DROP POLICY IF EXISTS "update own profile" ON public.profiles;
DROP POLICY IF EXISTS "read teachers basic info" ON public.profiles;
DROP POLICY IF EXISTS "read own profile" ON public.profiles;
DROP POLICY IF EXISTS "own todos" ON public.todos;
DROP POLICY IF EXISTS "own chat" ON public.chat_messages;
DROP POLICY IF EXISTS "insert own status" ON public.task_statuses;
DROP POLICY IF EXISTS "insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "authenticated write" ON public.teachings;
DROP POLICY IF EXISTS "authenticated write" ON public.tasks;
DROP POLICY IF EXISTS "authenticated write" ON public.quizzes;
DROP POLICY IF EXISTS "authenticated write" ON public.quiz_questions;
DROP POLICY IF EXISTS "authenticated write" ON public.materials;
DROP POLICY IF EXISTS "authenticated write" ON public.grades;
DROP POLICY IF EXISTS "authenticated write" ON public.enrollments;
DROP POLICY IF EXISTS "authenticated write" ON public.classes;
DROP POLICY IF EXISTS "authenticated write" ON public.announcements;
DROP POLICY IF EXISTS "authenticated read" ON public.teachings;
DROP POLICY IF EXISTS "authenticated read" ON public.tasks;
DROP POLICY IF EXISTS "authenticated read" ON public.task_statuses;
DROP POLICY IF EXISTS "authenticated read" ON public.quizzes;
DROP POLICY IF EXISTS "authenticated read" ON public.quiz_questions;
DROP POLICY IF EXISTS "authenticated read" ON public.materials;
DROP POLICY IF EXISTS "authenticated read" ON public.grades;
DROP POLICY IF EXISTS "authenticated read" ON public.enrollments;
DROP POLICY IF EXISTS "authenticated read" ON public.classes;
DROP POLICY IF EXISTS "authenticated read" ON public.announcements;
DROP POLICY IF EXISTS "admin write" ON public.teachings;
DROP POLICY IF EXISTS "admin write" ON public.enrollments;
DROP POLICY IF EXISTS "admin write" ON public.classes;
DROP POLICY IF EXISTS "admin update profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin insert profiles" ON public.profiles;
ALTER TABLE IF EXISTS ONLY public.todos DROP CONSTRAINT IF EXISTS todos_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.teachings DROP CONSTRAINT IF EXISTS teachings_teacher_id_fkey;
ALTER TABLE IF EXISTS ONLY public.teachings DROP CONSTRAINT IF EXISTS teachings_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_statuses DROP CONSTRAINT IF EXISTS task_statuses_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_statuses DROP CONSTRAINT IF EXISTS task_statuses_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.quizzes DROP CONSTRAINT IF EXISTS quizzes_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.quizzes DROP CONSTRAINT IF EXISTS quizzes_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_quiz_id_fkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS ONLY public.materials DROP CONSTRAINT IF EXISTS materials_teacher_id_fkey;
ALTER TABLE IF EXISTS ONLY public.materials DROP CONSTRAINT IF EXISTS materials_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.grades DROP CONSTRAINT IF EXISTS grades_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.grades DROP CONSTRAINT IF EXISTS grades_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.grades DROP CONSTRAINT IF EXISTS grades_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.enrollments DROP CONSTRAINT IF EXISTS enrollments_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.enrollments DROP CONSTRAINT IF EXISTS enrollments_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_class_id_fkey;
DROP INDEX IF EXISTS public.todos_user_id_idx;
DROP INDEX IF EXISTS public.teachings_class_id_idx;
DROP INDEX IF EXISTS public.tasks_due_at_idx;
DROP INDEX IF EXISTS public.tasks_class_id_idx;
DROP INDEX IF EXISTS public.task_statuses_task_id_idx;
DROP INDEX IF EXISTS public.task_statuses_student_id_idx;
DROP INDEX IF EXISTS public.sessions_user_id_idx;
DROP INDEX IF EXISTS public.sessions_expires_at_idx;
DROP INDEX IF EXISTS public.materials_class_id_idx;
DROP INDEX IF EXISTS public.grades_task_id_idx;
DROP INDEX IF EXISTS public.grades_student_id_idx;
DROP INDEX IF EXISTS public.grades_class_id_idx;
DROP INDEX IF EXISTS public.enrollments_student_id_idx;
DROP INDEX IF EXISTS public.enrollments_class_id_idx;
DROP INDEX IF EXISTS public.classes_ordinal_idx;
DROP INDEX IF EXISTS public.announcements_created_at_idx;
DROP INDEX IF EXISTS public.announcements_class_id_idx;
ALTER TABLE IF EXISTS ONLY public.todos DROP CONSTRAINT IF EXISTS todos_pkey;
ALTER TABLE IF EXISTS ONLY public.teachings DROP CONSTRAINT IF EXISTS teachings_pkey;
ALTER TABLE IF EXISTS ONLY public.teachings DROP CONSTRAINT IF EXISTS teachings_class_id_teacher_id_subject_key;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_class_id_position_key;
ALTER TABLE IF EXISTS ONLY public.task_statuses DROP CONSTRAINT IF EXISTS task_statuses_task_id_student_id_key;
ALTER TABLE IF EXISTS ONLY public.task_statuses DROP CONSTRAINT IF EXISTS task_statuses_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_token_hash_key;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.quizzes DROP CONSTRAINT IF EXISTS quizzes_pkey;
ALTER TABLE IF EXISTS ONLY public.quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_pkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
ALTER TABLE IF EXISTS ONLY public.materials DROP CONSTRAINT IF EXISTS materials_pkey;
ALTER TABLE IF EXISTS ONLY public.materials DROP CONSTRAINT IF EXISTS materials_class_id_position_key;
ALTER TABLE IF EXISTS ONLY public.grades DROP CONSTRAINT IF EXISTS grades_task_id_student_id_key;
ALTER TABLE IF EXISTS ONLY public.grades DROP CONSTRAINT IF EXISTS grades_pkey;
ALTER TABLE IF EXISTS ONLY public.enrollments DROP CONSTRAINT IF EXISTS enrollments_pkey;
ALTER TABLE IF EXISTS ONLY public.enrollments DROP CONSTRAINT IF EXISTS enrollments_class_id_student_id_key;
ALTER TABLE IF EXISTS ONLY public.classes DROP CONSTRAINT IF EXISTS classes_pkey;
ALTER TABLE IF EXISTS ONLY public.classes DROP CONSTRAINT IF EXISTS classes_name_key;
ALTER TABLE IF EXISTS ONLY public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_pkey;
DROP TABLE IF EXISTS public.todos;
DROP TABLE IF EXISTS public.teachings;
DROP TABLE IF EXISTS public.tasks;
DROP TABLE IF EXISTS public.task_statuses;
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.quizzes;
DROP TABLE IF EXISTS public.quiz_questions;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.materials;
DROP TABLE IF EXISTS public.grades;
DROP TABLE IF EXISTS public.enrollments;
DROP TABLE IF EXISTS public.classes;
DROP TABLE IF EXISTS public.chat_messages;
DROP TABLE IF EXISTS public.announcements;
DROP TABLE IF EXISTS auth.users;
DROP FUNCTION IF EXISTS public.verify_profile_login(p_email text, p_password text);
DROP FUNCTION IF EXISTS public.app_role();
DROP FUNCTION IF EXISTS extensions.set_graphql_placeholder();
DROP FUNCTION IF EXISTS extensions.pgrst_drop_watch();
DROP FUNCTION IF EXISTS extensions.pgrst_ddl_watch();
DROP FUNCTION IF EXISTS extensions.grant_pg_net_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_graphql_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_cron_access();
DROP FUNCTION IF EXISTS auth.uid();
DROP FUNCTION IF EXISTS auth.role();
DROP FUNCTION IF EXISTS auth.jwt();
DROP FUNCTION IF EXISTS auth.email();
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS pgcrypto;
DROP EXTENSION IF EXISTS pg_stat_statements;
DROP SCHEMA IF EXISTS extensions;
DROP SCHEMA IF EXISTS auth;
--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    RETURN COALESCE(NULLIF(current_setting('request.jwt.claim.email'::text, true), ''::text), ((NULLIF(current_setting('request.jwt.claims'::text, true), ''::text))::jsonb ->> 'email'::text));


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    RETURN COALESCE((NULLIF(current_setting('request.jwt.claims'::text, true), ''::text))::jsonb, '{}'::jsonb);


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    RETURN COALESCE(NULLIF(current_setting('request.jwt.claim.role'::text, true), ''::text), ((NULLIF(current_setting('request.jwt.claims'::text, true), ''::text))::jsonb ->> 'role'::text), 'anon'::text);


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    RETURN COALESCE((NULLIF(current_setting('request.jwt.claim.sub'::text, true), ''::text))::uuid, (((NULLIF(current_setting('request.jwt.claims'::text, true), ''::text))::jsonb ->> 'sub'::text))::uuid);


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
    revoke trigger on cron.job_run_details from postgres;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $_$
begin
    if not exists (
        select 1
        from pg_catalog.pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8.0', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
            set search_path to ''
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: app_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.app_role() RETURNS text
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select role from profiles where id = auth.uid()
$$;


--
-- Name: verify_profile_login(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.verify_profile_login(p_email text, p_password text) RETURNS TABLE(id uuid, email text, name text, role text, class_name text)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $$
  select p.id, p.email, p.name, p.role, p.class_name
  from profiles p
  where p.email = p_email
    and p.password is not null
    and crypt(p_password, p.password) = p.password;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    body text DEFAULT ''::text NOT NULL,
    class_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    text text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chat_messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'ai'::text])))
);


--
-- Name: classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    ordinal integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    student_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: grades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid,
    task_id uuid,
    student_id uuid NOT NULL,
    subject text NOT NULL,
    kind text DEFAULT 'Ulangan'::text NOT NULL,
    score integer NOT NULL,
    grade_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT grades_score_check CHECK (((score >= 0) AND (score <= 100)))
);


--
-- Name: materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.materials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    teacher_id uuid,
    class_id uuid NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    attachments text[] DEFAULT '{}'::text[] NOT NULL,
    pages integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    class_name text,
    avatar text DEFAULT '/assets/logo.png'::text,
    created_at timestamp with time zone DEFAULT now(),
    phone text,
    subject text,
    is_active boolean DEFAULT true NOT NULL,
    must_change_password boolean DEFAULT false NOT NULL,
    CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['student'::text, 'teacher'::text, 'admin'::text])))
);


--
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quiz_id uuid NOT NULL,
    idx integer NOT NULL,
    text text NOT NULL
);


--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quizzes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    created_by uuid,
    title text NOT NULL,
    topic text DEFAULT ''::text NOT NULL,
    difficulty text DEFAULT 'Sedang'::text NOT NULL,
    num_questions integer DEFAULT 10 NOT NULL,
    duration_min integer DEFAULT 20 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '30 days'::interval) NOT NULL
);


--
-- Name: task_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_statuses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    student_id uuid NOT NULL,
    done boolean DEFAULT false NOT NULL,
    submitted_at timestamp with time zone,
    grade integer,
    feedback text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT task_statuses_grade_check CHECK (((grade IS NULL) OR ((grade >= 0) AND (grade <= 100))))
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    created_by uuid,
    title text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    subject text DEFAULT 'Umum'::text NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL,
    due_at timestamp with time zone NOT NULL,
    is_completed boolean DEFAULT false NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: teachings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teachings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    subject text NOT NULL,
    kkm integer DEFAULT 80 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: todos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.todos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    subtitle text DEFAULT ''::text NOT NULL,
    done boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	9acbd82f-a01f-4c34-8b5f-c5be2c78d93c	authenticated	authenticated	murid.7.xirplb@grafidu.sch.id	$2a$06$XoWpzSrvE4/nrK7kb0OES.FWjiXI2I2Y9Nrxx37T1dr6y7O2XgZF2	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a236ca06-aae8-4a64-93a5-e136c4e68f5f	authenticated	authenticated	murid.8.xirplb@grafidu.sch.id	$2a$06$rs/WyTFfrS6bXn4AopC7kumpVSCPsf1kNd8Qqe0Y2GjOGKKAOHwfG	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	f0dbdfd0-b746-4b07-9092-e08eae1bcf74	authenticated	authenticated	murid.9.xirplb@grafidu.sch.id	$2a$06$yNG.KWiXgf83zIB0g/.Tme3lLTvI7B/Zi8XuiWECJ9NuMEOMoxQUO	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	9cf6960e-7856-4931-8867-a9baa12a13f7	authenticated	authenticated	murid.10.xirplb@grafidu.sch.id	$2a$06$RvtsFiW4OISAsKhHcnmM4uyMpKMmg.zJrob1af8wDHcOmidlYJ06G	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	8aac3f26-ee8d-41df-823f-ac3e1873dd9f	authenticated	authenticated	murid.11.xirplb@grafidu.sch.id	$2a$06$/sQAprFKgXkQKutwl4mDxenyVpQrx8HhRmYmueJA/u8S3orVumQ8C	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7bbcadb5-c73a-444e-a09b-ab8187e35f9e	authenticated	authenticated	murid.12.xirplb@grafidu.sch.id	$2a$06$JII39Tt.txoFLgMY5/C9CORK2DWEy4AMdLP0Om6xU6b/tjzZ/igEG	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	da602c03-1b20-478c-a81d-fa111ce71e41	authenticated	authenticated	murid.13.xirplb@grafidu.sch.id	$2a$06$znZmgUFobqmRv4sWOIgCqutM09slvg6zE36sG3pgVJsC1X45/LOLm	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	1a976f86-c615-4406-8336-2434ed269014	authenticated	authenticated	murid.14.xirplb@grafidu.sch.id	$2a$06$CliPfFMTQB8D/iQPSkWSK.RJcPInUULA1Fs8y7xvPQ5rHBiwyP5Xy	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	dd562628-fd47-4b90-989c-ac6df5ad7e03	authenticated	authenticated	murid.15.xirplb@grafidu.sch.id	$2a$06$oA1asj5Kl51Wj2Lk0pd1k.mGvh05dwyjbCYLhLUPRSbJs0u67KduS	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	bfe4f4a1-7d19-4f81-9122-f7b4299cc285	authenticated	authenticated	murid.16.xirplb@grafidu.sch.id	$2a$06$qucQJ6PLqNt0C9D9NdF.7eXImRVj/PVHQ8W6Cq/hle3nUcZGk71Bm	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	04b3bcf9-3367-46a4-9a78-a92696e4ef8e	authenticated	authenticated	murid.17.xirplb@grafidu.sch.id	$2a$06$r266SLvEh6HAB3VCJr6bvu83bl7PgzfmmkkY0dNzHlJ5zHeVZuOi2	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	467a114f-d73f-4556-89c2-3c794e1aaecd	authenticated	authenticated	murid.18.xirplb@grafidu.sch.id	$2a$06$qEsZWWu4s3lZILd/C53TvOI9gt6I2JW42CdaNPg6qdvu9WWa6LXl2	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	ac155231-ae3d-4d88-9394-8883411cf7d8	authenticated	authenticated	murid.19.xirplb@grafidu.sch.id	$2a$06$W0l4QACcpPk9GkbSZNuKdu744cCxukNyUXAklm7nqrpvQibtJTaxS	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	e6f10eeb-feee-41dd-8429-c8a938bee48e	authenticated	authenticated	murid.20.xirplb@grafidu.sch.id	$2a$06$ZWVGIiThQh0Ajnh05JFKVuWtSZh/ZElyiVjeAyosNJ/OHexXzcsf.	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	442d2d6b-e9a4-4088-8089-8029475879e7	authenticated	authenticated	murid.21.xirplb@grafidu.sch.id	$2a$06$J5QEN7uqXeoAbaw7Q/7Bt.Jl61PGzfou5s./sZiSuHjhPuLF7zGoW	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	5e0a6ea9-3634-4320-b0b1-00bf441cfe00	authenticated	authenticated	murid.22.xirplb@grafidu.sch.id	$2a$06$mnl7nVA7S26ATxpiUjTt3.2F3rwoQ0JaKsH6uwTFuWZbZtLnzuEVC	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	9bc5b210-8492-4e5d-9121-232f65386b56	authenticated	authenticated	murid.23.xirplb@grafidu.sch.id	$2a$06$GMT89hqaaJ8eiQkYGnw7I.qncUHEtTpUJUoOgin5/mKWbrD0ILuZi	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	85218733-c612-4e63-a65e-3ae32b0aa97f	authenticated	authenticated	murid.24.xirplb@grafidu.sch.id	$2a$06$/Wh.vJ6SUpmHXYpeo0f/Jeg3i6E7q.vj.b48AqO7Re0Z.GrXu1x16	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	ee28358b-4356-4dd3-97e8-dbc37b9fdfc4	authenticated	authenticated	murid.25.xirplb@grafidu.sch.id	$2a$06$noKIBAyDYbuAFmfDPw6pfORrPOeyKRGh9qTc7B9soQtYILuKkThKe	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7a5626af-1767-418b-a3eb-5a20813c0929	authenticated	authenticated	murid.26.xirplb@grafidu.sch.id	$2a$06$G6xBE5.WqnAuS6KA7CBUj.PjB7mrk/5a0HaJNHqC/.XJ/JK17/BPC	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	bdf6187d-5f04-4e52-864b-1aa87a1c143e	authenticated	authenticated	murid.27.xirplb@grafidu.sch.id	$2a$06$mc.nVcSamr6RJySQU3xYgOqfyzOyt1UjWQlpmjO1FI83fwnkoPLHe	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	0bb8f393-2636-440b-b43b-4de3bcd82948	authenticated	authenticated	murid.28.xirplb@grafidu.sch.id	$2a$06$GmZaQ4J/oF26TbVnrTVUAuOLl4sowvxSFgLXKpSIdSCLqTp0JOmr2	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	c42245cd-a62f-4bea-ad7f-a6dae57523b6	authenticated	authenticated	murid.29.xirplb@grafidu.sch.id	$2a$06$KqWyfPqJ6l4ONmGyyfp3auJo9qjYlSmQpD8OvhSBPMp8rHjMCeb0u	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	697f7343-9a12-4697-bd7b-4c3cfdb5e6ec	authenticated	authenticated	murid.30.xirplb@grafidu.sch.id	$2a$06$.jw8er78qwuWuLPwX6SOFezXQIm/uqosb0UVbn.kXwkLZgHEE0V5y	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a9268624-4bc4-417a-a54f-0d41aae287d6	authenticated	authenticated	murid.31.xirplb@grafidu.sch.id	$2a$06$dxetL.PlMoStx2PQ7xkIz.DmI5kwKINwZ73AkMez5gzxyWIp.j9x.	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	e8a2af47-703b-4b88-9ff9-7b068c21ddcd	authenticated	authenticated	murid.32.xirplb@grafidu.sch.id	$2a$06$CW29st7zrZtd32FqGehAGuHTP7E9c6AJbWTJlM0UsLAFVvhvFAFla	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	ed3b4cce-daa5-4e27-9fd2-6b832e7054c9	authenticated	authenticated	murid.1.xidkva@grafidu.sch.id	$2a$06$sV8kwvttsrCGM2KrEL9vgu.5TeKlAD7jpMGwDc.EntmS9CcQLo./y	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	88fd97ba-e199-455d-83fa-c4dcac822686	authenticated	authenticated	murid.2.xidkva@grafidu.sch.id	$2a$06$qAHwAcIX6EysI7NZaIfhX.9f47oWV8br8dsgMyTQXIGVtTXj94IKm	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7e190946-84bf-4bb9-aab8-3017aceadf8b	authenticated	authenticated	murid.3.xidkva@grafidu.sch.id	$2a$06$C02BSi81uWZ1RSIoQOy/reKqzmf6WioK2rSogK6ghGa2I9FeVayhO	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	01d91d18-37ec-4517-b0d2-05923352e9bf	authenticated	authenticated	murid.4.xidkva@grafidu.sch.id	$2a$06$6TkHYjgIYmlQ2RrwWId0kOqtn4B6UFJMJZAymg5zXaevjaLMiy9TG	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	31a15f56-7f31-4de6-a428-1cc6c70e5a8c	authenticated	authenticated	murid.5.xidkva@grafidu.sch.id	$2a$06$kr1DtTf.0BjBciqwVUAL7OLV8IYTOf1dqNIMeEGeyCOESMGFe1P3q	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	944a7447-9e99-4a05-9bd4-39b2be336882	authenticated	authenticated	murid.6.xidkva@grafidu.sch.id	$2a$06$vjtG3.jKWpwlbQQdZr73we94X/.aZ43/TIumY09m.zJFiZfNhLn9i	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	3ba48f01-b327-42ed-ad64-17622eee6b82	authenticated	authenticated	murid.7.xidkva@grafidu.sch.id	$2a$06$EYyg6BAUj4VFzHu7.lDDWedNhft4OXIsBDdAz9VVtMguVeZwJAdJ2	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	9766e933-d64c-4392-b264-9138df2283f1	authenticated	authenticated	murid.8.xidkva@grafidu.sch.id	$2a$06$wj5MaHFrmxk5A0qlPDJpyOo6t/aCLAkVvhY9Lr7XJxqFNUn8CneV2	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	618aa1fd-091b-4964-970d-a00876873de6	authenticated	authenticated	murid.9.xidkva@grafidu.sch.id	$2a$06$.WTdu/GtsPiVH6fXyYRgsu1DlzpnU08y2bXT1VGxw0KdmzxdyBOqW	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	46dd3781-ff6c-4770-a347-5422a6efddfc	authenticated	authenticated	murid.10.xidkva@grafidu.sch.id	$2a$06$r/.PFilzLf9tzA.KpzIFO.hIOZXEayu1yOuILemyzFQvKl7FjfBLm	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	fb8682da-d1a6-4bcd-88ad-577ceb2b36fc	authenticated	authenticated	murid.11.xidkva@grafidu.sch.id	$2a$06$iGazGZ0W43mX4L6sNP.nHu2VF7WgC1H2G6NQvJ3cgrYnTUv5PbBLO	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	62fc1f90-7a97-4b08-b914-2f2243c75b85	authenticated	authenticated	murid.12.xidkva@grafidu.sch.id	$2a$06$xfIg.lyEa3cXNcNEnl9SGuyPwKN4xk59mWI9xO4Kk5vc5OD57lUt2	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	72be464c-986f-48a2-85df-750a393a55fc	authenticated	authenticated	murid.14.xidkva@grafidu.sch.id	$2a$06$bFZynnPChPdJnqnPSH.PGO7wtUoFaYZJL5j5IBxL.ASl7koRmp4mK	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	18751472-ccd2-4b60-8a2b-924f0624567b	authenticated	authenticated	murid.15.xidkva@grafidu.sch.id	$2a$06$clA0PGQTF2ULcZGFOfhXpOeOuR9PiP3GYv3eG3Vi6y7u8ycvkAxq6	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7f4fca69-f0f3-4bb6-9a5c-1ac1759f54cb	authenticated	authenticated	murid.16.xidkva@grafidu.sch.id	$2a$06$qQ2xINQ/kqfVCDG6rcBEtu/HuoZqUKbayy6Hl13jL0x5H1VXGZ/LS	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	43a2e079-1f15-4045-aa42-a4bfb5a2d157	authenticated	authenticated	murid.17.xidkva@grafidu.sch.id	$2a$06$u1VZsttfXpBKYzgaopJbfObLPbeRHrCpnzQgZ2Uaam/9STfksNWHK	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	991c36a6-c684-49b3-a0a2-4d4b4c06c099	authenticated	authenticated	murid.18.xidkva@grafidu.sch.id	$2a$06$679rl944NxGrocAvyVa3OeHjZ2Ww7phKufGylRyG2yhNy0vkDfvi.	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	2a1cdaa2-4010-42d9-abc0-8e02da1f7149	authenticated	authenticated	murid.19.xidkva@grafidu.sch.id	$2a$06$WsBhZc8Tr04sT3b0RqrnHuYZEPjCIVIjFxSGDWr5mdew6mWLztKrq	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	00116bb5-1856-41c2-a82b-315e292ab22c	authenticated	authenticated	murid.20.xidkva@grafidu.sch.id	$2a$06$zVVl9PrKPSb.E2FVJJsSieP48/EV28G7LyS83G38NI1w8CLt40NqW	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4a264929-a958-4e4d-a2ce-a7099421a796	authenticated	authenticated	murid.21.xidkva@grafidu.sch.id	$2a$06$y2YC0NI4rYaVIf.N18lGQu8vmCp9ah66PD2bFN.vKuf1y/z3yleum	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	dfd0f7d8-0fc4-4c66-9ee4-d6a0dd4ec6ac	authenticated	authenticated	murid.22.xidkva@grafidu.sch.id	$2a$06$8LIrePMivjCimT6LuIIZD.29r6O.1kuq.m4lNr.VuP1EwOgepyaqK	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	6b2d4026-4fea-42f2-a927-1dc77d01a582	authenticated	authenticated	murid.23.xidkva@grafidu.sch.id	$2a$06$iuxwHpSi3/c10KMUu1ZfZ.BIew38bIovhJaZqGxj5VOhnZbOivTRG	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	6f60b65d-1bcd-489f-950d-00689b104e8b	authenticated	authenticated	murid.24.xidkva@grafidu.sch.id	$2a$06$f97QZHBFlE70P9BHl.Mb1etb89N4HDwMc3pRbUKDNxaE/cxuYd3k.	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	8e2a4e02-9634-49a8-91f4-1f96f61cd43b	authenticated	authenticated	murid.25.xidkva@grafidu.sch.id	$2a$06$TnpTeCUs4YPkowUSL3rKP.rLBQDQKz8DoC7Nji8kmKT6hEG20dOHK	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	d1c4d38a-de23-4ae7-8010-b5dcec300289	authenticated	authenticated	murid.26.xidkva@grafidu.sch.id	$2a$06$6/UxC/5kIWyVKF6DPxx5M.EvdfUtT35F2ONf04CC0pcwwjUGjq0xW	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	d422fcd6-2161-410e-b1e1-7b5a616e3f19	authenticated	authenticated	murid.27.xidkva@grafidu.sch.id	$2a$06$dZRdFTaeAh.qgC3q2Hri7e.MdhRSnbFodLo2jS7k/VfalEUw9oTxe	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	47517c77-1e13-4f6b-ba0a-01f02e3ecda8	authenticated	authenticated	murid.28.xidkva@grafidu.sch.id	$2a$06$IgbyCta9GZcPKbKoNP.zC.Jrlfq5t5dhcXuiqXvPjtu8fMwhiTTq.	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	67456128-2464-4bce-9902-7a75d5e87c08	authenticated	authenticated	murid.1.xirplc@grafidu.sch.id	$2a$06$kO9p/dlQu6XBKOctO3jAtOlPhKZ4DFbn6cBsQxz6EiF17ZZ9VO0k2	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	42cfd4bb-72b9-4c65-8690-d660e92abd06	authenticated	authenticated	murid.2.xirplc@grafidu.sch.id	$2a$06$J9edAXSDZlgn94xR5pmBgOxBZQI2G52uItFiFWg1BUvjxK/QHSf8m	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	6d6f3371-c3cf-4cc4-b872-a4085445f695	authenticated	authenticated	murid.3.xirplc@grafidu.sch.id	$2a$06$6NeHJz/VBhszi4FHhaXBF.rdioTecuIo.o3RvwY4Xuc/8L9f0NEIG	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	1eff5152-2da4-48d2-852d-9f98255c0fff	authenticated	authenticated	murid.4.xirplc@grafidu.sch.id	$2a$06$6qo/p4F01jmI32lw4Ipkqua1cN6gP9Y8Af29W4XOrsFVfZhL8U4VO	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	b14bb602-7b48-428a-af9d-ef2558cbb172	authenticated	authenticated	murid.5.xirplc@grafidu.sch.id	$2a$06$jojPCi4QoAyu8k32Ult1Y.J8ZGVlKpDlX6b/cwoYuDwbKPHdUva0e	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	0c8324b1-65f1-4280-9bb0-f40a7b9091df	authenticated	authenticated	murid.7.xirplc@grafidu.sch.id	$2a$06$XvD270gOyF3IWtORJKrQ5ePsyy6JcOO3VqYifjjcuNXMoFqd53iuG	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	31aae0d7-c09f-468e-af16-b8196a72459d	authenticated	authenticated	murid.8.xirplc@grafidu.sch.id	$2a$06$avtQ6jwA9lb9fcs44Iuy7e3Cr6qXeheK5ik8FAQEHB0GUMCqeBOb.	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	144a5dd4-e014-433d-9981-892e7c3ab031	authenticated	authenticated	murid.9.xirplc@grafidu.sch.id	$2a$06$1evN4FjhPY.rTyQNFtkn7e6r82Rbr2iWREhNMC/3EvmZBPshloYkW	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	f5034142-4c02-4f83-8ad7-6b6336dd9d62	authenticated	authenticated	murid.10.xirplc@grafidu.sch.id	$2a$06$qFkETBFjUoKrCm9mqqe27uGaBkpcw2lbw/rHlTEGfy5.jnVnIBkua	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	703b9fc3-a41d-41d7-8dbb-feb71360a8cf	authenticated	authenticated	murid.11.xirplc@grafidu.sch.id	$2a$06$cPyA.yndmvzG9JyHF9aWW.N8ovaZ9eq6RoKhJ08xfvNjiaE5qqbeK	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4f6de5d7-1e98-42ee-94a8-b82745bb3118	authenticated	authenticated	murid.12.xirplc@grafidu.sch.id	$2a$06$MziCmW7ctF6evrJejej3uOR6STF7U/0b3mRZYdfIiJHG7Wrds.ijm	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	962928b8-8af1-491c-9835-7331012ad77c	authenticated	authenticated	murid.13.xirplc@grafidu.sch.id	$2a$06$iNx5vYfFRA5Y20m.8w5qfuN2cuVWW47ztM.3treLhAKtE4uqe5h5q	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	04b00742-347c-45c9-99fc-2a4cef3806fb	authenticated	authenticated	murid.14.xirplc@grafidu.sch.id	$2a$06$M7GXBUng/nKJsaTZKq1lR.rbtw8QUZB3vXIsDstWcSkTcFlb6hcou	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	2a25d9a4-7826-4397-861a-2b0df3d816a6	authenticated	authenticated	murid.15.xirplc@grafidu.sch.id	$2a$06$VBZ3z190Wc9Chr93g9KHkOisQqDwRIrPqWmwgRq5fKtmTSZV7ruge	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	cb5df4a5-8dc6-4b11-855e-7b54b823bb9a	authenticated	authenticated	murid.16.xirplc@grafidu.sch.id	$2a$06$HaIpKwTg0D74a3/Pi0q6z.K.SvJsY8ePvRXlC6l0n0Bypgxom58AW	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	faf442a3-95c4-40c3-9a5c-292d2c328f4e	authenticated	authenticated	murid.21.xirplc@grafidu.sch.id	$2a$06$93566CXmD7/YexEieJTIuuUipoEnB33bZ6yAdDpMulUq0t0gbDVkS	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	3eee6182-1bba-46e0-9146-9116a260773c	authenticated	authenticated	murid.22.xirplc@grafidu.sch.id	$2a$06$TMvclgthFBfy6CvGX64mf.LVK0KsIgX63jb9Xr.eCWQAIXPSp2Io.	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	c860ee43-a393-421f-8e98-114fc699c7e7	authenticated	authenticated	murid.23.xirplc@grafidu.sch.id	$2a$06$lJOMfospd/UrTvzNsIWYJ.GK0cK11wYOcTc5gkNJrCguD5abV41WW	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	baa0777c-7ac9-47a3-9ce8-c1fc164261e2	authenticated	authenticated	murid.24.xirplc@grafidu.sch.id	$2a$06$Y4aTGf2ZZr6ymI613xP/iO1egBjfUAr38jfwPEVqYthJ/xr7YL8cm	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a82349c8-e917-45f9-8833-e46d6094e4b7	authenticated	authenticated	murid.25.xirplc@grafidu.sch.id	$2a$06$7khcQd3SxPxAydJeOsTZNemlNQN.Xiy/6qRX7reKQhccgBebFas4C	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	27c9b5fc-e6d1-4844-8382-6e547c54c04e	authenticated	authenticated	murid.26.xirplc@grafidu.sch.id	$2a$06$wr0Yt21XKykVAAFgcRaf3eNvD2lZhgVZeDkDcW6HGXr5Z6pc4bHxW	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	aca8a385-3f53-44c3-b6a6-8998d593da2c	authenticated	authenticated	murid.27.xirplc@grafidu.sch.id	$2a$06$8ZOXAQz4PGo.ept2qJ3oPOjNuBtxiwcQ2W8gyQMLvv/9jCMToC6Ue	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	60868b7a-df6d-41ba-bac5-0e2607695eea	authenticated	authenticated	murid.20.xirplc@grafidu.sch.id	$2a$06$FXidTi2x06e.d/8fmRnaIuWBUVc7YARb2.L/WxT99g/xtY/ZpvFB2	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7a45981c-1cb1-446c-9a65-7ac0c9865e85	authenticated	authenticated	murid.28.xirplc@grafidu.sch.id	$2a$06$UrgBIg58z340bvEIWtu7vOMsyJBssz9sX7sUh2x4ndeD9i.V6NpCC	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	0ef61474-e479-4e95-a456-4780bee27050	authenticated	authenticated	murid.29.xirplc@grafidu.sch.id	$2a$06$uIFWsiLqFID7C8sNRM5tL.EPeHx7mxjmo2pQ0bdjDy9CE6uceHogK	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a90e2951-1040-45e9-a98c-3b5920fceed8	authenticated	authenticated	murid.30.xirplc@grafidu.sch.id	$2a$06$b2BOaf.i8B55D8LtHslK.OdRE4cPNhEGKPeqQHM.6gInNgbTQlNtW	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	00f37c28-c8ed-4bf2-b6a7-3126a75e0745	authenticated	authenticated	murid.13.xidkva@grafidu.sch.id	$2a$06$6NBh1/UTpnS3UvjEXS1pmOaJ913kAyUaWQxXVTLllL00xC1T7k6.K	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	2026-10-01 15:25:59.596276+07	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:25:59.642942+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4c214951-4517-4ea0-b1c7-4907cbb98ed9	authenticated	authenticated	murid.6.xirplc@grafidu.sch.id	$2a$06$hHuCKAS1/2g.7mDsIx3.KODW6jD6uZSnlWejo/wnXVxK/ViAOQwRW	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	2026-10-01 15:27:14.157801+07	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:27:14.165996+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	0a9bd9ff-16ff-4c2c-bddd-63bc4db9afe9	authenticated	authenticated	guru1@grafidu.sch.id	$2a$06$q9IGOF.LYndh8jv55NDE.e9w7Pi0YkH61NDkDv98I3myAh8JUIZKK	2026-09-28 09:16:14.083604+07	\N		\N		\N			\N	2026-10-01 16:34:33.742596+07	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-09-28 09:16:14.078167+07	2026-10-01 17:26:09.985904+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	2f0e1e72-cb41-4924-82cc-7e9e82e434bf	authenticated	authenticated	murid.1.xirplb@grafidu.sch.id	$2a$06$VQcAKXy5Y3D8cvd9ouRbu.gFZnSCHzlDeVG8Oy6u3ejKPffCvSSCi	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	11996aad-e3bc-430d-a961-0868a4cffe9c	authenticated	authenticated	murid.2.xirplb@grafidu.sch.id	$2a$06$mbbdAxr7Q/dUGEEU7tsYwe/.lBK6TgTc.2n5oMGphFuuW81EHFxzS	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	b8572d2e-1e9b-455d-9030-6891c7d52b0c	authenticated	authenticated	murid.3.xirplb@grafidu.sch.id	$2a$06$WKs.IX2yFZ9O4ARuoOEzYePeOPa01NHwiL5CxOKueLZC0gJaFlKP.	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	27c0ec69-0d28-48c3-8bbd-b3acb528ba13	authenticated	authenticated	murid.4.xirplb@grafidu.sch.id	$2a$06$r4cA/OgTBTTGyL.38iNveOJ1fwVCzYk4K7cnfHErWHxN/w9p5IV.m	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	17b1f96a-11e7-45a0-ac82-b3938767cdc6	authenticated	authenticated	murid.5.xirplb@grafidu.sch.id	$2a$06$hItnF9BZWjsueSjum2PrXezVYUHjBoD8wCWn49RgVb5n..guS43be	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	9cb1b65e-808b-40e1-9601-87556a3be27c	authenticated	authenticated	murid.6.xirplb@grafidu.sch.id	$2a$06$NIAb0j9o/rHgBLX5/GaFY..EK2TxW.RYkqE49/jBP9qOFUi7RxWi.	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	73b570f5-becc-4b5f-8597-e7e8ecb5d731	authenticated	authenticated	murid.17.xirplc@grafidu.sch.id	$2a$06$D298oDniXcavvlP04A/PrebBJ1r4SIN6rDu/zabE60ZcEP7YMnZCC	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	d2e56fc9-21ca-4b9d-9cbc-bbc731c7f109	authenticated	authenticated	murid.18.xirplc@grafidu.sch.id	$2a$06$cMLR0q3bdR2wyV1tDrkfgeK2sIlO0TFozI0RisAnDlj6S1QnWUrKi	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	fc737808-6aac-4efa-9fd3-35481131db0d	authenticated	authenticated	murid.19.xirplc@grafidu.sch.id	$2a$06$b4OEKXtdrXjUk4Wu5GHo4uoyDyHSvG2RQeiszxsUM6PI.brYyeakG	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 15:23:50.251556+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	77db7bd6-e1c5-47b4-a6bf-56af65ea21d7	authenticated	authenticated	siswa1@grafidu.sch.id	$2a$06$Rgb/WyymrJhNmz3yfQnwGOjUGqCej83S/gbiAKG3wg6CMv3UMIhhC	2026-09-28 09:15:22.485405+07	\N		\N		\N			\N	2026-10-01 16:10:27.715246+07	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-09-28 09:15:22.468524+07	2026-10-01 16:10:27.739957+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	authenticated	authenticated	admin@grafidu.sch.id	$2a$06$YrTgNmY/kDvxcH7hsepAoOaZmGQE9QS/Qmeh7qHPC/IR01owTh762	2026-10-01 14:38:54.527876+07	\N		\N		\N			\N	2026-10-01 16:34:32.650815+07	{"provider": "email", "providers": ["email"]}	{}	\N	2026-10-01 14:38:54.527876+07	2026-10-01 16:34:32.693772+07	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	e94384ff-fcf2-434a-b0e2-6c71a16e5529	authenticated	authenticated	admin1@grafidu.sch.id	$2a$06$m7tQGReseftCOL8Qg0F7WuKgd3rHynEn.54jOeye.IGShsSJ2k60W	2026-09-28 09:16:34.712837+07	\N		\N		\N			\N	2026-10-01 16:36:27.962778+07	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-09-28 09:16:34.710225+07	2026-10-01 16:45:22.572343+07	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcements (id, title, body, class_id, created_by, created_at) FROM stdin;
d15b7b25-9c7d-8a8f-b699-95d1f885a596	Ujian Akhir Semester	Akan dilaksanakan pada tanggal 10 October 2026	46a5ee71-767e-778d-e2a9-334eb0845e73	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	2026-09-29 14:00:00+07
5bdea7f3-6ff0-974c-498e-6fe68ff8acf0	Pengumpulan Tugas	Kumpulkan Tugas sebelum 1 September 2026	46a5ee71-767e-778d-e2a9-334eb0845e73	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	2026-09-27 14:00:00+07
8d47894f-4016-2f77-aa19-92fa3f981b69	Materi Baru: Teks Pidato Persuasif	Materi bab pidato persuasif sudah tersedia. Silakan unduh di halaman materi.	46a5ee71-767e-778d-e2a9-334eb0845e73	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	2026-09-22 14:00:00+07
6fdf5e37-e63e-a70d-447c-4e3dbe361b32	Ujian Akhir Semester	Akan dilaksanakan pada tanggal 10 Oktober 2026	3535d275-b4c6-9601-e4b4-b57981176c39	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	2026-09-29 14:00:00+07
b5118651-0ed2-c3bf-ae98-408d2baebcc0	Brief Proyek Poster	Brief proyek poster untuk XI DKV A sudah dibagikan. Batas pengumpulan 1 Oktober 2026.	3535d275-b4c6-9601-e4b4-b57981176c39	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	2026-09-26 14:00:00+07
4d7b299d-09b9-1c1b-a401-b3f69339beb4	Materi Copywriting	Materi bab copywriting untuk media cetak sudah tersedia di halaman materi.	3535d275-b4c6-9601-e4b4-b57981176c39	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	2026-09-20 14:00:00+07
95bebab2-9369-89f3-e1ff-6f37ef137e8c	Ujian Akhir Semester	Akan dilaksanakan pada tanggal 10 Oktober 2026	407a66ba-e691-c373-c7fd-d40671b6596b	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	2026-09-29 14:00:00+07
179cd3cb-171d-250e-785b-021fcd376ca9	Jadwal remedial	Remedial bagi siswa dengan nilai di bawah KKM 80 dilaksanakan Sabtu, 05.00 WIB.	407a66ba-e691-c373-c7fd-d40671b6596b	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	2026-09-25 14:00:00+07
a5cb7510-1946-5318-a7a6-65b94b24534b	Pengumpulan Tugas	Kumpulkan tugas sebelum 1 September 2026	407a66ba-e691-c373-c7fd-d40671b6596b	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	2026-09-27 14:00:00+07
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_messages (id, user_id, role, text, created_at) FROM stdin;
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.classes (id, name, ordinal, created_at) FROM stdin;
46a5ee71-767e-778d-e2a9-334eb0845e73	XI RPL B	1	2026-10-01 14:38:54.527876+07
3535d275-b4c6-9601-e4b4-b57981176c39	XI DKV A	2	2026-10-01 14:38:54.527876+07
407a66ba-e691-c373-c7fd-d40671b6596b	XI RPL C	3	2026-10-01 14:38:54.527876+07
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.enrollments (id, class_id, student_id, created_at) FROM stdin;
f2d49333-da1c-4632-a4d6-7f1742707278	46a5ee71-767e-778d-e2a9-334eb0845e73	77db7bd6-e1c5-47b4-a6bf-56af65ea21d7	2026-10-01 14:38:54.527876+07
cf12330d-68e5-40f0-a073-44bc5d44570b	46a5ee71-767e-778d-e2a9-334eb0845e73	2f0e1e72-cb41-4924-82cc-7e9e82e434bf	2026-10-01 14:38:54.527876+07
776af8d3-469f-474c-aea5-36f3151e0c33	46a5ee71-767e-778d-e2a9-334eb0845e73	11996aad-e3bc-430d-a961-0868a4cffe9c	2026-10-01 14:38:54.527876+07
6d2d4877-283b-4e92-b799-c1d4914afa5a	46a5ee71-767e-778d-e2a9-334eb0845e73	b8572d2e-1e9b-455d-9030-6891c7d52b0c	2026-10-01 14:38:54.527876+07
b9103ef6-ca52-4363-a61b-8a57160be6d1	46a5ee71-767e-778d-e2a9-334eb0845e73	27c0ec69-0d28-48c3-8bbd-b3acb528ba13	2026-10-01 14:38:54.527876+07
6b031a1a-81cf-48ec-9e0c-1d617f8c53c1	46a5ee71-767e-778d-e2a9-334eb0845e73	17b1f96a-11e7-45a0-ac82-b3938767cdc6	2026-10-01 14:38:54.527876+07
06f904bf-0f67-46c8-a926-1b84700f0609	46a5ee71-767e-778d-e2a9-334eb0845e73	9cb1b65e-808b-40e1-9601-87556a3be27c	2026-10-01 14:38:54.527876+07
ab9edf6d-b846-4bfd-bc71-649320990a5d	46a5ee71-767e-778d-e2a9-334eb0845e73	9acbd82f-a01f-4c34-8b5f-c5be2c78d93c	2026-10-01 14:38:54.527876+07
25a394d5-315c-4b05-93a2-d1e28cf3e8b8	46a5ee71-767e-778d-e2a9-334eb0845e73	a236ca06-aae8-4a64-93a5-e136c4e68f5f	2026-10-01 14:38:54.527876+07
ac55e4ff-d8ad-4412-8153-fee8ed288eb1	46a5ee71-767e-778d-e2a9-334eb0845e73	f0dbdfd0-b746-4b07-9092-e08eae1bcf74	2026-10-01 14:38:54.527876+07
ae07e236-bde9-49a2-9e60-f8ba740fc746	46a5ee71-767e-778d-e2a9-334eb0845e73	9cf6960e-7856-4931-8867-a9baa12a13f7	2026-10-01 14:38:54.527876+07
27d5829e-27ed-463c-a8bd-60a23fc157c7	46a5ee71-767e-778d-e2a9-334eb0845e73	8aac3f26-ee8d-41df-823f-ac3e1873dd9f	2026-10-01 14:38:54.527876+07
a4bb2eed-bfd7-4cd4-928c-83d8bf8b7984	46a5ee71-767e-778d-e2a9-334eb0845e73	7bbcadb5-c73a-444e-a09b-ab8187e35f9e	2026-10-01 14:38:54.527876+07
3b049078-27a4-4cb3-aaf9-bc9c0a3e0347	46a5ee71-767e-778d-e2a9-334eb0845e73	da602c03-1b20-478c-a81d-fa111ce71e41	2026-10-01 14:38:54.527876+07
b3f263e5-abe7-48ff-9ab8-31d200c84424	46a5ee71-767e-778d-e2a9-334eb0845e73	1a976f86-c615-4406-8336-2434ed269014	2026-10-01 14:38:54.527876+07
b9b48522-5f8c-41ab-9a0f-49ecf8576946	46a5ee71-767e-778d-e2a9-334eb0845e73	dd562628-fd47-4b90-989c-ac6df5ad7e03	2026-10-01 14:38:54.527876+07
6c71290c-8448-4d88-a4e8-ba35b1462499	46a5ee71-767e-778d-e2a9-334eb0845e73	bfe4f4a1-7d19-4f81-9122-f7b4299cc285	2026-10-01 14:38:54.527876+07
de91d573-3e1d-4d00-964f-2996db90ff75	46a5ee71-767e-778d-e2a9-334eb0845e73	04b3bcf9-3367-46a4-9a78-a92696e4ef8e	2026-10-01 14:38:54.527876+07
9037fcd0-a8ee-4f7c-8162-83654a6c142e	46a5ee71-767e-778d-e2a9-334eb0845e73	467a114f-d73f-4556-89c2-3c794e1aaecd	2026-10-01 14:38:54.527876+07
ecbd70f2-e323-4aa4-9b67-cfb4da2fb8d9	46a5ee71-767e-778d-e2a9-334eb0845e73	ac155231-ae3d-4d88-9394-8883411cf7d8	2026-10-01 14:38:54.527876+07
52603de0-2fea-4c9e-b299-c946c2acf976	46a5ee71-767e-778d-e2a9-334eb0845e73	e6f10eeb-feee-41dd-8429-c8a938bee48e	2026-10-01 14:38:54.527876+07
73d3e5ba-2ca0-456e-9527-e3c796d7483b	46a5ee71-767e-778d-e2a9-334eb0845e73	442d2d6b-e9a4-4088-8089-8029475879e7	2026-10-01 14:38:54.527876+07
102fae7c-a2c5-44f8-ab17-f24f0884dfc7	46a5ee71-767e-778d-e2a9-334eb0845e73	5e0a6ea9-3634-4320-b0b1-00bf441cfe00	2026-10-01 14:38:54.527876+07
889369c3-5077-4199-b001-977205314406	46a5ee71-767e-778d-e2a9-334eb0845e73	9bc5b210-8492-4e5d-9121-232f65386b56	2026-10-01 14:38:54.527876+07
384b5880-7591-4116-a3d6-d07f02fcf401	46a5ee71-767e-778d-e2a9-334eb0845e73	85218733-c612-4e63-a65e-3ae32b0aa97f	2026-10-01 14:38:54.527876+07
ef2c0de0-1b42-4702-b71a-75539b3a704d	46a5ee71-767e-778d-e2a9-334eb0845e73	ee28358b-4356-4dd3-97e8-dbc37b9fdfc4	2026-10-01 14:38:54.527876+07
11b9279c-eb8b-4eb5-9314-de03d1b8a77b	46a5ee71-767e-778d-e2a9-334eb0845e73	7a5626af-1767-418b-a3eb-5a20813c0929	2026-10-01 14:38:54.527876+07
686bb206-5c0f-4011-971b-cd22e15cf6c8	46a5ee71-767e-778d-e2a9-334eb0845e73	bdf6187d-5f04-4e52-864b-1aa87a1c143e	2026-10-01 14:38:54.527876+07
46408c3c-6d22-4f7c-9ab4-dfe9b2a7898d	46a5ee71-767e-778d-e2a9-334eb0845e73	0bb8f393-2636-440b-b43b-4de3bcd82948	2026-10-01 14:38:54.527876+07
b6008ef2-eec2-4f43-b3f6-01ea1650fac0	46a5ee71-767e-778d-e2a9-334eb0845e73	c42245cd-a62f-4bea-ad7f-a6dae57523b6	2026-10-01 14:38:54.527876+07
b164895b-cbce-42f5-a1ae-892f0507290c	46a5ee71-767e-778d-e2a9-334eb0845e73	697f7343-9a12-4697-bd7b-4c3cfdb5e6ec	2026-10-01 14:38:54.527876+07
64657fe2-ed89-4b9e-8442-32706a1c7d5c	46a5ee71-767e-778d-e2a9-334eb0845e73	a9268624-4bc4-417a-a54f-0d41aae287d6	2026-10-01 14:38:54.527876+07
7b88daef-8d71-4476-911d-70eb6bec9611	46a5ee71-767e-778d-e2a9-334eb0845e73	e8a2af47-703b-4b88-9ff9-7b068c21ddcd	2026-10-01 14:38:54.527876+07
4c6984f3-0a52-46a0-8a60-5d159122f2da	3535d275-b4c6-9601-e4b4-b57981176c39	ed3b4cce-daa5-4e27-9fd2-6b832e7054c9	2026-10-01 14:38:54.527876+07
3baf1bab-e13c-4d78-808b-bdae54d8cdca	3535d275-b4c6-9601-e4b4-b57981176c39	88fd97ba-e199-455d-83fa-c4dcac822686	2026-10-01 14:38:54.527876+07
91441db2-7470-493c-8b33-5c950f84b226	3535d275-b4c6-9601-e4b4-b57981176c39	7e190946-84bf-4bb9-aab8-3017aceadf8b	2026-10-01 14:38:54.527876+07
9b62aee8-c339-4934-a20c-feb9ade1ad9e	3535d275-b4c6-9601-e4b4-b57981176c39	01d91d18-37ec-4517-b0d2-05923352e9bf	2026-10-01 14:38:54.527876+07
7e91910d-2141-4e91-9831-f993d0baa3e7	3535d275-b4c6-9601-e4b4-b57981176c39	31a15f56-7f31-4de6-a428-1cc6c70e5a8c	2026-10-01 14:38:54.527876+07
d331617a-381c-42da-96dd-d03dde11028e	3535d275-b4c6-9601-e4b4-b57981176c39	944a7447-9e99-4a05-9bd4-39b2be336882	2026-10-01 14:38:54.527876+07
c04e0bcb-5703-41bd-ad13-4ffb90156e39	3535d275-b4c6-9601-e4b4-b57981176c39	3ba48f01-b327-42ed-ad64-17622eee6b82	2026-10-01 14:38:54.527876+07
d951560d-778b-4271-b54f-d391ddb4d0cd	3535d275-b4c6-9601-e4b4-b57981176c39	9766e933-d64c-4392-b264-9138df2283f1	2026-10-01 14:38:54.527876+07
a7315b0d-423e-4248-9664-30c66c145c2c	3535d275-b4c6-9601-e4b4-b57981176c39	618aa1fd-091b-4964-970d-a00876873de6	2026-10-01 14:38:54.527876+07
806222a7-31ac-402c-9ebf-544e085139ec	3535d275-b4c6-9601-e4b4-b57981176c39	46dd3781-ff6c-4770-a347-5422a6efddfc	2026-10-01 14:38:54.527876+07
234beb36-c3ed-498a-968a-2ee8f16f6966	3535d275-b4c6-9601-e4b4-b57981176c39	fb8682da-d1a6-4bcd-88ad-577ceb2b36fc	2026-10-01 14:38:54.527876+07
c57d1fcd-b484-49b7-98ae-826f026f0c1d	3535d275-b4c6-9601-e4b4-b57981176c39	62fc1f90-7a97-4b08-b914-2f2243c75b85	2026-10-01 14:38:54.527876+07
f8b0083c-0311-4aae-8a11-c68868c70988	3535d275-b4c6-9601-e4b4-b57981176c39	00f37c28-c8ed-4bf2-b6a7-3126a75e0745	2026-10-01 14:38:54.527876+07
7a93d779-8f29-4b06-b3a4-1e78354611cc	3535d275-b4c6-9601-e4b4-b57981176c39	72be464c-986f-48a2-85df-750a393a55fc	2026-10-01 14:38:54.527876+07
d3cef6c4-b963-4c72-ae5a-30a0af244866	3535d275-b4c6-9601-e4b4-b57981176c39	18751472-ccd2-4b60-8a2b-924f0624567b	2026-10-01 14:38:54.527876+07
c89a8ae8-7390-4373-8af9-48b802228721	3535d275-b4c6-9601-e4b4-b57981176c39	7f4fca69-f0f3-4bb6-9a5c-1ac1759f54cb	2026-10-01 14:38:54.527876+07
1012e828-a615-4063-b414-3a8c1a98c940	3535d275-b4c6-9601-e4b4-b57981176c39	43a2e079-1f15-4045-aa42-a4bfb5a2d157	2026-10-01 14:38:54.527876+07
505a5fe1-3156-4f29-aadf-847cbb631ef0	3535d275-b4c6-9601-e4b4-b57981176c39	991c36a6-c684-49b3-a0a2-4d4b4c06c099	2026-10-01 14:38:54.527876+07
665f3bef-bd89-41e3-a59e-03f2e31d464b	3535d275-b4c6-9601-e4b4-b57981176c39	2a1cdaa2-4010-42d9-abc0-8e02da1f7149	2026-10-01 14:38:54.527876+07
e5d0a1b1-831b-4739-a7ac-e018891ba71b	3535d275-b4c6-9601-e4b4-b57981176c39	00116bb5-1856-41c2-a82b-315e292ab22c	2026-10-01 14:38:54.527876+07
004c4df8-6ffa-4789-aa19-0e1b090d8084	3535d275-b4c6-9601-e4b4-b57981176c39	4a264929-a958-4e4d-a2ce-a7099421a796	2026-10-01 14:38:54.527876+07
3c3efe12-90ed-4ac8-8cb2-4fe679feb0fd	3535d275-b4c6-9601-e4b4-b57981176c39	dfd0f7d8-0fc4-4c66-9ee4-d6a0dd4ec6ac	2026-10-01 14:38:54.527876+07
75592b50-3ec3-4e85-a958-075977407c0a	3535d275-b4c6-9601-e4b4-b57981176c39	6b2d4026-4fea-42f2-a927-1dc77d01a582	2026-10-01 14:38:54.527876+07
13ec1a99-db2b-431e-a52b-01c33bfe4175	3535d275-b4c6-9601-e4b4-b57981176c39	6f60b65d-1bcd-489f-950d-00689b104e8b	2026-10-01 14:38:54.527876+07
68857cae-bd15-40d0-8852-f94320d3c8e8	3535d275-b4c6-9601-e4b4-b57981176c39	8e2a4e02-9634-49a8-91f4-1f96f61cd43b	2026-10-01 14:38:54.527876+07
1f148c8a-73e7-4dc7-9e3f-633951f47780	3535d275-b4c6-9601-e4b4-b57981176c39	d1c4d38a-de23-4ae7-8010-b5dcec300289	2026-10-01 14:38:54.527876+07
d92f51ef-3402-457d-864f-4e717a287ecd	3535d275-b4c6-9601-e4b4-b57981176c39	d422fcd6-2161-410e-b1e1-7b5a616e3f19	2026-10-01 14:38:54.527876+07
51bbf26e-064f-4cda-bce7-0f5881c5594a	3535d275-b4c6-9601-e4b4-b57981176c39	47517c77-1e13-4f6b-ba0a-01f02e3ecda8	2026-10-01 14:38:54.527876+07
91919d4c-4928-4709-84cb-abca42928a24	407a66ba-e691-c373-c7fd-d40671b6596b	67456128-2464-4bce-9902-7a75d5e87c08	2026-10-01 14:38:54.527876+07
4187cdac-95f4-4645-a246-35935cf05123	407a66ba-e691-c373-c7fd-d40671b6596b	42cfd4bb-72b9-4c65-8690-d660e92abd06	2026-10-01 14:38:54.527876+07
0866176c-b72f-4461-9051-e13fcdabc044	407a66ba-e691-c373-c7fd-d40671b6596b	6d6f3371-c3cf-4cc4-b872-a4085445f695	2026-10-01 14:38:54.527876+07
40499f0f-0cbd-4abf-a033-4e1e2c3115df	407a66ba-e691-c373-c7fd-d40671b6596b	1eff5152-2da4-48d2-852d-9f98255c0fff	2026-10-01 14:38:54.527876+07
4adb758d-665a-4a06-b929-be0dac628b43	407a66ba-e691-c373-c7fd-d40671b6596b	b14bb602-7b48-428a-af9d-ef2558cbb172	2026-10-01 14:38:54.527876+07
de43a181-63ee-4e90-84d5-ac70482047a7	407a66ba-e691-c373-c7fd-d40671b6596b	4c214951-4517-4ea0-b1c7-4907cbb98ed9	2026-10-01 14:38:54.527876+07
bdf5cfb6-153f-44e8-83dc-2a5399ee0571	407a66ba-e691-c373-c7fd-d40671b6596b	0c8324b1-65f1-4280-9bb0-f40a7b9091df	2026-10-01 14:38:54.527876+07
270ea8ca-9188-4701-b8d1-717b0861208e	407a66ba-e691-c373-c7fd-d40671b6596b	31aae0d7-c09f-468e-af16-b8196a72459d	2026-10-01 14:38:54.527876+07
c606b08a-4c24-418c-ae96-ef9e45c72122	407a66ba-e691-c373-c7fd-d40671b6596b	144a5dd4-e014-433d-9981-892e7c3ab031	2026-10-01 14:38:54.527876+07
6f563591-561d-4918-ba56-f3646236d2d1	407a66ba-e691-c373-c7fd-d40671b6596b	f5034142-4c02-4f83-8ad7-6b6336dd9d62	2026-10-01 14:38:54.527876+07
b02de882-cf5f-42c4-9263-f7dae1e931df	407a66ba-e691-c373-c7fd-d40671b6596b	703b9fc3-a41d-41d7-8dbb-feb71360a8cf	2026-10-01 14:38:54.527876+07
10e84406-49bc-44e6-8283-fb3c8e192acd	407a66ba-e691-c373-c7fd-d40671b6596b	4f6de5d7-1e98-42ee-94a8-b82745bb3118	2026-10-01 14:38:54.527876+07
be0fa970-e991-40fa-959a-a247995f0297	407a66ba-e691-c373-c7fd-d40671b6596b	962928b8-8af1-491c-9835-7331012ad77c	2026-10-01 14:38:54.527876+07
e1f12580-efa6-4c43-8b6e-fbace195df77	407a66ba-e691-c373-c7fd-d40671b6596b	04b00742-347c-45c9-99fc-2a4cef3806fb	2026-10-01 14:38:54.527876+07
57cec857-6562-4af5-9dce-b91fc7342444	407a66ba-e691-c373-c7fd-d40671b6596b	2a25d9a4-7826-4397-861a-2b0df3d816a6	2026-10-01 14:38:54.527876+07
12d99dc7-5842-4427-97b2-a11afcd16fa0	407a66ba-e691-c373-c7fd-d40671b6596b	cb5df4a5-8dc6-4b11-855e-7b54b823bb9a	2026-10-01 14:38:54.527876+07
e5ef525a-702e-4b23-ba8f-2377820c64a2	407a66ba-e691-c373-c7fd-d40671b6596b	73b570f5-becc-4b5f-8597-e7e8ecb5d731	2026-10-01 14:38:54.527876+07
b6bea3d6-b687-4917-a571-7c8c21953b8f	407a66ba-e691-c373-c7fd-d40671b6596b	d2e56fc9-21ca-4b9d-9cbc-bbc731c7f109	2026-10-01 14:38:54.527876+07
13167001-c4d4-415d-b18e-433eb7610d7b	407a66ba-e691-c373-c7fd-d40671b6596b	fc737808-6aac-4efa-9fd3-35481131db0d	2026-10-01 14:38:54.527876+07
142d0dfd-cfc4-4876-9a52-6fade240b3c5	407a66ba-e691-c373-c7fd-d40671b6596b	60868b7a-df6d-41ba-bac5-0e2607695eea	2026-10-01 14:38:54.527876+07
77fd5273-d5a9-4a1c-92b3-73d5ba7258b2	407a66ba-e691-c373-c7fd-d40671b6596b	faf442a3-95c4-40c3-9a5c-292d2c328f4e	2026-10-01 14:38:54.527876+07
106b470f-17d4-4bdf-8797-ae5bf3665b9c	407a66ba-e691-c373-c7fd-d40671b6596b	3eee6182-1bba-46e0-9146-9116a260773c	2026-10-01 14:38:54.527876+07
a86641f0-1b4f-4dd1-8606-3e921db7bf52	407a66ba-e691-c373-c7fd-d40671b6596b	c860ee43-a393-421f-8e98-114fc699c7e7	2026-10-01 14:38:54.527876+07
ec1996cd-362d-4e09-b32a-236f1f2ab594	407a66ba-e691-c373-c7fd-d40671b6596b	baa0777c-7ac9-47a3-9ce8-c1fc164261e2	2026-10-01 14:38:54.527876+07
b3c8839c-907b-49df-90f9-5ef3bca206c8	407a66ba-e691-c373-c7fd-d40671b6596b	a82349c8-e917-45f9-8833-e46d6094e4b7	2026-10-01 14:38:54.527876+07
30aa973d-b357-48b5-9a63-71a00f655a26	407a66ba-e691-c373-c7fd-d40671b6596b	27c9b5fc-e6d1-4844-8382-6e547c54c04e	2026-10-01 14:38:54.527876+07
b31e4362-74fa-41d1-9a52-d2d6ebc08454	407a66ba-e691-c373-c7fd-d40671b6596b	aca8a385-3f53-44c3-b6a6-8998d593da2c	2026-10-01 14:38:54.527876+07
d67eac7a-e304-47d4-9cf2-6f777e9a25c8	407a66ba-e691-c373-c7fd-d40671b6596b	7a45981c-1cb1-446c-9a65-7ac0c9865e85	2026-10-01 14:38:54.527876+07
6f7f22d8-b2df-4cad-8b2e-db4423fd667b	407a66ba-e691-c373-c7fd-d40671b6596b	0ef61474-e479-4e95-a456-4780bee27050	2026-10-01 14:38:54.527876+07
1bba7bc3-c00a-48bf-8cfb-db82fc4caf0c	407a66ba-e691-c373-c7fd-d40671b6596b	a90e2951-1040-45e9-a98c-3b5920fceed8	2026-10-01 14:38:54.527876+07
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.grades (id, class_id, task_id, student_id, subject, kind, score, grade_date, created_at) FROM stdin;
51a5491d-d614-4900-8b99-7af1832592f7	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	7bbcadb5-c73a-444e-a09b-ab8187e35f9e	Bahasa Indonesia	Menulis Teks Eksposisi	97	2026-09-10	2026-10-01 14:38:54.527876+07
3be983a7-6ee2-4790-8709-efd61a1a001c	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	2f0e1e72-cb41-4924-82cc-7e9e82e434bf	Bahasa Indonesia	Menulis Teks Eksposisi	83	2026-09-10	2026-10-01 14:38:54.527876+07
e3172b89-eade-4b17-9c19-3bd50389ed02	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	11996aad-e3bc-430d-a961-0868a4cffe9c	Bahasa Indonesia	Menulis Teks Eksposisi	91	2026-09-10	2026-10-01 14:38:54.527876+07
ff9af4aa-2f53-45ba-9134-279e8c463dbb	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	b8572d2e-1e9b-455d-9030-6891c7d52b0c	Bahasa Indonesia	Menulis Teks Eksposisi	99	2026-09-10	2026-10-01 14:38:54.527876+07
2254ffd7-1892-48dd-9c4f-55b59a91a1fd	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	27c0ec69-0d28-48c3-8bbd-b3acb528ba13	Bahasa Indonesia	Menulis Teks Eksposisi	86	2026-09-10	2026-10-01 14:38:54.527876+07
cb425219-91c2-46af-a3e7-41c6d4336b53	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	17b1f96a-11e7-45a0-ac82-b3938767cdc6	Bahasa Indonesia	Menulis Teks Eksposisi	94	2026-09-10	2026-10-01 14:38:54.527876+07
e497ba64-c5c8-4694-a44b-5566ca599dc5	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	9cb1b65e-808b-40e1-9601-87556a3be27c	Bahasa Indonesia	Menulis Teks Eksposisi	97	2026-09-10	2026-10-01 14:38:54.527876+07
71488773-64f4-4f7e-a591-0a68fa39a04d	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	9acbd82f-a01f-4c34-8b5f-c5be2c78d93c	Bahasa Indonesia	Menulis Teks Eksposisi	84	2026-09-10	2026-10-01 14:38:54.527876+07
ac1e88ae-2042-44c3-80b4-907a88c8bd27	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	a236ca06-aae8-4a64-93a5-e136c4e68f5f	Bahasa Indonesia	Menulis Teks Eksposisi	92	2026-09-10	2026-10-01 14:38:54.527876+07
297082f3-03c9-4154-819e-ffc5ce17b991	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	f0dbdfd0-b746-4b07-9092-e08eae1bcf74	Bahasa Indonesia	Menulis Teks Eksposisi	100	2026-09-10	2026-10-01 14:38:54.527876+07
be050489-a7d6-4fe4-8e42-440c7cd5cdcd	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	9cf6960e-7856-4931-8867-a9baa12a13f7	Bahasa Indonesia	Menulis Teks Eksposisi	87	2026-09-10	2026-10-01 14:38:54.527876+07
5fb9b11f-31a3-4a96-ba2b-cce2d819799e	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	8aac3f26-ee8d-41df-823f-ac3e1873dd9f	Bahasa Indonesia	Menulis Teks Eksposisi	90	2026-09-10	2026-10-01 14:38:54.527876+07
5ebebb37-714b-4f8d-a09a-34ee021460d1	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	da602c03-1b20-478c-a81d-fa111ce71e41	Bahasa Indonesia	Menulis Teks Eksposisi	84	2026-09-10	2026-10-01 14:38:54.527876+07
8d99e2ef-700a-4568-8494-7006d4ee9dfd	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	1a976f86-c615-4406-8336-2434ed269014	Bahasa Indonesia	Menulis Teks Eksposisi	92	2026-09-10	2026-10-01 14:38:54.527876+07
161e7714-b90f-47a8-a587-172cc7eef4ea	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	dd562628-fd47-4b90-989c-ac6df5ad7e03	Bahasa Indonesia	Menulis Teks Eksposisi	100	2026-09-10	2026-10-01 14:38:54.527876+07
a25d9791-7e77-4d6f-84bd-a8ab29c157a1	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	bfe4f4a1-7d19-4f81-9122-f7b4299cc285	Bahasa Indonesia	Menulis Teks Eksposisi	82	2026-09-10	2026-10-01 14:38:54.527876+07
9649756c-87f4-45d3-be23-1330a395ced5	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	04b3bcf9-3367-46a4-9a78-a92696e4ef8e	Bahasa Indonesia	Menulis Teks Eksposisi	90	2026-09-10	2026-10-01 14:38:54.527876+07
80ef90eb-7bce-44f0-870a-90680ae70791	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	467a114f-d73f-4556-89c2-3c794e1aaecd	Bahasa Indonesia	Menulis Teks Eksposisi	98	2026-09-10	2026-10-01 14:38:54.527876+07
9418a89e-0972-4ca8-b81f-93b1b3d518ae	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	ac155231-ae3d-4d88-9394-8883411cf7d8	Bahasa Indonesia	Menulis Teks Eksposisi	85	2026-09-10	2026-10-01 14:38:54.527876+07
a17db34e-376e-4ef4-9ffb-7631ea97483f	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	e6f10eeb-feee-41dd-8429-c8a938bee48e	Bahasa Indonesia	Menulis Teks Eksposisi	93	2026-09-10	2026-10-01 14:38:54.527876+07
35a0085d-05a5-45a6-b3b6-24f6c2963be3	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	442d2d6b-e9a4-4088-8089-8029475879e7	Bahasa Indonesia	Menulis Teks Eksposisi	96	2026-09-10	2026-10-01 14:38:54.527876+07
bc6b4512-fc6d-463f-8f68-d2c921f499f2	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	5e0a6ea9-3634-4320-b0b1-00bf441cfe00	Bahasa Indonesia	Menulis Teks Eksposisi	83	2026-09-10	2026-10-01 14:38:54.527876+07
062e95dd-6872-417c-a1f3-fd4d7938e9f6	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	9bc5b210-8492-4e5d-9121-232f65386b56	Bahasa Indonesia	Menulis Teks Eksposisi	91	2026-09-10	2026-10-01 14:38:54.527876+07
2cb3e12c-b109-41f6-803e-d7cac092e362	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	85218733-c612-4e63-a65e-3ae32b0aa97f	Bahasa Indonesia	Menulis Teks Eksposisi	99	2026-09-10	2026-10-01 14:38:54.527876+07
33f5cdb6-4dc3-422f-a93b-c85fae87289f	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	ee28358b-4356-4dd3-97e8-dbc37b9fdfc4	Bahasa Indonesia	Menulis Teks Eksposisi	86	2026-09-10	2026-10-01 14:38:54.527876+07
eb8ab9ad-ea7b-4667-8116-903a6e06254e	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	7a5626af-1767-418b-a3eb-5a20813c0929	Bahasa Indonesia	Menulis Teks Eksposisi	89	2026-09-10	2026-10-01 14:38:54.527876+07
f602eee1-d0a8-4e7f-9403-33869da46cb0	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	bdf6187d-5f04-4e52-864b-1aa87a1c143e	Bahasa Indonesia	Menulis Teks Eksposisi	97	2026-09-10	2026-10-01 14:38:54.527876+07
5142df90-17c5-4f6b-b809-cc5353441780	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	0bb8f393-2636-440b-b43b-4de3bcd82948	Bahasa Indonesia	Menulis Teks Eksposisi	84	2026-09-10	2026-10-01 14:38:54.527876+07
5040927c-48ae-4fcd-b906-198d0cc026db	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	c42245cd-a62f-4bea-ad7f-a6dae57523b6	Bahasa Indonesia	Menulis Teks Eksposisi	92	2026-09-10	2026-10-01 14:38:54.527876+07
cef674a1-54f5-4e98-a47a-a8a2ab993d04	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	697f7343-9a12-4697-bd7b-4c3cfdb5e6ec	Bahasa Indonesia	Menulis Teks Eksposisi	100	2026-09-10	2026-10-01 14:38:54.527876+07
ecc7cf8f-cf50-4107-8762-5bb068547f72	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	a9268624-4bc4-417a-a54f-0d41aae287d6	Bahasa Indonesia	Menulis Teks Eksposisi	82	2026-09-10	2026-10-01 14:38:54.527876+07
18d9f949-e66b-496c-a781-33d6de6a1d4a	46a5ee71-767e-778d-e2a9-334eb0845e73	683fc447-a093-5855-e3e1-c0eb75edce03	e8a2af47-703b-4b88-9ff9-7b068c21ddcd	Bahasa Indonesia	Menulis Teks Eksposisi	90	2026-09-10	2026-10-01 14:38:54.527876+07
1ee77981-f674-4bfb-8a5b-e8b460ab9446	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	2f0e1e72-cb41-4924-82cc-7e9e82e434bf	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	79	2026-08-12	2026-10-01 14:38:54.527876+07
ec70cddc-94bc-4969-9a60-12a2d46a66b5	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	11996aad-e3bc-430d-a961-0868a4cffe9c	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	87	2026-08-12	2026-10-01 14:38:54.527876+07
94ee1bfc-e3fd-4a00-b7b1-0f0628a5e54b	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	b8572d2e-1e9b-455d-9030-6891c7d52b0c	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	95	2026-08-12	2026-10-01 14:38:54.527876+07
a05ca6bb-8dff-4fbe-a576-b95850b555a4	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	27c0ec69-0d28-48c3-8bbd-b3acb528ba13	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	82	2026-08-12	2026-10-01 14:38:54.527876+07
d16cf8f2-4dd0-4e9d-a679-ea22a68048f2	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	17b1f96a-11e7-45a0-ac82-b3938767cdc6	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	85	2026-08-12	2026-10-01 14:38:54.527876+07
da0629e3-71a0-4fff-b8e6-4d7736d111cc	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	9cb1b65e-808b-40e1-9601-87556a3be27c	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	93	2026-08-12	2026-10-01 14:38:54.527876+07
8a2db05e-c838-48e3-8fd4-ce3e7513ab6e	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	9acbd82f-a01f-4c34-8b5f-c5be2c78d93c	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	80	2026-08-12	2026-10-01 14:38:54.527876+07
18a1dc8a-09a1-4030-9ada-f94a9789327a	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	a236ca06-aae8-4a64-93a5-e136c4e68f5f	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	88	2026-08-12	2026-10-01 14:38:54.527876+07
821af87a-7d88-4632-89a8-faddf50bc6a2	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	f0dbdfd0-b746-4b07-9092-e08eae1bcf74	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	96	2026-08-12	2026-10-01 14:38:54.527876+07
ee0ac8d4-07f0-4a06-8a2f-1dfde8ad8ea3	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	9cf6960e-7856-4931-8867-a9baa12a13f7	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	78	2026-08-12	2026-10-01 14:38:54.527876+07
4b8b83a1-3900-42dd-9fdb-7abebc5ec470	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	8aac3f26-ee8d-41df-823f-ac3e1873dd9f	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	85	2026-08-12	2026-10-01 14:38:54.527876+07
a91e9dbe-b5d0-44c5-afec-2a8dd798743c	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	7bbcadb5-c73a-444e-a09b-ab8187e35f9e	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	93	2026-08-12	2026-10-01 14:38:54.527876+07
6d016050-6d6d-4437-a002-414ea3779d60	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	da602c03-1b20-478c-a81d-fa111ce71e41	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	80	2026-08-12	2026-10-01 14:38:54.527876+07
33ceea6e-3f4c-4a4d-9db6-c163a2d7b472	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	1a976f86-c615-4406-8336-2434ed269014	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	88	2026-08-12	2026-10-01 14:38:54.527876+07
5fe8760a-d1b9-45ab-8d93-0eb8b00c8817	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	dd562628-fd47-4b90-989c-ac6df5ad7e03	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	91	2026-08-12	2026-10-01 14:38:54.527876+07
d71b3715-b11a-4385-9f41-cb894d149944	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	bfe4f4a1-7d19-4f81-9122-f7b4299cc285	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	78	2026-08-12	2026-10-01 14:38:54.527876+07
f95d4399-e238-4c0e-b278-539ae8a6011d	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	04b3bcf9-3367-46a4-9a78-a92696e4ef8e	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	86	2026-08-12	2026-10-01 14:38:54.527876+07
02c27e4f-0ef9-496b-9dc0-80cc0de23a3a	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	467a114f-d73f-4556-89c2-3c794e1aaecd	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	94	2026-08-12	2026-10-01 14:38:54.527876+07
32d67743-a928-4265-8643-379ad5174001	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	ac155231-ae3d-4d88-9394-8883411cf7d8	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	81	2026-08-12	2026-10-01 14:38:54.527876+07
67979986-63ed-4c10-bbb3-fafa25fe6057	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	e6f10eeb-feee-41dd-8429-c8a938bee48e	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	84	2026-08-12	2026-10-01 14:38:54.527876+07
e028cc7b-c3bd-43ce-b6dc-fb5c7d696ee2	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	442d2d6b-e9a4-4088-8089-8029475879e7	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	92	2026-08-12	2026-10-01 14:38:54.527876+07
70dbf67f-f995-430d-b5ab-8689b5910de6	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	5e0a6ea9-3634-4320-b0b1-00bf441cfe00	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	79	2026-08-12	2026-10-01 14:38:54.527876+07
a3ea9823-6b4b-4167-9236-e0f614d60e38	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	9bc5b210-8492-4e5d-9121-232f65386b56	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	87	2026-08-12	2026-10-01 14:38:54.527876+07
854e783f-dc65-467d-a3d2-5dd17b842a97	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	85218733-c612-4e63-a65e-3ae32b0aa97f	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	95	2026-08-12	2026-10-01 14:38:54.527876+07
09c17c04-8f12-424f-abf8-f33588fc1334	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	ee28358b-4356-4dd3-97e8-dbc37b9fdfc4	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	77	2026-08-12	2026-10-01 14:38:54.527876+07
8594e81a-16b5-4759-8f87-97e93b16cc94	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	7a5626af-1767-418b-a3eb-5a20813c0929	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	85	2026-08-12	2026-10-01 14:38:54.527876+07
0e283f14-3f96-4d2d-a1d6-1e2d0a74ebe0	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	bdf6187d-5f04-4e52-864b-1aa87a1c143e	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	93	2026-08-12	2026-10-01 14:38:54.527876+07
aaac3145-28a9-4ca4-8aad-448eeaf2dbc3	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	0bb8f393-2636-440b-b43b-4de3bcd82948	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	80	2026-08-12	2026-10-01 14:38:54.527876+07
606d56a1-cabd-446b-a2bb-a41660325557	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	c42245cd-a62f-4bea-ad7f-a6dae57523b6	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	88	2026-08-12	2026-10-01 14:38:54.527876+07
90fe1d29-8fc4-404e-a149-2da0a3689a9a	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	697f7343-9a12-4697-bd7b-4c3cfdb5e6ec	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	91	2026-08-12	2026-10-01 14:38:54.527876+07
77376dcd-b2a4-48c8-9ca9-532ba60411a1	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	a9268624-4bc4-417a-a54f-0d41aae287d6	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	78	2026-08-12	2026-10-01 14:38:54.527876+07
949d4dee-3304-4c51-b2ce-2039c21533b5	46a5ee71-767e-778d-e2a9-334eb0845e73	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	e8a2af47-703b-4b88-9ff9-7b068c21ddcd	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	86	2026-08-12	2026-10-01 14:38:54.527876+07
16a85c12-505a-4544-adc0-b754e61dff1c	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	2f0e1e72-cb41-4924-82cc-7e9e82e434bf	Bahasa Indonesia	Membuat Teks Pidato Persuasif	83	2026-09-10	2026-10-01 14:38:54.527876+07
a83750a1-00c4-4300-9b48-4886a4e22b26	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	11996aad-e3bc-430d-a961-0868a4cffe9c	Bahasa Indonesia	Membuat Teks Pidato Persuasif	91	2026-09-10	2026-10-01 14:38:54.527876+07
b49130f2-a677-4b8b-8500-e7e7065afbfd	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	b8572d2e-1e9b-455d-9030-6891c7d52b0c	Bahasa Indonesia	Membuat Teks Pidato Persuasif	99	2026-09-10	2026-10-01 14:38:54.527876+07
7a040b04-84ab-4f1b-bf6f-5a385b12d3e8	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	27c0ec69-0d28-48c3-8bbd-b3acb528ba13	Bahasa Indonesia	Membuat Teks Pidato Persuasif	81	2026-09-10	2026-10-01 14:38:54.527876+07
112dc07e-bc2b-461e-9240-31f964b7add1	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	17b1f96a-11e7-45a0-ac82-b3938767cdc6	Bahasa Indonesia	Membuat Teks Pidato Persuasif	89	2026-09-10	2026-10-01 14:38:54.527876+07
bbfc386c-d2d5-4f32-95a8-f54580c7bbbb	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	9cb1b65e-808b-40e1-9601-87556a3be27c	Bahasa Indonesia	Membuat Teks Pidato Persuasif	97	2026-09-10	2026-10-01 14:38:54.527876+07
d898fde3-182a-4006-8fb9-93b8803f6b7d	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	9acbd82f-a01f-4c34-8b5f-c5be2c78d93c	Bahasa Indonesia	Membuat Teks Pidato Persuasif	84	2026-09-10	2026-10-01 14:38:54.527876+07
d793f66d-1dda-481d-b132-a3d179f7967b	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	a236ca06-aae8-4a64-93a5-e136c4e68f5f	Bahasa Indonesia	Membuat Teks Pidato Persuasif	92	2026-09-10	2026-10-01 14:38:54.527876+07
86996fba-53d0-454f-8fee-dcdea47ce6fb	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	f0dbdfd0-b746-4b07-9092-e08eae1bcf74	Bahasa Indonesia	Membuat Teks Pidato Persuasif	95	2026-09-10	2026-10-01 14:38:54.527876+07
bea5f2c5-850c-4264-853a-1b5012406bbf	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	9cf6960e-7856-4931-8867-a9baa12a13f7	Bahasa Indonesia	Membuat Teks Pidato Persuasif	82	2026-09-10	2026-10-01 14:38:54.527876+07
d457c9bf-3e0b-4bd8-af3b-7bd9225ff6ee	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	8aac3f26-ee8d-41df-823f-ac3e1873dd9f	Bahasa Indonesia	Membuat Teks Pidato Persuasif	89	2026-09-10	2026-10-01 14:38:54.527876+07
ea99fb26-a8b0-4147-9fce-c03b15e01810	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	7bbcadb5-c73a-444e-a09b-ab8187e35f9e	Bahasa Indonesia	Membuat Teks Pidato Persuasif	97	2026-09-10	2026-10-01 14:38:54.527876+07
533e995f-adf3-4b11-88ef-f0aa83c978c0	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	da602c03-1b20-478c-a81d-fa111ce71e41	Bahasa Indonesia	Membuat Teks Pidato Persuasif	84	2026-09-10	2026-10-01 14:38:54.527876+07
7f9e5d1f-9038-4922-aa78-31edf2a3363e	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	1a976f86-c615-4406-8336-2434ed269014	Bahasa Indonesia	Membuat Teks Pidato Persuasif	87	2026-09-10	2026-10-01 14:38:54.527876+07
e3a3e3ae-c24b-4cdb-8e99-b20d53213b8e	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	dd562628-fd47-4b90-989c-ac6df5ad7e03	Bahasa Indonesia	Membuat Teks Pidato Persuasif	95	2026-09-10	2026-10-01 14:38:54.527876+07
f00599ea-2d9a-45d2-927a-c6bf7f615e93	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	bfe4f4a1-7d19-4f81-9122-f7b4299cc285	Bahasa Indonesia	Membuat Teks Pidato Persuasif	82	2026-09-10	2026-10-01 14:38:54.527876+07
3b8688a9-7d24-4a78-b00b-2dc74f9dcc4c	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	04b3bcf9-3367-46a4-9a78-a92696e4ef8e	Bahasa Indonesia	Membuat Teks Pidato Persuasif	90	2026-09-10	2026-10-01 14:38:54.527876+07
a7038db5-9e73-4170-ba13-0616dbde341a	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	467a114f-d73f-4556-89c2-3c794e1aaecd	Bahasa Indonesia	Membuat Teks Pidato Persuasif	98	2026-09-10	2026-10-01 14:38:54.527876+07
bf2a90f4-ca21-4fc4-90e6-b61f8fddc298	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	ac155231-ae3d-4d88-9394-8883411cf7d8	Bahasa Indonesia	Membuat Teks Pidato Persuasif	80	2026-09-10	2026-10-01 14:38:54.527876+07
8ae058a0-574e-4d73-b827-7ab331c19933	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	e6f10eeb-feee-41dd-8429-c8a938bee48e	Bahasa Indonesia	Membuat Teks Pidato Persuasif	88	2026-09-10	2026-10-01 14:38:54.527876+07
3418bd7e-bff5-4bb3-abd1-0a2e2991f60e	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	442d2d6b-e9a4-4088-8089-8029475879e7	Bahasa Indonesia	Membuat Teks Pidato Persuasif	96	2026-09-10	2026-10-01 14:38:54.527876+07
331c9dbb-fd22-4197-8c6b-3d329783c81e	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	5e0a6ea9-3634-4320-b0b1-00bf441cfe00	Bahasa Indonesia	Membuat Teks Pidato Persuasif	83	2026-09-10	2026-10-01 14:38:54.527876+07
e4675415-396b-4170-aa3c-efb666d30ebb	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	9bc5b210-8492-4e5d-9121-232f65386b56	Bahasa Indonesia	Membuat Teks Pidato Persuasif	91	2026-09-10	2026-10-01 14:38:54.527876+07
72f0d1d5-815e-4b31-9549-964c0bf9f0f1	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	85218733-c612-4e63-a65e-3ae32b0aa97f	Bahasa Indonesia	Membuat Teks Pidato Persuasif	94	2026-09-10	2026-10-01 14:38:54.527876+07
876056a6-15ae-40ec-a82a-28ecb15cb6be	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	ee28358b-4356-4dd3-97e8-dbc37b9fdfc4	Bahasa Indonesia	Membuat Teks Pidato Persuasif	81	2026-09-10	2026-10-01 14:38:54.527876+07
d8d59f5f-b3e0-4809-8c33-9971b222773a	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	7a5626af-1767-418b-a3eb-5a20813c0929	Bahasa Indonesia	Membuat Teks Pidato Persuasif	89	2026-09-10	2026-10-01 14:38:54.527876+07
375a1922-1049-4247-a212-b8668968b8bc	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	bdf6187d-5f04-4e52-864b-1aa87a1c143e	Bahasa Indonesia	Membuat Teks Pidato Persuasif	97	2026-09-10	2026-10-01 14:38:54.527876+07
e42cbf97-af93-4db2-8ba9-d6697934361e	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	0bb8f393-2636-440b-b43b-4de3bcd82948	Bahasa Indonesia	Membuat Teks Pidato Persuasif	84	2026-09-10	2026-10-01 14:38:54.527876+07
0e014464-2b53-4d12-a245-61153c6e6f09	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	c42245cd-a62f-4bea-ad7f-a6dae57523b6	Bahasa Indonesia	Membuat Teks Pidato Persuasif	87	2026-09-10	2026-10-01 14:38:54.527876+07
297b5586-c162-47a2-85f0-714905494e57	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	697f7343-9a12-4697-bd7b-4c3cfdb5e6ec	Bahasa Indonesia	Membuat Teks Pidato Persuasif	95	2026-09-10	2026-10-01 14:38:54.527876+07
4ae4daa8-1dc7-4216-ae01-2fadd8c45bf8	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	a9268624-4bc4-417a-a54f-0d41aae287d6	Bahasa Indonesia	Membuat Teks Pidato Persuasif	82	2026-09-10	2026-10-01 14:38:54.527876+07
63c8c129-2753-4e09-8ccc-4172b0192cb3	46a5ee71-767e-778d-e2a9-334eb0845e73	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	e8a2af47-703b-4b88-9ff9-7b068c21ddcd	Bahasa Indonesia	Membuat Teks Pidato Persuasif	90	2026-09-10	2026-10-01 14:38:54.527876+07
694b4e4c-7252-4088-bc8b-2d3ef37a1518	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	2f0e1e72-cb41-4924-82cc-7e9e82e434bf	Bahasa Indonesia	Membuat Resensi Buku	79	2026-09-01	2026-10-01 14:38:54.527876+07
dae80dbe-ac8b-4308-89dd-862becc16c04	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	11996aad-e3bc-430d-a961-0868a4cffe9c	Bahasa Indonesia	Membuat Resensi Buku	87	2026-09-01	2026-10-01 14:38:54.527876+07
239bd9c0-c3f7-44bf-95f4-8cf106bc57c3	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	b8572d2e-1e9b-455d-9030-6891c7d52b0c	Bahasa Indonesia	Membuat Resensi Buku	90	2026-09-01	2026-10-01 14:38:54.527876+07
9a8bd8ce-9726-42da-bc2e-7f790d67ea93	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	27c0ec69-0d28-48c3-8bbd-b3acb528ba13	Bahasa Indonesia	Membuat Resensi Buku	77	2026-09-01	2026-10-01 14:38:54.527876+07
d3575a67-f0d9-45cd-ae0c-af01d97f6995	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	17b1f96a-11e7-45a0-ac82-b3938767cdc6	Bahasa Indonesia	Membuat Resensi Buku	85	2026-09-01	2026-10-01 14:38:54.527876+07
6c1a4c07-9af8-4ff1-88cc-d35332a6b46a	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	9cb1b65e-808b-40e1-9601-87556a3be27c	Bahasa Indonesia	Membuat Resensi Buku	93	2026-09-01	2026-10-01 14:38:54.527876+07
44552b3f-0e46-4701-a840-d5a1e975077f	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	9acbd82f-a01f-4c34-8b5f-c5be2c78d93c	Bahasa Indonesia	Membuat Resensi Buku	80	2026-09-01	2026-10-01 14:38:54.527876+07
6efc972b-b7eb-4fd6-9022-cdff331dafa8	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	a236ca06-aae8-4a64-93a5-e136c4e68f5f	Bahasa Indonesia	Membuat Resensi Buku	83	2026-09-01	2026-10-01 14:38:54.527876+07
ef1afcac-eb92-4646-95e3-f822e3fe4afb	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	f0dbdfd0-b746-4b07-9092-e08eae1bcf74	Bahasa Indonesia	Membuat Resensi Buku	91	2026-09-01	2026-10-01 14:38:54.527876+07
991c51b5-5fcf-455d-8fac-f82dad0807d7	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	9cf6960e-7856-4931-8867-a9baa12a13f7	Bahasa Indonesia	Membuat Resensi Buku	78	2026-09-01	2026-10-01 14:38:54.527876+07
c4d161e0-f764-497f-9650-4e0564214a58	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	8aac3f26-ee8d-41df-823f-ac3e1873dd9f	Bahasa Indonesia	Membuat Resensi Buku	85	2026-09-01	2026-10-01 14:38:54.527876+07
bc69da67-2b42-41c0-a50b-4f936f8b3bb9	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	7bbcadb5-c73a-444e-a09b-ab8187e35f9e	Bahasa Indonesia	Membuat Resensi Buku	93	2026-09-01	2026-10-01 14:38:54.527876+07
7a234ac5-bead-4497-a2aa-02e4e8a2c85d	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	da602c03-1b20-478c-a81d-fa111ce71e41	Bahasa Indonesia	Membuat Resensi Buku	75	2026-09-01	2026-10-01 14:38:54.527876+07
2af6197b-f593-4860-8d00-858da9efc08e	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	1a976f86-c615-4406-8336-2434ed269014	Bahasa Indonesia	Membuat Resensi Buku	83	2026-09-01	2026-10-01 14:38:54.527876+07
6fe885b6-dbdd-4be2-b053-99f61501e798	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	dd562628-fd47-4b90-989c-ac6df5ad7e03	Bahasa Indonesia	Membuat Resensi Buku	91	2026-09-01	2026-10-01 14:38:54.527876+07
7fc234ce-6fe0-4602-b939-4d50d5b20a45	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	bfe4f4a1-7d19-4f81-9122-f7b4299cc285	Bahasa Indonesia	Membuat Resensi Buku	78	2026-09-01	2026-10-01 14:38:54.527876+07
72b138e8-02f3-47f1-b2ef-2c3d5607e6ed	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	04b3bcf9-3367-46a4-9a78-a92696e4ef8e	Bahasa Indonesia	Membuat Resensi Buku	86	2026-09-01	2026-10-01 14:38:54.527876+07
d612de6b-3355-4f8a-86a4-5923098c5283	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	467a114f-d73f-4556-89c2-3c794e1aaecd	Bahasa Indonesia	Membuat Resensi Buku	89	2026-09-01	2026-10-01 14:38:54.527876+07
ef7ae86b-b11e-4efd-8323-8b46fdb5ba8a	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	ac155231-ae3d-4d88-9394-8883411cf7d8	Bahasa Indonesia	Membuat Resensi Buku	76	2026-09-01	2026-10-01 14:38:54.527876+07
ac60270a-5967-4908-b44f-81d58de8b4e3	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	e6f10eeb-feee-41dd-8429-c8a938bee48e	Bahasa Indonesia	Membuat Resensi Buku	84	2026-09-01	2026-10-01 14:38:54.527876+07
4be24874-72a8-47a1-ba4e-9be6d35399b2	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	442d2d6b-e9a4-4088-8089-8029475879e7	Bahasa Indonesia	Membuat Resensi Buku	92	2026-09-01	2026-10-01 14:38:54.527876+07
63469b92-1b99-43e7-b1ad-498a14b0a108	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	5e0a6ea9-3634-4320-b0b1-00bf441cfe00	Bahasa Indonesia	Membuat Resensi Buku	79	2026-09-01	2026-10-01 14:38:54.527876+07
dfd8b2dc-1621-4f5a-a5e4-4a3daac1e061	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	9bc5b210-8492-4e5d-9121-232f65386b56	Bahasa Indonesia	Membuat Resensi Buku	82	2026-09-01	2026-10-01 14:38:54.527876+07
a41bd54f-3cf0-47b6-a146-cfa649f4cf53	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	85218733-c612-4e63-a65e-3ae32b0aa97f	Bahasa Indonesia	Membuat Resensi Buku	90	2026-09-01	2026-10-01 14:38:54.527876+07
3e4741c3-bc88-4798-a355-3ce8937987ea	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	ee28358b-4356-4dd3-97e8-dbc37b9fdfc4	Bahasa Indonesia	Membuat Resensi Buku	77	2026-09-01	2026-10-01 14:38:54.527876+07
40178b3d-e30e-41d0-b976-ab5493e43a2a	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	7a5626af-1767-418b-a3eb-5a20813c0929	Bahasa Indonesia	Membuat Resensi Buku	85	2026-09-01	2026-10-01 14:38:54.527876+07
27d469fb-aa9d-45b5-8bcf-8c21fdb0a91c	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	bdf6187d-5f04-4e52-864b-1aa87a1c143e	Bahasa Indonesia	Membuat Resensi Buku	93	2026-09-01	2026-10-01 14:38:54.527876+07
4fa864e2-fb41-4ef0-a9a4-2d687e724534	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	0bb8f393-2636-440b-b43b-4de3bcd82948	Bahasa Indonesia	Membuat Resensi Buku	75	2026-09-01	2026-10-01 14:38:54.527876+07
22744ef2-7638-47bc-b390-2fba1c8553ea	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	c42245cd-a62f-4bea-ad7f-a6dae57523b6	Bahasa Indonesia	Membuat Resensi Buku	83	2026-09-01	2026-10-01 14:38:54.527876+07
e6ee7f50-6c7b-4303-b6ae-26989703728f	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	697f7343-9a12-4697-bd7b-4c3cfdb5e6ec	Bahasa Indonesia	Membuat Resensi Buku	91	2026-09-01	2026-10-01 14:38:54.527876+07
c6da747c-d989-4d03-a83c-4cdfeea8c58d	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	a9268624-4bc4-417a-a54f-0d41aae287d6	Bahasa Indonesia	Membuat Resensi Buku	78	2026-09-01	2026-10-01 14:38:54.527876+07
5ee5824b-9c0a-4a8f-92b4-61455da8ac73	46a5ee71-767e-778d-e2a9-334eb0845e73	d2eeff0e-4100-4fec-4310-8726f09d1f4c	e8a2af47-703b-4b88-9ff9-7b068c21ddcd	Bahasa Indonesia	Membuat Resensi Buku	86	2026-09-01	2026-10-01 14:38:54.527876+07
7050d065-775b-4f9d-987e-1ddbfa724ec1	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	ed3b4cce-daa5-4e27-9fd2-6b832e7054c9	Bahasa Indonesia	Caption Poster	78	2026-09-10	2026-10-01 14:38:54.527876+07
4b628ee1-30a1-4379-8f54-39c861c20cae	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	88fd97ba-e199-455d-83fa-c4dcac822686	Bahasa Indonesia	Caption Poster	86	2026-09-10	2026-10-01 14:38:54.527876+07
bcf5cbc4-894c-49fc-becf-f2d2668e2734	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	7e190946-84bf-4bb9-aab8-3017aceadf8b	Bahasa Indonesia	Caption Poster	94	2026-09-10	2026-10-01 14:38:54.527876+07
33caa940-d646-480b-9444-48a6b41b1d43	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	01d91d18-37ec-4517-b0d2-05923352e9bf	Bahasa Indonesia	Caption Poster	79	2026-09-10	2026-10-01 14:38:54.527876+07
21cc2cc5-db8d-4bc1-854a-30adda12cf5f	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	31a15f56-7f31-4de6-a428-1cc6c70e5a8c	Bahasa Indonesia	Caption Poster	87	2026-09-10	2026-10-01 14:38:54.527876+07
8f1cc3b6-d872-4c1f-80c0-44afe6afaf05	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	944a7447-9e99-4a05-9bd4-39b2be336882	Bahasa Indonesia	Caption Poster	90	2026-09-10	2026-10-01 14:38:54.527876+07
c8b2a555-cc58-4baa-ae32-648f75066ef4	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	3ba48f01-b327-42ed-ad64-17622eee6b82	Bahasa Indonesia	Caption Poster	98	2026-09-10	2026-10-01 14:38:54.527876+07
6ba4a368-36cc-4e2e-b399-928e3f3db3ff	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	9766e933-d64c-4392-b264-9138df2283f1	Bahasa Indonesia	Caption Poster	83	2026-09-10	2026-10-01 14:38:54.527876+07
d92dab9a-e937-4dca-b99d-066d81229e84	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	618aa1fd-091b-4964-970d-a00876873de6	Bahasa Indonesia	Caption Poster	91	2026-09-10	2026-10-01 14:38:54.527876+07
9219df55-c1a3-41ba-8857-b1880e129634	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	46dd3781-ff6c-4770-a347-5422a6efddfc	Bahasa Indonesia	Caption Poster	98	2026-09-10	2026-10-01 14:38:54.527876+07
769361fd-8961-44e1-a4e6-187db3c12533	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	fb8682da-d1a6-4bcd-88ad-577ceb2b36fc	Bahasa Indonesia	Caption Poster	79	2026-09-10	2026-10-01 14:38:54.527876+07
a9a4f4d3-2563-4f2e-8504-041216a5b019	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	62fc1f90-7a97-4b08-b914-2f2243c75b85	Bahasa Indonesia	Caption Poster	87	2026-09-10	2026-10-01 14:38:54.527876+07
8c4d1e8e-24c3-4db4-9779-7128a3cfe4b9	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	00f37c28-c8ed-4bf2-b6a7-3126a75e0745	Bahasa Indonesia	Caption Poster	95	2026-09-10	2026-10-01 14:38:54.527876+07
8f06306d-9c0c-4cc4-bbfa-de513b15d64a	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	72be464c-986f-48a2-85df-750a393a55fc	Bahasa Indonesia	Caption Poster	80	2026-09-10	2026-10-01 14:38:54.527876+07
d75c9dff-ad32-4b06-b474-5ba37fe0b10c	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	18751472-ccd2-4b60-8a2b-924f0624567b	Bahasa Indonesia	Caption Poster	88	2026-09-10	2026-10-01 14:38:54.527876+07
402ab20e-962b-4875-a20c-7f89fcb41a20	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	7f4fca69-f0f3-4bb6-9a5c-1ac1759f54cb	Bahasa Indonesia	Caption Poster	91	2026-09-10	2026-10-01 14:38:54.527876+07
7887622e-e3ea-411a-8d13-bc02c150be97	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	43a2e079-1f15-4045-aa42-a4bfb5a2d157	Bahasa Indonesia	Caption Poster	76	2026-09-10	2026-10-01 14:38:54.527876+07
828bdbe9-8580-4296-b88c-2b2d8f54c694	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	991c36a6-c684-49b3-a0a2-4d4b4c06c099	Bahasa Indonesia	Caption Poster	85	2026-09-10	2026-10-01 14:38:54.527876+07
8c31de58-f0f5-4a58-8911-c5c8a213cc59	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	2a1cdaa2-4010-42d9-abc0-8e02da1f7149	Bahasa Indonesia	Caption Poster	93	2026-09-10	2026-10-01 14:38:54.527876+07
e6110cde-2742-4dc1-8542-3dbf6adf8dfa	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	00116bb5-1856-41c2-a82b-315e292ab22c	Bahasa Indonesia	Caption Poster	99	2026-09-10	2026-10-01 14:38:54.527876+07
4646cfc5-9e7f-4ca9-a5ab-80a19ac69fe6	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	4a264929-a958-4e4d-a2ce-a7099421a796	Bahasa Indonesia	Caption Poster	81	2026-09-10	2026-10-01 14:38:54.527876+07
1df27a9d-fecf-45a7-9024-7f7a7650718f	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	dfd0f7d8-0fc4-4c66-9ee4-d6a0dd4ec6ac	Bahasa Indonesia	Caption Poster	89	2026-09-10	2026-10-01 14:38:54.527876+07
ca7f0748-6e37-4ef2-bd49-548e7b09c464	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	6b2d4026-4fea-42f2-a927-1dc77d01a582	Bahasa Indonesia	Caption Poster	97	2026-09-10	2026-10-01 14:38:54.527876+07
ea59672e-891d-4ecf-ac39-f125506b0e20	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	6f60b65d-1bcd-489f-950d-00689b104e8b	Bahasa Indonesia	Caption Poster	82	2026-09-10	2026-10-01 14:38:54.527876+07
53527dec-3505-42ff-b5e8-1c0c66e5f6a8	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	8e2a4e02-9634-49a8-91f4-1f96f61cd43b	Bahasa Indonesia	Caption Poster	90	2026-09-10	2026-10-01 14:38:54.527876+07
efa4b455-df3c-4a0b-af31-41f23f96c2cd	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	d1c4d38a-de23-4ae7-8010-b5dcec300289	Bahasa Indonesia	Caption Poster	93	2026-09-10	2026-10-01 14:38:54.527876+07
d74b2030-e62f-4791-982d-fe087fb9f562	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	d422fcd6-2161-410e-b1e1-7b5a616e3f19	Bahasa Indonesia	Caption Poster	78	2026-09-10	2026-10-01 14:38:54.527876+07
e8fd32fc-56e2-47b5-887c-db0a1e3f967f	3535d275-b4c6-9601-e4b4-b57981176c39	d62d4825-66ac-31eb-182e-f3b2c4d17c36	47517c77-1e13-4f6b-ba0a-01f02e3ecda8	Bahasa Indonesia	Caption Poster	86	2026-09-10	2026-10-01 14:38:54.527876+07
8e08d7ec-4f23-4b58-a5ce-1de8c1c9ff21	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	ed3b4cce-daa5-4e27-9fd2-6b832e7054c9	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	74	2026-08-12	2026-10-01 14:38:54.527876+07
13752ea7-178f-400d-9404-0ed310b40702	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	88fd97ba-e199-455d-83fa-c4dcac822686	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	82	2026-08-12	2026-10-01 14:38:54.527876+07
c83c1c7a-5d61-4a35-8e3f-32508004f88a	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	7e190946-84bf-4bb9-aab8-3017aceadf8b	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	90	2026-08-12	2026-10-01 14:38:54.527876+07
d5e9424b-2780-4416-b0fd-6c66bab74a90	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	01d91d18-37ec-4517-b0d2-05923352e9bf	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	75	2026-08-12	2026-10-01 14:38:54.527876+07
ae799f64-cbc7-4ff6-ac7e-50fe9821fa7f	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	31a15f56-7f31-4de6-a428-1cc6c70e5a8c	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	78	2026-08-12	2026-10-01 14:38:54.527876+07
05bd5db4-5579-4472-ba0a-36bdc90e103e	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	944a7447-9e99-4a05-9bd4-39b2be336882	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	86	2026-08-12	2026-10-01 14:38:54.527876+07
a56cd74f-8e2d-4590-b472-0e1e506b5157	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	3ba48f01-b327-42ed-ad64-17622eee6b82	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	94	2026-08-12	2026-10-01 14:38:54.527876+07
8705ff48-c63a-44fb-953b-2d809e2b2ac9	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	9766e933-d64c-4392-b264-9138df2283f1	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	79	2026-08-12	2026-10-01 14:38:54.527876+07
22ef37df-f621-4c3b-82cf-e0ce62b78d02	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	618aa1fd-091b-4964-970d-a00876873de6	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	87	2026-08-12	2026-10-01 14:38:54.527876+07
e8a9f29c-6f47-409a-9e71-347f1439fa34	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	46dd3781-ff6c-4770-a347-5422a6efddfc	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	90	2026-08-12	2026-10-01 14:38:54.527876+07
ab7fbc83-a000-4514-9479-94b9bc1f2859	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	fb8682da-d1a6-4bcd-88ad-577ceb2b36fc	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	75	2026-08-12	2026-10-01 14:38:54.527876+07
c8b7bdab-2cda-4d20-87d8-7cf739b47c1c	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	62fc1f90-7a97-4b08-b914-2f2243c75b85	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	83	2026-08-12	2026-10-01 14:38:54.527876+07
43230a46-3ed2-4251-b9bf-3c2e76006034	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	00f37c28-c8ed-4bf2-b6a7-3126a75e0745	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	91	2026-08-12	2026-10-01 14:38:54.527876+07
f5044cbb-e03b-441f-9c57-c6a188a78e12	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	72be464c-986f-48a2-85df-750a393a55fc	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	76	2026-08-12	2026-10-01 14:38:54.527876+07
b1cd5e6e-ad06-48b8-aa2c-28d2ac51679d	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	18751472-ccd2-4b60-8a2b-924f0624567b	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	79	2026-08-12	2026-10-01 14:38:54.527876+07
93aa4aa1-49d7-407d-aa31-9b30df4e2b1b	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	7f4fca69-f0f3-4bb6-9a5c-1ac1759f54cb	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	87	2026-08-12	2026-10-01 14:38:54.527876+07
b84d0dff-ede4-4790-84a4-b19d9d535558	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	43a2e079-1f15-4045-aa42-a4bfb5a2d157	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	72	2026-08-12	2026-10-01 14:38:54.527876+07
d22d20d1-9385-4996-aef1-7b758350be7e	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	991c36a6-c684-49b3-a0a2-4d4b4c06c099	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	81	2026-08-12	2026-10-01 14:38:54.527876+07
8339428f-ff7c-4799-a21c-3da938d7e1a0	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	2a1cdaa2-4010-42d9-abc0-8e02da1f7149	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	89	2026-08-12	2026-10-01 14:38:54.527876+07
a269b156-a7bb-4db7-b7c2-40ee06ae6930	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	00116bb5-1856-41c2-a82b-315e292ab22c	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	92	2026-08-12	2026-10-01 14:38:54.527876+07
c83557a4-b280-4d1a-b7a7-ff004c4a3b0c	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	4a264929-a958-4e4d-a2ce-a7099421a796	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	77	2026-08-12	2026-10-01 14:38:54.527876+07
d2919e2a-5d46-4c35-99ed-ec2c5e019f0c	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	dfd0f7d8-0fc4-4c66-9ee4-d6a0dd4ec6ac	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	85	2026-08-12	2026-10-01 14:38:54.527876+07
3c4a081a-bfb0-452f-90d6-2550c7d1483f	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	6b2d4026-4fea-42f2-a927-1dc77d01a582	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	93	2026-08-12	2026-10-01 14:38:54.527876+07
9ae954bf-5649-4077-8e80-ba5af8f08287	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	6f60b65d-1bcd-489f-950d-00689b104e8b	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	78	2026-08-12	2026-10-01 14:38:54.527876+07
af003312-6ab3-4edc-a1fd-12885dd2e260	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	8e2a4e02-9634-49a8-91f4-1f96f61cd43b	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	81	2026-08-12	2026-10-01 14:38:54.527876+07
27a22137-00c1-414a-ae23-9c07914eb7c8	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	d1c4d38a-de23-4ae7-8010-b5dcec300289	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	89	2026-08-12	2026-10-01 14:38:54.527876+07
caf58fd0-cf44-4190-bc67-923960c73645	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	d422fcd6-2161-410e-b1e1-7b5a616e3f19	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	74	2026-08-12	2026-10-01 14:38:54.527876+07
81c249a6-0db5-4b0d-8e9f-0c996c7d2ca2	3535d275-b4c6-9601-e4b4-b57981176c39	0b1e4cb9-0998-79c8-73c6-65d9410c748f	47517c77-1e13-4f6b-ba0a-01f02e3ecda8	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	82	2026-08-12	2026-10-01 14:38:54.527876+07
9934f56d-8187-4d5d-9617-d1744cfad91c	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	ed3b4cce-daa5-4e27-9fd2-6b832e7054c9	Bahasa Indonesia	Copywriting Poster	78	2026-08-24	2026-10-01 14:38:54.527876+07
135c5f1e-3404-4226-8168-2b13cefda584	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	88fd97ba-e199-455d-83fa-c4dcac822686	Bahasa Indonesia	Copywriting Poster	86	2026-08-24	2026-10-01 14:38:54.527876+07
2f78f44f-f564-4110-adfc-a3cdbd7776b7	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	7e190946-84bf-4bb9-aab8-3017aceadf8b	Bahasa Indonesia	Copywriting Poster	94	2026-08-24	2026-10-01 14:38:54.527876+07
433bc613-282a-42b9-9672-d20fac4525f6	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	01d91d18-37ec-4517-b0d2-05923352e9bf	Bahasa Indonesia	Copywriting Poster	74	2026-08-24	2026-10-01 14:38:54.527876+07
57fbb2f0-8a22-4f46-8d4e-165555d79e93	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	31a15f56-7f31-4de6-a428-1cc6c70e5a8c	Bahasa Indonesia	Copywriting Poster	82	2026-08-24	2026-10-01 14:38:54.527876+07
ec1b63d9-f5b5-445e-a092-77b1d11a469c	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	944a7447-9e99-4a05-9bd4-39b2be336882	Bahasa Indonesia	Copywriting Poster	90	2026-08-24	2026-10-01 14:38:54.527876+07
d4667b78-cd26-4457-ac98-1b1d1f9249e9	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	3ba48f01-b327-42ed-ad64-17622eee6b82	Bahasa Indonesia	Copywriting Poster	98	2026-08-24	2026-10-01 14:38:54.527876+07
bc6026f9-ba29-4907-89ba-c3962631998e	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	9766e933-d64c-4392-b264-9138df2283f1	Bahasa Indonesia	Copywriting Poster	83	2026-08-24	2026-10-01 14:38:54.527876+07
33d50459-c533-4614-b311-140701b02954	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	618aa1fd-091b-4964-970d-a00876873de6	Bahasa Indonesia	Copywriting Poster	86	2026-08-24	2026-10-01 14:38:54.527876+07
21b899c9-3f93-42d7-b9a3-00d26df60a21	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	46dd3781-ff6c-4770-a347-5422a6efddfc	Bahasa Indonesia	Copywriting Poster	94	2026-08-24	2026-10-01 14:38:54.527876+07
b99141d8-d943-4d74-912d-79a445b6b4a2	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	fb8682da-d1a6-4bcd-88ad-577ceb2b36fc	Bahasa Indonesia	Copywriting Poster	79	2026-08-24	2026-10-01 14:38:54.527876+07
b6b3a1b7-673a-4f1c-a9d8-933f2b124402	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	62fc1f90-7a97-4b08-b914-2f2243c75b85	Bahasa Indonesia	Copywriting Poster	87	2026-08-24	2026-10-01 14:38:54.527876+07
ae1ef32e-02c7-4184-aab0-490b4449f047	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	00f37c28-c8ed-4bf2-b6a7-3126a75e0745	Bahasa Indonesia	Copywriting Poster	95	2026-08-24	2026-10-01 14:38:54.527876+07
d6787067-f26e-4a08-9e7e-7710b184d033	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	72be464c-986f-48a2-85df-750a393a55fc	Bahasa Indonesia	Copywriting Poster	75	2026-08-24	2026-10-01 14:38:54.527876+07
7cfa51c5-2f18-4f94-b16e-8538553364d6	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	18751472-ccd2-4b60-8a2b-924f0624567b	Bahasa Indonesia	Copywriting Poster	83	2026-08-24	2026-10-01 14:38:54.527876+07
c5f38b7a-97fd-47dd-961d-e0a8e87bd7c0	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	7f4fca69-f0f3-4bb6-9a5c-1ac1759f54cb	Bahasa Indonesia	Copywriting Poster	91	2026-08-24	2026-10-01 14:38:54.527876+07
9b0c0ebc-e65f-4908-aea8-02fe276fff76	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	43a2e079-1f15-4045-aa42-a4bfb5a2d157	Bahasa Indonesia	Copywriting Poster	76	2026-08-24	2026-10-01 14:38:54.527876+07
e00b7600-0755-4ce6-9779-07fb5947af7e	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	991c36a6-c684-49b3-a0a2-4d4b4c06c099	Bahasa Indonesia	Copywriting Poster	85	2026-08-24	2026-10-01 14:38:54.527876+07
51f7bf51-8562-4259-acca-8f9a69e8d06a	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	2a1cdaa2-4010-42d9-abc0-8e02da1f7149	Bahasa Indonesia	Copywriting Poster	88	2026-08-24	2026-10-01 14:38:54.527876+07
588333fb-a37e-4d68-8d31-ba1289ca10b6	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	00116bb5-1856-41c2-a82b-315e292ab22c	Bahasa Indonesia	Copywriting Poster	96	2026-08-24	2026-10-01 14:38:54.527876+07
3684ee4d-d71c-4f39-b262-9861f2af279a	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	4a264929-a958-4e4d-a2ce-a7099421a796	Bahasa Indonesia	Copywriting Poster	81	2026-08-24	2026-10-01 14:38:54.527876+07
9d65c3c3-7ec9-4730-a1ee-c9ffbab0fb0a	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	dfd0f7d8-0fc4-4c66-9ee4-d6a0dd4ec6ac	Bahasa Indonesia	Copywriting Poster	89	2026-08-24	2026-10-01 14:38:54.527876+07
82d9d4bb-73c1-4c57-a21f-9215a16634ec	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	6b2d4026-4fea-42f2-a927-1dc77d01a582	Bahasa Indonesia	Copywriting Poster	97	2026-08-24	2026-10-01 14:38:54.527876+07
68a2542b-84cc-4e1d-853b-02501869145d	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	6f60b65d-1bcd-489f-950d-00689b104e8b	Bahasa Indonesia	Copywriting Poster	77	2026-08-24	2026-10-01 14:38:54.527876+07
1a80d149-9cdb-49b7-a511-c74570995b49	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	8e2a4e02-9634-49a8-91f4-1f96f61cd43b	Bahasa Indonesia	Copywriting Poster	85	2026-08-24	2026-10-01 14:38:54.527876+07
069d9084-37ee-4fbf-afb2-c13d3362809a	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	d1c4d38a-de23-4ae7-8010-b5dcec300289	Bahasa Indonesia	Copywriting Poster	93	2026-08-24	2026-10-01 14:38:54.527876+07
45089ff1-6fab-4074-b911-506ad1ac4ac6	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	d422fcd6-2161-410e-b1e1-7b5a616e3f19	Bahasa Indonesia	Copywriting Poster	78	2026-08-24	2026-10-01 14:38:54.527876+07
5cff8446-b619-4ec8-aa0c-b9c610db09f1	3535d275-b4c6-9601-e4b4-b57981176c39	358c57fc-4c82-50e7-8980-91d2a7199f23	47517c77-1e13-4f6b-ba0a-01f02e3ecda8	Bahasa Indonesia	Copywriting Poster	86	2026-08-24	2026-10-01 14:38:54.527876+07
e98a1504-7c90-44b9-be9f-951adc6e66c5	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	ed3b4cce-daa5-4e27-9fd2-6b832e7054c9	Bahasa Indonesia	Laporan Proyek Desain	74	2026-09-01	2026-10-01 14:38:54.527876+07
387728e6-7c79-4348-b266-25e7faeed058	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	88fd97ba-e199-455d-83fa-c4dcac822686	Bahasa Indonesia	Laporan Proyek Desain	82	2026-09-01	2026-10-01 14:38:54.527876+07
e85b1a28-264f-419e-b642-b79371a33265	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	7e190946-84bf-4bb9-aab8-3017aceadf8b	Bahasa Indonesia	Laporan Proyek Desain	85	2026-09-01	2026-10-01 14:38:54.527876+07
d877747e-758b-4401-8334-006d75c25f29	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	01d91d18-37ec-4517-b0d2-05923352e9bf	Bahasa Indonesia	Laporan Proyek Desain	70	2026-09-01	2026-10-01 14:38:54.527876+07
80b5d352-42b9-4d29-a71e-6d962d02b7dd	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	31a15f56-7f31-4de6-a428-1cc6c70e5a8c	Bahasa Indonesia	Laporan Proyek Desain	78	2026-09-01	2026-10-01 14:38:54.527876+07
5b7d3263-ae96-45d9-98a9-07fa57dd8543	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	944a7447-9e99-4a05-9bd4-39b2be336882	Bahasa Indonesia	Laporan Proyek Desain	86	2026-09-01	2026-10-01 14:38:54.527876+07
c3d999c3-d5cc-41f3-93b8-21c3fb48460a	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	3ba48f01-b327-42ed-ad64-17622eee6b82	Bahasa Indonesia	Laporan Proyek Desain	94	2026-09-01	2026-10-01 14:38:54.527876+07
be726422-a237-4ed0-bc98-994715b96f76	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	9766e933-d64c-4392-b264-9138df2283f1	Bahasa Indonesia	Laporan Proyek Desain	74	2026-09-01	2026-10-01 14:38:54.527876+07
24141cf1-9042-4237-a5ee-7533229478af	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	618aa1fd-091b-4964-970d-a00876873de6	Bahasa Indonesia	Laporan Proyek Desain	82	2026-09-01	2026-10-01 14:38:54.527876+07
474a2f8a-9ff7-4292-9e45-1590346481ac	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	46dd3781-ff6c-4770-a347-5422a6efddfc	Bahasa Indonesia	Laporan Proyek Desain	90	2026-09-01	2026-10-01 14:38:54.527876+07
0d547b5c-ad2e-4f9d-836d-2494391803ca	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	fb8682da-d1a6-4bcd-88ad-577ceb2b36fc	Bahasa Indonesia	Laporan Proyek Desain	75	2026-09-01	2026-10-01 14:38:54.527876+07
1e16c5a0-7c67-48af-bce2-c0a00ee22b30	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	62fc1f90-7a97-4b08-b914-2f2243c75b85	Bahasa Indonesia	Laporan Proyek Desain	83	2026-09-01	2026-10-01 14:38:54.527876+07
c0e814b2-916c-4935-965b-879f364ceaf0	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	00f37c28-c8ed-4bf2-b6a7-3126a75e0745	Bahasa Indonesia	Laporan Proyek Desain	86	2026-09-01	2026-10-01 14:38:54.527876+07
41bc4f1c-cfdc-4a41-9a95-3d8157977706	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	72be464c-986f-48a2-85df-750a393a55fc	Bahasa Indonesia	Laporan Proyek Desain	71	2026-09-01	2026-10-01 14:38:54.527876+07
f3ef7543-6d52-4e4b-9b7d-a19dba3c854f	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	18751472-ccd2-4b60-8a2b-924f0624567b	Bahasa Indonesia	Laporan Proyek Desain	79	2026-09-01	2026-10-01 14:38:54.527876+07
39cabaf2-77d4-4bd1-a90b-284606e56c1a	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	7f4fca69-f0f3-4bb6-9a5c-1ac1759f54cb	Bahasa Indonesia	Laporan Proyek Desain	87	2026-09-01	2026-10-01 14:38:54.527876+07
9b574239-00b7-44c5-9aa1-9fdfdbb7d525	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	43a2e079-1f15-4045-aa42-a4bfb5a2d157	Bahasa Indonesia	Laporan Proyek Desain	72	2026-09-01	2026-10-01 14:38:54.527876+07
82518982-6ed7-486b-9717-83b82d8ebb8c	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	991c36a6-c684-49b3-a0a2-4d4b4c06c099	Bahasa Indonesia	Laporan Proyek Desain	76	2026-09-01	2026-10-01 14:38:54.527876+07
af22d6d1-db90-4667-834c-4f32d9aee88f	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	2a1cdaa2-4010-42d9-abc0-8e02da1f7149	Bahasa Indonesia	Laporan Proyek Desain	84	2026-09-01	2026-10-01 14:38:54.527876+07
753abbc8-9741-4313-bba9-b5603887ff64	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	00116bb5-1856-41c2-a82b-315e292ab22c	Bahasa Indonesia	Laporan Proyek Desain	92	2026-09-01	2026-10-01 14:38:54.527876+07
40b4d97b-26a1-40d5-963c-9db1c12453c6	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	4a264929-a958-4e4d-a2ce-a7099421a796	Bahasa Indonesia	Laporan Proyek Desain	77	2026-09-01	2026-10-01 14:38:54.527876+07
bd22fffa-03ce-402f-8046-6164121692af	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	dfd0f7d8-0fc4-4c66-9ee4-d6a0dd4ec6ac	Bahasa Indonesia	Laporan Proyek Desain	85	2026-09-01	2026-10-01 14:38:54.527876+07
effc8d8a-bcfe-4857-9a8e-f0b5926af926	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	6b2d4026-4fea-42f2-a927-1dc77d01a582	Bahasa Indonesia	Laporan Proyek Desain	88	2026-09-01	2026-10-01 14:38:54.527876+07
bc16619d-1eb3-4d6c-8a28-73c5754082af	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	6f60b65d-1bcd-489f-950d-00689b104e8b	Bahasa Indonesia	Laporan Proyek Desain	73	2026-09-01	2026-10-01 14:38:54.527876+07
05e1030c-3b21-46cd-bb25-9168ca0034b3	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	8e2a4e02-9634-49a8-91f4-1f96f61cd43b	Bahasa Indonesia	Laporan Proyek Desain	81	2026-09-01	2026-10-01 14:38:54.527876+07
34f1041e-6e56-4d9d-afce-286e866acaa4	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	d1c4d38a-de23-4ae7-8010-b5dcec300289	Bahasa Indonesia	Laporan Proyek Desain	89	2026-09-01	2026-10-01 14:38:54.527876+07
b564489c-dbf1-4db1-b6dd-62996e1e1293	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	d422fcd6-2161-410e-b1e1-7b5a616e3f19	Bahasa Indonesia	Laporan Proyek Desain	74	2026-09-01	2026-10-01 14:38:54.527876+07
016e6d9b-0e39-457a-b7f1-c434750b8e5d	3535d275-b4c6-9601-e4b4-b57981176c39	2cf3965b-df9c-438a-1977-f495a9108ef9	47517c77-1e13-4f6b-ba0a-01f02e3ecda8	Bahasa Indonesia	Laporan Proyek Desain	77	2026-09-01	2026-10-01 14:38:54.527876+07
51ba715b-46a2-49a2-9d13-6aed6ef06cd4	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	67456128-2464-4bce-9902-7a75d5e87c08	Bahasa Indonesia	Menulis Teks Eksposisi	87	2026-09-10	2026-10-01 14:38:54.527876+07
988ed322-308c-4487-8d47-582d2d15833c	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	42cfd4bb-72b9-4c65-8690-d660e92abd06	Bahasa Indonesia	Menulis Teks Eksposisi	95	2026-09-10	2026-10-01 14:38:54.527876+07
8e71587d-20d9-4255-b0ea-437e6ca4639b	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	6d6f3371-c3cf-4cc4-b872-a4085445f695	Bahasa Indonesia	Menulis Teks Eksposisi	100	2026-09-10	2026-10-01 14:38:54.527876+07
b31c137c-5e92-40fe-8bd3-79a295172a78	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	1eff5152-2da4-48d2-852d-9f98255c0fff	Bahasa Indonesia	Menulis Teks Eksposisi	88	2026-09-10	2026-10-01 14:38:54.527876+07
db419c05-49f3-44bc-ace4-1e4e65e5fad0	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	b14bb602-7b48-428a-af9d-ef2558cbb172	Bahasa Indonesia	Menulis Teks Eksposisi	96	2026-09-10	2026-10-01 14:38:54.527876+07
0527e216-ab3a-4d9e-a176-50693bd6fe25	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	4c214951-4517-4ea0-b1c7-4907cbb98ed9	Bahasa Indonesia	Menulis Teks Eksposisi	99	2026-09-10	2026-10-01 14:38:54.527876+07
b0a099f9-76cd-41ec-bd31-9598ee7ec7bd	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	0c8324b1-65f1-4280-9bb0-f40a7b9091df	Bahasa Indonesia	Menulis Teks Eksposisi	84	2026-09-10	2026-10-01 14:38:54.527876+07
595b47e8-e05c-46c7-9109-79793ceec63a	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	31aae0d7-c09f-468e-af16-b8196a72459d	Bahasa Indonesia	Menulis Teks Eksposisi	92	2026-09-10	2026-10-01 14:38:54.527876+07
4c559485-9e6a-4644-9624-51952c043e1e	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	144a5dd4-e014-433d-9981-892e7c3ab031	Bahasa Indonesia	Menulis Teks Eksposisi	100	2026-09-10	2026-10-01 14:38:54.527876+07
89eddbdc-bf11-439d-94cd-ea579a395be6	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	f5034142-4c02-4f83-8ad7-6b6336dd9d62	Bahasa Indonesia	Menulis Teks Eksposisi	85	2026-09-10	2026-10-01 14:38:54.527876+07
d944504b-a95e-4585-b617-e3418be447e6	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	703b9fc3-a41d-41d7-8dbb-feb71360a8cf	Bahasa Indonesia	Menulis Teks Eksposisi	88	2026-09-10	2026-10-01 14:38:54.527876+07
055244ea-3f62-4a8e-9cf7-5ab148c4330d	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	4f6de5d7-1e98-42ee-94a8-b82745bb3118	Bahasa Indonesia	Menulis Teks Eksposisi	96	2026-09-10	2026-10-01 14:38:54.527876+07
1f6c8a1e-b517-4102-8d6b-c8db0177219b	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	962928b8-8af1-491c-9835-7331012ad77c	Bahasa Indonesia	Menulis Teks Eksposisi	100	2026-09-10	2026-10-01 14:38:54.527876+07
5687cd71-6f18-4064-9216-ad5946b03028	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	04b00742-347c-45c9-99fc-2a4cef3806fb	Bahasa Indonesia	Menulis Teks Eksposisi	89	2026-09-10	2026-10-01 14:38:54.527876+07
efb74d0a-b72b-49ad-8b90-8a3a210992fb	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	2a25d9a4-7826-4397-861a-2b0df3d816a6	Bahasa Indonesia	Menulis Teks Eksposisi	97	2026-09-10	2026-10-01 14:38:54.527876+07
252a1cc0-4011-45ce-be76-386ef2350c6d	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	cb5df4a5-8dc6-4b11-855e-7b54b823bb9a	Bahasa Indonesia	Menulis Teks Eksposisi	100	2026-09-10	2026-10-01 14:38:54.527876+07
15db2539-6261-4ea2-88d2-bcdebab7ae53	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	73b570f5-becc-4b5f-8597-e7e8ecb5d731	Bahasa Indonesia	Menulis Teks Eksposisi	85	2026-09-10	2026-10-01 14:38:54.527876+07
7aa9b041-fd95-4667-9c61-118a67b28e35	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	d2e56fc9-21ca-4b9d-9cbc-bbc731c7f109	Bahasa Indonesia	Menulis Teks Eksposisi	93	2026-09-10	2026-10-01 14:38:54.527876+07
dd33ecaf-6c56-4d4f-b1b8-7f7bd286ebfe	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	fc737808-6aac-4efa-9fd3-35481131db0d	Bahasa Indonesia	Menulis Teks Eksposisi	100	2026-09-10	2026-10-01 14:38:54.527876+07
fddd2340-d4c6-4651-98c3-52251c1bcd9f	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	60868b7a-df6d-41ba-bac5-0e2607695eea	Bahasa Indonesia	Menulis Teks Eksposisi	85	2026-09-10	2026-10-01 14:38:54.527876+07
5bed0a34-9ed7-42ce-8ddd-207d80da78c4	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	faf442a3-95c4-40c3-9a5c-292d2c328f4e	Bahasa Indonesia	Menulis Teks Eksposisi	88	2026-09-10	2026-10-01 14:38:54.527876+07
d0c983a6-59b6-494f-9736-e559d4185b21	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	3eee6182-1bba-46e0-9146-9116a260773c	Bahasa Indonesia	Menulis Teks Eksposisi	96	2026-09-10	2026-10-01 14:38:54.527876+07
5224dc37-119c-4c0b-9c06-ab1d26c0db25	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	c860ee43-a393-421f-8e98-114fc699c7e7	Bahasa Indonesia	Menulis Teks Eksposisi	81	2026-09-10	2026-10-01 14:38:54.527876+07
bcdb319d-a96c-4888-927c-40957de7e7ce	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	baa0777c-7ac9-47a3-9ce8-c1fc164261e2	Bahasa Indonesia	Menulis Teks Eksposisi	89	2026-09-10	2026-10-01 14:38:54.527876+07
6064e45b-ec3f-4dd5-b5d8-1bed7e2c5405	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	a82349c8-e917-45f9-8833-e46d6094e4b7	Bahasa Indonesia	Menulis Teks Eksposisi	97	2026-09-10	2026-10-01 14:38:54.527876+07
d95c2276-5f8c-42a0-b9a5-f52b1e0f96d0	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	27c9b5fc-e6d1-4844-8382-6e547c54c04e	Bahasa Indonesia	Menulis Teks Eksposisi	100	2026-09-10	2026-10-01 14:38:54.527876+07
9119caf3-8e75-43a3-836d-6a43c9c3f66f	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	aca8a385-3f53-44c3-b6a6-8998d593da2c	Bahasa Indonesia	Menulis Teks Eksposisi	85	2026-09-10	2026-10-01 14:38:54.527876+07
c100177f-123c-410f-bbeb-0dd29053ca23	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	7a45981c-1cb1-446c-9a65-7ac0c9865e85	Bahasa Indonesia	Menulis Teks Eksposisi	93	2026-09-10	2026-10-01 14:38:54.527876+07
c75bbe32-b171-4320-97c4-11c9828ea57e	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	0ef61474-e479-4e95-a456-4780bee27050	Bahasa Indonesia	Menulis Teks Eksposisi	100	2026-09-10	2026-10-01 14:38:54.527876+07
39ade316-4d16-4dd3-8a95-e01a51eb8bd2	407a66ba-e691-c373-c7fd-d40671b6596b	da421492-9d40-5925-7892-22b47fdc7445	a90e2951-1040-45e9-a98c-3b5920fceed8	Bahasa Indonesia	Menulis Teks Eksposisi	86	2026-09-10	2026-10-01 14:38:54.527876+07
32f45dc2-5d08-4a9e-8c53-3ef02d2b3e43	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	67456128-2464-4bce-9902-7a75d5e87c08	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	83	2026-08-12	2026-10-01 14:38:54.527876+07
463646f7-3454-4b17-adb9-f9c4c8ec522f	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	42cfd4bb-72b9-4c65-8690-d660e92abd06	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	91	2026-08-12	2026-10-01 14:38:54.527876+07
79b84569-ec5e-4b1f-adeb-de0e692c9f04	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	6d6f3371-c3cf-4cc4-b872-a4085445f695	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	99	2026-08-12	2026-10-01 14:38:54.527876+07
3a2de4db-454d-4a53-a893-5228749299ee	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	1eff5152-2da4-48d2-852d-9f98255c0fff	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	84	2026-08-12	2026-10-01 14:38:54.527876+07
6b488e0d-fc9d-4fde-b4c2-7a9c4256fad9	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	b14bb602-7b48-428a-af9d-ef2558cbb172	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	87	2026-08-12	2026-10-01 14:38:54.527876+07
de4ff2dc-8f4f-4a7d-8697-54882775a782	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	4c214951-4517-4ea0-b1c7-4907cbb98ed9	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	95	2026-08-12	2026-10-01 14:38:54.527876+07
29836301-5148-4d79-9f7e-d8317eca71be	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	0c8324b1-65f1-4280-9bb0-f40a7b9091df	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	80	2026-08-12	2026-10-01 14:38:54.527876+07
4bde487e-95e6-460e-a7c0-b1216eab5fb1	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	31aae0d7-c09f-468e-af16-b8196a72459d	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	88	2026-08-12	2026-10-01 14:38:54.527876+07
e3f82fcb-4c8b-4d2f-a604-da42aedbc98e	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	144a5dd4-e014-433d-9981-892e7c3ab031	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	96	2026-08-12	2026-10-01 14:38:54.527876+07
93a0b8a4-e93a-4062-a1f6-5fc8d94facda	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	f5034142-4c02-4f83-8ad7-6b6336dd9d62	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	76	2026-08-12	2026-10-01 14:38:54.527876+07
69eba55a-db28-48f9-8241-90352502f704	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	703b9fc3-a41d-41d7-8dbb-feb71360a8cf	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	84	2026-08-12	2026-10-01 14:38:54.527876+07
691f7c71-0a44-4009-bb19-88a4760ef71e	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	4f6de5d7-1e98-42ee-94a8-b82745bb3118	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	92	2026-08-12	2026-10-01 14:38:54.527876+07
dd679f52-7bb8-432c-980f-67b68d646503	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	962928b8-8af1-491c-9835-7331012ad77c	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	100	2026-08-12	2026-10-01 14:38:54.527876+07
ce37ba3e-084c-40d5-b588-3c1fbdd2ffca	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	04b00742-347c-45c9-99fc-2a4cef3806fb	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	85	2026-08-12	2026-10-01 14:38:54.527876+07
6b6df0fa-ec3e-4cc8-bd1b-30f44c6716fe	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	2a25d9a4-7826-4397-861a-2b0df3d816a6	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	88	2026-08-12	2026-10-01 14:38:54.527876+07
541980c4-1de5-4841-a253-ef314ea397cc	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	cb5df4a5-8dc6-4b11-855e-7b54b823bb9a	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	96	2026-08-12	2026-10-01 14:38:54.527876+07
7b312580-7d4e-48c1-8732-900d84df6d00	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	73b570f5-becc-4b5f-8597-e7e8ecb5d731	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	81	2026-08-12	2026-10-01 14:38:54.527876+07
67db22d6-371f-472e-8d73-9cee2427c9fd	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	d2e56fc9-21ca-4b9d-9cbc-bbc731c7f109	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	89	2026-08-12	2026-10-01 14:38:54.527876+07
9f00f0fb-a095-4e4c-b40a-307477ff2240	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	fc737808-6aac-4efa-9fd3-35481131db0d	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	96	2026-08-12	2026-10-01 14:38:54.527876+07
d90bb0e5-0280-4b6c-851c-91b490418b59	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	60868b7a-df6d-41ba-bac5-0e2607695eea	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	76	2026-08-12	2026-10-01 14:38:54.527876+07
181e9eb5-896c-4ee8-afc8-0fa645302f02	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	faf442a3-95c4-40c3-9a5c-292d2c328f4e	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	84	2026-08-12	2026-10-01 14:38:54.527876+07
63fe49c3-7629-45de-b37d-ef31666fbbca	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	3eee6182-1bba-46e0-9146-9116a260773c	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	92	2026-08-12	2026-10-01 14:38:54.527876+07
22b6c841-a1b9-4f9f-ad6e-a5ee26d38a33	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	c860ee43-a393-421f-8e98-114fc699c7e7	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	77	2026-08-12	2026-10-01 14:38:54.527876+07
d6d774c2-a9fa-4c3e-b8f7-5404fc91d9a0	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	baa0777c-7ac9-47a3-9ce8-c1fc164261e2	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	85	2026-08-12	2026-10-01 14:38:54.527876+07
9a4a3fc8-5faa-4b78-a979-0f02c96f7c07	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	a82349c8-e917-45f9-8833-e46d6094e4b7	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	88	2026-08-12	2026-10-01 14:38:54.527876+07
78ef5f19-5d4c-4bd3-9453-444a2d105c0d	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	27c9b5fc-e6d1-4844-8382-6e547c54c04e	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	96	2026-08-12	2026-10-01 14:38:54.527876+07
204b4080-0b91-4615-8ead-0dac7e8ccd34	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	aca8a385-3f53-44c3-b6a6-8998d593da2c	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	81	2026-08-12	2026-10-01 14:38:54.527876+07
82cf513a-e6c7-4a7f-ab0c-253495c51b43	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	7a45981c-1cb1-446c-9a65-7ac0c9865e85	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	89	2026-08-12	2026-10-01 14:38:54.527876+07
f0906aa7-cf9f-43e3-8ce0-320e6650de1d	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	0ef61474-e479-4e95-a456-4780bee27050	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	98	2026-08-12	2026-10-01 14:38:54.527876+07
27e4ed19-9f43-4dc3-aa6b-30a76f4194be	407a66ba-e691-c373-c7fd-d40671b6596b	a672ee27-6c81-085a-b74e-0c9b57211f58	a90e2951-1040-45e9-a98c-3b5920fceed8	Bahasa Indonesia	Analisis Unsur Intrinsik Cerpen	77	2026-08-12	2026-10-01 14:38:54.527876+07
4242148f-80e6-4fd2-a9c7-2a25e654cd11	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	67456128-2464-4bce-9902-7a75d5e87c08	Bahasa Indonesia	Membuat Teks Pidato Persuasif	87	2026-09-10	2026-10-01 14:38:54.527876+07
f238bbc9-3e9b-4e81-9a1a-9a38e54d218b	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	42cfd4bb-72b9-4c65-8690-d660e92abd06	Bahasa Indonesia	Membuat Teks Pidato Persuasif	95	2026-09-10	2026-10-01 14:38:54.527876+07
e69eeec5-e27a-4698-b411-8129426c20da	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	6d6f3371-c3cf-4cc4-b872-a4085445f695	Bahasa Indonesia	Membuat Teks Pidato Persuasif	100	2026-09-10	2026-10-01 14:38:54.527876+07
43a30996-a2a7-47ea-98ab-dc426aeb82ae	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	1eff5152-2da4-48d2-852d-9f98255c0fff	Bahasa Indonesia	Membuat Teks Pidato Persuasif	83	2026-09-10	2026-10-01 14:38:54.527876+07
562fab7c-c44b-4884-b678-9f5005c97e10	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	b14bb602-7b48-428a-af9d-ef2558cbb172	Bahasa Indonesia	Membuat Teks Pidato Persuasif	91	2026-09-10	2026-10-01 14:38:54.527876+07
99391889-5161-4fb1-b196-046bde749c80	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	4c214951-4517-4ea0-b1c7-4907cbb98ed9	Bahasa Indonesia	Membuat Teks Pidato Persuasif	99	2026-09-10	2026-10-01 14:38:54.527876+07
bbaae498-2428-436e-8137-284e002c7802	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	0c8324b1-65f1-4280-9bb0-f40a7b9091df	Bahasa Indonesia	Membuat Teks Pidato Persuasif	84	2026-09-10	2026-10-01 14:38:54.527876+07
2bcf062d-eb10-4e0a-9c6a-d59fdd07d370	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	31aae0d7-c09f-468e-af16-b8196a72459d	Bahasa Indonesia	Membuat Teks Pidato Persuasif	92	2026-09-10	2026-10-01 14:38:54.527876+07
089201e3-b957-4fd4-94b2-65dc0bc67e2d	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	144a5dd4-e014-433d-9981-892e7c3ab031	Bahasa Indonesia	Membuat Teks Pidato Persuasif	95	2026-09-10	2026-10-01 14:38:54.527876+07
c65b1358-390e-457d-9dd2-185e17d413a1	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	f5034142-4c02-4f83-8ad7-6b6336dd9d62	Bahasa Indonesia	Membuat Teks Pidato Persuasif	80	2026-09-10	2026-10-01 14:38:54.527876+07
88b229ed-9755-455f-aa3b-d42f00dacdb9	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	703b9fc3-a41d-41d7-8dbb-feb71360a8cf	Bahasa Indonesia	Membuat Teks Pidato Persuasif	88	2026-09-10	2026-10-01 14:38:54.527876+07
d6aa78e6-028f-4b01-8d2f-7ee91d8c8320	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	4f6de5d7-1e98-42ee-94a8-b82745bb3118	Bahasa Indonesia	Membuat Teks Pidato Persuasif	96	2026-09-10	2026-10-01 14:38:54.527876+07
aa5ed754-9492-4748-a9b6-79f112389327	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	962928b8-8af1-491c-9835-7331012ad77c	Bahasa Indonesia	Membuat Teks Pidato Persuasif	100	2026-09-10	2026-10-01 14:38:54.527876+07
4509df55-f0f0-411d-8f98-0cdc6bc28224	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	04b00742-347c-45c9-99fc-2a4cef3806fb	Bahasa Indonesia	Membuat Teks Pidato Persuasif	84	2026-09-10	2026-10-01 14:38:54.527876+07
1e870e99-dd03-413f-b443-73cd180dabe2	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	2a25d9a4-7826-4397-861a-2b0df3d816a6	Bahasa Indonesia	Membuat Teks Pidato Persuasif	92	2026-09-10	2026-10-01 14:38:54.527876+07
1d9f540b-82fc-4dd2-9bd4-dbf3db895f61	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	cb5df4a5-8dc6-4b11-855e-7b54b823bb9a	Bahasa Indonesia	Membuat Teks Pidato Persuasif	100	2026-09-10	2026-10-01 14:38:54.527876+07
e1ddebba-c6cb-40fc-89a4-b6bb44f0586c	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	73b570f5-becc-4b5f-8597-e7e8ecb5d731	Bahasa Indonesia	Membuat Teks Pidato Persuasif	85	2026-09-10	2026-10-01 14:38:54.527876+07
aa3a408f-f184-4746-9d32-1d9b427a14ad	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	d2e56fc9-21ca-4b9d-9cbc-bbc731c7f109	Bahasa Indonesia	Membuat Teks Pidato Persuasif	92	2026-09-10	2026-10-01 14:38:54.527876+07
33bc3a9f-081f-43c1-bd4d-fc92dd72a56d	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	fc737808-6aac-4efa-9fd3-35481131db0d	Bahasa Indonesia	Membuat Teks Pidato Persuasif	95	2026-09-10	2026-10-01 14:38:54.527876+07
2c14ada7-3364-46fd-a3ee-2e67d2cdd619	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	60868b7a-df6d-41ba-bac5-0e2607695eea	Bahasa Indonesia	Membuat Teks Pidato Persuasif	80	2026-09-10	2026-10-01 14:38:54.527876+07
0a9de08e-43ad-4589-ac15-d95445a20d93	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	faf442a3-95c4-40c3-9a5c-292d2c328f4e	Bahasa Indonesia	Membuat Teks Pidato Persuasif	88	2026-09-10	2026-10-01 14:38:54.527876+07
e63a2e20-9e6c-437d-9f3f-cdc987b6fa0a	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	3eee6182-1bba-46e0-9146-9116a260773c	Bahasa Indonesia	Membuat Teks Pidato Persuasif	96	2026-09-10	2026-10-01 14:38:54.527876+07
9bb8ea05-f3a0-41d4-b478-9af11fb657bd	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	c860ee43-a393-421f-8e98-114fc699c7e7	Bahasa Indonesia	Membuat Teks Pidato Persuasif	81	2026-09-10	2026-10-01 14:38:54.527876+07
e535e54e-9aa2-4781-8b1b-4fb036d4fd6e	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	baa0777c-7ac9-47a3-9ce8-c1fc164261e2	Bahasa Indonesia	Membuat Teks Pidato Persuasif	84	2026-09-10	2026-10-01 14:38:54.527876+07
7afceed8-2a3f-40bb-b8b1-c998181ac2f8	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	a82349c8-e917-45f9-8833-e46d6094e4b7	Bahasa Indonesia	Membuat Teks Pidato Persuasif	92	2026-09-10	2026-10-01 14:38:54.527876+07
4ded4f01-ce99-4d09-bcea-b8d24acbc74e	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	27c9b5fc-e6d1-4844-8382-6e547c54c04e	Bahasa Indonesia	Membuat Teks Pidato Persuasif	100	2026-09-10	2026-10-01 14:38:54.527876+07
5d06257f-79cd-44e1-8deb-21562ecc3902	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	aca8a385-3f53-44c3-b6a6-8998d593da2c	Bahasa Indonesia	Membuat Teks Pidato Persuasif	85	2026-09-10	2026-10-01 14:38:54.527876+07
c2cdd682-600e-45d3-aff1-5c1ab41faf14	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	7a45981c-1cb1-446c-9a65-7ac0c9865e85	Bahasa Indonesia	Membuat Teks Pidato Persuasif	93	2026-09-10	2026-10-01 14:38:54.527876+07
68bf1f8f-c4a5-490f-845b-fa07b54e0652	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	0ef61474-e479-4e95-a456-4780bee27050	Bahasa Indonesia	Membuat Teks Pidato Persuasif	96	2026-09-10	2026-10-01 14:38:54.527876+07
b5d87987-4ed3-4238-ab94-1db37541cc1f	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	baa0777c-7ac9-47a3-9ce8-c1fc164261e2	Bahasa Indonesia	Membuat Resensi Buku	80	2026-09-01	2026-10-01 14:38:54.527876+07
498a7ae4-614e-4c75-b11d-b7848f1574cf	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	a82349c8-e917-45f9-8833-e46d6094e4b7	Bahasa Indonesia	Membuat Resensi Buku	88	2026-09-01	2026-10-01 14:38:54.527876+07
56042bb4-bbf2-43cc-9fcf-6d557f36cd7b	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	27c9b5fc-e6d1-4844-8382-6e547c54c04e	Bahasa Indonesia	Membuat Resensi Buku	96	2026-09-01	2026-10-01 14:38:54.527876+07
bbc0db68-5b6d-40e1-9315-fdecb4bde956	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	aca8a385-3f53-44c3-b6a6-8998d593da2c	Bahasa Indonesia	Membuat Resensi Buku	81	2026-09-01	2026-10-01 14:38:54.527876+07
ad0cf1a5-ff52-4f02-902f-b3e2f7f5cd1e	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	7a45981c-1cb1-446c-9a65-7ac0c9865e85	Bahasa Indonesia	Membuat Resensi Buku	84	2026-09-01	2026-10-01 14:38:54.527876+07
764f4d53-657c-495c-980e-a85aba1f39d4	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	0ef61474-e479-4e95-a456-4780bee27050	Bahasa Indonesia	Membuat Resensi Buku	92	2026-09-01	2026-10-01 14:38:54.527876+07
64bfa3a8-b1f3-4dab-87d8-f172ce693afe	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	a90e2951-1040-45e9-a98c-3b5920fceed8	Bahasa Indonesia	Membuat Resensi Buku	77	2026-09-01	2026-10-01 14:38:54.527876+07
bbda1d9b-6a45-4ba3-8c04-3aefb8c4b773	407a66ba-e691-c373-c7fd-d40671b6596b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	a90e2951-1040-45e9-a98c-3b5920fceed8	Bahasa Indonesia	Membuat Teks Pidato Persuasif	81	2026-09-10	2026-10-01 14:38:54.527876+07
bba2e87b-c83b-4497-af39-3f4ceb69b3d9	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	67456128-2464-4bce-9902-7a75d5e87c08	Bahasa Indonesia	Membuat Resensi Buku	83	2026-09-01	2026-10-01 14:38:54.527876+07
28303aae-13c8-4f94-bb49-79c726bc6179	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	42cfd4bb-72b9-4c65-8690-d660e92abd06	Bahasa Indonesia	Membuat Resensi Buku	91	2026-09-01	2026-10-01 14:38:54.527876+07
5d043f4e-b841-4c1e-9edd-55e4fdcbe182	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	6d6f3371-c3cf-4cc4-b872-a4085445f695	Bahasa Indonesia	Membuat Resensi Buku	94	2026-09-01	2026-10-01 14:38:54.527876+07
51598358-97cb-4552-9d15-f32a838cd43e	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	1eff5152-2da4-48d2-852d-9f98255c0fff	Bahasa Indonesia	Membuat Resensi Buku	79	2026-09-01	2026-10-01 14:38:54.527876+07
c43fe630-79e7-497b-98df-3e3d22fec449	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	b14bb602-7b48-428a-af9d-ef2558cbb172	Bahasa Indonesia	Membuat Resensi Buku	87	2026-09-01	2026-10-01 14:38:54.527876+07
3f8720ad-1583-47d4-8426-9b158f168e9c	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	4c214951-4517-4ea0-b1c7-4907cbb98ed9	Bahasa Indonesia	Membuat Resensi Buku	95	2026-09-01	2026-10-01 14:38:54.527876+07
b62c6ef3-2b63-4714-ac89-e91eda6ff39f	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	0c8324b1-65f1-4280-9bb0-f40a7b9091df	Bahasa Indonesia	Membuat Resensi Buku	80	2026-09-01	2026-10-01 14:38:54.527876+07
d64b2d4c-6bf5-4e42-b757-98b2adcfc218	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	31aae0d7-c09f-468e-af16-b8196a72459d	Bahasa Indonesia	Membuat Resensi Buku	83	2026-09-01	2026-10-01 14:38:54.527876+07
4554c595-2a10-49df-a3af-fdb4416d3774	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	144a5dd4-e014-433d-9981-892e7c3ab031	Bahasa Indonesia	Membuat Resensi Buku	91	2026-09-01	2026-10-01 14:38:54.527876+07
fd922cf2-2d09-4623-b79a-a404d3e87f5e	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	f5034142-4c02-4f83-8ad7-6b6336dd9d62	Bahasa Indonesia	Membuat Resensi Buku	76	2026-09-01	2026-10-01 14:38:54.527876+07
ed053e29-991c-4a09-83ee-1563dd713ce5	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	703b9fc3-a41d-41d7-8dbb-feb71360a8cf	Bahasa Indonesia	Membuat Resensi Buku	84	2026-09-01	2026-10-01 14:38:54.527876+07
4fb2bd49-5604-428b-a319-2170cb7d75ab	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	4f6de5d7-1e98-42ee-94a8-b82745bb3118	Bahasa Indonesia	Membuat Resensi Buku	92	2026-09-01	2026-10-01 14:38:54.527876+07
8ed7b086-9b3e-481e-99d2-6aecd88e6847	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	962928b8-8af1-491c-9835-7331012ad77c	Bahasa Indonesia	Membuat Resensi Buku	95	2026-09-01	2026-10-01 14:38:54.527876+07
fc072dc8-15bc-485e-b4b0-8b7e2c28a76d	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	04b00742-347c-45c9-99fc-2a4cef3806fb	Bahasa Indonesia	Membuat Resensi Buku	80	2026-09-01	2026-10-01 14:38:54.527876+07
d25ec0a7-9a1f-4913-b6e4-76cb6af32752	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	2a25d9a4-7826-4397-861a-2b0df3d816a6	Bahasa Indonesia	Membuat Resensi Buku	88	2026-09-01	2026-10-01 14:38:54.527876+07
4f0db33e-e044-4175-a8c9-badcb618c04c	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	cb5df4a5-8dc6-4b11-855e-7b54b823bb9a	Bahasa Indonesia	Membuat Resensi Buku	96	2026-09-01	2026-10-01 14:38:54.527876+07
99debacb-f385-4631-a9bb-91db4dbc161e	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	73b570f5-becc-4b5f-8597-e7e8ecb5d731	Bahasa Indonesia	Membuat Resensi Buku	81	2026-09-01	2026-10-01 14:38:54.527876+07
8d6963fa-5472-4e4d-8114-d5fa65579621	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	d2e56fc9-21ca-4b9d-9cbc-bbc731c7f109	Bahasa Indonesia	Membuat Resensi Buku	83	2026-09-01	2026-10-01 14:38:54.527876+07
5c725283-c3e8-4295-bc4e-649e067cb54d	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	fc737808-6aac-4efa-9fd3-35481131db0d	Bahasa Indonesia	Membuat Resensi Buku	91	2026-09-01	2026-10-01 14:38:54.527876+07
53b47eaa-1aa1-4e5a-8bab-bcfa04552a29	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	60868b7a-df6d-41ba-bac5-0e2607695eea	Bahasa Indonesia	Membuat Resensi Buku	76	2026-09-01	2026-10-01 14:38:54.527876+07
84b9af2d-6c7c-426b-9c89-c57ce852463e	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	faf442a3-95c4-40c3-9a5c-292d2c328f4e	Bahasa Indonesia	Membuat Resensi Buku	84	2026-09-01	2026-10-01 14:38:54.527876+07
c0d71741-1629-4dba-9403-7cb53db7e842	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	3eee6182-1bba-46e0-9146-9116a260773c	Bahasa Indonesia	Membuat Resensi Buku	92	2026-09-01	2026-10-01 14:38:54.527876+07
ca66663d-c67a-4fc9-90fe-aa5f591b0078	407a66ba-e691-c373-c7fd-d40671b6596b	a1382eca-43a1-c1f5-4baa-fc2972675d66	c860ee43-a393-421f-8e98-114fc699c7e7	Bahasa Indonesia	Membuat Resensi Buku	72	2026-09-01	2026-10-01 14:38:54.527876+07
\.


--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.materials (id, teacher_id, class_id, title, description, attachments, pages, status, views, "position", created_at) FROM stdin;
dbbd2405-810b-1b14-40ae-749808f5a2be	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	46a5ee71-767e-778d-e2a9-334eb0845e73	Belajar Teks Eksposisi	Mengenal teks eksposisi sebagai teks yang bertujuan menjelaskan suatu peristiwa atau gagasan secara sistematis. Materi ini membahas tesis, rangkaian argumen, dan penegasan ulang, disertai contoh teks tentang isu lingkungan di sekitar sekolah.	{/materi/eksposisi-modul.pdf,https://kemdikbud.go.id/teks-eksposisi}	0	published	0	1	2026-10-01 14:38:54.527876+07
feca82f4-ac59-5530-bd8c-88da340046dd	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	46a5ee71-767e-778d-e2a9-334eb0845e73	Unsur Intrinsik Cerpen	Mempelajari lima unsur intrinsik cerpen — tokoh, penokohan, latar, konflik, dan amanat — beserta cara mengidentifikasi setiap unsur pada kutipan cerita pendek.	{/materi/cerpen-unsur.pdf,/materi/cerpen-kisah-di-sekolah.docx}	0	published	0	2	2026-10-01 14:38:54.527876+07
67c02dba-a922-5aef-42ee-66ef4cc0d7a5	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	46a5ee71-767e-778d-e2a9-334eb0845e73	Teks Pidato Persuasif	Struktur pembuka, isi, dan penutup teks pidato persuasif, disertai teknik kebahasaan persuasif dan cara menyusun data yang kuat untuk membahas isu lingkungan.	{https://id.wikipedia.org/wiki/Pidato_persuasif}	0	published	0	3	2026-10-01 14:38:54.527876+07
d72b283b-13a3-42c7-21f8-fe4589a67c73	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	46a5ee71-767e-778d-e2a9-334eb0845e73	Membuat Resensi Buku	Panduan menulis resensi: identitas buku, sinopsis, kelebihan, dan kekurangan, serta cara memberi rekomendasi yang jujur berdasarkan pembacaan utuh.	{/materi/resensi-panduan.pdf,/materi/contoh-resensi.pdf}	0	published	0	4	2026-10-01 14:38:54.527876+07
3c08b73e-53e2-0285-21b0-ffd531484cba	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	3535d275-b4c6-9601-e4b4-b57981176c39	Teks Deskripsi dalam Desain Visual	Menerapkan struktur teks deskripsi pada caption dan keterangan karya visual: objek, atribut, dan suasana. Materi disertai contoh caption poster dan produk kemasan.	{/materi/deskripsi-visual.pdf,/materi/contoh-caption-poster.jpg}	0	published	0	1	2026-10-01 14:38:54.527876+07
464cd48a-43cd-6671-3275-e91cf5ff84b6	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	3535d275-b4c6-9601-e4b4-b57981176c39	Copywriting untuk Poster & Kemasan	Menyusun judul, subjudul, dan kalimat ajakan singkat yang efektif untuk media cetak, dengan perhatian pada daya tarik visual dan batasan karakter.	{/materi/copywriting-poster.pdf,https://kemdikbud.go.id/copywriting}	0	published	0	2	2026-10-01 14:38:54.527876+07
e281575f-38ab-ae0f-3cdc-61a55ee6c5e8	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	3535d275-b4c6-9601-e4b4-b57981176c39	Teks Laporan Hasil Proyek	Struktur laporan proyek desain: latar belakang, tujuan, proses pembuatan, hasil, dan kesimpulan, beserta cara menyusun dokumentasi visual yang runtut.	{/materi/laporan-proyek.pdf}	0	published	0	3	2026-10-01 14:38:54.527876+07
4da65bf8-ba37-d9e9-bd67-811cd992c9b5	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	3535d275-b4c6-9601-e4b4-b57981176c39	Etika dan Bahasa dalam Publikasi	Penggunaan bahasa Indonesia yang baku pada poster, katalog, dan media sosial, termasuk ejaan, kapitalisasi, serta menghindari bahasa yang menyinggung.	{/materi/etika-bahasa.pdf,https://kbbi.kemdikbud.go.id/}	0	published	0	4	2026-10-01 14:38:54.527876+07
6371c22f-2cab-53a0-fb35-a92461857895	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	407a66ba-e691-c373-c7fd-d40671b6596b	Belajar Teks Eksposisi	Mengenal teks eksposisi sebagai teks yang bertujuan menjelaskan suatu peristiwa atau gagasan secara sistematis, beserta tesis, rangkaian argumen, dan penegasan ulang.	{/materi/eksposisi-modul.pdf,https://kemdikbud.go.id/teks-eksposisi}	0	published	0	1	2026-10-01 14:38:54.527876+07
b6b0f4c6-f223-cdd2-95f7-219ccab6e925	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	407a66ba-e691-c373-c7fd-d40671b6596b	Unsur Intrinsik Cerpen	Mempelajari lima unsur intrinsik cerpen — tokoh, penokohan, latar, konflik, dan amanat — beserta cara mengidentifikasi setiap unsur pada kutipan cerita pendek.	{/materi/cerpen-unsur.pdf,/materi/cerpen-kisah-di-sekolah.docx}	0	published	0	2	2026-10-01 14:38:54.527876+07
0c840d7d-76eb-25d9-e83d-1b8377575668	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	407a66ba-e691-c373-c7fd-d40671b6596b	Teks Pidato Persuasif	Struktur pembuka, isi, dan penutup teks pidato persuasif, disertai teknik kebahasaan persuasif dan cara menyusun data yang kuat untuk membahas isu lingkungan.	{https://id.wikipedia.org/wiki/Pidato_persuasif}	0	published	0	3	2026-10-01 14:38:54.527876+07
eda8f03d-42f0-9aaf-b6e7-f50096c4eef0	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	407a66ba-e691-c373-c7fd-d40671b6596b	Membuat Resensi Buku	Panduan menulis resensi: identitas buku, sinopsis, kelebihan, dan kekurangan, serta cara memberi rekomendasi yang jujur berdasarkan pembacaan utuh.	{/materi/resensi-panduan.pdf,/materi/contoh-resensi.pdf}	0	published	0	4	2026-10-01 14:38:54.527876+07
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, email, name, role, class_name, avatar, created_at, phone, subject, is_active, must_change_password) FROM stdin;
77db7bd6-e1c5-47b4-a6bf-56af65ea21d7	siswa1@grafidu.sch.id	Farid Pratama Putra	student	XI RPL B	/assets/logo.png	2026-09-28 09:18:10.02694+07	\N	\N	t	f
e94384ff-fcf2-434a-b0e2-6c71a16e5529	admin1@grafidu.sch.id	Gibran	admin	\N	/assets/logo.png	2026-09-28 09:20:06.092717+07	\N	\N	t	f
bdf6187d-5f04-4e52-864b-1aa87a1c143e	murid.27.xirplb@grafidu.sch.id	Umar Shara	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	admin@grafidu.sch.id	Bu Dewi Lestari	teacher	\N	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
2f0e1e72-cb41-4924-82cc-7e9e82e434bf	murid.1.xirplb@grafidu.sch.id	Adam Saputra	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
11996aad-e3bc-430d-a961-0868a4cffe9c	murid.2.xirplb@grafidu.sch.id	Andrew Toby	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
b8572d2e-1e9b-455d-9030-6891c7d52b0c	murid.3.xirplb@grafidu.sch.id	Arfan Dwitara	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
27c0ec69-0d28-48c3-8bbd-b3acb528ba13	murid.4.xirplb@grafidu.sch.id	Eka Wulandari	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
17b1f96a-11e7-45a0-ac82-b3938767cdc6	murid.5.xirplb@grafidu.sch.id	Gibran Rakabumi	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
9cb1b65e-808b-40e1-9601-87556a3be27c	murid.6.xirplb@grafidu.sch.id	Ahmad Firmansyah	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
9acbd82f-a01f-4c34-8b5f-c5be2c78d93c	murid.7.xirplb@grafidu.sch.id	Bagas Wulandari	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
a236ca06-aae8-4a64-93a5-e136c4e68f5f	murid.8.xirplb@grafidu.sch.id	Bimo Ramadhan	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
f0dbdfd0-b746-4b07-9092-e08eae1bcf74	murid.9.xirplb@grafidu.sch.id	Candra Anggraini	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
9cf6960e-7856-4931-8867-a9baa12a13f7	murid.10.xirplb@grafidu.sch.id	Daffa Safitri	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
8aac3f26-ee8d-41df-823f-ac3e1873dd9f	murid.11.xirplb@grafidu.sch.id	Dea Santoso	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
7bbcadb5-c73a-444e-a09b-ab8187e35f9e	murid.12.xirplb@grafidu.sch.id	Denny Syahputra	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
da602c03-1b20-478c-a81d-fa111ce71e41	murid.13.xirplb@grafidu.sch.id	Fajar Lestari	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
1a976f86-c615-4406-8336-2434ed269014	murid.14.xirplb@grafidu.sch.id	Galih Permata	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
dd562628-fd47-4b90-989c-ac6df5ad7e03	murid.15.xirplb@grafidu.sch.id	Hendra Wicaksono	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
bfe4f4a1-7d19-4f81-9122-f7b4299cc285	murid.16.xirplb@grafidu.sch.id	Irfan Malik	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
04b3bcf9-3367-46a4-9a78-a92696e4ef8e	murid.17.xirplb@grafidu.sch.id	Jihan Hardiman	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
0a9bd9ff-16ff-4c2c-bddd-63bc4db9afe9	guru1@grafidu.sch.id	Mahmudi	teacher	\N	/assets/logo.png	2026-09-28 09:19:11.662805+07	\N	\N	t	f
467a114f-d73f-4556-89c2-3c794e1aaecd	murid.18.xirplb@grafidu.sch.id	Karim Dwitara	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
ac155231-ae3d-4d88-9394-8883411cf7d8	murid.19.xirplb@grafidu.sch.id	Lukman Nuraini	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
e6f10eeb-feee-41dd-8429-c8a938bee48e	murid.20.xirplb@grafidu.sch.id	Mahler Hakim	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
442d2d6b-e9a4-4088-8089-8029475879e7	murid.21.xirplb@grafidu.sch.id	Nanda Hidayat	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
5e0a6ea9-3634-4320-b0b1-00bf441cfe00	murid.22.xirplb@grafidu.sch.id	Oki Wijaya	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
9bc5b210-8492-4e5d-9121-232f65386b56	murid.23.xirplb@grafidu.sch.id	Putra Halim	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
85218733-c612-4e63-a65e-3ae32b0aa97f	murid.24.xirplb@grafidu.sch.id	Radit Fauzi	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
ee28358b-4356-4dd3-97e8-dbc37b9fdfc4	murid.25.xirplb@grafidu.sch.id	Satria Kusuma	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
7a5626af-1767-418b-a3eb-5a20813c0929	murid.26.xirplb@grafidu.sch.id	Taufik Yuliana	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
0bb8f393-2636-440b-b43b-4de3bcd82948	murid.28.xirplb@grafidu.sch.id	Wahyu Wibowo	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
c42245cd-a62f-4bea-ad7f-a6dae57523b6	murid.29.xirplb@grafidu.sch.id	Yoga Toby	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
697f7343-9a12-4697-bd7b-4c3cfdb5e6ec	murid.30.xirplb@grafidu.sch.id	Zaki Anggara	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
a9268624-4bc4-417a-a54f-0d41aae287d6	murid.31.xirplb@grafidu.sch.id	Ardi Dewi	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
e8a2af47-703b-4b88-9ff9-7b068c21ddcd	murid.32.xirplb@grafidu.sch.id	Cahya Maulana	student	XI RPL B	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
ed3b4cce-daa5-4e27-9fd2-6b832e7054c9	murid.1.xidkva@grafidu.sch.id	Adam Wulandari	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
88fd97ba-e199-455d-83fa-c4dcac822686	murid.2.xidkva@grafidu.sch.id	Andrew Ramadhan	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
7e190946-84bf-4bb9-aab8-3017aceadf8b	murid.3.xidkva@grafidu.sch.id	Arfan Anggraini	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
01d91d18-37ec-4517-b0d2-05923352e9bf	murid.4.xidkva@grafidu.sch.id	Eka Safitri	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
31a15f56-7f31-4de6-a428-1cc6c70e5a8c	murid.5.xidkva@grafidu.sch.id	Gibran Santoso	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
944a7447-9e99-4a05-9bd4-39b2be336882	murid.6.xidkva@grafidu.sch.id	Ahmad Syahputra	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
3ba48f01-b327-42ed-ad64-17622eee6b82	murid.7.xidkva@grafidu.sch.id	Bagas Lestari	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
9766e933-d64c-4392-b264-9138df2283f1	murid.8.xidkva@grafidu.sch.id	Bimo Permata	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
618aa1fd-091b-4964-970d-a00876873de6	murid.9.xidkva@grafidu.sch.id	Candra Wicaksono	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
46dd3781-ff6c-4770-a347-5422a6efddfc	murid.10.xidkva@grafidu.sch.id	Daffa Malik	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
fb8682da-d1a6-4bcd-88ad-577ceb2b36fc	murid.11.xidkva@grafidu.sch.id	Dea Hardiman	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
62fc1f90-7a97-4b08-b914-2f2243c75b85	murid.12.xidkva@grafidu.sch.id	Denny Dwitara	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
00f37c28-c8ed-4bf2-b6a7-3126a75e0745	murid.13.xidkva@grafidu.sch.id	Fajar Nuraini	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
72be464c-986f-48a2-85df-750a393a55fc	murid.14.xidkva@grafidu.sch.id	Galih Hakim	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
18751472-ccd2-4b60-8a2b-924f0624567b	murid.15.xidkva@grafidu.sch.id	Hendra Hidayat	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
7f4fca69-f0f3-4bb6-9a5c-1ac1759f54cb	murid.16.xidkva@grafidu.sch.id	Irfan Wijaya	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
43a2e079-1f15-4045-aa42-a4bfb5a2d157	murid.17.xidkva@grafidu.sch.id	Jihan Halim	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
991c36a6-c684-49b3-a0a2-4d4b4c06c099	murid.18.xidkva@grafidu.sch.id	Karim Fauzi	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
3eee6182-1bba-46e0-9146-9116a260773c	murid.22.xirplc@grafidu.sch.id	Oki Setiawan	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
c860ee43-a393-421f-8e98-114fc699c7e7	murid.23.xirplc@grafidu.sch.id	Putra Rakabumi	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
2a1cdaa2-4010-42d9-abc0-8e02da1f7149	murid.19.xidkva@grafidu.sch.id	Lukman Kusuma	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
00116bb5-1856-41c2-a82b-315e292ab22c	murid.20.xidkva@grafidu.sch.id	Mahler Yuliana	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
4a264929-a958-4e4d-a2ce-a7099421a796	murid.21.xidkva@grafidu.sch.id	Nanda Shara	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
dfd0f7d8-0fc4-4c66-9ee4-d6a0dd4ec6ac	murid.22.xidkva@grafidu.sch.id	Oki Wibowo	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
6b2d4026-4fea-42f2-a927-1dc77d01a582	murid.23.xidkva@grafidu.sch.id	Putra Toby	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
6f60b65d-1bcd-489f-950d-00689b104e8b	murid.24.xidkva@grafidu.sch.id	Radit Anggara	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
8e2a4e02-9634-49a8-91f4-1f96f61cd43b	murid.25.xidkva@grafidu.sch.id	Satria Dewi	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
d1c4d38a-de23-4ae7-8010-b5dcec300289	murid.26.xidkva@grafidu.sch.id	Taufik Maulana	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
d422fcd6-2161-410e-b1e1-7b5a616e3f19	murid.27.xidkva@grafidu.sch.id	Umar Ningrum	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
47517c77-1e13-4f6b-ba0a-01f02e3ecda8	murid.28.xidkva@grafidu.sch.id	Wahyu Setiawan	student	XI DKV A	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
67456128-2464-4bce-9902-7a75d5e87c08	murid.1.xirplc@grafidu.sch.id	Adam Lestari	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
42cfd4bb-72b9-4c65-8690-d660e92abd06	murid.2.xirplc@grafidu.sch.id	Andrew Permata	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
6d6f3371-c3cf-4cc4-b872-a4085445f695	murid.3.xirplc@grafidu.sch.id	Arfan Wicaksono	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
1eff5152-2da4-48d2-852d-9f98255c0fff	murid.4.xirplc@grafidu.sch.id	Eka Malik	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
b14bb602-7b48-428a-af9d-ef2558cbb172	murid.5.xirplc@grafidu.sch.id	Gibran Hardiman	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
4c214951-4517-4ea0-b1c7-4907cbb98ed9	murid.6.xirplc@grafidu.sch.id	Ahmad Dwitara	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
0c8324b1-65f1-4280-9bb0-f40a7b9091df	murid.7.xirplc@grafidu.sch.id	Bagas Nuraini	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
31aae0d7-c09f-468e-af16-b8196a72459d	murid.8.xirplc@grafidu.sch.id	Bimo Hakim	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
144a5dd4-e014-433d-9981-892e7c3ab031	murid.9.xirplc@grafidu.sch.id	Candra Hidayat	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
f5034142-4c02-4f83-8ad7-6b6336dd9d62	murid.10.xirplc@grafidu.sch.id	Daffa Wijaya	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
703b9fc3-a41d-41d7-8dbb-feb71360a8cf	murid.11.xirplc@grafidu.sch.id	Dea Halim	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
4f6de5d7-1e98-42ee-94a8-b82745bb3118	murid.12.xirplc@grafidu.sch.id	Denny Fauzi	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
962928b8-8af1-491c-9835-7331012ad77c	murid.13.xirplc@grafidu.sch.id	Fajar Kusuma	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
04b00742-347c-45c9-99fc-2a4cef3806fb	murid.14.xirplc@grafidu.sch.id	Galih Yuliana	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
2a25d9a4-7826-4397-861a-2b0df3d816a6	murid.15.xirplc@grafidu.sch.id	Hendra Shara	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
cb5df4a5-8dc6-4b11-855e-7b54b823bb9a	murid.16.xirplc@grafidu.sch.id	Irfan Wibowo	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
73b570f5-becc-4b5f-8597-e7e8ecb5d731	murid.17.xirplc@grafidu.sch.id	Jihan Toby	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
d2e56fc9-21ca-4b9d-9cbc-bbc731c7f109	murid.18.xirplc@grafidu.sch.id	Karim Anggara	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
fc737808-6aac-4efa-9fd3-35481131db0d	murid.19.xirplc@grafidu.sch.id	Lukman Dewi	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
60868b7a-df6d-41ba-bac5-0e2607695eea	murid.20.xirplc@grafidu.sch.id	Mahler Maulana	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
faf442a3-95c4-40c3-9a5c-292d2c328f4e	murid.21.xirplc@grafidu.sch.id	Nanda Ningrum	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
baa0777c-7ac9-47a3-9ce8-c1fc164261e2	murid.24.xirplc@grafidu.sch.id	Radit Puspita	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
a82349c8-e917-45f9-8833-e46d6094e4b7	murid.25.xirplc@grafidu.sch.id	Satria Prasetyo	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
27c9b5fc-e6d1-4844-8382-6e547c54c04e	murid.26.xirplc@grafidu.sch.id	Taufik Nugroho	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
aca8a385-3f53-44c3-b6a6-8998d593da2c	murid.27.xirplc@grafidu.sch.id	Umar Pratama	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
7a45981c-1cb1-446c-9a65-7ac0c9865e85	murid.28.xirplc@grafidu.sch.id	Wahyu Saputra	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
0ef61474-e479-4e95-a456-4780bee27050	murid.29.xirplc@grafidu.sch.id	Yoga Amelia	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
a90e2951-1040-45e9-a98c-3b5920fceed8	murid.30.xirplc@grafidu.sch.id	Zaki Jamaludin	student	XI RPL C	/assets/logo.png	2026-10-01 14:38:54.527876+07	\N	\N	t	f
\.


--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quiz_questions (id, quiz_id, idx, text) FROM stdin;
\.


--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quizzes (id, class_id, created_by, title, topic, difficulty, num_questions, duration_min, status, created_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, user_id, token_hash, user_agent, created_at, last_seen_at, expires_at) FROM stdin;
fd6483ff-0050-40df-9822-ef510d660b38	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	0aa9d7f77e7f35f7483d1df7a8ec08a83d1167a8360df0411ad2f3efa628f0a9	\N	2026-10-02 18:44:48.672326+07	2026-10-02 18:44:49.502195+07	2026-11-01 18:44:48.672326+07
\.


--
-- Data for Name: task_statuses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task_statuses (id, task_id, student_id, done, submitted_at, grade, feedback, created_at) FROM stdin;
197aa1d7-703e-4836-ac96-57d1dddd6040	683fc447-a093-5855-e3e1-c0eb75edce03	77db7bd6-e1c5-47b4-a6bf-56af65ea21d7	t	2026-10-01 15:53:52.394+07	\N		2026-10-01 15:53:52.450439+07
d4212bc3-c37f-40c3-b033-6b3e6b636473	683fc447-a093-5855-e3e1-c0eb75edce03	7bbcadb5-c73a-444e-a09b-ab8187e35f9e	t	2026-09-03 14:00:00+07	97		2026-10-01 14:38:54.527876+07
3bff8bc7-ecd0-4399-bb53-818192cc48ca	683fc447-a093-5855-e3e1-c0eb75edce03	2f0e1e72-cb41-4924-82cc-7e9e82e434bf	t	2026-08-20 14:00:00+07	83		2026-10-01 14:38:54.527876+07
44313b95-9996-4f99-af7e-3adcb42fb18b	683fc447-a093-5855-e3e1-c0eb75edce03	11996aad-e3bc-430d-a961-0868a4cffe9c	t	2026-08-21 14:00:00+07	91		2026-10-01 14:38:54.527876+07
7906d269-e8e9-4d86-971b-8cee18513151	683fc447-a093-5855-e3e1-c0eb75edce03	b8572d2e-1e9b-455d-9030-6891c7d52b0c	t	2026-08-22 14:00:00+07	99		2026-10-01 14:38:54.527876+07
89d056d2-9218-46ed-93f9-b70d8508b39f	683fc447-a093-5855-e3e1-c0eb75edce03	27c0ec69-0d28-48c3-8bbd-b3acb528ba13	t	2026-08-23 14:00:00+07	86		2026-10-01 14:38:54.527876+07
bf5712f9-b53c-4a75-b8c1-2c6c07c901c2	683fc447-a093-5855-e3e1-c0eb75edce03	17b1f96a-11e7-45a0-ac82-b3938767cdc6	t	2026-08-25 14:00:00+07	94		2026-10-01 14:38:54.527876+07
d2ce667f-6cd8-486c-af94-6514f1449261	683fc447-a093-5855-e3e1-c0eb75edce03	9cb1b65e-808b-40e1-9601-87556a3be27c	t	2026-08-26 14:00:00+07	97		2026-10-01 14:38:54.527876+07
50f12a54-f6d9-40e4-a37a-381e6fdb02a7	683fc447-a093-5855-e3e1-c0eb75edce03	9acbd82f-a01f-4c34-8b5f-c5be2c78d93c	t	2026-08-27 14:00:00+07	84		2026-10-01 14:38:54.527876+07
3dc917fa-df91-404a-94d9-22f4793a4887	683fc447-a093-5855-e3e1-c0eb75edce03	a236ca06-aae8-4a64-93a5-e136c4e68f5f	t	2026-08-29 14:00:00+07	92		2026-10-01 14:38:54.527876+07
05798988-24e7-40ef-9b85-ef0dc7f439a3	683fc447-a093-5855-e3e1-c0eb75edce03	f0dbdfd0-b746-4b07-9092-e08eae1bcf74	t	2026-08-30 14:00:00+07	100		2026-10-01 14:38:54.527876+07
fdba1c5b-4931-4cd8-86d0-2dcc96828f1b	683fc447-a093-5855-e3e1-c0eb75edce03	9cf6960e-7856-4931-8867-a9baa12a13f7	t	2026-08-31 14:00:00+07	87		2026-10-01 14:38:54.527876+07
16c06471-d0db-4097-b8fd-2415faa79404	683fc447-a093-5855-e3e1-c0eb75edce03	8aac3f26-ee8d-41df-823f-ac3e1873dd9f	t	2026-09-02 14:00:00+07	90		2026-10-01 14:38:54.527876+07
012f9768-008c-4fba-92cb-77eaf46c009b	683fc447-a093-5855-e3e1-c0eb75edce03	da602c03-1b20-478c-a81d-fa111ce71e41	t	2026-09-04 14:00:00+07	84		2026-10-01 14:38:54.527876+07
ddffe141-daf3-4ace-94a9-4ef9e05aeba6	683fc447-a093-5855-e3e1-c0eb75edce03	1a976f86-c615-4406-8336-2434ed269014	t	2026-09-06 14:00:00+07	92		2026-10-01 14:38:54.527876+07
38095058-429b-419b-88ce-a512030ac390	683fc447-a093-5855-e3e1-c0eb75edce03	dd562628-fd47-4b90-989c-ac6df5ad7e03	t	2026-09-07 14:00:00+07	100		2026-10-01 14:38:54.527876+07
114e27a8-8b38-434e-a6c6-8ca50607e74b	683fc447-a093-5855-e3e1-c0eb75edce03	bfe4f4a1-7d19-4f81-9122-f7b4299cc285	t	2026-09-08 14:00:00+07	82		2026-10-01 14:38:54.527876+07
02b40c35-3c62-403a-9760-d84465986897	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	2f0e1e72-cb41-4924-82cc-7e9e82e434bf	t	2026-08-07 14:00:00+07	79		2026-10-01 14:38:54.527876+07
fce8c55e-4479-4492-bdaa-993061306ffb	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	11996aad-e3bc-430d-a961-0868a4cffe9c	t	2026-08-08 14:00:00+07	87		2026-10-01 14:38:54.527876+07
fd1fb6ac-10a7-4bad-91ee-fb8c6e6bab4f	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	b8572d2e-1e9b-455d-9030-6891c7d52b0c	t	2026-08-08 14:00:00+07	95		2026-10-01 14:38:54.527876+07
de8d690b-ab4b-44d0-afbe-514326c9d0ad	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	27c0ec69-0d28-48c3-8bbd-b3acb528ba13	t	2026-08-09 14:00:00+07	82		2026-10-01 14:38:54.527876+07
aebbf18a-f304-4b36-8e95-ac964af2f7c5	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	17b1f96a-11e7-45a0-ac82-b3938767cdc6	t	2026-08-10 14:00:00+07	85		2026-10-01 14:38:54.527876+07
029414b5-dac1-48c5-8966-e529d4d15791	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	9cb1b65e-808b-40e1-9601-87556a3be27c	t	2026-08-10 14:00:00+07	93		2026-10-01 14:38:54.527876+07
cb4e2b5d-5ff2-42a0-9472-7a9c265cc481	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	9acbd82f-a01f-4c34-8b5f-c5be2c78d93c	t	2026-08-11 14:00:00+07	80		2026-10-01 14:38:54.527876+07
c4bdf6e2-cf4d-4ee8-af11-8ebffdf56f03	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	a236ca06-aae8-4a64-93a5-e136c4e68f5f	t	2026-07-22 14:00:00+07	88		2026-10-01 14:38:54.527876+07
bf145fc6-1687-4e74-90d7-5b82ce1d5e1e	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	f0dbdfd0-b746-4b07-9092-e08eae1bcf74	t	2026-07-22 14:00:00+07	96		2026-10-01 14:38:54.527876+07
c53f7363-f02f-412c-9987-a56a993c5ea1	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	9cf6960e-7856-4931-8867-a9baa12a13f7	t	2026-07-23 14:00:00+07	78		2026-10-01 14:38:54.527876+07
97d6b03e-49e1-4423-8454-b066b43a44f0	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	8aac3f26-ee8d-41df-823f-ac3e1873dd9f	t	2026-07-23 14:00:00+07	85		2026-10-01 14:38:54.527876+07
2b793db0-7f6d-45d3-8a7f-55fec8b1e8fe	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	7bbcadb5-c73a-444e-a09b-ab8187e35f9e	t	2026-07-24 14:00:00+07	93		2026-10-01 14:38:54.527876+07
c55d7b5b-cbe8-4760-965f-47554661fa25	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	da602c03-1b20-478c-a81d-fa111ce71e41	t	2026-07-25 14:00:00+07	80		2026-10-01 14:38:54.527876+07
68773038-99db-46ad-9a98-eb3b4caef065	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	1a976f86-c615-4406-8336-2434ed269014	t	2026-07-25 14:00:00+07	88		2026-10-01 14:38:54.527876+07
7ece2501-5e67-4f2f-a54c-73a43a1a4208	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	dd562628-fd47-4b90-989c-ac6df5ad7e03	t	2026-07-26 14:00:00+07	91		2026-10-01 14:38:54.527876+07
e9049b19-9a66-4164-b458-7c84f667c03d	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	bfe4f4a1-7d19-4f81-9122-f7b4299cc285	t	2026-07-27 14:00:00+07	78		2026-10-01 14:38:54.527876+07
79456a57-9bae-4c32-aa9b-bd5e41c902d2	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	04b3bcf9-3367-46a4-9a78-a92696e4ef8e	t	2026-07-27 14:00:00+07	86		2026-10-01 14:38:54.527876+07
d71f9973-970e-43ae-81ec-5b117730cb48	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	467a114f-d73f-4556-89c2-3c794e1aaecd	t	2026-07-28 14:00:00+07	94		2026-10-01 14:38:54.527876+07
eab546bb-8e88-4630-974a-b03b89d894f1	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	ac155231-ae3d-4d88-9394-8883411cf7d8	t	2026-07-29 14:00:00+07	81		2026-10-01 14:38:54.527876+07
6d63b4df-8352-4073-bda9-e98785251cc7	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	e6f10eeb-feee-41dd-8429-c8a938bee48e	t	2026-07-29 14:00:00+07	84		2026-10-01 14:38:54.527876+07
fcd7c900-12ee-435e-a0aa-ad213e46f9f0	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	442d2d6b-e9a4-4088-8089-8029475879e7	t	2026-07-30 14:00:00+07	92		2026-10-01 14:38:54.527876+07
70b85839-c976-4533-a02c-e6628aafbd49	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	5e0a6ea9-3634-4320-b0b1-00bf441cfe00	t	2026-07-31 14:00:00+07	79		2026-10-01 14:38:54.527876+07
e099ebbc-7e6a-4447-b3db-1fd819aa7f09	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	9bc5b210-8492-4e5d-9121-232f65386b56	t	2026-07-31 14:00:00+07	87		2026-10-01 14:38:54.527876+07
c71e4a4b-e784-4e61-b822-50a59dab8434	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	85218733-c612-4e63-a65e-3ae32b0aa97f	t	2026-08-01 14:00:00+07	95		2026-10-01 14:38:54.527876+07
4b23a695-b674-464f-80ab-33ccb9cbed00	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	ee28358b-4356-4dd3-97e8-dbc37b9fdfc4	t	2026-08-02 14:00:00+07	77		2026-10-01 14:38:54.527876+07
e1bc8e0b-1d59-4b28-af02-5685c6a24818	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	7a5626af-1767-418b-a3eb-5a20813c0929	t	2026-08-02 14:00:00+07	85		2026-10-01 14:38:54.527876+07
1454c72b-4ff6-4d95-9bb3-b27b7567a1c6	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	bdf6187d-5f04-4e52-864b-1aa87a1c143e	t	2026-08-03 14:00:00+07	93		2026-10-01 14:38:54.527876+07
3c454f54-2a91-4172-ad14-e519929e4566	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	0bb8f393-2636-440b-b43b-4de3bcd82948	t	2026-08-04 14:00:00+07	80		2026-10-01 14:38:54.527876+07
bb586b42-58c3-4428-8a9c-591b90b1e8ad	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	c42245cd-a62f-4bea-ad7f-a6dae57523b6	t	2026-08-04 14:00:00+07	88		2026-10-01 14:38:54.527876+07
7d7ca3c8-a87b-4a0c-8b7a-ca7086962574	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	697f7343-9a12-4697-bd7b-4c3cfdb5e6ec	t	2026-08-05 14:00:00+07	91		2026-10-01 14:38:54.527876+07
d7cc4cd9-d96e-41bc-910d-a32532962e4a	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	a9268624-4bc4-417a-a54f-0d41aae287d6	t	2026-08-06 14:00:00+07	78		2026-10-01 14:38:54.527876+07
c45ccee1-2a1a-45cf-b9ce-8b4479cf97c6	70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	e8a2af47-703b-4b88-9ff9-7b068c21ddcd	t	2026-08-06 14:00:00+07	86		2026-10-01 14:38:54.527876+07
ef7b1b64-282e-4bc3-b26d-5d715e6d3ca8	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	2f0e1e72-cb41-4924-82cc-7e9e82e434bf	t	2026-08-20 14:00:00+07	83		2026-10-01 14:38:54.527876+07
590a9bb5-282c-4700-a783-ebbf5e8cd202	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	11996aad-e3bc-430d-a961-0868a4cffe9c	t	2026-08-20 14:00:00+07	91		2026-10-01 14:38:54.527876+07
e349e79c-a7e5-438e-8dfb-1d3b1272317a	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	b8572d2e-1e9b-455d-9030-6891c7d52b0c	t	2026-08-21 14:00:00+07	99		2026-10-01 14:38:54.527876+07
0373e4ec-c5f9-4b4b-896e-4d9b3855d152	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	27c0ec69-0d28-48c3-8bbd-b3acb528ba13	t	2026-08-21 14:00:00+07	81		2026-10-01 14:38:54.527876+07
662c1a2d-079c-4f06-b997-accf522c2b59	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	17b1f96a-11e7-45a0-ac82-b3938767cdc6	t	2026-08-22 14:00:00+07	89		2026-10-01 14:38:54.527876+07
5d771323-7071-450b-bd53-4971b2a13ddc	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	9cb1b65e-808b-40e1-9601-87556a3be27c	t	2026-08-22 14:00:00+07	97		2026-10-01 14:38:54.527876+07
0dccd8f3-d8ce-49fe-8520-358e2c92268e	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	9acbd82f-a01f-4c34-8b5f-c5be2c78d93c	t	2026-08-22 14:00:00+07	84		2026-10-01 14:38:54.527876+07
08bf8a7c-37fd-4a72-9493-5e709acfcb6a	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	a236ca06-aae8-4a64-93a5-e136c4e68f5f	t	2026-08-23 14:00:00+07	92		2026-10-01 14:38:54.527876+07
8edaa4e7-4ed9-40b9-9dcb-e1b45884ab9b	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	f0dbdfd0-b746-4b07-9092-e08eae1bcf74	t	2026-08-24 14:00:00+07	95		2026-10-01 14:38:54.527876+07
5c354107-3099-4e8e-830f-35b88a0cbc49	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	9cf6960e-7856-4931-8867-a9baa12a13f7	t	2026-08-25 14:00:00+07	82		2026-10-01 14:38:54.527876+07
339c6a62-aa43-4af3-ac4a-aefd9093fadb	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	8aac3f26-ee8d-41df-823f-ac3e1873dd9f	t	2026-08-26 14:00:00+07	89		2026-10-01 14:38:54.527876+07
68fa1f38-79fa-443a-8723-ca4ec12c8c2d	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	7bbcadb5-c73a-444e-a09b-ab8187e35f9e	t	2026-08-27 14:00:00+07	97		2026-10-01 14:38:54.527876+07
06c6edc4-2da0-48c4-a20c-04a9ccee0fe3	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	da602c03-1b20-478c-a81d-fa111ce71e41	t	2026-08-28 14:00:00+07	84		2026-10-01 14:38:54.527876+07
600ae24f-7dc9-43a1-8ba2-424e5a8cd8ed	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	1a976f86-c615-4406-8336-2434ed269014	t	2026-08-28 14:00:00+07	87		2026-10-01 14:38:54.527876+07
59069005-5d4c-41be-946c-df4736c5108a	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	dd562628-fd47-4b90-989c-ac6df5ad7e03	t	2026-08-29 14:00:00+07	95		2026-10-01 14:38:54.527876+07
3090e601-78c3-4003-a9f6-4cdef44bbac3	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	bfe4f4a1-7d19-4f81-9122-f7b4299cc285	t	2026-08-30 14:00:00+07	82		2026-10-01 14:38:54.527876+07
c677de47-d518-4324-b634-fa64748e6383	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	04b3bcf9-3367-46a4-9a78-a92696e4ef8e	t	2026-08-31 14:00:00+07	90		2026-10-01 14:38:54.527876+07
76823918-76b2-4a45-ab51-0076f44f0036	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	467a114f-d73f-4556-89c2-3c794e1aaecd	t	2026-09-01 14:00:00+07	98		2026-10-01 14:38:54.527876+07
80ab24f8-59a3-4fe6-bfa3-ef0538bf0fe6	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	ac155231-ae3d-4d88-9394-8883411cf7d8	t	2026-09-02 14:00:00+07	80		2026-10-01 14:38:54.527876+07
3611703d-30a7-447f-8ea2-c538dab18b74	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	e6f10eeb-feee-41dd-8429-c8a938bee48e	t	2026-09-03 14:00:00+07	88		2026-10-01 14:38:54.527876+07
bcb3b337-a1e4-4dbd-813b-9ce47e12c0fa	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	442d2d6b-e9a4-4088-8089-8029475879e7	t	2026-09-03 14:00:00+07	96		2026-10-01 14:38:54.527876+07
3405e341-1f42-4935-9364-c745c4a2e5a6	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	5e0a6ea9-3634-4320-b0b1-00bf441cfe00	t	2026-09-04 14:00:00+07	83		2026-10-01 14:38:54.527876+07
b875455d-f228-4183-931f-b948cdcddfc3	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	9bc5b210-8492-4e5d-9121-232f65386b56	t	2026-09-05 14:00:00+07	91		2026-10-01 14:38:54.527876+07
d39f8a15-5132-41a8-bf88-61454d269df9	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	85218733-c612-4e63-a65e-3ae32b0aa97f	t	2026-09-06 14:00:00+07	94		2026-10-01 14:38:54.527876+07
9b34652f-d2fb-4572-9325-5b28828874e8	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	ee28358b-4356-4dd3-97e8-dbc37b9fdfc4	t	2026-09-07 14:00:00+07	81		2026-10-01 14:38:54.527876+07
1b8f1dc0-a72e-44c5-98a8-02b0411b1c07	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	7a5626af-1767-418b-a3eb-5a20813c0929	t	2026-09-08 14:00:00+07	89		2026-10-01 14:38:54.527876+07
4f41f40c-c844-4e1e-a921-ff10c73765c2	4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	bdf6187d-5f04-4e52-864b-1aa87a1c143e	t	2026-09-09 14:00:00+07	97		2026-10-01 14:38:54.527876+07
d6becd69-bb32-4bb2-95bc-bfc43c7db38f	d2eeff0e-4100-4fec-4310-8726f09d1f4c	2f0e1e72-cb41-4924-82cc-7e9e82e434bf	t	2026-08-22 14:00:00+07	79		2026-10-01 14:38:54.527876+07
f71c2b1c-2fe7-4a9b-b0e5-208e8d64eedc	d2eeff0e-4100-4fec-4310-8726f09d1f4c	11996aad-e3bc-430d-a961-0868a4cffe9c	t	2026-08-23 14:00:00+07	87		2026-10-01 14:38:54.527876+07
e82abd3c-722d-4650-8728-29848c482ed0	d2eeff0e-4100-4fec-4310-8726f09d1f4c	b8572d2e-1e9b-455d-9030-6891c7d52b0c	t	2026-08-23 14:00:00+07	90		2026-10-01 14:38:54.527876+07
df1355db-fa62-46b2-a18d-f18552c60fcb	d2eeff0e-4100-4fec-4310-8726f09d1f4c	27c0ec69-0d28-48c3-8bbd-b3acb528ba13	t	2026-08-24 14:00:00+07	77		2026-10-01 14:38:54.527876+07
99f5768c-2bbb-4be8-93ef-bfdcea8a22cd	d2eeff0e-4100-4fec-4310-8726f09d1f4c	17b1f96a-11e7-45a0-ac82-b3938767cdc6	t	2026-08-24 14:00:00+07	85		2026-10-01 14:38:54.527876+07
ea46c35e-52e9-4659-8f3b-9e451a9a04f0	d2eeff0e-4100-4fec-4310-8726f09d1f4c	9cb1b65e-808b-40e1-9601-87556a3be27c	t	2026-08-25 14:00:00+07	93		2026-10-01 14:38:54.527876+07
da933418-a644-4034-b24b-3fade4155fd8	d2eeff0e-4100-4fec-4310-8726f09d1f4c	9acbd82f-a01f-4c34-8b5f-c5be2c78d93c	t	2026-08-25 14:00:00+07	80		2026-10-01 14:38:54.527876+07
c963d41b-a3b4-47e6-85fa-671dc060d355	d2eeff0e-4100-4fec-4310-8726f09d1f4c	a236ca06-aae8-4a64-93a5-e136c4e68f5f	t	2026-08-26 14:00:00+07	83		2026-10-01 14:38:54.527876+07
749442c1-662b-4c75-8d7f-721f3c5b4255	d2eeff0e-4100-4fec-4310-8726f09d1f4c	f0dbdfd0-b746-4b07-9092-e08eae1bcf74	t	2026-08-26 14:00:00+07	91		2026-10-01 14:38:54.527876+07
f643740d-9f48-4c82-9807-20c14825ed93	d2eeff0e-4100-4fec-4310-8726f09d1f4c	9cf6960e-7856-4931-8867-a9baa12a13f7	t	2026-08-27 14:00:00+07	78		2026-10-01 14:38:54.527876+07
b6416d7a-1333-4808-b51a-96a075a50691	d2eeff0e-4100-4fec-4310-8726f09d1f4c	8aac3f26-ee8d-41df-823f-ac3e1873dd9f	t	2026-08-27 14:00:00+07	85		2026-10-01 14:38:54.527876+07
7a5f9ad2-7594-4f18-9acd-13b7228a48fd	d2eeff0e-4100-4fec-4310-8726f09d1f4c	7bbcadb5-c73a-444e-a09b-ab8187e35f9e	t	2026-08-27 14:00:00+07	93		2026-10-01 14:38:54.527876+07
d8949e59-f5ff-476b-916e-c138870dda3a	d2eeff0e-4100-4fec-4310-8726f09d1f4c	da602c03-1b20-478c-a81d-fa111ce71e41	t	2026-08-28 14:00:00+07	75		2026-10-01 14:38:54.527876+07
474c5501-93de-4b81-94d6-3071656fdf0b	d2eeff0e-4100-4fec-4310-8726f09d1f4c	1a976f86-c615-4406-8336-2434ed269014	t	2026-08-28 14:00:00+07	83		2026-10-01 14:38:54.527876+07
d4eac973-b856-4869-8e11-99d0e7f58993	d2eeff0e-4100-4fec-4310-8726f09d1f4c	dd562628-fd47-4b90-989c-ac6df5ad7e03	t	2026-08-29 14:00:00+07	91		2026-10-01 14:38:54.527876+07
9e02a69d-1515-4682-afc1-b46bc7d0359a	d2eeff0e-4100-4fec-4310-8726f09d1f4c	bfe4f4a1-7d19-4f81-9122-f7b4299cc285	t	2026-08-29 14:00:00+07	78		2026-10-01 14:38:54.527876+07
f48678b9-9601-40a4-998c-1e90835c5b09	d2eeff0e-4100-4fec-4310-8726f09d1f4c	04b3bcf9-3367-46a4-9a78-a92696e4ef8e	t	2026-08-30 14:00:00+07	86		2026-10-01 14:38:54.527876+07
1c915bfb-4a9e-40db-8379-91aeb6f1f04d	d2eeff0e-4100-4fec-4310-8726f09d1f4c	467a114f-d73f-4556-89c2-3c794e1aaecd	t	2026-08-30 14:00:00+07	89		2026-10-01 14:38:54.527876+07
e473e0fd-6a79-4e56-9848-aa81a9f1bbd2	d2eeff0e-4100-4fec-4310-8726f09d1f4c	ac155231-ae3d-4d88-9394-8883411cf7d8	t	2026-08-31 14:00:00+07	76		2026-10-01 14:38:54.527876+07
c51b623d-ef86-498a-80ee-c819612db641	d2eeff0e-4100-4fec-4310-8726f09d1f4c	e6f10eeb-feee-41dd-8429-c8a938bee48e	t	2026-08-31 14:00:00+07	84		2026-10-01 14:38:54.527876+07
5a4e96b7-fe1d-498e-9a1d-e2d72938dd5f	d2eeff0e-4100-4fec-4310-8726f09d1f4c	5e0a6ea9-3634-4320-b0b1-00bf441cfe00	t	2026-08-18 14:00:00+07	79		2026-10-01 14:38:54.527876+07
b1dff749-bdc2-4945-86df-3ddf5bb17cf6	d2eeff0e-4100-4fec-4310-8726f09d1f4c	9bc5b210-8492-4e5d-9121-232f65386b56	t	2026-08-18 14:00:00+07	82		2026-10-01 14:38:54.527876+07
1d4bdf55-d358-4e18-8237-4bc28a17e5c4	d2eeff0e-4100-4fec-4310-8726f09d1f4c	85218733-c612-4e63-a65e-3ae32b0aa97f	t	2026-08-18 14:00:00+07	90		2026-10-01 14:38:54.527876+07
1c7000f5-042f-40c0-9525-d498285459cb	d2eeff0e-4100-4fec-4310-8726f09d1f4c	ee28358b-4356-4dd3-97e8-dbc37b9fdfc4	t	2026-08-19 14:00:00+07	77		2026-10-01 14:38:54.527876+07
8486593e-7dc3-423c-a28a-550f219f90a7	d2eeff0e-4100-4fec-4310-8726f09d1f4c	7a5626af-1767-418b-a3eb-5a20813c0929	t	2026-08-19 14:00:00+07	85		2026-10-01 14:38:54.527876+07
11e06ab8-04e3-4b1c-8c2a-511c7888fa04	d2eeff0e-4100-4fec-4310-8726f09d1f4c	bdf6187d-5f04-4e52-864b-1aa87a1c143e	t	2026-08-20 14:00:00+07	93		2026-10-01 14:38:54.527876+07
7254d821-b08c-45af-86cb-ca0222d906a4	d2eeff0e-4100-4fec-4310-8726f09d1f4c	0bb8f393-2636-440b-b43b-4de3bcd82948	t	2026-08-20 14:00:00+07	75		2026-10-01 14:38:54.527876+07
4802789c-3489-495a-8da4-709e62ebe0a4	d2eeff0e-4100-4fec-4310-8726f09d1f4c	c42245cd-a62f-4bea-ad7f-a6dae57523b6	t	2026-08-21 14:00:00+07	83		2026-10-01 14:38:54.527876+07
03c360b0-0535-4db8-8947-083213a0d9d9	d2eeff0e-4100-4fec-4310-8726f09d1f4c	697f7343-9a12-4697-bd7b-4c3cfdb5e6ec	t	2026-08-21 14:00:00+07	91		2026-10-01 14:38:54.527876+07
21ee7d32-ce6d-44d9-9386-886860f2c327	d2eeff0e-4100-4fec-4310-8726f09d1f4c	a9268624-4bc4-417a-a54f-0d41aae287d6	t	2026-08-22 14:00:00+07	78		2026-10-01 14:38:54.527876+07
fa6ece72-9428-433e-8351-629390a84a68	d2eeff0e-4100-4fec-4310-8726f09d1f4c	e8a2af47-703b-4b88-9ff9-7b068c21ddcd	t	2026-08-22 14:00:00+07	86		2026-10-01 14:38:54.527876+07
8146ed1b-9c22-4810-9c4e-40483b3eb600	d62d4825-66ac-31eb-182e-f3b2c4d17c36	01d91d18-37ec-4517-b0d2-05923352e9bf	t	2026-08-20 14:00:00+07	79		2026-10-01 14:38:54.527876+07
c05c169f-c40e-4c9a-ad9d-61208b2cae09	d62d4825-66ac-31eb-182e-f3b2c4d17c36	31a15f56-7f31-4de6-a428-1cc6c70e5a8c	t	2026-08-21 14:00:00+07	87		2026-10-01 14:38:54.527876+07
a17e5422-4bd2-44d9-9fca-14e55450c7d4	d62d4825-66ac-31eb-182e-f3b2c4d17c36	944a7447-9e99-4a05-9bd4-39b2be336882	t	2026-08-23 14:00:00+07	90		2026-10-01 14:38:54.527876+07
2afd5a63-7044-4a13-be5d-cd0c7c1162e3	d62d4825-66ac-31eb-182e-f3b2c4d17c36	3ba48f01-b327-42ed-ad64-17622eee6b82	t	2026-08-24 14:00:00+07	98		2026-10-01 14:38:54.527876+07
61f6e0e7-a5d5-42e9-a8c8-e75b2679aebc	d62d4825-66ac-31eb-182e-f3b2c4d17c36	9766e933-d64c-4392-b264-9138df2283f1	t	2026-08-26 14:00:00+07	83		2026-10-01 14:38:54.527876+07
d66165fe-ee4e-4e84-86fc-18fa5b404dd8	d62d4825-66ac-31eb-182e-f3b2c4d17c36	618aa1fd-091b-4964-970d-a00876873de6	t	2026-08-27 14:00:00+07	91		2026-10-01 14:38:54.527876+07
91e90e06-385f-402b-80b1-a9566a687194	d62d4825-66ac-31eb-182e-f3b2c4d17c36	46dd3781-ff6c-4770-a347-5422a6efddfc	t	2026-08-29 14:00:00+07	98		2026-10-01 14:38:54.527876+07
e248b458-4d14-4ac9-bbf2-c3d35edad119	d62d4825-66ac-31eb-182e-f3b2c4d17c36	fb8682da-d1a6-4bcd-88ad-577ceb2b36fc	t	2026-08-30 14:00:00+07	79		2026-10-01 14:38:54.527876+07
fd3ea25e-b3ab-4005-98ac-bec0d914ace3	d62d4825-66ac-31eb-182e-f3b2c4d17c36	62fc1f90-7a97-4b08-b914-2f2243c75b85	t	2026-09-01 14:00:00+07	87		2026-10-01 14:38:54.527876+07
69866b0f-9c10-4fc5-b0a5-ce3a73ad46ce	d62d4825-66ac-31eb-182e-f3b2c4d17c36	00f37c28-c8ed-4bf2-b6a7-3126a75e0745	t	2026-09-02 14:00:00+07	95		2026-10-01 14:38:54.527876+07
33053ec7-3122-4434-872c-e1d4fda035f3	d62d4825-66ac-31eb-182e-f3b2c4d17c36	72be464c-986f-48a2-85df-750a393a55fc	t	2026-09-04 14:00:00+07	80		2026-10-01 14:38:54.527876+07
3a2493eb-d316-4c49-bbbe-fcf36a3c8bdb	d62d4825-66ac-31eb-182e-f3b2c4d17c36	18751472-ccd2-4b60-8a2b-924f0624567b	t	2026-09-05 14:00:00+07	88		2026-10-01 14:38:54.527876+07
57115088-9d53-4c0b-99bb-779e0c37ea69	d62d4825-66ac-31eb-182e-f3b2c4d17c36	7f4fca69-f0f3-4bb6-9a5c-1ac1759f54cb	t	2026-09-07 14:00:00+07	91		2026-10-01 14:38:54.527876+07
cc011560-60f1-4eff-8303-5862f3485360	d62d4825-66ac-31eb-182e-f3b2c4d17c36	43a2e079-1f15-4045-aa42-a4bfb5a2d157	t	2026-09-08 14:00:00+07	76		2026-10-01 14:38:54.527876+07
30e55507-8b05-42c9-bcc9-f0bdaae89116	0b1e4cb9-0998-79c8-73c6-65d9410c748f	ed3b4cce-daa5-4e27-9fd2-6b832e7054c9	t	2026-08-04 14:00:00+07	74		2026-10-01 14:38:54.527876+07
0ac9b9ee-fc15-456a-85db-34e226080c5d	0b1e4cb9-0998-79c8-73c6-65d9410c748f	88fd97ba-e199-455d-83fa-c4dcac822686	t	2026-08-05 14:00:00+07	82		2026-10-01 14:38:54.527876+07
ffd26724-84cb-4321-8e38-bb558f479a13	0b1e4cb9-0998-79c8-73c6-65d9410c748f	7e190946-84bf-4bb9-aab8-3017aceadf8b	t	2026-08-06 14:00:00+07	90		2026-10-01 14:38:54.527876+07
e3f5923e-770c-4af9-998d-0f142048fcf9	0b1e4cb9-0998-79c8-73c6-65d9410c748f	01d91d18-37ec-4517-b0d2-05923352e9bf	t	2026-08-06 14:00:00+07	75		2026-10-01 14:38:54.527876+07
44df2ca0-3ecc-4275-8180-28e0ff9cdebb	0b1e4cb9-0998-79c8-73c6-65d9410c748f	31a15f56-7f31-4de6-a428-1cc6c70e5a8c	t	2026-08-07 14:00:00+07	78		2026-10-01 14:38:54.527876+07
7b895c54-4b25-4799-a168-9cbad85d6099	0b1e4cb9-0998-79c8-73c6-65d9410c748f	944a7447-9e99-4a05-9bd4-39b2be336882	t	2026-08-08 14:00:00+07	86		2026-10-01 14:38:54.527876+07
1c2be8b7-1453-49ad-952d-cbd2c651a2df	0b1e4cb9-0998-79c8-73c6-65d9410c748f	3ba48f01-b327-42ed-ad64-17622eee6b82	t	2026-08-09 14:00:00+07	94		2026-10-01 14:38:54.527876+07
5f7e43b6-0c98-4982-a93e-cc5c8ce5cd63	0b1e4cb9-0998-79c8-73c6-65d9410c748f	9766e933-d64c-4392-b264-9138df2283f1	t	2026-08-09 14:00:00+07	79		2026-10-01 14:38:54.527876+07
40252b39-96f6-488e-8f3d-f7cb3fe12460	0b1e4cb9-0998-79c8-73c6-65d9410c748f	618aa1fd-091b-4964-970d-a00876873de6	t	2026-08-10 14:00:00+07	87		2026-10-01 14:38:54.527876+07
99cc6708-7e97-4f15-8620-6bb8e3b10cbc	0b1e4cb9-0998-79c8-73c6-65d9410c748f	46dd3781-ff6c-4770-a347-5422a6efddfc	t	2026-08-11 14:00:00+07	90		2026-10-01 14:38:54.527876+07
cd7dc150-931c-4884-a585-ca6ac040bd2f	0b1e4cb9-0998-79c8-73c6-65d9410c748f	fb8682da-d1a6-4bcd-88ad-577ceb2b36fc	t	2026-07-22 14:00:00+07	75		2026-10-01 14:38:54.527876+07
98f3d042-2113-4e10-9f17-38e14fb437e6	0b1e4cb9-0998-79c8-73c6-65d9410c748f	62fc1f90-7a97-4b08-b914-2f2243c75b85	t	2026-07-22 14:00:00+07	83		2026-10-01 14:38:54.527876+07
f6a34ab0-5d4b-4881-b804-9ff94f7a09ef	0b1e4cb9-0998-79c8-73c6-65d9410c748f	00f37c28-c8ed-4bf2-b6a7-3126a75e0745	t	2026-07-23 14:00:00+07	91		2026-10-01 14:38:54.527876+07
fd563fb0-77a1-40d6-a5ba-8b7d08415b6e	0b1e4cb9-0998-79c8-73c6-65d9410c748f	72be464c-986f-48a2-85df-750a393a55fc	t	2026-07-24 14:00:00+07	76		2026-10-01 14:38:54.527876+07
6aed2371-6301-42d6-ab51-0f06760875ec	0b1e4cb9-0998-79c8-73c6-65d9410c748f	18751472-ccd2-4b60-8a2b-924f0624567b	t	2026-07-25 14:00:00+07	79		2026-10-01 14:38:54.527876+07
49924b3c-9d78-4140-9d6a-fabdd01b212a	0b1e4cb9-0998-79c8-73c6-65d9410c748f	7f4fca69-f0f3-4bb6-9a5c-1ac1759f54cb	t	2026-07-25 14:00:00+07	87		2026-10-01 14:38:54.527876+07
155d090e-eb93-48ff-b9b4-a90f8e57f8a5	0b1e4cb9-0998-79c8-73c6-65d9410c748f	43a2e079-1f15-4045-aa42-a4bfb5a2d157	t	2026-07-26 14:00:00+07	72		2026-10-01 14:38:54.527876+07
eb500881-0bee-474b-a94d-2e48903cb034	0b1e4cb9-0998-79c8-73c6-65d9410c748f	991c36a6-c684-49b3-a0a2-4d4b4c06c099	t	2026-07-27 14:00:00+07	81		2026-10-01 14:38:54.527876+07
ab3faff9-87b7-4160-b6f0-29a0ce56ecfe	0b1e4cb9-0998-79c8-73c6-65d9410c748f	2a1cdaa2-4010-42d9-abc0-8e02da1f7149	t	2026-07-28 14:00:00+07	89		2026-10-01 14:38:54.527876+07
db2f7bd0-9fdd-4ac3-a176-8e9f69bf220f	0b1e4cb9-0998-79c8-73c6-65d9410c748f	00116bb5-1856-41c2-a82b-315e292ab22c	t	2026-07-28 14:00:00+07	92		2026-10-01 14:38:54.527876+07
4d287f69-ef27-4344-862a-4e2c0af71c12	0b1e4cb9-0998-79c8-73c6-65d9410c748f	4a264929-a958-4e4d-a2ce-a7099421a796	t	2026-07-29 14:00:00+07	77		2026-10-01 14:38:54.527876+07
78ed3d1c-2681-4472-a36c-b3e1acad958e	0b1e4cb9-0998-79c8-73c6-65d9410c748f	dfd0f7d8-0fc4-4c66-9ee4-d6a0dd4ec6ac	t	2026-07-30 14:00:00+07	85		2026-10-01 14:38:54.527876+07
586cd3dc-0466-47b4-88b7-1716df67c737	0b1e4cb9-0998-79c8-73c6-65d9410c748f	6b2d4026-4fea-42f2-a927-1dc77d01a582	t	2026-07-31 14:00:00+07	93		2026-10-01 14:38:54.527876+07
703078c4-763b-4d67-b821-867690a03fc1	0b1e4cb9-0998-79c8-73c6-65d9410c748f	6f60b65d-1bcd-489f-950d-00689b104e8b	t	2026-07-31 14:00:00+07	78		2026-10-01 14:38:54.527876+07
72a67578-c8ea-409d-b3b2-1cbeea66c6f8	0b1e4cb9-0998-79c8-73c6-65d9410c748f	8e2a4e02-9634-49a8-91f4-1f96f61cd43b	t	2026-08-01 14:00:00+07	81		2026-10-01 14:38:54.527876+07
9b36280d-a275-40d5-87c3-63b7c1aa6e86	0b1e4cb9-0998-79c8-73c6-65d9410c748f	d1c4d38a-de23-4ae7-8010-b5dcec300289	t	2026-08-02 14:00:00+07	89		2026-10-01 14:38:54.527876+07
7e3e4622-3e2c-4309-be63-576723807401	0b1e4cb9-0998-79c8-73c6-65d9410c748f	d422fcd6-2161-410e-b1e1-7b5a616e3f19	t	2026-08-03 14:00:00+07	74		2026-10-01 14:38:54.527876+07
10181400-d028-491c-a3b9-fea0fabc6f0d	0b1e4cb9-0998-79c8-73c6-65d9410c748f	47517c77-1e13-4f6b-ba0a-01f02e3ecda8	t	2026-08-03 14:00:00+07	82		2026-10-01 14:38:54.527876+07
d1686172-6bca-4dd6-9242-c697511d1e8d	358c57fc-4c82-50e7-8980-91d2a7199f23	ed3b4cce-daa5-4e27-9fd2-6b832e7054c9	t	2026-08-22 14:00:00+07	78		2026-10-01 14:38:54.527876+07
90cad14f-8b70-47f8-bf0a-4cd825bbf69b	358c57fc-4c82-50e7-8980-91d2a7199f23	88fd97ba-e199-455d-83fa-c4dcac822686	t	2026-08-22 14:00:00+07	86		2026-10-01 14:38:54.527876+07
1fee032b-9adb-4a9e-9ccf-acae563ed99b	358c57fc-4c82-50e7-8980-91d2a7199f23	7e190946-84bf-4bb9-aab8-3017aceadf8b	t	2026-08-22 14:00:00+07	94		2026-10-01 14:38:54.527876+07
bbb275d1-5672-41df-bb00-44a8c9b0a5cd	358c57fc-4c82-50e7-8980-91d2a7199f23	01d91d18-37ec-4517-b0d2-05923352e9bf	t	2026-08-22 14:00:00+07	74		2026-10-01 14:38:54.527876+07
d1825e19-bbf2-4edb-afee-752e98c5668f	358c57fc-4c82-50e7-8980-91d2a7199f23	31a15f56-7f31-4de6-a428-1cc6c70e5a8c	t	2026-08-22 14:00:00+07	82		2026-10-01 14:38:54.527876+07
d69c25f6-d3cf-4474-b0ce-625b11c55959	358c57fc-4c82-50e7-8980-91d2a7199f23	944a7447-9e99-4a05-9bd4-39b2be336882	t	2026-08-22 14:00:00+07	90		2026-10-01 14:38:54.527876+07
577a2af1-f068-4d10-b043-f64b935955e3	358c57fc-4c82-50e7-8980-91d2a7199f23	3ba48f01-b327-42ed-ad64-17622eee6b82	t	2026-08-23 14:00:00+07	98		2026-10-01 14:38:54.527876+07
ac82d65d-6a4e-43de-b2ce-5e473d8a5c59	358c57fc-4c82-50e7-8980-91d2a7199f23	9766e933-d64c-4392-b264-9138df2283f1	t	2026-08-23 14:00:00+07	83		2026-10-01 14:38:54.527876+07
1fdf974b-105f-46be-a5c5-d52868e0a0d2	358c57fc-4c82-50e7-8980-91d2a7199f23	618aa1fd-091b-4964-970d-a00876873de6	t	2026-08-23 14:00:00+07	86		2026-10-01 14:38:54.527876+07
3b0c024e-42af-45ff-91cc-c9d3490a96a0	358c57fc-4c82-50e7-8980-91d2a7199f23	46dd3781-ff6c-4770-a347-5422a6efddfc	t	2026-08-23 14:00:00+07	94		2026-10-01 14:38:54.527876+07
0705dea6-46c2-4548-a4e2-a84f8702ee7c	358c57fc-4c82-50e7-8980-91d2a7199f23	fb8682da-d1a6-4bcd-88ad-577ceb2b36fc	t	2026-08-23 14:00:00+07	79		2026-10-01 14:38:54.527876+07
2f819936-afe2-430e-8374-c4b1018c38c2	358c57fc-4c82-50e7-8980-91d2a7199f23	991c36a6-c684-49b3-a0a2-4d4b4c06c099	t	2026-08-20 14:00:00+07	85		2026-10-01 14:38:54.527876+07
66473d89-28fa-4365-8faa-981eb4a1f96e	358c57fc-4c82-50e7-8980-91d2a7199f23	2a1cdaa2-4010-42d9-abc0-8e02da1f7149	t	2026-08-20 14:00:00+07	88		2026-10-01 14:38:54.527876+07
d6ab3821-06e1-467c-8428-a70af46631ba	358c57fc-4c82-50e7-8980-91d2a7199f23	00116bb5-1856-41c2-a82b-315e292ab22c	t	2026-08-20 14:00:00+07	96		2026-10-01 14:38:54.527876+07
b2dece40-9724-4192-bd42-798620b8c6e7	358c57fc-4c82-50e7-8980-91d2a7199f23	4a264929-a958-4e4d-a2ce-a7099421a796	t	2026-08-20 14:00:00+07	81		2026-10-01 14:38:54.527876+07
9124bbc9-83ae-405d-b5d4-8a50d63cbf11	358c57fc-4c82-50e7-8980-91d2a7199f23	dfd0f7d8-0fc4-4c66-9ee4-d6a0dd4ec6ac	t	2026-08-20 14:00:00+07	89		2026-10-01 14:38:54.527876+07
9c6f54bb-fe18-4686-8bc0-9cca1883aa69	358c57fc-4c82-50e7-8980-91d2a7199f23	6b2d4026-4fea-42f2-a927-1dc77d01a582	t	2026-08-20 14:00:00+07	97		2026-10-01 14:38:54.527876+07
f495770f-6263-4d30-b18c-2d3b340ae2c3	358c57fc-4c82-50e7-8980-91d2a7199f23	6f60b65d-1bcd-489f-950d-00689b104e8b	t	2026-08-21 14:00:00+07	77		2026-10-01 14:38:54.527876+07
18188706-8965-4ccb-a12e-b6ecf46e69b7	358c57fc-4c82-50e7-8980-91d2a7199f23	8e2a4e02-9634-49a8-91f4-1f96f61cd43b	t	2026-08-21 14:00:00+07	85		2026-10-01 14:38:54.527876+07
32f2ca25-a49f-4617-ac73-da963d714dc4	358c57fc-4c82-50e7-8980-91d2a7199f23	d1c4d38a-de23-4ae7-8010-b5dcec300289	t	2026-08-21 14:00:00+07	93		2026-10-01 14:38:54.527876+07
d5193dfa-4174-4c5d-a1b7-56bc68c80dd3	358c57fc-4c82-50e7-8980-91d2a7199f23	d422fcd6-2161-410e-b1e1-7b5a616e3f19	t	2026-08-21 14:00:00+07	78		2026-10-01 14:38:54.527876+07
069f0ace-c66d-4bba-8f6a-d5c1b9a1fc76	358c57fc-4c82-50e7-8980-91d2a7199f23	47517c77-1e13-4f6b-ba0a-01f02e3ecda8	t	2026-08-21 14:00:00+07	86		2026-10-01 14:38:54.527876+07
d15ce586-75af-4a10-8582-b5832a0ba94b	2cf3965b-df9c-438a-1977-f495a9108ef9	ed3b4cce-daa5-4e27-9fd2-6b832e7054c9	t	2026-08-20 14:00:00+07	74		2026-10-01 14:38:54.527876+07
b4e268a4-77e8-483a-b2dd-84a30af9ad23	2cf3965b-df9c-438a-1977-f495a9108ef9	88fd97ba-e199-455d-83fa-c4dcac822686	t	2026-08-20 14:00:00+07	82		2026-10-01 14:38:54.527876+07
e1dbdc13-4bfb-4551-b07c-e74656b66717	2cf3965b-df9c-438a-1977-f495a9108ef9	7e190946-84bf-4bb9-aab8-3017aceadf8b	t	2026-08-21 14:00:00+07	85		2026-10-01 14:38:54.527876+07
b177e5cc-0b68-4169-b6d3-d3362da5b6cc	2cf3965b-df9c-438a-1977-f495a9108ef9	01d91d18-37ec-4517-b0d2-05923352e9bf	t	2026-08-21 14:00:00+07	70		2026-10-01 14:38:54.527876+07
eeef3a96-1e7f-4c01-a01a-b8d822fad68c	2cf3965b-df9c-438a-1977-f495a9108ef9	31a15f56-7f31-4de6-a428-1cc6c70e5a8c	t	2026-08-22 14:00:00+07	78		2026-10-01 14:38:54.527876+07
9df22b37-39af-46c5-9e54-70183711a0e1	2cf3965b-df9c-438a-1977-f495a9108ef9	944a7447-9e99-4a05-9bd4-39b2be336882	t	2026-08-22 14:00:00+07	86		2026-10-01 14:38:54.527876+07
1027c095-d960-4f2f-9825-4be3b2b53131	2cf3965b-df9c-438a-1977-f495a9108ef9	3ba48f01-b327-42ed-ad64-17622eee6b82	t	2026-08-23 14:00:00+07	94		2026-10-01 14:38:54.527876+07
4b98e5b1-19b6-4980-acd4-c6f5134b115b	2cf3965b-df9c-438a-1977-f495a9108ef9	9766e933-d64c-4392-b264-9138df2283f1	t	2026-08-23 14:00:00+07	74		2026-10-01 14:38:54.527876+07
3527fa11-ad07-49e1-96c1-787a15563d51	2cf3965b-df9c-438a-1977-f495a9108ef9	618aa1fd-091b-4964-970d-a00876873de6	t	2026-08-24 14:00:00+07	82		2026-10-01 14:38:54.527876+07
b7531d44-32bb-457e-b2fe-bd98d70dc491	2cf3965b-df9c-438a-1977-f495a9108ef9	46dd3781-ff6c-4770-a347-5422a6efddfc	t	2026-08-25 14:00:00+07	90		2026-10-01 14:38:54.527876+07
3f57ad92-d951-44f2-82ed-0a6a4bd5c519	2cf3965b-df9c-438a-1977-f495a9108ef9	fb8682da-d1a6-4bcd-88ad-577ceb2b36fc	t	2026-08-25 14:00:00+07	75		2026-10-01 14:38:54.527876+07
5f89efac-ca03-4f8f-9b6e-3226d69c2274	2cf3965b-df9c-438a-1977-f495a9108ef9	62fc1f90-7a97-4b08-b914-2f2243c75b85	t	2026-08-26 14:00:00+07	83		2026-10-01 14:38:54.527876+07
e6ed5ef7-44fc-46bc-99f2-548d2efa0425	2cf3965b-df9c-438a-1977-f495a9108ef9	00f37c28-c8ed-4bf2-b6a7-3126a75e0745	t	2026-08-26 14:00:00+07	86		2026-10-01 14:38:54.527876+07
1f5bbdd1-d206-4a5b-b857-104af9027f4c	2cf3965b-df9c-438a-1977-f495a9108ef9	72be464c-986f-48a2-85df-750a393a55fc	t	2026-08-27 14:00:00+07	71		2026-10-01 14:38:54.527876+07
11701ad1-42c2-479e-9369-f8b24e78f6f6	2cf3965b-df9c-438a-1977-f495a9108ef9	18751472-ccd2-4b60-8a2b-924f0624567b	t	2026-08-27 14:00:00+07	79		2026-10-01 14:38:54.527876+07
478e31cc-f2b0-41ba-9a8a-e6c1fddc53dc	2cf3965b-df9c-438a-1977-f495a9108ef9	7f4fca69-f0f3-4bb6-9a5c-1ac1759f54cb	t	2026-08-28 14:00:00+07	87		2026-10-01 14:38:54.527876+07
4f5e7f0b-5206-46a2-9dcd-265b158f09b7	2cf3965b-df9c-438a-1977-f495a9108ef9	43a2e079-1f15-4045-aa42-a4bfb5a2d157	t	2026-08-28 14:00:00+07	72		2026-10-01 14:38:54.527876+07
45f6bf61-d380-437c-bca1-144e276f1292	2cf3965b-df9c-438a-1977-f495a9108ef9	991c36a6-c684-49b3-a0a2-4d4b4c06c099	t	2026-08-29 14:00:00+07	76		2026-10-01 14:38:54.527876+07
254cdbdf-097f-4459-98cb-9263d4155ec0	2cf3965b-df9c-438a-1977-f495a9108ef9	2a1cdaa2-4010-42d9-abc0-8e02da1f7149	t	2026-08-29 14:00:00+07	84		2026-10-01 14:38:54.527876+07
5fdc080d-2241-4fbb-98b0-c51af1e1462a	2cf3965b-df9c-438a-1977-f495a9108ef9	00116bb5-1856-41c2-a82b-315e292ab22c	t	2026-08-30 14:00:00+07	92		2026-10-01 14:38:54.527876+07
4dbc0721-7333-4ea8-9359-4a08275cb68d	2cf3965b-df9c-438a-1977-f495a9108ef9	4a264929-a958-4e4d-a2ce-a7099421a796	t	2026-08-30 14:00:00+07	77		2026-10-01 14:38:54.527876+07
549b55a9-1b58-4eeb-9fbd-99741882c0e7	2cf3965b-df9c-438a-1977-f495a9108ef9	dfd0f7d8-0fc4-4c66-9ee4-d6a0dd4ec6ac	t	2026-08-31 14:00:00+07	85		2026-10-01 14:38:54.527876+07
d919e8cc-eab9-4478-b6c1-b00eb724b599	2cf3965b-df9c-438a-1977-f495a9108ef9	8e2a4e02-9634-49a8-91f4-1f96f61cd43b	t	2026-08-18 14:00:00+07	81		2026-10-01 14:38:54.527876+07
e7c4c708-9b35-4453-be0a-a4145f8aeb08	2cf3965b-df9c-438a-1977-f495a9108ef9	d1c4d38a-de23-4ae7-8010-b5dcec300289	t	2026-08-18 14:00:00+07	89		2026-10-01 14:38:54.527876+07
579c7b4f-1aa2-47d5-8898-b4fda3651c6a	2cf3965b-df9c-438a-1977-f495a9108ef9	d422fcd6-2161-410e-b1e1-7b5a616e3f19	t	2026-08-19 14:00:00+07	74		2026-10-01 14:38:54.527876+07
137e5d5a-0238-4586-a5ec-636c9f5e3ff0	2cf3965b-df9c-438a-1977-f495a9108ef9	47517c77-1e13-4f6b-ba0a-01f02e3ecda8	t	2026-08-19 14:00:00+07	77		2026-10-01 14:38:54.527876+07
46e7e4be-ddd4-4017-b2cc-54804ababe2b	da421492-9d40-5925-7892-22b47fdc7445	0c8324b1-65f1-4280-9bb0-f40a7b9091df	t	2026-08-20 14:00:00+07	84		2026-10-01 14:38:54.527876+07
edd0c975-816b-4aa1-bf15-609f40b3275a	da421492-9d40-5925-7892-22b47fdc7445	31aae0d7-c09f-468e-af16-b8196a72459d	t	2026-08-21 14:00:00+07	92		2026-10-01 14:38:54.527876+07
7abe305e-7d75-4ab3-b912-84640ec54a75	da421492-9d40-5925-7892-22b47fdc7445	144a5dd4-e014-433d-9981-892e7c3ab031	t	2026-08-22 14:00:00+07	100		2026-10-01 14:38:54.527876+07
08d9518f-677a-47bc-bcdc-16fb3911961b	da421492-9d40-5925-7892-22b47fdc7445	f5034142-4c02-4f83-8ad7-6b6336dd9d62	t	2026-08-23 14:00:00+07	85		2026-10-01 14:38:54.527876+07
137dddb1-daf4-4d7c-8a36-260c63e3e0ec	da421492-9d40-5925-7892-22b47fdc7445	703b9fc3-a41d-41d7-8dbb-feb71360a8cf	t	2026-08-24 14:00:00+07	88		2026-10-01 14:38:54.527876+07
88ea2620-0795-4938-8080-b1da162c8113	da421492-9d40-5925-7892-22b47fdc7445	4f6de5d7-1e98-42ee-94a8-b82745bb3118	t	2026-08-25 14:00:00+07	96		2026-10-01 14:38:54.527876+07
b8402801-0ace-4095-a1a4-d3fa2a85a30d	da421492-9d40-5925-7892-22b47fdc7445	962928b8-8af1-491c-9835-7331012ad77c	t	2026-08-26 14:00:00+07	100		2026-10-01 14:38:54.527876+07
856ef939-f4e8-4ae6-812f-b293059c7196	da421492-9d40-5925-7892-22b47fdc7445	04b00742-347c-45c9-99fc-2a4cef3806fb	t	2026-08-27 14:00:00+07	89		2026-10-01 14:38:54.527876+07
4a1906e3-9c68-4117-b728-0fddde67b752	da421492-9d40-5925-7892-22b47fdc7445	2a25d9a4-7826-4397-861a-2b0df3d816a6	t	2026-08-28 14:00:00+07	97		2026-10-01 14:38:54.527876+07
5f4903e0-9ce2-4a7f-9506-915e2db4c240	da421492-9d40-5925-7892-22b47fdc7445	cb5df4a5-8dc6-4b11-855e-7b54b823bb9a	t	2026-08-29 14:00:00+07	100		2026-10-01 14:38:54.527876+07
6625a88d-ef6e-4f17-a15a-dac9d5a34868	da421492-9d40-5925-7892-22b47fdc7445	73b570f5-becc-4b5f-8597-e7e8ecb5d731	t	2026-08-31 14:00:00+07	85		2026-10-01 14:38:54.527876+07
47ac2e9d-9710-42ad-b9a7-2a6e2e20c124	da421492-9d40-5925-7892-22b47fdc7445	d2e56fc9-21ca-4b9d-9cbc-bbc731c7f109	t	2026-09-01 14:00:00+07	93		2026-10-01 14:38:54.527876+07
acb79433-39ca-44fe-851c-5abd91f51b21	da421492-9d40-5925-7892-22b47fdc7445	fc737808-6aac-4efa-9fd3-35481131db0d	t	2026-09-02 14:00:00+07	100		2026-10-01 14:38:54.527876+07
2ac56533-65ef-4829-b5c0-ccadf4d4e456	da421492-9d40-5925-7892-22b47fdc7445	60868b7a-df6d-41ba-bac5-0e2607695eea	t	2026-09-03 14:00:00+07	85		2026-10-01 14:38:54.527876+07
82e02146-9fb3-470e-ab76-29cce5305e38	da421492-9d40-5925-7892-22b47fdc7445	faf442a3-95c4-40c3-9a5c-292d2c328f4e	t	2026-09-04 14:00:00+07	88		2026-10-01 14:38:54.527876+07
a8b3058b-8092-4d76-a26b-bdb3c5746dc5	da421492-9d40-5925-7892-22b47fdc7445	3eee6182-1bba-46e0-9146-9116a260773c	t	2026-09-05 14:00:00+07	96		2026-10-01 14:38:54.527876+07
ee398ffd-4af4-4d53-b455-e7a2806665bf	da421492-9d40-5925-7892-22b47fdc7445	c860ee43-a393-421f-8e98-114fc699c7e7	t	2026-09-06 14:00:00+07	81		2026-10-01 14:38:54.527876+07
5d9f3d06-a6fc-4b9d-941f-d2575d42879b	da421492-9d40-5925-7892-22b47fdc7445	baa0777c-7ac9-47a3-9ce8-c1fc164261e2	t	2026-09-07 14:00:00+07	89		2026-10-01 14:38:54.527876+07
c982f0a4-eaf2-42b7-80fd-27c541d3ca5c	da421492-9d40-5925-7892-22b47fdc7445	a82349c8-e917-45f9-8833-e46d6094e4b7	t	2026-09-08 14:00:00+07	97		2026-10-01 14:38:54.527876+07
4d317bfd-21a8-4555-ac42-c08c53e40127	a672ee27-6c81-085a-b74e-0c9b57211f58	67456128-2464-4bce-9902-7a75d5e87c08	t	2026-08-02 14:00:00+07	83		2026-10-01 14:38:54.527876+07
308e13d8-84b4-4c89-8ccb-07545871983c	a672ee27-6c81-085a-b74e-0c9b57211f58	42cfd4bb-72b9-4c65-8690-d660e92abd06	t	2026-08-03 14:00:00+07	91		2026-10-01 14:38:54.527876+07
bb7cd058-f263-4016-9495-f96ec0cedd1c	a672ee27-6c81-085a-b74e-0c9b57211f58	6d6f3371-c3cf-4cc4-b872-a4085445f695	t	2026-08-04 14:00:00+07	99		2026-10-01 14:38:54.527876+07
2f7b69e6-aac0-44a6-9607-4bac76ed8629	a672ee27-6c81-085a-b74e-0c9b57211f58	1eff5152-2da4-48d2-852d-9f98255c0fff	t	2026-08-05 14:00:00+07	84		2026-10-01 14:38:54.527876+07
4fcecdd5-8177-4956-b5c9-68eae13a2392	a672ee27-6c81-085a-b74e-0c9b57211f58	b14bb602-7b48-428a-af9d-ef2558cbb172	t	2026-08-05 14:00:00+07	87		2026-10-01 14:38:54.527876+07
5ae0ff87-fc04-46fb-aaf6-d9f79ae7e19d	a672ee27-6c81-085a-b74e-0c9b57211f58	4c214951-4517-4ea0-b1c7-4907cbb98ed9	t	2026-08-06 14:00:00+07	95		2026-10-01 14:38:54.527876+07
519d77ad-3512-4595-a713-a270e42a4654	a672ee27-6c81-085a-b74e-0c9b57211f58	0c8324b1-65f1-4280-9bb0-f40a7b9091df	t	2026-08-07 14:00:00+07	80		2026-10-01 14:38:54.527876+07
198d2286-88c2-4234-aa7c-11d789ca2e4f	a672ee27-6c81-085a-b74e-0c9b57211f58	31aae0d7-c09f-468e-af16-b8196a72459d	t	2026-08-07 14:00:00+07	88		2026-10-01 14:38:54.527876+07
b5bcf121-e31c-4c0a-abf9-36ed1e5323dd	a672ee27-6c81-085a-b74e-0c9b57211f58	144a5dd4-e014-433d-9981-892e7c3ab031	t	2026-08-08 14:00:00+07	96		2026-10-01 14:38:54.527876+07
17ed7270-50c8-4366-8d1f-82f803531f7c	a672ee27-6c81-085a-b74e-0c9b57211f58	f5034142-4c02-4f83-8ad7-6b6336dd9d62	t	2026-08-09 14:00:00+07	76		2026-10-01 14:38:54.527876+07
6b232e37-6b44-4bbd-a594-1b04757f0228	a672ee27-6c81-085a-b74e-0c9b57211f58	703b9fc3-a41d-41d7-8dbb-feb71360a8cf	t	2026-08-09 14:00:00+07	84		2026-10-01 14:38:54.527876+07
d0e9f210-20eb-4a25-ac16-03ea39f09838	a672ee27-6c81-085a-b74e-0c9b57211f58	4f6de5d7-1e98-42ee-94a8-b82745bb3118	t	2026-08-10 14:00:00+07	92		2026-10-01 14:38:54.527876+07
34f6c7df-9875-446d-9965-3447be7c2cc8	a672ee27-6c81-085a-b74e-0c9b57211f58	962928b8-8af1-491c-9835-7331012ad77c	t	2026-08-11 14:00:00+07	100		2026-10-01 14:38:54.527876+07
4a84bab3-8e90-4c6a-b0b5-461eeba81ed7	a672ee27-6c81-085a-b74e-0c9b57211f58	04b00742-347c-45c9-99fc-2a4cef3806fb	t	2026-07-22 14:00:00+07	85		2026-10-01 14:38:54.527876+07
d0d7f4a7-838a-44e7-9b3b-bbaa88e0268c	a672ee27-6c81-085a-b74e-0c9b57211f58	2a25d9a4-7826-4397-861a-2b0df3d816a6	t	2026-07-22 14:00:00+07	88		2026-10-01 14:38:54.527876+07
72bc06ac-11bc-435f-8f95-99f011d211d8	a672ee27-6c81-085a-b74e-0c9b57211f58	cb5df4a5-8dc6-4b11-855e-7b54b823bb9a	t	2026-07-23 14:00:00+07	96		2026-10-01 14:38:54.527876+07
8094ca5e-4ded-4ba6-8dfb-53f2ac91e083	a672ee27-6c81-085a-b74e-0c9b57211f58	73b570f5-becc-4b5f-8597-e7e8ecb5d731	t	2026-07-24 14:00:00+07	81		2026-10-01 14:38:54.527876+07
1190f462-309c-4d5a-9e31-2b938a611e83	a672ee27-6c81-085a-b74e-0c9b57211f58	d2e56fc9-21ca-4b9d-9cbc-bbc731c7f109	t	2026-07-24 14:00:00+07	89		2026-10-01 14:38:54.527876+07
6a807170-3bc4-4f94-bb73-89cea725c5f0	a672ee27-6c81-085a-b74e-0c9b57211f58	fc737808-6aac-4efa-9fd3-35481131db0d	t	2026-07-25 14:00:00+07	96		2026-10-01 14:38:54.527876+07
6f657485-8ddd-4e8e-81cb-7f8f4dfba897	a672ee27-6c81-085a-b74e-0c9b57211f58	60868b7a-df6d-41ba-bac5-0e2607695eea	t	2026-07-26 14:00:00+07	76		2026-10-01 14:38:54.527876+07
054863d6-b8f0-4aa7-b800-ad06ea0762bb	a672ee27-6c81-085a-b74e-0c9b57211f58	faf442a3-95c4-40c3-9a5c-292d2c328f4e	t	2026-07-26 14:00:00+07	84		2026-10-01 14:38:54.527876+07
104a25b3-34ee-4bfa-92e0-a273ae8b6e39	a672ee27-6c81-085a-b74e-0c9b57211f58	3eee6182-1bba-46e0-9146-9116a260773c	t	2026-07-27 14:00:00+07	92		2026-10-01 14:38:54.527876+07
b80b2cab-4b9d-4352-9032-45299f2c5cda	a672ee27-6c81-085a-b74e-0c9b57211f58	c860ee43-a393-421f-8e98-114fc699c7e7	t	2026-07-28 14:00:00+07	77		2026-10-01 14:38:54.527876+07
fd5a1b7e-55c3-4e3a-ae52-499afac70859	a672ee27-6c81-085a-b74e-0c9b57211f58	baa0777c-7ac9-47a3-9ce8-c1fc164261e2	t	2026-07-29 14:00:00+07	85		2026-10-01 14:38:54.527876+07
e6db2b3e-6eb0-4819-85c9-8cf61ae7c7c3	a672ee27-6c81-085a-b74e-0c9b57211f58	a82349c8-e917-45f9-8833-e46d6094e4b7	t	2026-07-29 14:00:00+07	88		2026-10-01 14:38:54.527876+07
710508ab-7aad-4a3c-acfb-b784ae855f1d	a672ee27-6c81-085a-b74e-0c9b57211f58	27c9b5fc-e6d1-4844-8382-6e547c54c04e	t	2026-07-30 14:00:00+07	96		2026-10-01 14:38:54.527876+07
85954bb6-97f8-4dc6-b867-b5d3e74eac29	a672ee27-6c81-085a-b74e-0c9b57211f58	aca8a385-3f53-44c3-b6a6-8998d593da2c	t	2026-07-31 14:00:00+07	81		2026-10-01 14:38:54.527876+07
37ea7110-87ae-4e09-a07f-5929b872b9a7	a672ee27-6c81-085a-b74e-0c9b57211f58	7a45981c-1cb1-446c-9a65-7ac0c9865e85	t	2026-07-31 14:00:00+07	89		2026-10-01 14:38:54.527876+07
a00d6bc3-6f66-4d3e-8c9c-87206a657c9a	a672ee27-6c81-085a-b74e-0c9b57211f58	0ef61474-e479-4e95-a456-4780bee27050	t	2026-08-01 14:00:00+07	98		2026-10-01 14:38:54.527876+07
47738848-8577-40a1-af08-7d53ca25a0c6	a672ee27-6c81-085a-b74e-0c9b57211f58	a90e2951-1040-45e9-a98c-3b5920fceed8	t	2026-08-02 14:00:00+07	77		2026-10-01 14:38:54.527876+07
9f55089a-6e04-406b-9997-e1be7a38a90f	f0c572fc-e0ea-bb01-f20b-1cdae608a584	67456128-2464-4bce-9902-7a75d5e87c08	t	2026-08-28 14:00:00+07	87		2026-10-01 14:38:54.527876+07
fde1bb4f-dcd2-48bf-9f54-26b29cdb0006	f0c572fc-e0ea-bb01-f20b-1cdae608a584	42cfd4bb-72b9-4c65-8690-d660e92abd06	t	2026-08-29 14:00:00+07	95		2026-10-01 14:38:54.527876+07
524a12c4-5d9e-43b7-86db-7ae569a7b3be	f0c572fc-e0ea-bb01-f20b-1cdae608a584	6d6f3371-c3cf-4cc4-b872-a4085445f695	t	2026-08-30 14:00:00+07	100		2026-10-01 14:38:54.527876+07
fb7d1cc5-bf56-49d5-9104-bad619dc3962	f0c572fc-e0ea-bb01-f20b-1cdae608a584	1eff5152-2da4-48d2-852d-9f98255c0fff	t	2026-08-30 14:00:00+07	83		2026-10-01 14:38:54.527876+07
dcb73642-d41e-474b-bab6-9e52ec049bd2	f0c572fc-e0ea-bb01-f20b-1cdae608a584	b14bb602-7b48-428a-af9d-ef2558cbb172	t	2026-08-31 14:00:00+07	91		2026-10-01 14:38:54.527876+07
1b1f0781-e663-4521-90b9-ff9e1c0cab5a	f0c572fc-e0ea-bb01-f20b-1cdae608a584	4c214951-4517-4ea0-b1c7-4907cbb98ed9	t	2026-09-01 14:00:00+07	99		2026-10-01 14:38:54.527876+07
eff23af1-51c6-4bef-a363-173599815c1d	f0c572fc-e0ea-bb01-f20b-1cdae608a584	0c8324b1-65f1-4280-9bb0-f40a7b9091df	t	2026-09-02 14:00:00+07	84		2026-10-01 14:38:54.527876+07
72176091-31da-4404-bded-ddad80394cb1	f0c572fc-e0ea-bb01-f20b-1cdae608a584	31aae0d7-c09f-468e-af16-b8196a72459d	t	2026-09-03 14:00:00+07	92		2026-10-01 14:38:54.527876+07
b9c4223a-d112-46ab-8036-9f1b7f4a784e	f0c572fc-e0ea-bb01-f20b-1cdae608a584	144a5dd4-e014-433d-9981-892e7c3ab031	t	2026-09-04 14:00:00+07	95		2026-10-01 14:38:54.527876+07
27daf91a-2a92-4003-b4bd-d2a57c89d042	f0c572fc-e0ea-bb01-f20b-1cdae608a584	f5034142-4c02-4f83-8ad7-6b6336dd9d62	t	2026-09-04 14:00:00+07	80		2026-10-01 14:38:54.527876+07
202bc75d-42f8-4789-82e1-4ad452ce1c7d	f0c572fc-e0ea-bb01-f20b-1cdae608a584	703b9fc3-a41d-41d7-8dbb-feb71360a8cf	t	2026-09-05 14:00:00+07	88		2026-10-01 14:38:54.527876+07
a1698bfa-9270-4594-ac15-351ef9aca273	f0c572fc-e0ea-bb01-f20b-1cdae608a584	4f6de5d7-1e98-42ee-94a8-b82745bb3118	t	2026-09-06 14:00:00+07	96		2026-10-01 14:38:54.527876+07
4c504cf5-f5d6-4dfc-8f21-366cbb4b5082	f0c572fc-e0ea-bb01-f20b-1cdae608a584	962928b8-8af1-491c-9835-7331012ad77c	t	2026-09-07 14:00:00+07	100		2026-10-01 14:38:54.527876+07
95de8f55-4641-416f-827a-37b8914079b4	f0c572fc-e0ea-bb01-f20b-1cdae608a584	04b00742-347c-45c9-99fc-2a4cef3806fb	t	2026-09-08 14:00:00+07	84		2026-10-01 14:38:54.527876+07
f1b1648c-a0e6-452b-bab3-71a2266e4b9f	f0c572fc-e0ea-bb01-f20b-1cdae608a584	2a25d9a4-7826-4397-861a-2b0df3d816a6	t	2026-09-09 14:00:00+07	92		2026-10-01 14:38:54.527876+07
a812ef79-f827-4d4c-8ecc-8d258af05885	f0c572fc-e0ea-bb01-f20b-1cdae608a584	faf442a3-95c4-40c3-9a5c-292d2c328f4e	t	2026-08-20 14:00:00+07	88		2026-10-01 14:38:54.527876+07
3cb43671-15fc-462b-af89-b57b732ff67b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	3eee6182-1bba-46e0-9146-9116a260773c	t	2026-08-20 14:00:00+07	96		2026-10-01 14:38:54.527876+07
cdefab40-b88b-4a53-a202-ffb4dd21c272	f0c572fc-e0ea-bb01-f20b-1cdae608a584	c860ee43-a393-421f-8e98-114fc699c7e7	t	2026-08-21 14:00:00+07	81		2026-10-01 14:38:54.527876+07
4bc2bc6e-7b40-4366-8b8e-39c7fd991e00	f0c572fc-e0ea-bb01-f20b-1cdae608a584	baa0777c-7ac9-47a3-9ce8-c1fc164261e2	t	2026-08-22 14:00:00+07	84		2026-10-01 14:38:54.527876+07
7c12e45b-b6ea-4531-87c3-7a3e2a742e26	f0c572fc-e0ea-bb01-f20b-1cdae608a584	a82349c8-e917-45f9-8833-e46d6094e4b7	t	2026-08-23 14:00:00+07	92		2026-10-01 14:38:54.527876+07
d37cfc7d-6a45-4d4a-93f0-c9534a5c628e	f0c572fc-e0ea-bb01-f20b-1cdae608a584	27c9b5fc-e6d1-4844-8382-6e547c54c04e	t	2026-08-24 14:00:00+07	100		2026-10-01 14:38:54.527876+07
f540028c-ebe0-4eb1-8709-436620ebe546	f0c572fc-e0ea-bb01-f20b-1cdae608a584	aca8a385-3f53-44c3-b6a6-8998d593da2c	t	2026-08-25 14:00:00+07	85		2026-10-01 14:38:54.527876+07
d77ee985-7238-4dde-a213-af0b8032fafe	f0c572fc-e0ea-bb01-f20b-1cdae608a584	7a45981c-1cb1-446c-9a65-7ac0c9865e85	t	2026-08-25 14:00:00+07	93		2026-10-01 14:38:54.527876+07
28c0ff0c-a1e5-4849-bd72-8e9214fc08de	f0c572fc-e0ea-bb01-f20b-1cdae608a584	0ef61474-e479-4e95-a456-4780bee27050	t	2026-08-26 14:00:00+07	96		2026-10-01 14:38:54.527876+07
1deb2cf6-8c27-4b41-b156-be61a051c0b9	a1382eca-43a1-c1f5-4baa-fc2972675d66	baa0777c-7ac9-47a3-9ce8-c1fc164261e2	t	2026-08-30 14:00:00+07	80		2026-10-01 14:38:54.527876+07
3804c24a-9d53-4a40-b719-b497759030bd	a1382eca-43a1-c1f5-4baa-fc2972675d66	a82349c8-e917-45f9-8833-e46d6094e4b7	t	2026-08-31 14:00:00+07	88		2026-10-01 14:38:54.527876+07
9422419e-1aa4-4712-bfd1-0f6e3c7e1ef6	a1382eca-43a1-c1f5-4baa-fc2972675d66	27c9b5fc-e6d1-4844-8382-6e547c54c04e	t	2026-08-31 14:00:00+07	96		2026-10-01 14:38:54.527876+07
68c126d5-75b3-4867-bb50-03aef7a75bc5	a1382eca-43a1-c1f5-4baa-fc2972675d66	7a45981c-1cb1-446c-9a65-7ac0c9865e85	t	2026-08-18 14:00:00+07	84		2026-10-01 14:38:54.527876+07
ca3c1b63-e3ff-4a25-8c1c-5be070c523b4	a1382eca-43a1-c1f5-4baa-fc2972675d66	0ef61474-e479-4e95-a456-4780bee27050	t	2026-08-18 14:00:00+07	92		2026-10-01 14:38:54.527876+07
c07841c5-0742-4d9f-a754-858a06ceb4fc	a1382eca-43a1-c1f5-4baa-fc2972675d66	a90e2951-1040-45e9-a98c-3b5920fceed8	t	2026-08-18 14:00:00+07	77		2026-10-01 14:38:54.527876+07
2110aa35-0257-4adc-a87c-0df374fd9f6b	f0c572fc-e0ea-bb01-f20b-1cdae608a584	a90e2951-1040-45e9-a98c-3b5920fceed8	t	2026-08-27 14:00:00+07	81		2026-10-01 14:38:54.527876+07
038ed3f1-238f-4e77-aafe-3eb4d0848949	a1382eca-43a1-c1f5-4baa-fc2972675d66	67456128-2464-4bce-9902-7a75d5e87c08	t	2026-08-19 14:00:00+07	83		2026-10-01 14:38:54.527876+07
e7139e63-abc9-4e63-876b-c38a4abae667	a1382eca-43a1-c1f5-4baa-fc2972675d66	42cfd4bb-72b9-4c65-8690-d660e92abd06	t	2026-08-19 14:00:00+07	91		2026-10-01 14:38:54.527876+07
92e8ad39-92a3-42e5-90ed-d98b733ff494	a1382eca-43a1-c1f5-4baa-fc2972675d66	6d6f3371-c3cf-4cc4-b872-a4085445f695	t	2026-08-20 14:00:00+07	94		2026-10-01 14:38:54.527876+07
f41a9c0f-3b76-4b05-8e37-d9b6d57a2851	a1382eca-43a1-c1f5-4baa-fc2972675d66	1eff5152-2da4-48d2-852d-9f98255c0fff	t	2026-08-20 14:00:00+07	79		2026-10-01 14:38:54.527876+07
ad9e690b-8f12-4b02-932c-de9ad391829c	a1382eca-43a1-c1f5-4baa-fc2972675d66	b14bb602-7b48-428a-af9d-ef2558cbb172	t	2026-08-21 14:00:00+07	87		2026-10-01 14:38:54.527876+07
45d4e161-3b19-4ef0-bd41-2d66926b852b	a1382eca-43a1-c1f5-4baa-fc2972675d66	4c214951-4517-4ea0-b1c7-4907cbb98ed9	t	2026-08-21 14:00:00+07	95		2026-10-01 14:38:54.527876+07
8c3670a0-05e8-493e-b218-c4c9821fa558	a1382eca-43a1-c1f5-4baa-fc2972675d66	0c8324b1-65f1-4280-9bb0-f40a7b9091df	t	2026-08-22 14:00:00+07	80		2026-10-01 14:38:54.527876+07
01d5b0bd-2123-40cb-b78e-99e661bcc6f6	a1382eca-43a1-c1f5-4baa-fc2972675d66	31aae0d7-c09f-468e-af16-b8196a72459d	t	2026-08-22 14:00:00+07	83		2026-10-01 14:38:54.527876+07
853a9065-3ee8-431a-9142-a3d3f077bd7a	a1382eca-43a1-c1f5-4baa-fc2972675d66	144a5dd4-e014-433d-9981-892e7c3ab031	t	2026-08-23 14:00:00+07	91		2026-10-01 14:38:54.527876+07
b18e237a-c95d-47e3-8f26-130225fad013	a1382eca-43a1-c1f5-4baa-fc2972675d66	f5034142-4c02-4f83-8ad7-6b6336dd9d62	t	2026-08-23 14:00:00+07	76		2026-10-01 14:38:54.527876+07
2cca2a36-9bba-4ef4-9827-8084a3c02e77	a1382eca-43a1-c1f5-4baa-fc2972675d66	703b9fc3-a41d-41d7-8dbb-feb71360a8cf	t	2026-08-24 14:00:00+07	84		2026-10-01 14:38:54.527876+07
20b875c3-8880-4ad3-96d1-9ca35611b486	a1382eca-43a1-c1f5-4baa-fc2972675d66	4f6de5d7-1e98-42ee-94a8-b82745bb3118	t	2026-08-24 14:00:00+07	92		2026-10-01 14:38:54.527876+07
300cce34-f3b1-43d0-b09d-7e6a93f2b0ef	a1382eca-43a1-c1f5-4baa-fc2972675d66	962928b8-8af1-491c-9835-7331012ad77c	t	2026-08-25 14:00:00+07	95		2026-10-01 14:38:54.527876+07
8779fb1a-4457-4a8e-a098-7bc272118dda	a1382eca-43a1-c1f5-4baa-fc2972675d66	04b00742-347c-45c9-99fc-2a4cef3806fb	t	2026-08-25 14:00:00+07	80		2026-10-01 14:38:54.527876+07
ed7fb914-5759-4799-8e99-d23774583c3c	a1382eca-43a1-c1f5-4baa-fc2972675d66	2a25d9a4-7826-4397-861a-2b0df3d816a6	t	2026-08-26 14:00:00+07	88		2026-10-01 14:38:54.527876+07
bdd4bc18-c1a3-4cd9-90f8-fed1bafbcb79	a1382eca-43a1-c1f5-4baa-fc2972675d66	cb5df4a5-8dc6-4b11-855e-7b54b823bb9a	t	2026-08-26 14:00:00+07	96		2026-10-01 14:38:54.527876+07
77fca301-6118-47e0-ba1d-9cb933de8759	a1382eca-43a1-c1f5-4baa-fc2972675d66	73b570f5-becc-4b5f-8597-e7e8ecb5d731	t	2026-08-27 14:00:00+07	81		2026-10-01 14:38:54.527876+07
ecab2ffa-d25d-4469-af78-b8338f9fbafc	a1382eca-43a1-c1f5-4baa-fc2972675d66	d2e56fc9-21ca-4b9d-9cbc-bbc731c7f109	t	2026-08-27 14:00:00+07	83		2026-10-01 14:38:54.527876+07
fde9808d-c48f-48da-a3bd-9db679ad7bd9	a1382eca-43a1-c1f5-4baa-fc2972675d66	fc737808-6aac-4efa-9fd3-35481131db0d	t	2026-08-28 14:00:00+07	91		2026-10-01 14:38:54.527876+07
6f4fb399-78d2-4770-98b6-ba324373c5d1	a1382eca-43a1-c1f5-4baa-fc2972675d66	60868b7a-df6d-41ba-bac5-0e2607695eea	t	2026-08-28 14:00:00+07	76		2026-10-01 14:38:54.527876+07
5423cdb4-c16e-415f-a9c4-f0786f0420e2	a1382eca-43a1-c1f5-4baa-fc2972675d66	faf442a3-95c4-40c3-9a5c-292d2c328f4e	t	2026-08-29 14:00:00+07	84		2026-10-01 14:38:54.527876+07
944fd7bc-47ff-4922-9db9-97bca69de7c6	a1382eca-43a1-c1f5-4baa-fc2972675d66	3eee6182-1bba-46e0-9146-9116a260773c	t	2026-08-29 14:00:00+07	92		2026-10-01 14:38:54.527876+07
95c3d738-c92b-4815-a7f2-e6f2cf7e5829	a1382eca-43a1-c1f5-4baa-fc2972675d66	c860ee43-a393-421f-8e98-114fc699c7e7	t	2026-08-30 14:00:00+07	72		2026-10-01 14:38:54.527876+07
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tasks (id, class_id, created_by, title, description, subject, assigned_at, due_at, is_completed, "position", created_at) FROM stdin;
683fc447-a093-5855-e3e1-c0eb75edce03	46a5ee71-767e-778d-e2a9-334eb0845e73	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	Menulis Teks Eksposisi	Susun sebuah teks eksposisi dengan tema bebas yang berkaitan dengan isu pendidikan di sekitar sekolah. Teks harus memuat tesis di paragraf pembuka, rangkaian argumen yang tersusun logis, dan penegasan ulang di paragraf penutup. Gunakan kalimat efektif dan kutipan dari sumber yang kredibel, minimal tiga sumber berbeda. Kumpulkan dalam format dokumen (.pdf atau .docx), minimal 350 kata.	Bahasa Indonesia	2026-08-20 14:00:00+07	2026-09-10 14:00:00+07	f	1	2026-10-01 14:38:54.527876+07
70f9d4e0-e188-6f4c-9d8c-4ed985c2e358	46a5ee71-767e-778d-e2a9-334eb0845e73	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	Analisis Unsur Intrinsik Cerpen	Baca satu cerpen yang ditentukan guru, lalu identifikasi kelima unsur intrinsik - tokoh, penokohan, latar, konflik, dan amanat. Untuk setiap unsur, sertakan kutipan kalimat dari cerpen sebagai bukti dan satu kalimat penjelasan. Tulis analisis dalam bentuk paragraf, bukan poin-poin, minimal 300 kata.	Bahasa Indonesia	2026-07-22 14:00:00+07	2026-08-12 14:00:00+07	t	2	2026-10-01 14:38:54.527876+07
4a4037e7-ea3b-6093-cbf8-88f131d9d8e0	46a5ee71-767e-778d-e2a9-334eb0845e73	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	Membuat Teks Pidato Persuasif	Siswa membuat teks pidato persuasif dengan tema bebas yang berkaitan dengan isu lingkungan di sekitar sekolah. Pidato harus memuat struktur pembuka, isi, dan penutup, serta minimal tiga argumen yang didukung data atau fakta. Kumpulkan dalam format dokumen (.pdf atau .docx), minimal 400 kata.	Bahasa Indonesia	2026-08-20 14:00:00+07	2026-09-10 14:00:00+07	t	3	2026-10-01 14:38:54.527876+07
d2eeff0e-4100-4fec-4310-8726f09d1f4c	46a5ee71-767e-778d-e2a9-334eb0845e73	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	Membuat Resensi Buku	Tulis resensi terhadap buku fiksi pilihanmu. Resensi wajib memuat identitas buku, sinopsis, penilaian atas isi dan kegunaan, serta komentar evaluatif terhadap kebahasaan dan penerbit. Sertakan minimal tiga kutipan dari buku yang kamu kutip beserta nomor halaman. Minimal 400 kata.	Bahasa Indonesia	2026-08-18 14:00:00+07	2026-09-01 14:00:00+07	t	4	2026-10-01 14:38:54.527876+07
d62d4825-66ac-31eb-182e-f3b2c4d17c36	3535d275-b4c6-9601-e4b4-b57981176c39	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	Caption Poster	Buat tiga variasi caption untuk poster kegiatan sekolah. Setiap caption harus memiliki panjang maksimal 60 karakter, menggunakan kalimat ajakan, dan memuat satu kata kunci yang relevan. Jelaskan alasan pemilihan kata pada setiap variasi. Kumpulkan dalam format dokumen (.pdf), minimal 150 kata.	Bahasa Indonesia	2026-08-20 14:00:00+07	2026-09-10 14:00:00+07	f	1	2026-10-01 14:38:54.527876+07
0b1e4cb9-0998-79c8-73c6-65d9410c748f	3535d275-b4c6-9601-e4b4-b57981176c39	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	Analisis Unsur Intrinsik Cerpen	Baca satu cerpen yang ditentukan guru, lalu identifikasi kelima unsur intrinsik - tokoh, penokohan, latar, konflik, dan amanat. Untuk setiap unsur, sertakan kutipan kalimat dari cerpen sebagai bukti dan satu kalimat penjelasan. Tulis analisis dalam bentuk paragraf, bukan poin-poin, minimal 300 kata.	Bahasa Indonesia	2026-07-22 14:00:00+07	2026-08-12 14:00:00+07	t	2	2026-10-01 14:38:54.527876+07
358c57fc-4c82-50e7-8980-91d2a7199f23	3535d275-b4c6-9601-e4b4-b57981176c39	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	Copywriting Poster	Tulis naskah copy untuk poster kegiatan sekolah. Naskah terdiri dari headline, sub-headline, dan body copy yang memuat ajakan bertindak. Gunakan gaya bahasa yang jelas dan jangan membuat klaim yang tidak terbukti. Kumpulkan dalam format dokumen (.pdf), minimal 250 kata.	Bahasa Indonesia	2026-08-20 14:00:00+07	2026-08-24 14:00:00+07	t	3	2026-10-01 14:38:54.527876+07
2cf3965b-df9c-438a-1977-f495a9108ef9	3535d275-b4c6-9601-e4b4-b57981176c39	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	Laporan Proyek Desain	Tulis laporan hasil proyek desain yang kamu kerjakan. Laporan memuat latar belakang, tujuan, proses pengerjaan yang dilakukan, hasil akhir, dan evaluasi diri. Sertakan dokumentasi berupa foto atau tangkapan layar dari proses pengerjaan. Minimal 400 kata.	Bahasa Indonesia	2026-08-18 14:00:00+07	2026-09-01 14:00:00+07	t	4	2026-10-01 14:38:54.527876+07
f0c572fc-e0ea-bb01-f20b-1cdae608a584	407a66ba-e691-c373-c7fd-d40671b6596b	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	Membuat Teks Pidato Persuasif	Siswa membuat teks pidato persuasif dengan tema bebas yang berkaitan dengan isu lingkungan di sekitar sekolah. Pidato harus memuat struktur pembuka, isi, dan penutup, serta minimal tiga argumen yang didukung data atau fakta. Kumpulkan dalam format dokumen (.pdf atau .docx), minimal 400 kata.	Bahasa Indonesia	2026-08-20 14:00:00+07	2026-09-10 14:00:00+07	t	3	2026-10-01 14:38:54.527876+07
da421492-9d40-5925-7892-22b47fdc7445	407a66ba-e691-c373-c7fd-d40671b6596b	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	Menulis Teks Eksposisi	Susun sebuah teks eksposisi dengan tema bebas yang berkaitan dengan isu pendidikan di sekitar sekolah. Teks harus memuat tesis di paragraf pembuka, rangkaian argumen yang tersusun logis, dan penegasan ulang di paragraf penutup. Gunakan kalimat efektif dan kutipan dari sumber yang kredibel, minimal tiga sumber berbeda. Kumpulkan dalam format dokumen (.pdf atau .docx), minimal 350 kata.	Bahasa Indonesia	2026-08-20 14:00:00+07	2026-09-10 14:00:00+07	f	1	2026-10-01 14:38:54.527876+07
a672ee27-6c81-085a-b74e-0c9b57211f58	407a66ba-e691-c373-c7fd-d40671b6596b	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	Analisis Unsur Intrinsik Cerpen	Baca satu cerpen yang ditentukan guru, lalu identifikasi kelima unsur intrinsik - tokoh, penokohan, latar, konflik, dan amanat. Untuk setiap unsur, sertakan kutipan kalimat dari cerpen sebagai bukti dan satu kalimat penjelasan. Tulis analisis dalam bentuk paragraf, bukan poin-poin, minimal 300 kata.	Bahasa Indonesia	2026-07-22 14:00:00+07	2026-08-12 14:00:00+07	t	2	2026-10-01 14:38:54.527876+07
a1382eca-43a1-c1f5-4baa-fc2972675d66	407a66ba-e691-c373-c7fd-d40671b6596b	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	Membuat Resensi Buku	Tulis resensi terhadap buku fiksi pilihanmu. Resensi wajib memuat identitas buku, sinopsis, penilaian atas isi dan kegunaan, serta komentar evaluatif terhadap kebahasaan dan penerbit. Sertakan minimal tiga kutipan dari buku yang kamu kutip beserta nomor halaman. Minimal 400 kata.	Bahasa Indonesia	2026-08-18 14:00:00+07	2026-09-01 14:00:00+07	t	4	2026-10-01 14:38:54.527876+07
\.


--
-- Data for Name: teachings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teachings (id, class_id, teacher_id, subject, kkm, created_at) FROM stdin;
46aa472a-8b6a-4fa6-b958-ffaf3f310f69	46a5ee71-767e-778d-e2a9-334eb0845e73	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	Bahasa Indonesia	80	2026-10-01 14:38:54.527876+07
6a895d13-a024-4792-8537-b67ab9957d4e	3535d275-b4c6-9601-e4b4-b57981176c39	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	Bahasa Indonesia	80	2026-10-01 14:38:54.527876+07
de5a1cb6-0d33-4a57-9adc-38d2beeec3d2	407a66ba-e691-c373-c7fd-d40671b6596b	ccfba53a-4a6a-4b67-bd87-d5bb00535bf0	Bahasa Indonesia	80	2026-10-01 14:38:54.527876+07
\.


--
-- Data for Name: todos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.todos (id, user_id, title, subtitle, done, created_at) FROM stdin;
70f160d7-5b90-45e5-909d-13f6980746fb	77db7bd6-e1c5-47b4-a6bf-56af65ea21d7	halo	Kegiatan pribadi	f	2026-10-01 15:56:07.805127+07
\.


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: classes classes_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_name_key UNIQUE (name);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_class_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_class_id_student_id_key UNIQUE (class_id, student_id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: grades grades_task_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_task_id_student_id_key UNIQUE (task_id, student_id);


--
-- Name: materials materials_class_id_position_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_class_id_position_key UNIQUE (class_id, "position");


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_hash_key UNIQUE (token_hash);


--
-- Name: task_statuses task_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_statuses
    ADD CONSTRAINT task_statuses_pkey PRIMARY KEY (id);


--
-- Name: task_statuses task_statuses_task_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_statuses
    ADD CONSTRAINT task_statuses_task_id_student_id_key UNIQUE (task_id, student_id);


--
-- Name: tasks tasks_class_id_position_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_class_id_position_key UNIQUE (class_id, "position");


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: teachings teachings_class_id_teacher_id_subject_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachings
    ADD CONSTRAINT teachings_class_id_teacher_id_subject_key UNIQUE (class_id, teacher_id, subject);


--
-- Name: teachings teachings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachings
    ADD CONSTRAINT teachings_pkey PRIMARY KEY (id);


--
-- Name: todos todos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT todos_pkey PRIMARY KEY (id);


--
-- Name: announcements_class_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX announcements_class_id_idx ON public.announcements USING btree (class_id);


--
-- Name: announcements_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX announcements_created_at_idx ON public.announcements USING btree (created_at DESC);


--
-- Name: classes_ordinal_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX classes_ordinal_idx ON public.classes USING btree (ordinal);


--
-- Name: enrollments_class_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX enrollments_class_id_idx ON public.enrollments USING btree (class_id);


--
-- Name: enrollments_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX enrollments_student_id_idx ON public.enrollments USING btree (student_id);


--
-- Name: grades_class_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX grades_class_id_idx ON public.grades USING btree (class_id);


--
-- Name: grades_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX grades_student_id_idx ON public.grades USING btree (student_id);


--
-- Name: grades_task_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX grades_task_id_idx ON public.grades USING btree (task_id);


--
-- Name: materials_class_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX materials_class_id_idx ON public.materials USING btree (class_id);


--
-- Name: sessions_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_expires_at_idx ON public.sessions USING btree (expires_at);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_idx ON public.sessions USING btree (user_id);


--
-- Name: task_statuses_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX task_statuses_student_id_idx ON public.task_statuses USING btree (student_id);


--
-- Name: task_statuses_task_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX task_statuses_task_id_idx ON public.task_statuses USING btree (task_id);


--
-- Name: tasks_class_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tasks_class_id_idx ON public.tasks USING btree (class_id);


--
-- Name: tasks_due_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tasks_due_at_idx ON public.tasks USING btree (due_at);


--
-- Name: teachings_class_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teachings_class_id_idx ON public.teachings USING btree (class_id);


--
-- Name: todos_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX todos_user_id_idx ON public.todos USING btree (user_id);


--
-- Name: announcements announcements_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: announcements announcements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: chat_messages chat_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: grades grades_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: grades grades_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: grades grades_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: materials materials_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: materials materials_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: quiz_questions quiz_questions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- Name: quizzes quizzes_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: quizzes quizzes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: task_statuses task_statuses_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_statuses
    ADD CONSTRAINT task_statuses_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: task_statuses task_statuses_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_statuses
    ADD CONSTRAINT task_statuses_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: teachings teachings_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachings
    ADD CONSTRAINT teachings_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: teachings teachings_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachings
    ADD CONSTRAINT teachings_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: todos todos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT todos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles admin insert profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin insert profiles" ON public.profiles FOR INSERT WITH CHECK ((public.app_role() = 'admin'::text));


--
-- Name: profiles admin update profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin update profiles" ON public.profiles FOR UPDATE USING ((public.app_role() = 'admin'::text)) WITH CHECK ((public.app_role() = 'admin'::text));


--
-- Name: classes admin write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin write" ON public.classes USING ((public.app_role() = 'admin'::text)) WITH CHECK ((public.app_role() = 'admin'::text));


--
-- Name: enrollments admin write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin write" ON public.enrollments USING ((public.app_role() = 'admin'::text)) WITH CHECK ((public.app_role() = 'admin'::text));


--
-- Name: teachings admin write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin write" ON public.teachings USING ((public.app_role() = 'admin'::text)) WITH CHECK ((public.app_role() = 'admin'::text));


--
-- Name: announcements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

--
-- Name: announcements authenticated read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated read" ON public.announcements FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: classes authenticated read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated read" ON public.classes FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: enrollments authenticated read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated read" ON public.enrollments FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: grades authenticated read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated read" ON public.grades FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: materials authenticated read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated read" ON public.materials FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: quiz_questions authenticated read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated read" ON public.quiz_questions FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: quizzes authenticated read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated read" ON public.quizzes FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: task_statuses authenticated read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated read" ON public.task_statuses FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: tasks authenticated read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated read" ON public.tasks FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: teachings authenticated read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated read" ON public.teachings FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: announcements authenticated write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated write" ON public.announcements USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: classes authenticated write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated write" ON public.classes FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: enrollments authenticated write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated write" ON public.enrollments USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: grades authenticated write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated write" ON public.grades USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: materials authenticated write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated write" ON public.materials USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: quiz_questions authenticated write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated write" ON public.quiz_questions USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: quizzes authenticated write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated write" ON public.quizzes USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: tasks authenticated write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated write" ON public.tasks USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: teachings authenticated write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated write" ON public.teachings USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: classes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

--
-- Name: enrollments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

--
-- Name: grades; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));


--
-- Name: task_statuses insert own status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "insert own status" ON public.task_statuses FOR INSERT WITH CHECK ((student_id = auth.uid()));


--
-- Name: materials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_messages own chat; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "own chat" ON public.chat_messages USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: todos own todos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "own todos" ON public.todos USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: quizzes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles read own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: profiles read teachers basic info; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read teachers basic info" ON public.profiles FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: task_statuses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.task_statuses ENABLE ROW LEVEL SECURITY;

--
-- Name: tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: teachings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.teachings ENABLE ROW LEVEL SECURITY;

--
-- Name: todos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: task_statuses update own status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "update own status" ON public.task_statuses FOR UPDATE USING ((student_id = auth.uid()));


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: -
--

GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.grant_pg_graphql_access() FROM postgres;
GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: -
--

GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgrst_ddl_watch() FROM postgres;
GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgrst_drop_watch() FROM postgres;
GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.set_graphql_placeholder() FROM postgres;
GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION app_role(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.app_role() TO anon;
GRANT ALL ON FUNCTION public.app_role() TO authenticated;
GRANT ALL ON FUNCTION public.app_role() TO service_role;


--
-- Name: FUNCTION verify_profile_login(p_email text, p_password text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.verify_profile_login(p_email text, p_password text) TO anon;
GRANT ALL ON FUNCTION public.verify_profile_login(p_email text, p_password text) TO authenticated;
GRANT ALL ON FUNCTION public.verify_profile_login(p_email text, p_password text) TO service_role;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE announcements; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.announcements TO anon;
GRANT ALL ON TABLE public.announcements TO authenticated;
GRANT ALL ON TABLE public.announcements TO service_role;


--
-- Name: TABLE chat_messages; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.chat_messages TO anon;
GRANT ALL ON TABLE public.chat_messages TO authenticated;
GRANT ALL ON TABLE public.chat_messages TO service_role;


--
-- Name: TABLE classes; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.classes TO anon;
GRANT ALL ON TABLE public.classes TO authenticated;
GRANT ALL ON TABLE public.classes TO service_role;


--
-- Name: TABLE enrollments; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.enrollments TO anon;
GRANT ALL ON TABLE public.enrollments TO authenticated;
GRANT ALL ON TABLE public.enrollments TO service_role;


--
-- Name: TABLE grades; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.grades TO anon;
GRANT ALL ON TABLE public.grades TO authenticated;
GRANT ALL ON TABLE public.grades TO service_role;


--
-- Name: TABLE materials; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.materials TO anon;
GRANT ALL ON TABLE public.materials TO authenticated;
GRANT ALL ON TABLE public.materials TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: TABLE quiz_questions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.quiz_questions TO anon;
GRANT ALL ON TABLE public.quiz_questions TO authenticated;
GRANT ALL ON TABLE public.quiz_questions TO service_role;


--
-- Name: TABLE quizzes; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.quizzes TO anon;
GRANT ALL ON TABLE public.quizzes TO authenticated;
GRANT ALL ON TABLE public.quizzes TO service_role;


--
-- Name: TABLE sessions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.sessions TO authenticated;
GRANT ALL ON TABLE public.sessions TO anon;
GRANT ALL ON TABLE public.sessions TO service_role;


--
-- Name: TABLE task_statuses; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.task_statuses TO anon;
GRANT ALL ON TABLE public.task_statuses TO authenticated;
GRANT ALL ON TABLE public.task_statuses TO service_role;


--
-- Name: TABLE tasks; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.tasks TO anon;
GRANT ALL ON TABLE public.tasks TO authenticated;
GRANT ALL ON TABLE public.tasks TO service_role;


--
-- Name: TABLE teachings; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.teachings TO anon;
GRANT ALL ON TABLE public.teachings TO authenticated;
GRANT ALL ON TABLE public.teachings TO service_role;


--
-- Name: TABLE todos; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.todos TO anon;
GRANT ALL ON TABLE public.todos TO authenticated;
GRANT ALL ON TABLE public.todos TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict dvzTt5hBTZvWgA2umgJPwBXNFioy8LuHNFDI9332g3bcJrPQ9GQrU1n2Ti9TuR2

