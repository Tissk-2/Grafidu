-- 001-auth.sql — session store for Grafidu's custom auth (replaces Supabase Auth/GoTrue).
-- Run on the target database as its owner:
--   psql -d grafidu_admin_database -f postgres/migrations/001-auth.sql
--
-- Design: the cookie holds an opaque random token; only its sha256 hash is
-- stored here, so a DB leak cannot be replayed as a session. Sessions are
-- rows (not JWTs) so the admin can revoke them per-user at any time
-- (password reset / deactivation call destroyUserSessions).

CREATE TABLE IF NOT EXISTS public.sessions (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    token_hash  text NOT NULL UNIQUE,
    user_agent  text,
    created_at  timestamptz NOT NULL DEFAULT now(),
    last_seen_at timestamptz NOT NULL DEFAULT now(),
    expires_at  timestamptz NOT NULL DEFAULT now() + interval '30 days'
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON public.sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON public.sessions (expires_at);

-- Supabase-style RLS on the new table too: the app connects as the table
-- owner (RLS bypassed), these policies only matter if that ever changes.
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
