#!/usr/bin/env node
/**
 * `npm run dev` wrapper — cross-platform (Linux/macOS/Windows):
 *
 *   1. make sure local PostgreSQL is up (setup/start.sh / service start)
 *   2. run `next dev`
 *   3. when the dev server exits (Ctrl+C included) automatically export the
 *      whole database to setup/exports/latest-dump.sql — commit & push that
 *      file so teammates can pull the latest data and restore it with
 *      setup/reset or:  psql -U postgres -d grafidu_admin_database -f <file>
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

// ---- 2. jalankan next dev ----------------------------------------------------
console.log("\nStarting Next.js dev server… (Ctrl+C to stop — the database is exported automatically)\n");
const next = spawn("npm", ["run", "dev:next"], { stdio: "inherit", cwd: root, shell: isWin });

// ---- 3. export otomatis saat dev server keluar -------------------------------
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
  writeFileSync(LATEST, readFileSync(setupDir + "/roles-prelude.sql"));
  appendFileSync(LATEST, "\n-- ==== database dump (auto-export saat dev exit) ====\n");
  appendFileSync(LATEST, readFileSync(tmp));
  rmSync(tmp);
  console.log(`\n[dev] Database exported → setup/exports/latest-dump.sql`);
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
