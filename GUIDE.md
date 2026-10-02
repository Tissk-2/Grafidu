# GRAFIDU — Developer & Deployment Guide

Operating manual for the Grafidu repo: how the app is wired to PostgreSQL, how `npm run dev`
behaves, how the local database is dumped/restored, and how to deploy to the VPS.

Read this before touching the database or deploying. `README.md` is the product overview,
`DESIGN.md` is the design system, `PRODUCT.md` is the product brief — this file is the
"how do I actually run and ship it" document.

---

## 1. Stack at a glance

| Layer | Choice |
|---|---|
| Framework | Next.js 16, App Router, `output: "standalone"` |
| Language | TypeScript 5 (strict) |
| Database | Self-hosted PostgreSQL (originally a Supabase dump, migrated off Supabase) |
| DB driver | `postgres` (postgres.js) — one shared pool in `src/lib/db.ts` |
| Auth | Custom session auth: opaque cookie token, sha256 hash stored in `public.sessions` |
| Mutations | Next.js **server actions** in `src/app/actions/*`, not client-side stores |
| Styling | Tailwind CSS v4 + a hand-built design system (`src/app/globals.css`) |

There is **no in-memory store and no external AI API** anymore. Everything is read from and
written to PostgreSQL through server actions. Any documentation that claims otherwise (older
README text, old chat notes) is stale.

---

## 2. Repository layout that matters

```
setup/                     Local PostgreSQL + dump tooling
├── dev.mjs                `npm run dev` wrapper (starts PG, runs next dev, auto-exports on exit)
├── start.sh / stop.sh     Portable PG cluster in ~/pgportable (Linux/macOS)
├── start.bat / stop.bat   Same for Windows (EDB-installed service)
├── export.sh / .bat       Manual export → setup/exports/grafidu-export-<timestamp>.sql
├── reset-database.sh/.bat DESTRUCTIVE reset back to full-dump.sql + migrations
├── roles-prelude.sql      Supabase roles/grants prepended to every dump
└── exports/
    └── latest-dump.sql    Auto-written by `npm run dev` when it exits (committed by design)

postgres/migrations/       Hand-written migrations applied on top of the Supabase dump
└── 001-auth.sql           public.sessions table for the custom session auth

supabase/                  Legacy Supabase-era SQL kept for reference/one-off fixes
src/lib/db.ts              Single postgres.js pool (DATABASE_URL, server-only)
src/lib/session.ts         Cookie sessions: create/read/destroy, role guards
src/app/actions/           Server actions: auth, student, teacher, admin
middleware.ts              Coarse cookie-presence redirect for protected route groups
```

---

## 3. Prerequisites

- Node.js 20+ (developed on Node 26)
- PostgreSQL client binaries on `PATH`: `psql`, `pg_dump`, `pg_isready`
- A running PostgreSQL server (local cluster for dev, systemd-managed server on the VPS)

---

## 4. Local PostgreSQL

### 4.1 Linux/macOS — portable cluster (`~/pgportable`)

The dev machine uses a **portable PostgreSQL 17 cluster**, not a system service. Binaries and
data live in `~/pgportable` (outside the repo), logs go to `~/pgportable/server.log`. It does
**not** survive a reboot — start it again with `setup/start.sh`.

```bash
./setup/start.sh     # idempotent: prints "already running" and exits 0
./setup/stop.sh      # fast shutdown
pg_isready -h 127.0.0.1 -p 5432
```

`start.sh` exports `LD_LIBRARY_PATH` to `$HOME/pgportable/pgbin/lib` and launches `pg_ctl` with
`-o "-p 5432 -c listen_addresses=127.0.0.1"`, so the server only listens on loopback.
Auth is `trust` — there is no local password.

If `~/pgportable` does not exist yet, initialise it once:

```bash
export LD_LIBRARY_PATH="$HOME/pgportable/pgbin/lib"
"$HOME/pgportable/pgbin/bin/initdb" -D "$HOME/pgportable/data" -U postgres --auth=trust
./setup/start.sh
```

### 4.2 Windows — EDB installer service

`setup/start.bat` / `setup/stop.bat` use `net start postgresql-x64-17` (falls back to 16, 15).
Those need an **Administrator** terminal. `pg_isready` is resolved from
`C:\Program Files\PostgreSQL\<version>\bin`.

### 4.3 Database name and roles

| Item | Value |
|---|---|
| Database | `grafidu_admin_database` |
| Host / port | `127.0.0.1:5432` (dev) |
| Superuser | `postgres` (trust auth locally, password on Windows) |
| Extra roles | `anon`, `authenticated`, `service_role`, `authenticator` — created by `setup/roles-prelude.sql` because the original Supabase dump's grants and RLS policies reference them |

`auth.uid()` / `auth.role()` / `auth.jwt()` come from the dump as compatibility functions that
read the `request.jwt.claims` GUC. Grafidu's session code does not rely on Supabase Auth, so you
normally never need to set that GUC yourself.

---

## 5. Environment configuration

One server-only variable, in `.env.local` (git-ignored, copy from `.env.local.example`):

```bash
DATABASE_URL=postgres://grafidu_admin_root:YOUR_PASSWORD@127.0.0.1:5432/grafidu_admin_database
```

- There are **no public/`NEXT_PUBLIC_*` database variables.** The connection string is read in
  `src/lib/db.ts` only, which runs on the server.
- `npm run dev` reads the same file directly to know which database to dump (see §6).
- On the VPS, set it in the service environment (systemd `EnvironmentFile` or a `.env` next to
  the standalone server) — never commit it.

Pool settings: `max: 10` connections, 30s idle timeout, 10s connect timeout. In dev the pool is
cached on `globalThis` so hot-reloads don't leak connections.

---

## 6. HOW IT WORKS — `npm run dev`

`npm run dev` is **not** plain `next dev`. It runs `setup/dev.mjs`, a cross-platform wrapper
that does three things in order:

```
npm run dev
   │
   ├─ 1. Ensure PostgreSQL is up
   │     Linux/macOS → runs setup/start.sh (portable cluster in ~/pgportable)
   │     Windows     → finds C:\Program Files\PostgreSQL\<ver>\bin, then
   │                    `net start postgresql-x64-17|16|15` (needs Administrator)
   │     If Postgres still is not reachable → the wrapper exits with code 1,
   │     `next dev` never starts.
   │
   ├─ 2. Run the dev server
   │     spawns `npm run dev:next` (i.e. `next dev`) with stdio inherited,
   │     so you see the normal Next.js output.
   │
   └─ 3. On exit (Ctrl+C included) → auto-export the database
         reads DATABASE_URL from .env.local
         pg_dump <url> --format=plain --no-owner --clean --if-exists
           → setup/exports/.dump-in-progress.sql   (temp)
         writes roles-prelude.sql + a banner + the dump
           → setup/exports/latest-dump.sql          (atomic-ish swap, temp removed)
```

Key consequences:

- **Stopping the dev server with Ctrl+C always writes `setup/exports/latest-dump.sql`.** That file
  is the single source of truth for "the current data" that teammates and the VPS can restore.
- If `pg_dump` fails (server already stopped, bad password), the wrapper prints
  `[dev] Auto-export FAILED: …`, leaves `latest-dump.sql` untouched, and does not throw.
- `SIGINT`/`SIGTERM` are forwarded to the Next.js process, so Ctrl+C never leaves an orphan server.
- `.dump-in-progress.sql` is git-ignored; `latest-dump.sql` is intentionally committed.
- `npm run dev:next` runs `next dev` **without** starting Postgres or exporting — use it only when
  the database is already up and you don't want a dump.

### 6.1 Privacy rule for dumps

Dumps contain real user rows and bcrypt password hashes. `setup/exports/latest-dump.sql`,
`full-dump.sql`, `auth-extra-data.sql` and `grafidu-export-*.sql` must only ever live in a
**private** repository. `.gitignore` blocks the ad-hoc exports; the committed `latest-dump.sql`
is the deliberate trade-off — if the repo is ever made public, delete it and rotate nothing else.

### 6.2 Sharing data with a teammate

```bash
git add setup/exports/latest-dump.sql && git commit -m "data: export dev database" && git push
```

On their machine:

```bash
./setup/start.sh
psql postgres://postgres@127.0.0.1:5432/grafidu_admin_database -f setup/exports/latest-dump.sql
```

The dump starts with `roles-prelude.sql`, so it restores cleanly into a **fresh** database
(schema + data + roles in one file).

---

## 7. Database maintenance scripts

| Task | Linux/macOS | Windows |
|---|---|---|
| Start PostgreSQL | `./setup/start.sh` | `setup\start.bat` (Admin) |
| Stop PostgreSQL | `./setup/stop.sh` | `setup\stop.bat` (Admin) |
| Manual export (timestamped file) | `./setup/export.sh` | `setup\export.bat` |
| Reset to the original Supabase dump (**destructive**) | `./setup/reset-database.sh` | `setup\reset-database.bat` |

`export.sh` writes `setup/exports/grafidu-export-<YYYYmmdd-HHMMSS>.sql`
(roles prelude + `--clean --if-exists` dump). Use it when you want a timestamped snapshot in
addition to `latest-dump.sql`; pass a path as `$1` to override the output.

`reset-database.sh` drops and recreates `grafidu_admin_database`, replays `full-dump.sql`, then
applies `postgres/migrations/001-auth.sql`, and prints the profile count (expect **94**). Every
hand-written migration must be replayed after a reset — that is the reason the script lists them
explicitly.

### 7.1 Applying a migration

Migrations are plain SQL, applied by hand (no runner, no lockfile):

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f postgres/migrations/001-auth.sql
```

Rules for new migrations:

1. New file `postgres/migrations/NNN-short-name.sql`, never edit an already-applied one.
2. Idempotent DDL (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`) so re-running is safe.
3. Add the replay line to `reset-database.sh` and `reset-database.bat`.
4. Run it on the VPS before deploying code that depends on it.

---

## 8. Deploying to the VPS

The app is built with `output: "standalone"`, so the server only needs `node`, the
`.next/standalone` bundle, `public/` and `.next/static/` — no `node_modules` install on the
server for production dependencies beyond what standalone already traces.

### 8.1 Build and ship (run these on the VPS)

```bash
npm ci
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

Notes on those four steps:

- `npm ci` — reproducible install from `package-lock.json` (never `npm install` on the server).
- `npm run build` — produces `.next/standalone/server.js`, the entry point.
- `cp -r .next/static …` — standalone output **excludes** static assets; without this copy every
  page loads without CSS/JS chunks.
- `cp -r public …` — same for `public/`. `cp -r` will nest into an existing directory
  (`public/public`), so delete the target first if you re-deploy into a dirty tree:
  `rm -rf .next/standalone/public .next/standalone/.next/static` before copying.
- Optionally run `npm run typecheck` and `npm run lint` before building — the build itself does
  not run them.

### 8.2 Run the server

```bash
cd .next/standalone
export DATABASE_URL='postgres://grafidu_admin_root:PASSWORD@127.0.0.1:5432/grafidu_admin_database'
export PORT=3000
export HOSTNAME=127.0.0.1     # put nginx/Caddy in front, do not expose this port
node server.js
```

`NODE_ENV=production` makes the session cookie `secure`, so serve the site over HTTPS — over plain
HTTP the browser drops the session cookie and every login appears to fail silently.

### 8.3 Restart after every deploy

Keep the process under a supervisor so `node server.js` is restarted on reboot and crash. Minimal
systemd unit:

```ini
# /etc/systemd/system/grafidu.service
[Unit]
Description=Grafidu (Next.js standalone)
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/srv/grafidu/.next/standalone
EnvironmentFile=/etc/grafidu.env     # DATABASE_URL, PORT, HOSTNAME
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now grafidu
sudo systemctl restart grafidu
sudo journalctl -u grafidu -f
```

### 8.4 Database on the VPS

- PostgreSQL must run as a service and listen on `127.0.0.1:5432` (the app connects over loopback).
- Create the runtime role, do not run the app as the postgres superuser:
  ```sql
  CREATE ROLE grafidu_admin_root LOGIN PASSWORD '…';
  GRANT ALL PRIVILEGES ON DATABASE grafidu_admin_database TO grafidu_admin_root;
  ```
- First boot on a fresh server: restore a dump, then replay migrations.
  ```bash
  psql postgres://…:5432/postgres -c 'CREATE DATABASE grafidu_admin_database;'
  psql "$DATABASE_URL" -f setup/exports/latest-dump.sql      # schema + data + roles
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f postgres/migrations/001-auth.sql
  ```
- Back up with `pg_dump "$DATABASE_URL" --format=custom --file=…` on a timer; restore with
  `pg_restore`. Take a dump **before** applying a migration to production.

### 8.5 Deploy checklist

1. `npm run typecheck` and `npm run lint` clean locally.
2. Take a production `pg_dump` backup.
3. Pull, then run the four commands in §8.1.
4. Apply any new migrations (§7.1).
5. Restart `grafidu`, check `journalctl -u grafidu`, then smoke-test:
   `/` → `/login` → student dashboard → teacher dashboard → `/admin`.
6. Confirm `.env.local` / `/etc/grafidu.env` still holds the production `DATABASE_URL`.

---

## 9. Application notes worth knowing before you edit code

- **Single DB pool** — import `sql` from `@/lib/db`; never open your own connection.
- **Server actions are the write path** — `src/app/actions/{auth,student,teacher,admin}.ts`. Pages
  read data on the server and pass it down; client components call actions and revalidate.
- **Sessions** — cookie `grafidu_session` holds a random 32-byte token; only its sha256 is in
  `public.sessions` (30-day TTL). Revoking a session = deleting those rows (password reset,
  deactivation, admin user management). `middleware.ts` only does a cheap cookie-presence redirect
  because the edge runtime can't reach Postgres; the real role guard is in `src/lib/session.ts`
  plus the per-area layouts.
- **Passwords** — hashed with `bcryptjs` inside the server actions and admin API routes. Existing
  hashes arrived from Supabase in `$2a$` format, which bcryptjs verifies as-is;
  `src/lib/password.ts` only generates the random temporary passwords shown once to the admin.
- **Roles** — `student | teacher | admin`; `dashboardPath()` maps a role to its landing route.
- **RLS still exists in the schema** from the Supabase era. The app connects as a privileged role,
  so policies are effectively bypassed — do not treat RLS as a second line of defence.

---

## 10. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `DATABASE_URL belum diisi` | `.env.local` missing or empty — copy `.env.local.example` |
| `npm run dev` exits immediately, "Failed to start local PostgreSQL" | Cluster not initialised or port busy; run `./setup/start.sh` manually to see the `pg_ctl` error. After a reboot, `~/pgportable` must be started by hand |
| Windows: "Could not start PostgreSQL" | `net start` needs an Administrator terminal, or the service name differs (check `services.msc`) |
| `[dev] Auto-export FAILED` | Dev server exited after Postgres stopped, or the password is wrong on Windows. Restart Postgres and re-export with `setup/export.sh` / `export.bat` |
| Login loops back to `/login` | Session cookie rejected: `secure` cookie over plain HTTP (prod), or `public.sessions` missing → apply `postgres/migrations/001-auth.sql` |
| Page renders unstyled on the VPS | Forgot `cp -r .next/static .next/standalone/.next/static` |
| Images/manifest 404 on the VPS | Forgot `cp -r public .next/standalone/public`, or nested `public/public` |
| `relation "public.sessions" does not exist` | Migration not replayed after a reset/restore |
| `pg_dump: error: connection refused` at exit | Postgres already stopped — `./setup/start.sh`, then `./setup/export.sh` |

---

## 11. Security & data handling

- `.env.local` and any production env file are secrets. Never commit them, never paste them into
  issues or chat.
- Dumps (`latest-dump.sql`, `grafidu-export-*.sql`, `full-dump.sql`, `auth-extra-data.sql`) contain
  user data and password hashes — private repository only.
- Passwords are hashed with `bcryptjs` in the server actions and admin API routes; never log or
  return hashes.
- Uploaded avatars go through `src/app/api/upload/avatar/route.ts` — keep that route's type/size
  validation in place when editing it.