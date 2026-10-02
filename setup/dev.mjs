#!/usr/bin/env node
/**
 * `npm run dev` wrapper — cross-platform (Linux/macOS/Windows):
 *
 *   1. make sure local PostgreSQL is up (setup/start.sh / service start)
 *   2. make sure the database has data: if it is empty (fresh clone / new
 *      machine) import setup/exports/latest-dump.sql automatically. Pass
 *      --restore (`npm run dev:restore`) to force that import even when the
 *      database already has data — it REPLACES everything.
 *   3. run `next dev`
 *   4. when the dev server exits (Ctrl+C included) automatically export the
 *      whole database to setup/exports/latest-dump.sql — commit & push that
 *      file so teammates can pull the latest data (their step 2 imports it).
 *
 * PRIVACY: latest-dump.sql contains user data + password hashes — push it to
 * a PRIVATE repository only.
 */
import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isWin = process.platform === "win32";
const setupDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(setupDir, "..");
const EXPORTS_DIR = path.join(setupDir, "exports");
const LATEST = path.join(EXPORTS_DIR, "latest-dump.sql");

/** `npm run dev:restore` → import the dump even if the database has data. */
const FORCE_RESTORE = process.argv.slice(2).some((a) => a === "--restore" || a === "--import");

// DATABASE_URL dari .env.local (di Windows harus memuat password postgres).
function databaseUrl() {
  const envPath = path.join(root, ".env.local");
  if (existsSync(envPath)) {
    const m = readFileSync(envPath, "utf8").match(/^DATABASE_URL=(.*)$/m);
    if (m) return m[1].trim();
  }
  return process.env.DATABASE_URL ?? "postgres://postgres@127.0.0.1:5432/grafidu_admin_database";
}

/** Cari folder bin PostgreSQL di Windows (instalasi EDB: \PostgreSQL\<versi>\bin). */
function findWindowsPgBin() {
  const base = "C:\\Program Files\\PostgreSQL";
  if (!existsSync(base)) return null;
  const versions = existsSync(`${base}\\17\\bin\\pg_dump.exe`)
    ? ["17", "16", "15"]
    : existsSync(`${base}\\16\\bin\\pg_dump.exe`)
      ? ["16", "17", "15"]
      : ["15", "16", "17"];
  for (const v of versions) {
    if (existsSync(`${base}\\${v}\\bin\\pg_dump.exe`)) return `${base}\\${v}\\bin`;
  }
  return null;
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "pipe", encoding: "utf8", shell: isWin, ...opts });
  return { ok: r.status === 0, out: `${r.stdout ?? ""}${r.stderr ?? ""}`.trim() };
}

/** psql: "psql" di Unix, path absolut ke psql.exe di Windows (fallback ke PATH). */
function psqlBin() {
  if (!isWin) return "psql";
  const pgBin = findWindowsPgBin();
  return pgBin ? path.join(pgBin, "psql.exe") : "psql";
}

/** Nama database dari connection string, mis. "grafidu_admin_database". */
function databaseName(url) {
  try {
    return decodeURIComponent(new URL(url).pathname.replace(/^\//, ""));
  } catch {
    return null;
  }
}

/** Koneksi ke database "postgres" di server yang sama (buat CREATE DATABASE). */
function adminUrl(url) {
  try {
    const u = new URL(url);
    u.pathname = "/postgres";
    return u.toString();
  } catch {
    return null;
  }
}

/** Buat database kalau belum ada (fresh clone). true = ada / berhasil dibuat. */
function ensureDatabaseExists(url) {
  const name = databaseName(url);
  const admin = adminUrl(url);
  if (!name || !admin) return true; // format tidak dikenali — andalkan error psql
  const exists = run(psqlBin(), [admin, "-At", "-c",
    `SELECT 1 FROM pg_database WHERE datname = '${name.replace(/'/g, "''")}';`]);
  if (exists.ok && exists.out.includes("1")) return true;
  console.log(`[dev] Creating database ${name}…`);
  const created = run(psqlBin(), [admin, "-q", "-c",
    `CREATE DATABASE "${name.replace(/"/g, '""')}";`]);
  if (!created.ok) console.error(`[dev] Could not create database ${name}: ${created.out}`);
  return created.ok;
}

/**
 * true = database sudah punya tabel public.profiles (jadi bukan fresh install).
 * null = tidak bisarage cek (koneksi gagal / psql hilang).
 */
function databaseHasProfiles(url) {
  const r = run(psqlBin(), [url, "-At", "-c",
    "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles';"]);
  if (!r.ok) return null;
  return r.out.trim().startsWith("1");
}

/** Import setup/exports/latest-dump.sql (roles prelude + schema + data). */
function restoreDump(url) {
  if (!existsSync(LATEST)) {
    console.error("[dev] No dump to import: setup/exports/latest-dump.sql is missing.");
    console.error("[dev] Get it with:  git pull origin main   (or run setup/reset-database)");
    process.exit(1);
  }
  console.log("[dev] Importing setup/exports/latest-dump.sql (this takes a few seconds)…");
  // Tanpa ON_ERROR_STOP: dump contains non-fatal errors di vanilla Postgres,
  // jadi kita cek output untuk "ERROR" alih-alih berhenti di error pertama.
  const r = run(psqlBin(), [url, "-q", "-f", LATEST]);
  const errors = r.out.split("\n").filter((l) => l.startsWith("ERROR"));
  if (!r.ok || errors.length > 0) {
    console.error(`[dev] Import FAILED (${errors.length || "?"} error(s)). First errors:`);
    for (const l of errors.slice(0, 5)) console.error(`      ${l}`);
    console.error(`[dev] Restore manually to see everything:  psql "${url}" -f setup/exports/latest-dump.sql`);
    process.exit(1);
  }
  const profiles = run(psqlBin(), [url, "-At", "-c", "SELECT count(*) FROM public.profiles;"]);
  console.log(`[dev] Import done — public.profiles: ${profiles.ok ? profiles.out.trim() : "?"} (expect 94).`);
}

/**
 * Step 2: pastikan database berisi data.
 * - fresh install (database tidak ada / tanpa public.profiles) → import otomatis
 * - --restore / npm run dev:restore → import paksa (MENGHAPUS semua data lokal)
 * - database sudah berisi data → dibiarkan, dump tidak di-import
 */
function ensureData() {
  const url = databaseUrl();

  if (!ensureDatabaseExists(url)) {
    console.error("[dev] Database is not reachable — check DATABASE_URL in .env.local.");
    process.exit(1);
  }

  const hasProfiles = databaseHasProfiles(url);
  if (hasProfiles === null) {
    console.error("[dev] Could not inspect the database — check DATABASE_URL in .env.local.");
    process.exit(1);
  }

  if (hasProfiles && !FORCE_RESTORE) {
    console.log("[dev] Database already has data — skipping import (use `npm run dev:restore` to overwrite).");
    return;
  }
  if (FORCE_RESTORE && hasProfiles) {
    console.log("[dev] --restore given: the current database will be REPLACED by the dump.");
  }
  restoreDump(url);
}

// ---- 1. pastikan PostgreSQL jalan -------------------------------------------
if (isWin) {
  const pgBin = findWindowsPgBin();
  if (!pgBin) {
    console.error("PostgreSQL not found in C:\\Program Files\\PostgreSQL\\ — install it first (see setup/README).");
    process.exit(1);
  }
  const ready = run(path.join(pgBin, "pg_isready.exe"), ["-h", "127.0.0.1", "-p", "5432"]);
  if (!ready.ok) {
    console.log("Starting the PostgreSQL service (needs an Administrator terminal)…");
    for (const svc of ["postgresql-x64-17", "postgresql-x64-16", "postgresql-x64-15"]) {
      const r = run("net", ["start", svc]);
      if (r.ok) break;
    }
    if (!run(path.join(pgBin, "pg_isready.exe"), ["-h", "127.0.0.1", "-p", "5432"]).ok) {
      console.error("PostgreSQL is not reachable. Start it manually (services.msc) and try again.");
      process.exit(1);
    }
  }
} else {
  const start = spawnSync("bash", [path.join(setupDir, "start.sh")], { stdio: "inherit" });
  if (start.status !== 0) {
    console.error("Failed to start local PostgreSQL (see ~/pgportable).");
    process.exit(1);
  }
}

// ---- 2. pastikan database berisi data (import dump kalau masih kosong) --------
ensureData();

// ---- 3. jalankan next dev ----------------------------------------------------
console.log("\nStarting Next.js dev server… (Ctrl+C to stop — the database is exported automatically)\n");
const next = spawn("npm", ["run", "dev:next"], { stdio: "inherit", cwd: root, shell: isWin });

// ---- 4. export otomatis saat dev server keluar -------------------------------

/**
 * Buat dump portable untuk server PostgreSQL yang lebih tua dari yang dipakai
 * lokal (VPS sering tertinggal satu-dua major version). pg_dump lokal = PG 17/18,
 * jadi ada tiga hal yang GAGAL di server lama:
 *
 *   1. `SET transaction_timeout = 0;`  → GUC hanya ada di PG 17+.
 *   2. `\restrict` / `\unrestrict`      → meta-command psql 18 (unknown di psql lama).
 *   3. Body fungsi `LANGUAGE sql … RETURN expr;` → sintaks SQL-standard hanya
 *      ada di PG 14+. Kalau gagal, function auth.uid()/auth.role() TIDAK terbentuk,
 *      lalu 25 policy RLS yang memakainya gagal dibuat → tabel kosong tanpa error.
 *
 * Transformasi di bawah hanya mengubah bentuk sintaks; isi data & skema tetap.
 */
function makePortable(sqlText) {
  const notes = [];

  // 1. GUC PG17+.
  const beforeGuc = sqlText;
  sqlText = sqlText.replace(/^SET transaction_timeout = 0;$/gm, "");
  if (sqlText !== beforeGuc) notes.push("dropped SET transaction_timeout (PG17+)");

  // 2. Meta-command psql 18.
  const beforeRestrict = sqlText;
  sqlText = sqlText.replace(/^\\(un)?restrict .*$/gm, "");
  if (sqlText !== beforeRestrict) notes.push("dropped \\restrict/\\unrestrict (psql 18)");

  // 3. `LANGUAGE sql STABLE\n    RETURN expr;` → `AS $$ SELECT expr $$;`
  //    Wajib ada SELECT-nya: tanpa itu `AS $$ COALESCE(...) $$` tersimpan tanpa
  //    error tapi tidak bisa dipanggil — PG Parse body sebagai SQL statement
  //    dan gagal saat inlining. Sudah diuji: uid()/role()/jwt() harus return
  //    nilai, bukan "syntax error at or near COALESCE".
  let converted = 0;
  sqlText = sqlText.replace(
    /(CREATE FUNCTION [^;]*?\n\s*LANGUAGE sql[^\n]*\n)(\s*)RETURN ([^\n]*);/g,
    (_m, head, _indent, expr) => {
      converted++;
      return `${head}    AS $$ SELECT ${expr} $$;`;
    },
  );
  if (converted > 0) {
    notes.push(`rewrote ${converted} SQL-standard function bodies to AS $$ (PG14+)`);
  }

  return { sql: sqlText, notes };
}

let done = false;
function exportDatabase() {
  if (done) return;
  done = true;
  const url = databaseUrl();
  mkdirSync(EXPORTS_DIR, { recursive: true });
  const tmp = path.join(EXPORTS_DIR, ".dump-in-progress.sql");
  const pgDumpArgs = [
    url,
    "--format=plain",
    "--no-owner",
    "--clean",
    "--if-exists",
    "--file",
    tmp,
  ];
  const pgDump = isWin ? path.join(findWindowsPgBin() ?? "", "pg_dump.exe") : "pg_dump";
  const r = spawnSync(pgDump, pgDumpArgs, { stdio: "pipe", shell: isWin });
  if (r.status !== 0) {
    console.error(`\n[dev] Auto-export FAILED: ${r.stderr ?? "(no output)"}`);
    process.exitCode = next.exitCode ?? 0;
    return;
  }
  const { sql: portable, notes } = makePortable(readFileSync(tmp, "utf8"));

  writeFileSync(LATEST, readFileSync(setupDir + "/roles-prelude.sql"));
  appendFileSync(LATEST, "\n-- ==== database dump (auto-export saat dev exit) ====\n");
  appendFileSync(LATEST, portable);
  rmSync(tmp);
  console.log(`\n[dev] Database exported → setup/exports/latest-dump.sql`);
  if (notes.length > 0) {
    console.log(`[dev] Portable fixes applied: ${notes.join("; ")}`);
  }
  console.log(`[dev] Commit & push it so your teammates get the latest data (PRIVATE repo only!).`);
  console.log(`[dev] Teammate restore:  psql -U postgres -d grafidu_admin_database -f setup/exports/latest-dump.sql`);
  process.exitCode = next.exitCode ?? 0;
}

next.on("exit", (code) => {
  console.log(`\n[dev] Dev server exited (code ${code ?? "signal"}) — exporting database…`);
  exportDatabase();
});
process.on("SIGINT", () => next.kill("SIGTERM"));
process.on("SIGTERM", () => next.kill("SIGTERM"));
