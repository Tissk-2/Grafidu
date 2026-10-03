import "server-only";

/**
 * Klien 9Router — endpoint OpenAI-compatible yang dijalankan lokal/VPS yang
 * sama dengan aplikasi (lihat setup/9router-vps.md). Konfigurasi dari env:
 * AI_ROUTER_URL, AI_MODEL, AI_ROUTER_KEY, AI_TIMEOUT_MS (.env.local.example).
 *
 * Router memegang koneksi ke provider gratis (OpenCode, OpenRouter, dll.);
 * aplikasi tidak pernah mengirim kredensial provider ke browser.
 */

const BASE_URL = (process.env.AI_ROUTER_URL || "http://127.0.0.1:20128/v1").replace(/\/+$/, "");
const MODEL = process.env.AI_MODEL || "First_combo";
const API_KEY = process.env.AI_ROUTER_KEY || "";
const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 45000);

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

/**
 * Satu panggilan chat completion non-streaming. Melempar Error bila router
 * tidak reachable, statusnya tidak 2xx, atau jawabannya kosong — pemanggil
 * (route handler) yang memutuskan fallback.
 */
export async function chatComplete(
  messages: ChatMsg[],
  opts?: { maxTokens?: number }
): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: opts?.maxTokens ?? 1200,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`9Router merespons ${res.status}`);
  }
  const text = await res.text();
  let data: {
    choices?: { message?: { content?: string | null } }[];
  };
  try {
    data = JSON.parse(text);
  } catch {
    // Sebagian provider menyisipkan artefak SSE ("data: [DONE]") setelah body
    // JSON, atau mengirim balasan bertingkat — ambil objek JSON terluar saja.
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    let recovered: unknown = null;
    if (start !== -1 && end > start) {
      try {
        recovered = JSON.parse(text.slice(start, end + 1));
      } catch {
        recovered = null;
      }
    }
    if (!recovered || typeof recovered !== "object") {
      throw new Error("9Router mengirim respons yang tidak bisa dibaca");
    }
    data = recovered as typeof data;
  }
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("9Router mengembalikan jawaban kosong");
  }
  return content;
}

/**
 * Mengambil objek JSON dari balasan model yang dibungkus kalimat pembuka atau
 * code fence. Mengembalikan null kalau tidak ada JSON valid — pemanggil
 * memperlakukannya sebagai teks biasa.
 */
export function extractJson<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  for (const candidate of [fenced?.[1], text]) {
    if (!candidate) continue;
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end <= start) continue;
    try {
      return JSON.parse(candidate.slice(start, end + 1)) as T;
    } catch {
      // coba kandidat berikutnya
    }
  }
  return null;
}

/** Memotong teks aman untuk prompt: rapi, terbatas, tanpa kontrol karakter. */
export function clip(text: unknown, max: number): string {
  return String(text ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim()
    .slice(0, max);
}
