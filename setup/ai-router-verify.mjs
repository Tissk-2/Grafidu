// One-off verification of the 9Router call + envelope parsing (mirrors
// src/lib/ai-router.ts logic verbatim). Not part of the app.
import { readFileSync } from "node:fs";
import path from "node:path";

const env = readFileSync(path.resolve(".env.local"), "utf8");
const get = (k, d) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim() ?? d;
const BASE = (get("AI_ROUTER_URL", "http://127.0.0.1:20128/v1")).replace(/\/+$/, "");
const MODEL = get("AI_MODEL", "First_combo");
const KEY = get("AI_ROUTER_KEY", "");
const TIMEOUT = Number(get("AI_TIMEOUT_MS", "45000"));

async function chatComplete(messages, maxTokens = 1400) {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: maxTokens }),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) throw new Error(`9Router merespons ${res.status}`);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    // Provider kadang menyisipkan artefak SSE setelah body JSON.
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    data = JSON.parse(text.slice(start, end + 1));
  }
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("jawaban kosong");
  return content;
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  for (const candidate of [fenced?.[1], text]) {
    if (!candidate) continue;
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end <= start) continue;
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {}
  }
  return null;
}

const clip = (t, m) => String(t ?? "").trim().slice(0, m);

const caseName = process.argv[2];

if (caseName === "chat") {
  const context = JSON.stringify({
    tasks: [
      { title: "Tugas PHP: CRUD", subject: "Pemrograman Web", dueAt: "2026-10-05", done: false, grade: null },
      { title: "Laporan Praktikum Jaringan", subject: "Jaringan Komputer", dueAt: "2026-10-04", done: false, grade: null },
    ],
    subjects: [
      { subject: "Pemrograman Web", score: 88 },
      { subject: "Seni Budaya", score: 62 },
      { subject: "Matematika", score: 74 },
    ],
  });
  const system =
    'Kamu adalah "AI Agent Grafidu", asisten belajar pribadi untuk siswa SMK bernama Arfan. Bicaralah sebagai teman belajar yang membangkitkan semangat.\n' +
    "Selalu jawab dalam Bahasa Indonesia yang ramah, positif, dan ringkas (maksimal ~150 kata kecuali diminta rinci).\n\n" +
    `DATA TERKINI (JSON, data nyata dari database Grafidu):\n${context}\n\n` +
    "ATURAN:\n" +
    "- Pertanyaan tentang nilai, tugas, tenggat, atau mata pelajaran WAJIB dijawab hanya dari DATA di atas. Jangan pernah mengarang nilai, tugas, tanggal, atau nama.\n" +
    "- Kalau data yang dibutuhkan tidak ada di DATA, katakan apa adanya dan sarankan langkah berikutnya.\n" +
    "- Pertanyaan belajar umum (menjelaskan konsep, cara mengerjakan) boleh dijawab dari pengetahuanmu.\n" +
    '- Jika siswa meminta dibuatkan to-do list / rencana berupa daftar kegiatan, balas dengan JSON {"type":"create_todos","items":[{"title":"...","subtitle":"..."}],"reply":"..."} — maksimal 5 item, title singkat (maks 80 huruf), subtitle alasan singkat, dan reply berisi kalimat penjelasan untuk siswa.\n' +
    '- Selain itu balas dengan JSON {"type":"reply","text":"..."} berisi jawabanmu.\n\n' +
    "Format output: SATU objek JSON tanpa teks lain di luar JSON. Gunakan \\n untuk baris baru di dalam string; tanpa markdown.";

  console.log("== CASE 1: pertanyaan data (nilai) ==");
  const r1 = await chatComplete([
    { role: "system", content: system },
    { role: "user", content: "Ringkas nilai saya semester ini" },
  ]);
  console.log(r1.slice(0, 400));
  console.log("parsed:", JSON.stringify(extractJson(r1))?.slice(0, 300));

  console.log("\n== CASE 2: minta to-do list ==");
  const r2 = await chatComplete([
    { role: "system", content: system },
    { role: "user", content: "Buatkan to-do list buat minggu ini" },
  ]);
  console.log(r2.slice(0, 400));
  console.log("parsed:", JSON.stringify(extractJson(r2))?.slice(0, 400));

  console.log("\n== CASE 3: pertanyaan umum ==");
  const r3 = await chatComplete([
    { role: "system", content: system },
    { role: "user", content: "Apa itu variabel dalam pemrograman? Jelaskan singkat." },
  ]);
  const p3 = extractJson(r3);
  console.log("type:", p3?.type, "| text:", clip(p3?.text ?? r3, 200));
} else if (caseName === "quiz") {
  console.log("== CASE 4: generator kuis ==");
  const materi = [
    "- Teks Eksposisi: struktur (tesis, argumen, penegasan ulang) dan kebahasaannya",
    "- Prosedur Instalasi Web Server: langkah install Apache, PHP, dan konfigurasi dasar",
  ];
  const system =
    "Kamu adalah penyusun soal ujian untuk guru SMK di platform Grafidu. Buat soal essay berbahasa Indonesia yang jelas, terukur, dan sesuai tingkat kesulitan.\n" +
    `Materi kelas yang WAJIB dipakai sebagai dasar soal:\n${materi.join("\n")}\n` +
    'Format output: SATU objek JSON tanpa teks lain: {"title":"judul kuis singkat","questions":["soal 1","soal 2",...]} — tepat 5 soal, setiap soal satu kalimat perintah (maks 200 huruf), tanpa pilihan ganda, tanpa kunci jawaban.';
  const raw = await chatComplete(
    [
      { role: "system", content: system },
      { role: "user", content: "Buatkan 5 soal tingkat Sedang tentang: Teks Eksposisi" },
    ],
    3000
  );
  const parsed = extractJson(raw);
  console.log("title:", parsed?.title);
  console.log("questions:", parsed?.questions?.length);
  console.log((parsed?.questions ?? []).slice(0, 3).map((q, i) => `${i + 1}. ${q}`).join("\n"));
} else {
  console.log("usage: node setup/ai-router-verify.mjs chat|quiz");
}
