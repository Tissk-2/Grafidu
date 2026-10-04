"use server";

import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { chatComplete, clip } from "@/lib/ai-router";
import { pill, relativeWhen } from "@/lib/student-model";
import type {
  AnnouncementItem,
  AnnouncementPageItem,
  ClassTeacher,
  QuizPlayData,
  SchoolTask,
  SidebarTask,
  StudentMaterial,
  StudentQuiz,
  SubjectScore,
  TaskDetail,
  TaskStatus,
  TodoItem,
} from "@/lib/student-model";

/**
 * Aksi data untuk area siswa — pengganti lib/supabase/queries.ts.
 * Semua query berjalan di server: identitas diambil dari session cookie
 * (bukan dari argumen client), dan setiap query dibatasi ke data milik
 * siswa itu sendiri. RLS tidak lagi yang menegakkan; scoping ada di SQL.
 */

// Nama kelas → id di-cache 60 detik per proses (sama seperti versi lama).
const classIdCache = new Map<string, { id: string | null; at: number }>();
const CLASS_ID_TTL = 60_000;

async function classIdByName(className: string | null): Promise<string | null> {
  if (!className) return null;
  const hit = classIdCache.get(className);
  if (hit && Date.now() - hit.at < CLASS_ID_TTL) return hit.id;
  const rows = await sql<{ id: string }[]>`
    SELECT id FROM public.classes WHERE name = ${className} LIMIT 1
  `;
  const id = rows[0]?.id ?? null;
  classIdCache.set(className, { id, at: Date.now() });
  return id;
}

/** Tugas sidebar: yang tenggatnya hari ini, fallback 3 tenggat terdekat. */
export async function fetchTasksToday(): Promise<SidebarTask[]> {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    const classId = await classIdByName(user.className);
    if (!classId) return [];

    // tasks + statuses tidak saling bergantung — jangan berurutan.
    const [tasks, statuses] = await Promise.all([
      sql<{ id: string; title: string; subject: string; description: string; due_at: Date }[]>`
        SELECT id, title, subject, description, due_at
        FROM public.tasks
        WHERE class_id = ${classId}
        ORDER BY due_at DESC
      `,
      sql<{ task_id: string; done: boolean }[]>`
        SELECT task_id, done FROM public.task_statuses WHERE student_id = ${user.id}
      `,
    ]);
    if (tasks.length === 0) return [];

    const doneBy = new Map(statuses.map((s) => [s.task_id, s.done]));

    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    const dueToday = tasks.filter((t) => {
      const d = new Date(t.due_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === startToday.getTime();
    });
    const picked = (dueToday.length > 0 ? dueToday : tasks.slice(0, 3)).slice(0, 3);
    return picked.map((t) => ({
      id: t.id,
      title: t.title,
      sub: t.subject || t.description,
      done: doneBy.get(t.id) ?? false,
    }));
  } catch {
    return [];
  }
}

/** Nilai terbaru per mapel + tren, dari tabel grades. */
export async function fetchSubjectScores(): Promise<SubjectScore[]> {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    const rows = await sql<{ subject: string; score: number; grade_date: string }[]>`
      SELECT subject, score, grade_date
      FROM public.grades
      WHERE student_id = ${user.id}
      ORDER BY subject, grade_date, created_at
    `;
    const by = new Map<string, number[]>();
    for (const r of rows) {
      const arr = by.get(r.subject) ?? [];
      arr.push(r.score);
      by.set(r.subject, arr);
    }
    const out: SubjectScore[] = [];
    for (const [subject, scores] of by) {
      const latest = scores[scores.length - 1];
      const trend: 1 | -1 =
        scores.length < 2 || scores[scores.length - 1] >= scores[scores.length - 2] ? 1 : -1;
      out.push({ subject, score: latest, trend, status: pill(latest) });
    }
    out.sort((a, b) => a.subject.localeCompare(b.subject));
    return out;
  } catch {
    return [];
  }
}

// pill & relativeWhen diimpor dari student-model (helper murni bersama client).

/**
 * Scope pengumuman untuk siswa: pengumuman sekolah (class_id NULL) atau
 * yang ditujukan ke kelas siswa itu sendiri. Penulis ikut diambil agar
 * tampil "dari siapa" di UI.
 */
async function scopedAnnouncements(limit: number | null) {
  const user = await getSessionUser();
  if (!user) return [];
  const classId = await classIdByName(user.className);
  const rows = await sql<
    { title: string; body: string; created_at: Date; author: string | null }[]
  >`
    SELECT a.title, a.body, a.created_at, p.name AS author
    FROM public.announcements a
    LEFT JOIN public.profiles p ON p.id = a.created_by
    WHERE a.class_id IS NULL OR a.class_id = ${classId}
    ORDER BY a.created_at DESC
    ${limit ? sql`LIMIT ${limit}` : sql``}
  `;
  return rows;
}

export async function fetchAnnouncements(limit = 3): Promise<AnnouncementItem[]> {
  try {
    const rows = await scopedAnnouncements(limit);
    return rows.map((a, i) => {
      const iso = a.created_at.toISOString();
      return {
        title: a.title,
        body: a.body.length > 120 ? a.body.slice(0, 120) + "..." : a.body,
        when: relativeWhen(iso),
        hl: i === 0,
        author: a.author ?? "Sekolah",
      };
    });
  } catch {
    return [];
  }
}

/** Semua pengumuman ter-scope kelas, plus ISO date untuk filter & sort halaman. */
export async function fetchAllAnnouncements(): Promise<AnnouncementPageItem[]> {
  try {
    const rows = await scopedAnnouncements(null);
    return rows.map((a) => {
      const iso = a.created_at.toISOString();
      return {
        title: a.title,
        body: a.body,
        when: relativeWhen(iso),
        date: iso,
        author: a.author ?? "Sekolah",
      };
    });
  } catch {
    return [];
  }
}

/**
 * Materi terbit untuk kelas siswa — target akhirnya dari materi yang
 * diunggah guru di /teacher/materi (status = published).
 */
export async function fetchStudentMaterials(): Promise<StudentMaterial[]> {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    const classId = await classIdByName(user.className);
    if (!classId) return [];
    const rows = await sql<
      {
        id: string;
        title: string;
        description: string;
        attachments: unknown;
        views: number | null;
        created_at: Date;
        teacher_name: string | null;
      }[]
    >`
      SELECT m.id, m.title, m.description, m.attachments, m.views, m.created_at,
             p.name AS teacher_name
      FROM public.materials m
      LEFT JOIN public.profiles p ON p.id = m.teacher_id
      WHERE m.class_id = ${classId}
        AND m.status = 'published'
      ORDER BY m.created_at DESC
    `;
    return rows.map((m) => ({
      id: m.id,
      title: m.title ?? "",
      description: m.description ?? "",
      attachments: Array.isArray(m.attachments) ? (m.attachments as string[]) : [],
      teacherName: m.teacher_name ?? "Guru",
      views: m.views ?? 0,
      createdAt: m.created_at.toISOString(),
    }));
  } catch {
    return [];
  }
}

/** Tambah satu view saat siswa membuka kartu materi (idempotent per klik). */
export async function markMaterialViewed(id: string): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;
  const classId = await classIdByName(user.className);
  await sql`
    UPDATE public.materials
    SET views = COALESCE(views, 0) + 1
    WHERE id = ${id}
      AND status = 'published'
      AND class_id = ${classId}
  `;
}

export async function fetchTodos(): Promise<TodoItem[]> {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    return await sql<TodoItem[]>`
      SELECT id, title, subtitle, done
      FROM public.todos
      WHERE user_id = ${user.id}
      ORDER BY created_at
    `;
  } catch {
    return [];
  }
}

export async function addTodo(title: string, subtitle?: string): Promise<TodoItem | null> {
  const user = await getSessionUser();
  if (!user) throw new Error("Sesi berakhir. Silakan login ulang.");
  const cleanTitle = title.trim();
  if (!cleanTitle) return null;
  const rows = await sql<TodoItem[]>`
    INSERT INTO public.todos (user_id, title, subtitle, done)
    VALUES (
      ${user.id},
      ${cleanTitle.slice(0, 120)},
      ${(subtitle ?? "").trim().slice(0, 160) || "Kegiatan pribadi"},
      false
    )
    RETURNING id, title, subtitle, done
  `;
  return rows[0] ?? null;
}

export async function toggleTodo(id: string, done: boolean): Promise<void> {
  const user = await getSessionUser();
  if (!user) throw new Error("Sesi berakhir. Silakan login ulang.");
  // user_id di WHERE = kepemilikan ditegakkan di sini (pengganti RLS).
  await sql`
    UPDATE public.todos SET done = ${done}
    WHERE id = ${id} AND user_id = ${user.id}
  `;
}

/** Daftar tugas sekolah untuk kelas siswa + status miliknya. */
export async function fetchSchoolTasks(): Promise<SchoolTask[]> {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    const classId = await classIdByName(user.className);
    if (!classId) return [];

    const [tasks, statuses] = await Promise.all([
      sql<{ id: string; title: string; subject: string; due_at: Date }[]>`
        SELECT id, title, subject, due_at
        FROM public.tasks
        WHERE class_id = ${classId}
        ORDER BY due_at DESC
      `,
      sql<{ task_id: string; done: boolean; grade: number | null }[]>`
        SELECT task_id, done, grade FROM public.task_statuses WHERE student_id = ${user.id}
      `,
    ]);
    const byTask = new Map(statuses.map((s) => [s.task_id, s]));
    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      subject: t.subject,
      dueAt: t.due_at.toISOString(),
      done: byTask.get(t.id)?.done ?? false,
      grade: byTask.get(t.id)?.grade ?? null,
    }));
  } catch {
    return [];
  }
}

export async function fetchTaskDetail(taskId: string): Promise<TaskDetail | null> {
  try {
    const rows = await sql<
      {
        id: string;
        title: string;
        description: string;
        subject: string;
        assigned_at: Date;
        due_at: Date;
        creator_name: string | null;
        material_id: string | null;
        material_title: string | null;
        material_url: string | null;
      }[]
    >`
      SELECT t.id, t.title, t.description, t.subject, t.assigned_at, t.due_at,
             p.name AS creator_name,
             m.id AS material_id, m.title AS material_title, m.attachments[1] AS material_url
      FROM public.tasks t
      LEFT JOIN public.profiles p ON p.id = t.created_by
      LEFT JOIN public.materials m ON m.id = t.material_id
      WHERE t.id = ${taskId}
      LIMIT 1
    `;
    const t = rows[0];
    if (!t) return null;
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      subject: t.subject,
      assignedAt: t.assigned_at.toISOString(),
      dueAt: t.due_at.toISOString(),
      creatorName: t.creator_name ?? "Guru",
      material: t.material_id
        ? {
            id: t.material_id,
            title: t.material_title ?? "Materi",
            url: t.material_url,
          }
        : null,
    };
  } catch {
    return null;
  }
}

export async function fetchTaskStatus(taskId: string): Promise<TaskStatus | null> {
  try {
    const user = await getSessionUser();
    if (!user) return null;
    const rows = await sql<
      { done: boolean; submitted_at: Date | null; grade: number | null; feedback: string; attachment_url: string | null }[]
    >`
      SELECT done, submitted_at, grade, feedback, attachment_url
      FROM public.task_statuses
      WHERE task_id = ${taskId} AND student_id = ${user.id}
      LIMIT 1
    `;
    const s = rows[0];
    if (!s) return null;
    return {
      done: s.done,
      submittedAt: s.submitted_at ? s.submitted_at.toISOString() : null,
      grade: s.grade,
      feedback: s.feedback,
      attachmentUrl: s.attachment_url,
    };
  } catch {
    return null;
  }
}

export async function submitTask(
  taskId: string,
  answer = "",
  attachmentUrl: string | null = null,
): Promise<void> {
  const user = await getSessionUser();
  if (!user) throw new Error("Sesi berakhir. Silakan login ulang.");

  // Tugas harus milik kelas siswa ini (kepemilikan ditegakkan di sini).
  const allowed = await sql<{ id: string }[]>`
    SELECT t.id
    FROM public.tasks t
    JOIN public.classes c ON c.id = t.class_id
    WHERE t.id = ${taskId} AND c.name = ${user.className}
    LIMIT 1
  `;
  if (!allowed[0]) throw new Error("Tugas tidak ditemukan di kelasmu.");

  await sql`
    INSERT INTO public.task_statuses (task_id, student_id, done, submitted_at, answer, attachment_url)
    VALUES (${taskId}, ${user.id}, true, now(), ${answer.slice(0, 4000)}, ${attachmentUrl})
    ON CONFLICT (task_id, student_id)
    DO UPDATE SET done = true, submitted_at = EXCLUDED.submitted_at,
                  answer = EXCLUDED.answer, attachment_url = EXCLUDED.attachment_url
  `;
}

/** Daftar guru pengajar kelas siswa (nama kelas dari database). */
export async function fetchClassTeachers(): Promise<ClassTeacher[]> {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    const classId = await classIdByName(user.className);
    if (!classId) return [];

    const rows = await sql<
      { subject: string; teacher_name: string | null; avatar: string | null }[]
    >`
      SELECT te.subject, p.name AS teacher_name, p.avatar
      FROM public.teachings te
      LEFT JOIN public.profiles p ON p.id = te.teacher_id
      WHERE te.class_id = ${classId}
    `;
    const out: ClassTeacher[] = rows.map((r) => ({
      teacher: r.teacher_name ?? "Guru",
      subject: r.subject || "Umum",
      avatar: r.avatar || "/assets/defaultpfp.jpg",
    }));
    out.sort((a, b) => a.subject.localeCompare(b.subject));
    return out;
  } catch {
    return [];
  }
}

// Rekomendasi AI di rightbar. Di-cache 15 menit per user agar router tidak
// dipanggil setiap muat halaman; router gagal → null, UI memakai fallback.
const aiNoteCache = new Map<string, { note: string; at: number }>();
const AI_NOTE_TTL = 15 * 60_000;

export async function fetchAiNote(): Promise<string | null> {
  try {
    const user = await getSessionUser();
    if (!user) return null;
    const key = `student:${user.id}`;
    const hit = aiNoteCache.get(key);
    if (hit && Date.now() - hit.at < AI_NOTE_TTL) return hit.note;

    const [scores, tasks] = await Promise.all([fetchSubjectScores(), fetchTasksToday()]);
    if (scores.length === 0) return null;

    const raw = await chatComplete(
      [
        {
          role: "system",
          content:
            "Kamu adalah AI Agent Grafidu, asisten belajar siswa SMK. Berdasarkan DATA nilai dan tugas berikut, tulis SATU kalimat rekomendasi belajar (maksimal 25 kata) dalam Bahasa Indonesia yang ramah dan memotivasi. Sebut mapel atau tugas secara spesifik bila relevan. Jawab HANYA kalimat rekomendasinya — tanpa sapaan, tanpa format, tanpa tanda kutip.",
        },
        {
          role: "user",
          content:
            "DATA:\n" +
            JSON.stringify({
              subjects: scores.map((s) => ({ subject: s.subject, score: s.score })),
              tasks: tasks.map((t) => ({ title: t.title, mapel: t.sub, done: t.done })),
            }),
        },
      ],
      { maxTokens: 120 }
    );
    const note = clip(raw, 220).replace(/^["']+|["']+$/g, "");
    if (!note) return null;
    aiNoteCache.set(key, { note, at: Date.now() });
    if (aiNoteCache.size > 200) {
      const oldest = aiNoteCache.keys().next().value;
      if (oldest !== undefined) aiNoteCache.delete(oldest);
    }
    return note;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Kuis siswa (#6): daftar kuis tayang kelasnya, pemain, dan penilaian otomatis.
// ---------------------------------------------------------------------------

/** Kuis tayang untuk kelas siswa + status percobaannya (satu per siswa). */
export async function fetchStudentQuizzes(): Promise<StudentQuiz[]> {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    const classId = await classIdByName(user.className);
    if (!classId) return [];
    const rows = await sql<
      {
        id: string;
        title: string;
        topic: string;
        subject: string;
        difficulty: string | null;
        num_questions: number | null;
        duration_min: number | null;
        created_at: Date;
        attempt_score: number | null;
        attempt_at: Date | null;
      }[]
    >`
      SELECT q.id, q.title, q.topic, q.subject, q.difficulty, q.num_questions,
             q.duration_min, q.created_at,
             qa.score AS attempt_score, qa.submitted_at AS attempt_at
      FROM public.quizzes q
      LEFT JOIN public.quiz_attempts qa
        ON qa.quiz_id = q.id AND qa.student_id = ${user.id}
      WHERE q.class_id = ${classId}
        AND q.status = 'published'
      ORDER BY q.created_at DESC
    `;
    return rows.map((q) => ({
      id: q.id,
      title: q.title ?? "",
      topic: q.topic ?? "",
      subject: q.subject || "Umum",
      difficulty: q.difficulty ?? "Sedang",
      numQuestions: q.num_questions ?? 0,
      durationMin: q.duration_min ?? 20,
      createdAt: q.created_at.toISOString(),
      attempt:
        q.attempt_score != null && q.attempt_at
          ? { score: q.attempt_score, submittedAt: q.attempt_at.toISOString() }
          : null,
    }));
  } catch {
    return [];
  }
}

/** Data pemain kuis: meta + soal TANPA kunci jawaban; kalau sudah dikerjakan,
 *  kembalikan hasil lengkap (review kunci jawaban) dan blok pengerjaan ulang. */
export async function fetchQuizPlay(quizId: string): Promise<QuizPlayData | null> {
  try {
    const user = await getSessionUser();
    if (!user) return null;
    const classId = await classIdByName(user.className);

    const quizzes = await sql<
      {
        id: string;
        title: string;
        topic: string;
        subject: string;
        difficulty: string | null;
        duration_min: number | null;
        class_id: string;
        teacher_name: string | null;
      }[]
    >`
      SELECT q.id, q.title, q.topic, q.subject, q.difficulty, q.duration_min,
             q.class_id, p.name AS teacher_name
      FROM public.quizzes q
      LEFT JOIN public.profiles p ON p.id = q.created_by
      WHERE q.id = ${quizId}
        AND q.status = 'published'
      LIMIT 1
    `;
    const q = quizzes[0];
    if (!q || q.class_id !== classId) return null;

    const [questionRows, attempts] = await Promise.all([
      sql<{ text: string; options: unknown }[]>`
        SELECT text, options
        FROM public.quiz_questions
        WHERE quiz_id = ${quizId}
        ORDER BY idx ASC
      `,
      sql<{ score: number; submitted_at: Date; answers: unknown }[]>`
        SELECT score, submitted_at, answers
        FROM public.quiz_attempts
        WHERE quiz_id = ${quizId} AND student_id = ${user.id}
        LIMIT 1
      `,
    ]);

    const questions = questionRows.map((r) => ({
      text: r.text,
      options: Array.isArray(r.options) ? (r.options as string[]) : [],
    }));

    const attemptRow = attempts[0];
    if (attemptRow) {
      // Sudah dikerjakan: ambil kunci jawaban untuk review.
      const keys = await sql<{ idx: number; text: string; options: unknown; answer_idx: number | null }[]>`
        SELECT idx, text, options, answer_idx
        FROM public.quiz_questions
        WHERE quiz_id = ${quizId}
        ORDER BY idx ASC
      `;
      const rawAnswers = Array.isArray(attemptRow.answers)
        ? (attemptRow.answers as (number | null)[])
        : [];
      const review = keys.map((k, i) => ({
        text: k.text,
        options: Array.isArray(k.options) ? (k.options as string[]) : [],
        chosen: rawAnswers[i] ?? null,
        answerIdx: k.answer_idx ?? 0,
      }));
      return {
        id: q.id,
        title: q.title,
        topic: q.topic,
        subject: q.subject || "Umum",
        difficulty: q.difficulty ?? "Sedang",
        durationMin: q.duration_min ?? 20,
        teacherName: q.teacher_name ?? "Guru",
        questions,
        attempt: {
          score: attemptRow.score,
          submittedAt: attemptRow.submitted_at.toISOString(),
          answers: questions.map((_, i) => rawAnswers[i] ?? null),
          review,
        },
      };
    }

    return {
      id: q.id,
      title: q.title,
      topic: q.topic,
      subject: q.subject || "Umum",
      difficulty: q.difficulty ?? "Sedang",
      durationMin: q.duration_min ?? 20,
      teacherName: q.teacher_name ?? "Guru",
      questions,
      attempt: null,
    };
  } catch {
    return null;
  }
}

export type QuizSubmitResult = {
  score: number;
  correct: number;
  total: number;
  review: {
    text: string;
    options: string[];
    chosen: number | null;
    answerIdx: number;
  }[];
};

/** Kumpulkan jawaban kuis: dinilai di server (kunci tak pernah ke klien),
 *  disimpan ke quiz_attempts, dan masuk ke tabel grades untuk halaman Grades. */
export async function submitQuizAttempt(
  quizId: string,
  answers: (number | null)[],
): Promise<QuizSubmitResult> {
  const user = await getSessionUser();
  if (!user) throw new Error("Sesi berakhir. Silakan login ulang.");
  const classId = await classIdByName(user.className);

  const quizzes = await sql<
    { id: string; class_id: string; subject: string; title: string }[]
  >`
    SELECT id, class_id, subject, title
    FROM public.quizzes
    WHERE id = ${quizId} AND status = 'published'
    LIMIT 1
  `;
  const quiz = quizzes[0];
  if (!quiz) throw new Error("Kuis tidak ditemukan atau belum tayang.");
  if (quiz.class_id !== classId) throw new Error("Kuis ini bukan untuk kelasmu.");

  const keys = await sql<{ idx: number; answer_idx: number | null }[]>`
    SELECT idx, answer_idx FROM public.quiz_questions
    WHERE quiz_id = ${quizId}
    ORDER BY idx ASC
  `;
  if (keys.length === 0) throw new Error("Kuis belum punya soal.");

  const already = await sql<{ id: string }[]>`
    SELECT id FROM public.quiz_attempts
    WHERE quiz_id = ${quizId} AND student_id = ${user.id}
    LIMIT 1
  `;
  if (already[0]) throw new Error("Kamu sudah mengerjakan kuis ini.");

  const clean = keys.map((_, i) => {
    const v = answers[i];
    return typeof v === "number" && Number.isInteger(v) && v >= 0 ? v : null;
  });
  const correct = keys.reduce(
    (acc, k, i) => acc + (k.answer_idx != null && clean[i] === k.answer_idx ? 1 : 0),
    0,
  );
  const score = Math.round((correct / keys.length) * 100);

  await sql.begin(async (tx) => {
    await tx`
      INSERT INTO public.quiz_attempts (quiz_id, student_id, answers, score)
      VALUES (${quizId}, ${user.id}, ${JSON.stringify(clean)}, ${score})
    `;
    // Nilai kuis ikut tabel grades (task_id NULL) — muncul di rata-rata mapel
    // siswa dan matriks nilai guru pembuat kuis.
    await tx`
      INSERT INTO public.grades (class_id, task_id, student_id, subject, kind, score, created_by)
      VALUES (${quiz.class_id}, NULL, ${user.id}, ${quiz.subject || "Umum"}, 'Kuis', ${score},
              (SELECT created_by FROM public.quizzes WHERE id = ${quizId}))
    `;
  });

  // Kunci jawaban untuk layar review — dikirim HANYA setelah pengumpulan.
  const keyRows = await sql<{ idx: number; text: string; options: unknown; answer_idx: number | null }[]>`
    SELECT idx, text, options, answer_idx
    FROM public.quiz_questions
    WHERE quiz_id = ${quizId}
    ORDER BY idx ASC
  `;
  return {
    score,
    correct,
    total: keys.length,
    review: keyRows.map((k, i) => ({
      text: k.text,
      options: Array.isArray(k.options) ? (k.options as string[]) : [],
      chosen: clean[i] ?? null,
      answerIdx: k.answer_idx ?? 0,
    })),
  };
}
