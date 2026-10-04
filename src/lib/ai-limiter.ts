import "server-only";

/**
 * Pembatas paralel chat AI per user — in-process (satu proses Node = satu
 * map). Upstream 9Router gratis hanya sanggup ~1-2 balasan/detik; tanpa batas
 * ini satu user bisa menahan banyak permintaan 45 detik sekaligus dan
 * menghabiskan kuota provider untuk semua orang.
 *
 * 1 slot paralel per user: UI chat menunggu balasan sebelum mengirim lagi,
 * jadi user normal tidak pernah kena — yang kena hanya tab ganda/abuse.
 * Kalau suatu saat deploy multi-proses (PM2 cluster), batas ini berlaku per
 * proses — masih jauh lebih baik daripada tanpa batas.
 */

const MAX_CONCURRENT_PER_USER = 1;

const globalForLimiter = globalThis as unknown as {
  __grafiduAiSlots?: Map<string, number>;
};

const active: Map<string, number> =
  globalForLimiter.__grafiduAiSlots ?? new Map();
globalForLimiter.__grafiduAiSlots = active;

/** true = slot didapat (wajib dipanggil releaseAiSlot setelahnya). */
export function tryAcquireAiSlot(userId: string): boolean {
  const n = active.get(userId) ?? 0;
  if (n >= MAX_CONCURRENT_PER_USER) return false;
  active.set(userId, n + 1);
  return true;
}

export function releaseAiSlot(userId: string): void {
  const n = (active.get(userId) ?? 1) - 1;
  if (n <= 0) active.delete(userId);
  else active.set(userId, n);
}
