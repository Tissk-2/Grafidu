# GRAFIDU — Quick Guide

Two things only: how to run it locally, and how to put it on the VPS.

---

## Deploy to VPS

Every time you update the code, run these **on the VPS**, in the project folder:

```bash
npm ci
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

**Requirements on the VPS:** Node.js + npm installed, and PostgreSQL installed and running.

The last two `cp` commands copy the static assets and `public/` into the standalone build.
Without them the site loads with no CSS and no images.

Then restart the app:

```bash
sudo systemctl restart grafidu
```

The server itself runs from the build:

```bash
cd .next/standalone && node server.js
```

`DATABASE_URL` must be set in the server's environment (not committed) — it points at the
PostgreSQL database, e.g.
`postgres://grafidu:PASSWORD@127.0.0.1:5432/grafidu_admin_database`.

> Re-running into an existing folder? The `cp -r public ...` can create `public/public`. Delete
> the target first if that happens:
> `rm -rf .next/standalone/public .next/standalone/.next/static` before copying.

---

## Run locally

```bash
npm run dev
```

That's it. It does three things:

1. Starts PostgreSQL for you.
2. Makes sure the database has data — if it's empty (fresh clone or new machine) it imports
   `setup/exports/latest-dump.sql` automatically. Takes a few seconds.
3. Starts Next.js at [http://localhost:3000](http://localhost:3000).

When you stop it (Ctrl+C), the database is automatically exported back to
`setup/exports/latest-dump.sql` so you can push the latest data to your teammates or restore it
on the VPS. **Dumps contain user data — never put this repo on a public GitHub.**

### I want the latest data even though my database isn't empty

```bash
npm run dev:restore
```

Same as `npm run dev`, but forces the import. **This replaces everything in your local database**
with the contents of the dump. Useful after a teammate pushed new data and you want their version
instead of yours.

### Don't want the SQL server?

```bash
npm run dev:next
```

Plain `next dev` — no PostgreSQL, no import, no export. Only use this if you're working on
something that doesn't touch the database, or if you already have a database running yourself.

---

## Manual database scripts

```bash
./setup/start.sh                     # start PostgreSQL
./setup/stop.sh                      # stop PostgreSQL
./setup/export.sh                    # export to a timestamped file
./setup/reset-database.sh            # reset to a fresh copy of the data (wipes local changes)
psql <DATABASE_URL> -f setup/exports/latest-dump.sql   # restore a teammate's data
```

Windows equivalents: `setup\start.bat`, `setup\stop.bat`, `setup\export.bat`,
`setup\reset-database.bat` (run as Administrator).
