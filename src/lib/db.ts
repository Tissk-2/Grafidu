import postgres from "postgres";

/**
 * Satu pool postgres.js untuk seluruh app (server actions + route handlers).
 * Koneksi memakai DATABASE_URL (server-only — tidak ada env publik lagi).
 *
 * Global cache penting di dev: Next.js me-reload modul saat hot-reload,
 * tanpa cache ini tiap reload membuat pool baru sampai menghabiskan koneksi.
 */
const globalForDb = globalThis as unknown as {
  __grafiduSql?: postgres.Sql;
};

function createSql(): postgres.Sql {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL belum diisi — isi .env.local dengan koneksi Postgres self-hosted."
    );
  }
  return postgres(url, {
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
    // Postgres 17 di VPS: prepared statements aman dipakai langsung.
    // Nonaktifkan hanya kalau suatu saat pindah ke pooler mode transaction.
  });
}

export const sql: postgres.Sql = globalForDb.__grafiduSql ?? createSql();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__grafiduSql = sql;
}
