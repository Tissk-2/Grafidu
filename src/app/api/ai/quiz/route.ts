import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { chatComplete, clip, extractJson } from "@/lib/ai-router";

export const dynamic = "force-dynamic";

/**
 * Generator soal kuis → 9Router lokal. Hanya guru pengampu kelas terkait.
 * Soal dirumuskan dari topik + materi kelas yang benar-benar dibagikan guru
 * (tabel materials) — sesuai janji produk "kuis dari materi guru".
 */

const MAX_TOPIC = 200;
const DIFFICULTIES = ["Mudah", "Sedang", "Sulit"];

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Kamu harus login terlebih dahulu." }, { status: 401 });
  }
  if (user.role !== "teacher") {
    return NextResponse.json({ error: "Hanya guru yang boleh membuat kuis." }, { status: 403 });
  }

  let body: { classId?: unknown; topic?: unknown; num?: unknown; difficulty?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const classId = clip(body.classId, 64);
  const topic = clip(body.topic, MAX_TOPIC);
  const difficulty = DIFFICULTIES.includes(String(body.difficulty))
    ? String(body.difficulty)
    : "Sedang";
  const num = Math.min(20, Math.max(1, Math.round(Number(body.num) || 10)));

  if (!topic) {
    return NextResponse.json({ error: "Topik tidak boleh kosong." }, { status: 400 });
  }
  if (!classId) {
    return NextResponse.json({ error: "Kelas belum dipilih." }, { status: 400 });
  }

  // Guru harus benar-benar mengampu kelas ini (tabel teachings) — pengganti RLS.
  const teaching = await sql<{ id: string }[]>`
    SELECT id FROM public.teachings
    WHERE teacher_id = ${user.id} AND class_id = ${classId}
    LIMIT 1
  `;
  if (!teaching[0]) {
    return NextResponse.json({ error: "Kelas ini bukan amanahmu." }, { status: 403 });
  }

  // Materi kelas yang jadi dasar soal (janji produk: kuis berbasis materi guru).
  const materials = await sql<{ title: string | null; description: string | null }[]>`
    SELECT title, description FROM public.materials
    WHERE class_id = ${classId}
    ORDER BY created_at DESC
    LIMIT 8
  `;
  const materiList = materials
    .map((m) => `- ${clip(m.title, 120)}: ${clip(m.description, 300)}`)
    .filter((m) => m.length > 4);

  const system =
    "Kamu adalah penyusun soal ujian untuk guru SMK di platform Grafidu. " +
    "Buat soal essay berbahasa Indonesia yang jelas, terukur, dan sesuai tingkat kesulitan.\n" +
    (materiList.length
      ? `Materi kelas yang WAJIB dipakai sebagai dasar soal:\n${materiList.join("\n")}\n` +
        "Soal harus menguji pemahaman materi di atas (bukan pengetahuan umum semata).\n"
      : "Belum ada materi yang dibagikan guru untuk kelas ini — susun soal umum yang relevan dengan topik.\n") +
    'Format output: SATU objek JSON tanpa teks lain: {"title":"judul kuis singkat","questions":["soal 1","soal 2",...]} — ' +
    `tepat ${num} soal, setiap soal satu kalimat perintah (maks 200 huruf), tanpa pilihan ganda, tanpa kunci jawaban.`;

  let raw: string;
  try {
    raw = await chatComplete(
      [
        { role: "system", content: system },
        {
          role: "user",
          content: `Buatkan ${num} soal tingkat ${difficulty} tentang: ${topic}`,
        },
      ],
      { maxTokens: 3000 }
    );
  } catch {
    return NextResponse.json(
      { error: "Layanan AI sedang tidak tersedia." },
      { status: 502 }
    );
  }

  const parsed = extractJson<{ title?: unknown; questions?: unknown }>(raw);
  const questions = (Array.isArray(parsed?.questions) ? parsed!.questions : [])
    .map((q) => clip(q, 300))
    .filter((q) => q.length > 0)
    .slice(0, 20);

  if (!questions.length) {
    return NextResponse.json(
      { error: "AI tidak menghasilkan soal yang valid." },
      { status: 502 }
    );
  }

  const title =
    parsed && clip(parsed.title, 120) ? clip(parsed.title, 120) : `Kuis: ${topic.slice(0, 80)}`;

  return NextResponse.json({ ok: true, title, questions, basedOnMaterials: materiList.length });
}
