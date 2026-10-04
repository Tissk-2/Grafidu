import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { chatComplete, clip, extractJson, type ChatMsg } from "@/lib/ai-router";
import { tryAcquireAiSlot, releaseAiSlot } from "@/lib/ai-limiter";

export const dynamic = "force-dynamic";

/**
 * Proxy chat AI → 9Router lokal. Browser tidak pernah bicara langsung ke
 * router; route ini yang memverifikasi sesi, menyusun system prompt berisi
 * konteks data nyata, lalu menerjemahkan balasan model ke bentuk yang aman
 * untuk UI (teks, atau aksi create_todos untuk siswa).
 *
 * Batas 1 permintaan AI paralel per user (ai-limiter) → 429 bila lewat.
 */

const MAX_MESSAGE = 1000;
const MAX_HISTORY = 10;
const MAX_CONTEXT_CHARS = 12000;

type IncomingTurn = { role: "user" | "assistant"; content: string };

type TodoDraft = { title: string; subtitle?: string };

type QuizDraft = {
  title: string;
  topic: string;
  difficulty: string;
  questions: { text: string; options: string[]; answer: number }[];
};

type ChatSuccess =
  | { ok: true; type: "reply"; reply: string }
  | { ok: true; type: "create_todos"; reply: string; items: TodoDraft[] }
  | { ok: true; type: "create_quiz"; reply: string; quiz: QuizDraft };

const QUIZ_DIFFICULTIES = ["Mudah", "Sedang", "Sulit"];
const MAX_CHAT_QUESTIONS = 10;

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Kamu harus login terlebih dahulu." }, { status: 401 });
  }

  let body: { message?: unknown; history?: unknown; context?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const message = clip(body.message, MAX_MESSAGE);
  if (!message) {
    return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
  }

  // Riwayat: maks 10 giliran sebelum pesan ini, teks dipotong per giliran.
  const history: IncomingTurn[] = Array.isArray(body.history)
    ? (body.history as unknown[])
        .slice(-MAX_HISTORY)
        .map((h) => {
          const turn = h as { role?: unknown; text?: unknown };
          const role = turn.role === "ai" ? "assistant" : "user";
          return { role: role as IncomingTurn["role"], content: clip(turn.text, 800) };
        })
        .filter((h) => h.content.length > 0)
    : [];

  const context = buildContext(user.role, body.context);
  const system = systemPrompt(user.role, user.name, context);

  const messages: ChatMsg[] = [
    { role: "system", content: system },
    ...history,
    { role: "user", content: message },
  ];

  // Satu permintaan AI paralel per user (lihat ai-limiter.ts). Slot dilepas
  // di finally — semua jalur keluar (502, retry, sukses) bebas slot.
  if (!tryAcquireAiSlot(user.id)) {
    return NextResponse.json(
      { error: "Masih ada pertanyaanmu yang sedang diproses. Tunggu balasannya dulu ya." },
      { status: 429 }
    );
  }

  try {
    let raw: string;
    try {
      raw = await chatComplete(messages, { maxTokens: 1400 });
    } catch {
      return NextResponse.json(
        { error: "Layanan AI sedang tidak tersedia." },
        { status: 502 }
      );
    }

    let reply = parseModelReply(user.role, raw);

    // Model kadang membalas percakapan biasa padahal diminta satu objek JSON —
    // coba perbaiki sekali dengan meminta format ulang sebelum fallback ke teks.
    if (!reply) {
      try {
        const retry = await chatComplete(
          [
            ...messages,
            { role: "assistant", content: clip(raw, 800) },
            {
              role: "user",
              content:
                'Balasanmu tadi bukan JSON yang valid. Ulangi jawaban yang sama dengan format PERSIS satu objek JSON tanpa teks lain: {"type":"reply","text":"..."} — atau aksi yang diminta pengguna: to-do list → {"type":"create_todos","items":[{"title":"...","subtitle":"..."}],"reply":"..."}, kuis → {"type":"create_quiz","title":"...","topic":"...","difficulty":"Mudah|Sedang|Sulit","questions":["..."],"reply":"..."}.',
            },
          ],
          { maxTokens: 1400 }
        );
        reply = parseModelReply(user.role, retry);
      } catch {
        // Router tidak reachable saat retry — pakai teks mentah panggilan pertama.
      }
    }

    return NextResponse.json(
      reply ?? { ok: true, type: "reply", reply: raw.trim().slice(0, 2000) }
    );
  } finally {
    releaseAiSlot(user.id);
  }
}

/** Konteks JSON dari klien dinormalisasi ulang di server (batas ukuran per field). */
function buildContext(role: string, raw: unknown): string {
  const src = (raw ?? {}) as Record<string, unknown>;

  if (role === "student") {
    const tasks = (Array.isArray(src.tasks) ? src.tasks : []).slice(0, 12).map((t) => {
      const x = t as Record<string, unknown>;
      return {
        title: clip(x.title, 120),
        subject: clip(x.subject, 60) || "Umum",
        dueAt: clip(x.dueAt, 40),
        done: x.done === true,
        grade: typeof x.grade === "number" ? x.grade : null,
      };
    });
    const subjects = (Array.isArray(src.subjects) ? src.subjects : [])
      .slice(0, 16)
      .map((s) => {
        const x = s as Record<string, unknown>;
        return { subject: clip(x.subject, 60), score: Number(x.score) || 0 };
      });
    return JSON.stringify({ tasks, subjects });
  }

  const materials = (Array.isArray(src.materials) ? src.materials : []).slice(0, 10).map((m) => {
    const x = m as Record<string, unknown>;
    return { title: clip(x.title, 120), description: clip(x.description, 240) };
  });
  const tasks = (Array.isArray(src.tasks) ? src.tasks : []).slice(0, 8).map((t) => {
    const x = t as Record<string, unknown>;
    return {
      title: clip(x.title, 120),
      dueAt: clip(x.dueAt, 40),
      submitted: Number(x.submitted) || 0,
      total: Number(x.total) || 0,
    };
  });
  const roster = (Array.isArray(src.roster) ? src.roster : []).slice(0, 40).map((r) => {
    const x = r as Record<string, unknown>;
    return { nama: clip(x.nama, 60), rata: Number(x.rata) || 0 };
  });
  return JSON.stringify({
    className: clip(src.className, 60),
    materials,
    tasks,
    roster,
  });
}

function systemPrompt(role: string, name: string, context: string): string {
  const persona =
    role === "student"
      ? 'Kamu adalah "AI Agent Grafidu", asisten belajar pribadi untuk siswa SMK bernama ' +
        `${name.split(" ")[0]}. Bicaralah sebagai teman belajar yang membangkitkan semangat.`
      : 'Kamu adalah "AI Agent Grafidu", asisten untuk guru pengampu kelas di platform Grafidu. ' +
        "Bicaralah sebagai rekan kerja yang membantu memantau kelas.";

  const aturan =
    role === "student"
      ? [
          "- Pertanyaan tentang nilai, tugas, tenggat, atau mata pelajaran WAJIB dijawab hanya dari DATA di atas. Jangan pernah mengarang nilai, tugas, tanggal, atau nama.",
          "- Kalau data yang dibutuhkan tidak ada di DATA, katakan apa adanya dan sarankan langkah berikutnya.",
          "- Pertanyaan belajar umum (menjelaskan konsep, cara mengerjakan) boleh dijawab dari pengetahuanmu.",
          '- Jika siswa meminta dibuatkan to-do list / rencana berupa daftar kegiatan, balas dengan JSON {"type":"create_todos","items":[{"title":"...","subtitle":"..."}],"reply":"..."} — maksimal 5 item, title singkat (maks 80 huruf), subtitle alasan singkat, dan reply berisi kalimat penjelasan untuk siswa.',
      '- Contoh: siswa minta "buatkan rencana belajar matematika" → {"type":"create_todos","items":[{"title":"Kerjakan 10 soal trigonometri","subtitle":"Latihan mandiri matematika"}],"reply":"Siap! Aku sudah buatkan to-do belajarmu."}',
      '- Contoh: siswa tanya "kapan tenggat tugasku?" → {"type":"reply","text":"Tenggat terdekatmu adalah ..."}',
          '- Selain itu balas dengan JSON {"type":"reply","text":"..."} berisi jawabanmu.',
        ].join("\n")
      : [
          "- Pertanyaan tentang nilai kelas, siswa, tugas, tenggat, atau materi WAJIB dijawab hanya dari DATA di atas. Jangan pernah mengarang angka, nama, atau tanggal.",
          "- Kalau data yang dibutuhkan tidak ada di DATA, katakan apa adanya dan sarankan langkah berikutnya (misal buka Quiz Maker).",
          "- Pertanyaan pedagogis umum boleh dijawab dari pengetahuanmu.",
          '- Jika guru meminta dibuatkan kuis / soal latihan, balas dengan JSON {"type":"create_quiz","title":"judul kuis singkat","topic":"topik kuis","difficulty":"Mudah|Sedang|Sulit","questions":[{"text":"pertanyaan","options":["A","B","C","D"],"answer":0}],"reply":"kalimat penjelasan untuk guru"} — maksimal 10 soal pilihan ganda: setiap soal punya 4 opsi dan "answer" berupa INDEKS opsi jawaban benar (0-3), hanya satu opsi benar, susun dari materi kelas di DATA bila ada.',
          '- Contoh: guru minta "buatkan kuis teks eksposisi" → {"type":"create_quiz","title":"Kuis Teks Eksposisi","topic":"Teks Eksposisi","difficulty":"Sedang","questions":[{"text":"Pengertian teks eksposisi adalah...","options":["Teks yang memaparkan informasi","Teks cerita fiksi","Teks ajakan","Teks puisi"],"answer":0}],"reply":"Siap, kuisnya sudah kusimpan sebagai draft."}',
          '- Selain itu balas dengan JSON {"type":"reply","text":"..."} berisi jawabanmu. Saran lain untuk guru hanya berupa teks, bukan aksi.',
        ].join("\n");

  return (
    `${persona}\n` +
    "Selalu jawab dalam Bahasa Indonesia yang ramah, positif, dan ringkas (maksimal ~150 kata kecuali diminta rinci).\n\n" +
    `DATA TERKINI (JSON, data nyata dari database Grafidu):\n${context.slice(0, MAX_CONTEXT_CHARS)}\n\n` +
    "ATURAN:\n" +
    aturan +
    '\n\nFormat output: SATU objek JSON tanpa teks lain di luar JSON. Gunakan \\n untuk baris baru di dalam string; tanpa markdown.'
  );
}

/** Balasan model → bentuk aman untuk UI; null berarti model tidak ikut format. */
function parseModelReply(role: string, raw: string): ChatSuccess | null {
  const parsed = extractJson<{
    type?: unknown;
    text?: unknown;
    reply?: unknown;
    items?: unknown;
    title?: unknown;
    topic?: unknown;
    difficulty?: unknown;
    questions?: unknown;
  }>(raw);

  if (parsed && typeof parsed === "object") {
    const text = clip(parsed.type === "create_todos" ? parsed.reply : parsed.text, 2000);
    if (role === "student" && parsed.type === "create_todos" && Array.isArray(parsed.items)) {
      const items: TodoDraft[] = (parsed.items as unknown[])
        .slice(0, 5)
        .map((it) => {
          const x = it as Record<string, unknown>;
          return {
            title: clip(x.title, 120),
            subtitle: clip(x.subtitle, 160) || undefined,
          };
        })
        .filter((it) => it.title.length > 0);
      if (items.length) {
        return {
          ok: true,
          type: "create_todos",
          reply:
            text ||
            `Beres! Aku buatkan ${items.length} to-do untukmu — cek halaman To-Do List ya.`,
          items,
        };
      }
    }
    if (role === "teacher" && parsed.type === "create_quiz" && Array.isArray(parsed.questions)) {
      // Soal pilihan ganda: teks + tepat 4 opsi + indeks kunci jawaban 0-3.
      const questions = (parsed.questions as unknown[])
        .map((q) => {
          const x = (q ?? {}) as Record<string, unknown>;
          const text = clip(typeof x.text === "string" ? x.text : "", 300);
          const options = (Array.isArray(x.options) ? x.options : [])
            .map((o) => clip(String(o ?? ""), 160))
            .filter((o) => o.length > 0)
            .slice(0, 4);
          const answer = Math.min(3, Math.max(0, Math.round(Number(x.answer) || 0)));
          return { text, options, answer };
        })
        .filter((q) => q.text.length > 0 && q.options.length === 4)
        .slice(0, MAX_CHAT_QUESTIONS);
      if (questions.length) {
        const title = clip(parsed.title, 120);
        const topic = clip(parsed.topic, 200) || title;
        const difficulty = QUIZ_DIFFICULTIES.includes(clip(parsed.difficulty, 10))
          ? clip(parsed.difficulty, 10)
          : "Sedang";
        return {
          ok: true,
          type: "create_quiz",
          reply:
            clip(parsed.reply, 2000) ||
            `Beres! ${questions.length} soal kusimpan sebagai draft di Quiz Maker.`,
          quiz: {
            title: title || (topic ? `Kuis: ${topic.slice(0, 80)}` : "Kuis dari AI Agent"),
            // Topik kosong diisi klien dengan pesan guru sebagai fallback.
            topic,
            difficulty,
            questions,
          },
        };
      }
    }
    if (text) {
      return { ok: true, type: "reply", reply: text };
    }
  }

  return null;
}
