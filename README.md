# GRAFIDU

> **"Know where you are. Know what to do next."**  
> An education platform connecting grades, teacher materials, assignments, and AI recommendations for Indonesian vocational high-school students (XI RPL) and their teachers.

Built with **Next.js (App Router)** and **TypeScript** — server-rendered, backed by a
self-hosted **PostgreSQL** database.

> **Looking for setup, database and VPS deployment instructions? See [GUIDE.md](./GUIDE.md).**

## Tech Stack

- **Framework**: Next.js, App Router, `output: "standalone"` for VPS deploys
- **Language**: TypeScript 5 (strict mode)
- **Database**: Self-hosted PostgreSQL via `postgres` (postgres.js); one shared pool in
  `src/lib/db.ts`, reached only from the server via `DATABASE_URL`
- **Writes**: Next.js server actions (`src/app/actions/*`) — no client-side data store
- **Auth**: Custom session cookies, tokens hashed in `public.sessions`
- **Styling**: Tailwind CSS v4 + hand-crafted design system (`globals.css`) from the Figma exports

## Project Status

Shipped: landing page, auth (login/signup/forgot password/change password), student dashboard
(tasks, task detail + submission, to-do, grades, materials, announcements, AI agent, settings),
teacher area (class home, tasks, materials, quiz maker, announcements, AI agent, settings) and a
full admin area (users, classes, announcements, settings).

## Data & the Database

Everything is persisted in PostgreSQL. `npm run dev` starts the local PostgreSQL cluster before
`next dev`, and **exports the whole database to `setup/exports/latest-dump.sql` when the dev
server exits** (Ctrl+C included) so teammates and the VPS can restore the latest data. Dump files
contain user data and password hashes — this repository must stay private. Full details, restore
commands and the VPS deploy procedure are in [GUIDE.md](./GUIDE.md).

---

## Getting Started

```bash
cp .env.local.example .env.local    # set DATABASE_URL
npm install
npm run dev
```

`npm run dev` boots PostgreSQL for you, then runs the dev server at
[http://localhost:3000](http://localhost:3000). If the dump on exit fails, run `./setup/start.sh`
and `./setup/export.sh` manually — see GUIDE.md.

## Accounts & Roles

Accounts live in the database (94 seeded profiles). Roles are `student`, `teacher`, `admin`, each
with its own dashboard (`/student/home`, `/teacher/home`, `/admin`). The admin account is
`admin@grafidu.sch.id`; passwords are bcrypt hashes, and new/changed accounts get a random
temporary password that is shown once. There are no hard-coded demo logins in the code — restore
the database (GUIDE.md §6.2) and use the accounts that come with the dump.

---

## Production Build

```bash
npm run typecheck
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
cd .next/standalone && node server.js
```

See [GUIDE.md §8](./GUIDE.md) for the full VPS deployment checklist.
