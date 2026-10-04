"use server";

import { sql } from "@/lib/db";
import { getSessionUser, type SessionUser } from "@/lib/session";
import { chatComplete, clip } from "@/lib/ai-router";
import { relativeWhen, type TeacherAnnouncement } from "@/lib/student-model";
import type {
  MaterialRow,
  QuizQuestion,
  QuizRow,
  RosterRow,
  SubmissionRow,
  TaskDetail,
  TaskInput,
  TeacherClass,
  TeacherTask,
} from "@/lib/teacher-model";

/**
 * Aksi data area guru — pengganti lib/supabase/teacher-queries.ts.
 * Identitas dari session; setiap aksi berbasis kelas memverifikasi bahwa
 * guru benar-benar mengampu kelas itu (tabel teachings) — pengganti RLS.
 */

async function requireTeacher(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Sesi berakhir. Silakan login ulang.");
  if (user.role !== "teacher") {
    throw new Error("Hanya guru yang boleh melakukan aksi ini.");
  }
  return user;
}

/** Kelas harus jadi amanah guru (teachings) — else throw. */
async function requireTeaching(user: SessionUser, classId: string): Promise<void> {
  const rows = await sql<{ id: string }[]>`
    SELECT id FROM public.teachings
    WHERE teacher_id = ${user.id} AND class_id = ${classId}
    LIMIT 1
  `;
  if (!rows[0]) throw new Error("Kelas ini bukan amanahmu.");
}

/** Kelas yang diampu seorang guru (dari teachings + classes). */
export async function fetchTeacherClasses(): Promise<TeacherClass[]> {
  try {
    const user = await requireTeacher();
    const rows = await sql<
      { class_id: string; kkm: number | null; subject: string; name: string | null }[]
    >`
      SELECT t.class_id, t.kkm, t.subject, c.name
      FROM public.teachings t
      LEFT JOIN public.classes c ON c.id = t.class_id
      WHERE t.teacher_id = ${user.id}
    `;
    return rows
      .map((r) => ({
        id: r.class_id,
        name: r.name ?? "Kelas",
        kkm: r.kkm ?? 80,
        subject: r.subject || "Umum",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

/** Tugas satu kelas + rekap pengumpulan/penilaian dari task_statuses.
 *  Hanya tugas buatan guru itu sendiri — guru baru yang di-assign ke kelas
 *  berisi materi/tugas demo tetap mulai dari nol. */
export async function fetchClassTasks(classId: string): Promise<TeacherTask[]> {
  try {
    const user = await requireTeacher();
    await requireTeaching(user, classId);
    const [tasks, aggs, totals] = await Promise.all([
      sql<
        {
          id: string;
          title: string;
          subject: string;
          description: string;
          assigned_at: Date;
          due_at: Date;
          is_completed: boolean;
        }[]
      >`
        SELECT id, title, subject, description, assigned_at, due_at, is_completed
        FROM public.tasks
        WHERE class_id = ${classId}
          AND created_by = ${user.id}
        ORDER BY position ASC
      `,
      sql<{ task_id: string; done_count: number; graded_count: number }[]>`
        SELECT ts.task_id,
          count(*) FILTER (WHERE ts.done)::int AS done_count,
          count(*) FILTER (WHERE ts.grade IS NOT NULL)::int AS graded_count
        FROM public.task_statuses ts
        WHERE ts.task_id IN (
          SELECT id FROM public.tasks
          WHERE class_id = ${classId} AND created_by = ${user.id}
        )
        GROUP BY ts.task_id
      `,
      sql<{ count: number }[]>`
        SELECT count(*)::int AS count FROM public.enrollments WHERE class_id = ${classId}
      `,
    ]);
    const byTask = new Map(aggs.map((a) => [a.task_id, a]));
    const totalStudents = totals[0]?.count ?? 0;
    return tasks.map((t) => {
      const agg = byTask.get(t.id);
      return {
        id: t.id,
        title: t.title,
        subject: t.subject || "Umum",
        description: t.description,
        assignedAt: t.assigned_at.toISOString(),
        dueAt: t.due_at.toISOString(),
        isCompleted: t.is_completed,
        total: totalStudents,
        submitted: agg?.done_count ?? 0,
        graded: agg?.graded_count ?? 0,
      };
    });
  } catch {
    return [];
  }
}

/** Siswa satu kelas + rata-rata nilai (hanya nilai dari tugas/kuis guru itu).
 *  Guru baru melihat roster kelas tanpa "mewarisi" nilai demo guru lain. */
export async function fetchClassRoster(classId: string, kkm: number): Promise<RosterRow[]> {
  try {
    const user = await requireTeacher();
    await requireTeaching(user, classId);
    const rows = await sql<
      {
        id: string;
        name: string | null;
        avatar: string | null;
        grade_count: number;
        avg: number | null;
      }[]
    >`
      SELECT p.id, p.name, p.avatar,
        count(g.score)::int AS grade_count,
        avg(g.score)::float8 AS avg
      FROM public.enrollments e
      JOIN public.profiles p ON p.id = e.student_id
      LEFT JOIN public.grades g ON g.student_id = e.student_id AND g.class_id = e.class_id
        AND (g.created_by = ${user.id} OR g.task_id IN (
          SELECT id FROM public.tasks WHERE created_by = ${user.id}
        ))
      WHERE e.class_id = ${classId}
      GROUP BY p.id, p.name, p.avatar
    `;
    return rows
      .map((r) => {
        const count = r.grade_count ?? 0;
        const avg = count > 0 ? Math.round(r.avg ?? 0) : 0;
        return {
          id: r.id,
          name: r.name ?? "Siswa",
          avatar: r.avatar || "/assets/defaultpfp.jpg",
          gradeCount: count,
          avg,
          tuntas: count > 0 && avg >= kkm,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export async function fetchClassMaterials(classId: string): Promise<MaterialRow[]> {
  try {
    const user = await requireTeacher();
    await requireTeaching(user, classId);
    const rows = await sql<
      {
        id: string;
        title: string;
        description: string;
        attachments: unknown;
        status: string | null;
        views: number | null;
        created_at: Date;
      }[]
    >`
      SELECT id, title, description, attachments, status, views, created_at
      FROM public.materials
      WHERE class_id = ${classId}
        AND teacher_id = ${user.id}
      ORDER BY created_at DESC
    `;
    return rows.map((m) => ({
      id: m.id,
      title: m.title ?? "",
      description: m.description ?? "",
      attachments: Array.isArray(m.attachments) ? (m.attachments as string[]) : [],
      status: m.status ?? "draft",
      views: m.views ?? 0,
      createdAt: m.created_at.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function createMaterial(input: {
  classId: string;
  title: string;
  description: string;
  attachments: string[];
  status: string;
}): Promise<void> {
  const user = await requireTeacher();
  await requireTeaching(user, input.classId);
  // position unik per kelas (materials_class_id_position_key) — ambil MAX+1.
  await sql`
    INSERT INTO public.materials
      (class_id, teacher_id, title, description, attachments, status, pages, position)
    VALUES
      (${input.classId}, ${user.id}, ${input.title}, ${input.description},
       ${input.attachments}, ${input.status}, 0,
       (SELECT COALESCE(MAX("position"), 0) + 1 FROM public.materials WHERE class_id = ${input.classId}))
  `;
}

export async function updateMaterial(
  id: string,
  patch: { title: string; description: string; attachments: string[]; status: string },
): Promise<void> {
  const user = await requireTeacher();
  // Hanya pemilik materi yang boleh mengubah/menghapus.
  await sql`
    UPDATE public.materials SET
      title = ${patch.title},
      description = ${patch.description},
      attachments = ${patch.attachments},
      status = ${patch.status}
    WHERE id = ${id}
      AND teacher_id = ${user.id}
  `;
}

export async function deleteMaterial(id: string): Promise<void> {
  const user = await requireTeacher();
  await sql`
    DELETE FROM public.materials
    WHERE id = ${id}
      AND teacher_id = ${user.id}
  `;
}

/** Satu tugas berdasarkan id (uuid) untuk halaman detail. */
export async function fetchTask(taskId: string): Promise<TaskDetail | null> {
  try {
    const user = await requireTeacher();
    const rows = await sql<
      {
        id: string;
        title: string;
        description: string;
        subject: string;
        assigned_at: Date;
        due_at: Date;
        is_completed: boolean;
        material_id: string | null;
        material_title: string | null;
        material_url: string | null;
      }[]
    >`
      SELECT t.id, t.title, t.description, t.subject, t.assigned_at, t.due_at, t.is_completed,
             m.id AS material_id, m.title AS material_title, m.attachments[1] AS material_url
      FROM public.tasks t
      LEFT JOIN public.materials m ON m.id = t.material_id
      WHERE t.id = ${taskId}
        AND t.created_by = ${user.id}
        AND t.class_id IN (SELECT class_id FROM public.teachings WHERE teacher_id = ${user.id})
      LIMIT 1
    `;
    const t = rows[0];
    if (!t) return null;
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      subject: t.subject || "Umum",
      assignedAt: t.assigned_at.toISOString(),
      dueAt: t.due_at.toISOString(),
      isCompleted: t.is_completed,
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

/**
 * Seluruh siswa kelas + status pengumpulan satu tugas (bukan hanya yang
 * sudah mengumpulkan). Default setiap siswa: belum mengumpulkan, tanpa
 * nilai — baris task_statuses memang tercipta saat siswa mengumpulkan,
 * jadi siswa tanpa baris tetap muncul sebagai "belum".
 */
export async function fetchTaskSubmissions(taskId: string): Promise<SubmissionRow[]> {
  try {
    const user = await requireTeacher();
    const rows = await sql<
      {
        id: string | null;
        student_id: string;
        done: boolean;
        submitted_at: Date | null;
        grade: number | null;
        feedback: string;
        answer: string;
        attachment_url: string | null;
        name: string | null;
        avatar: string | null;
      }[]
    >`
      SELECT ts.id, ts.done, ts.submitted_at, ts.grade, ts.feedback,
             ts.answer, ts.attachment_url,
             e.student_id, p.name, p.avatar
      FROM public.tasks t
      JOIN public.enrollments e ON e.class_id = t.class_id
      LEFT JOIN public.task_statuses ts
        ON ts.task_id = t.id AND ts.student_id = e.student_id
      LEFT JOIN public.profiles p ON p.id = e.student_id
      WHERE t.id = ${taskId}
        AND t.created_by = ${user.id}
        AND t.class_id IN (SELECT class_id FROM public.teachings WHERE teacher_id = ${user.id})
    `;
    return rows
      .map((s) => ({
        id: s.id,
        studentId: s.student_id,
        name: s.name ?? "Siswa",
        avatar: s.avatar || "/assets/defaultpfp.jpg",
        done: s.done ?? false,
        submittedAt: s.submitted_at ? s.submitted_at.toISOString() : null,
        grade: s.grade,
        feedback: s.feedback ?? "",
        answer: s.answer ?? "",
        attachmentUrl: s.attachment_url,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

/** Simpan nilai + umpan balik ke task_statuses, lalu sinkron ke tabel grades.
 *  Nilai baru juga ditandai created_by agar muncul di matriks nilai guru ini. */
export async function saveGrade(
  submissionId: string,
  score: number,
  feedback: string,
): Promise<void> {
  const user = await requireTeacher();

  // Konteks submission + otorisasi: tugas harus milik guru ini.
  const rows = await sql<
    { task_id: string; student_id: string; class_id: string; subject: string }[]
  >`
    SELECT ts.task_id, ts.student_id, t.class_id, t.subject
    FROM public.task_statuses ts
    JOIN public.tasks t ON t.id = ts.task_id
    WHERE ts.id = ${submissionId}
      AND t.created_by = ${user.id}
      AND t.class_id IN (SELECT class_id FROM public.teachings WHERE teacher_id = ${user.id})
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) throw new Error("Pengumpulan tidak ditemukan di amanahmu.");

  await sql`
    UPDATE public.task_statuses
    SET grade = ${score}, feedback = ${feedback}
    WHERE id = ${submissionId}
  `;

  // Satu sumber kebenaran: nilai tugas ikut tercatat di tabel grades agar
  // rata-rata per mapel (dashboard siswa & guru) dan matriks nilai tetap
  // sinkron dengan penilaian tugas.
  await sql`
    INSERT INTO public.grades (class_id, task_id, student_id, subject, kind, score, created_by)
    VALUES (${row.class_id}, ${row.task_id}, ${row.student_id}, ${row.subject}, 'Tugas', ${score}, ${user.id})
    ON CONFLICT (task_id, student_id)
    DO UPDATE SET score = EXCLUDED.score, created_by = EXCLUDED.created_by
  `;
}

const fmtDue = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export async function createTask(classId: string, input: TaskInput): Promise<void> {
  const user = await requireTeacher();
  await requireTeaching(user, classId);
  await sql.begin(async (tx) => {
    // position unik per kelas (tasks_class_id_position_key) — MAX+1, bukan 0.
    const inserted = await tx<{ id: string }[]>`
      INSERT INTO public.tasks
        (class_id, created_by, title, description, subject, due_at, is_completed, material_id, position)
      VALUES
        (${classId}, ${user.id}, ${input.title}, ${input.description},
         ${input.subject}, ${input.dueAt}, false, ${input.materialId ?? null},
         (SELECT COALESCE(MAX("position"), 0) + 1 FROM public.tasks WHERE class_id = ${classId}))
      RETURNING id
    `;
    // Setiap tugas baru otomatis jadi pengumuman kelas (#5) — siswa tahu
    // ada tugas baru tanpa harus membuka halaman Tasks.
    await tx`
      INSERT INTO public.announcements (title, body, class_id, created_by)
      VALUES (
        ${`Tugas Baru: ${input.title}`},
        ${[
          input.description.trim() || "Kerjakan tugas ini sesuai petunjuk di halaman detail.",
          "",
          `Tenggat: ${fmtDue(input.dueAt)} — kumpulkan lewat halaman Tasks.`,
        ].join("\n")},
        ${classId},
        ${user.id}
      )
    `;
    return inserted;
  });
}

export async function updateTask(id: string, input: TaskInput): Promise<void> {
  const user = await requireTeacher();
  await sql`
    UPDATE public.tasks SET
      title = ${input.title},
      description = ${input.description},
      subject = ${input.subject},
      due_at = ${input.dueAt},
      material_id = ${input.materialId ?? null}
    WHERE id = ${id}
      AND created_by = ${user.id}
  `;
}

export async function deleteTask(id: string): Promise<void> {
  const user = await requireTeacher();
  // task_statuses tercascade di database; quiz_questions tidak berelasi ke tasks.
  await sql`
    DELETE FROM public.tasks
    WHERE id = ${id}
      AND created_by = ${user.id}
  `;
}

export async function fetchClassQuizzes(classId: string): Promise<QuizRow[]> {
  try {
    const user = await requireTeacher();
    await requireTeaching(user, classId);
    const [quizzes, questions] = await Promise.all([
      sql<
        {
          id: string;
          title: string;
          topic: string;
          subject: string;
          difficulty: string | null;
          num_questions: number | null;
          duration_min: number | null;
          status: string | null;
          created_at: Date;
          attempts: number;
        }[]
      >`
        SELECT q.id, q.title, q.topic, q.subject, q.difficulty, q.num_questions,
               q.duration_min, q.status, q.created_at,
               (SELECT count(*)::int FROM public.quiz_attempts qa WHERE qa.quiz_id = q.id) AS attempts
        FROM public.quizzes q
        WHERE q.class_id = ${classId}
          AND q.created_by = ${user.id}
        ORDER BY q.created_at DESC
      `,
      sql<{ quiz_id: string; idx: number; text: string; options: unknown; answer_idx: number | null }[]>`
        SELECT qq.quiz_id, qq.idx, qq.text, qq.options, qq.answer_idx
        FROM public.quiz_questions qq
        WHERE qq.quiz_id IN (
          SELECT id FROM public.quizzes
          WHERE class_id = ${classId} AND created_by = ${user.id}
        )
        ORDER BY qq.idx ASC
      `,
    ]);
    const byQuiz = new Map<string, QuizQuestion[]>();
    for (const q of questions) {
      const arr = byQuiz.get(q.quiz_id) ?? [];
      arr[q.idx - 1] = {
        text: q.text,
        options: Array.isArray(q.options) ? (q.options as string[]) : [],
        answerIdx: q.answer_idx ?? 0,
      };
      byQuiz.set(q.quiz_id, arr);
    }
    return quizzes.map((q) => ({
      id: q.id,
      title: q.title ?? "",
      topic: q.topic ?? "",
      subject: q.subject || "Umum",
      difficulty: q.difficulty ?? "Sedang",
      numQuestions: q.num_questions ?? 0,
      durationMin: q.duration_min ?? 20,
      status: q.status ?? "draft",
      createdAt: q.created_at.toISOString(),
      questions: byQuiz.get(q.id) ?? [],
      attempts: q.attempts ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function createQuiz(input: {
  classId: string;
  title: string;
  topic: string;
  subject: string;
  difficulty: string;
  durationMin: number;
  questions: QuizQuestion[];
}): Promise<void> {
  const user = await requireTeacher();
  await requireTeaching(user, input.classId);
  if (input.questions.length === 0) throw new Error("Kuis butuh minimal satu soal.");
  await sql.begin(async (tx) => {
    const inserted = await tx<{ id: string }[]>`
      INSERT INTO public.quizzes
        (class_id, created_by, title, topic, subject, difficulty, num_questions, duration_min, status)
      VALUES
        (${input.classId}, ${user.id}, ${input.title}, ${input.topic}, ${input.subject},
         ${input.difficulty}, ${input.questions.length}, ${input.durationMin}, 'draft')
      RETURNING id
    `;
    const quizId = inserted[0].id;
    for (let i = 0; i < input.questions.length; i++) {
      const q = input.questions[i];
      await tx`
        INSERT INTO public.quiz_questions (quiz_id, idx, text, options, answer_idx)
        VALUES (${quizId}, ${i + 1}, ${q.text}, ${JSON.stringify(q.options)}, ${q.answerIdx})
      `;
    }
  });
}

/** Tayangkan/hapus kuis. Menayangkan draft sekali → jadi pengumuman kelas (#5). */
export async function setQuizStatus(id: string, status: string): Promise<void> {
  const user = await requireTeacher();
  if (status !== "draft" && status !== "published") {
    throw new Error("Status kuis tidak valid.");
  }
  // WHERE status <> ${status}: hanya transisi nyata (draft → published atau
  // sebaliknya) yang mengembalikan baris, jadi pengumuman tak dobel.
  const rows = await sql<
    { class_id: string; title: string; topic: string; num_questions: number; duration_min: number }[]
  >`
    UPDATE public.quizzes SET status = ${status}
    WHERE id = ${id}
      AND created_by = ${user.id}
      AND class_id IN (SELECT class_id FROM public.teachings WHERE teacher_id = ${user.id})
      AND status <> ${status}
    RETURNING class_id, title, topic, num_questions, duration_min
  `;
  const q = rows[0];
  if (status === "published" && q) {
    await sql`
      INSERT INTO public.announcements (title, body, class_id, created_by)
      VALUES (
        ${`Kuis Baru: ${q.title}`},
        ${[
          `Kuis ${q.num_questions} soal (${q.duration_min} menit) tentang ${q.topic || q.title} sudah tayang.`,
          "",
          "Buka menu Kuis di halaman siswa untuk mengerjakan sebelum waktu habis.",
        ].join("\n")},
        ${q.class_id},
        ${user.id}
      )
    `;
  }
}

export async function deleteQuiz(id: string): Promise<void> {
  const user = await requireTeacher();
  // quiz_questions & quiz_attempts cascade dari quizzes — hapus miliknya saja.
  await sql`
    DELETE FROM public.quizzes
    WHERE id = ${id}
      AND created_by = ${user.id}
  `;
}

/** Pengumuman ter-scoped kelas (class_id terisi). */
export async function createClassAnnouncement(
  classId: string,
  title: string,
  body: string,
): Promise<void> {
  const user = await requireTeacher();
  await requireTeaching(user, classId);
  await sql`
    INSERT INTO public.announcements (title, body, class_id, created_by)
    VALUES (${title}, ${body}, ${classId}, ${user.id})
  `;
}

/**
 * Daftar pengumuman untuk guru: sekolah-wide + yang ditujukan ke kelas yang
 * dia ampu. `mine` menandai postingan yang bisa dia hapus.
 */
export async function fetchTeacherAnnouncements(): Promise<TeacherAnnouncement[]> {
  try {
    const user = await requireTeacher();
    const rows = await sql<
      {
        id: string;
        title: string;
        body: string;
        created_at: Date;
        class_name: string | null;
        author: string | null;
        mine: boolean;
      }[]
    >`
      SELECT a.id, a.title, a.body, a.created_at, c.name AS class_name,
             p.name AS author, (a.created_by = ${user.id}) AS mine
      FROM public.announcements a
      LEFT JOIN public.classes c ON c.id = a.class_id
      LEFT JOIN public.profiles p ON p.id = a.created_by
      WHERE a.class_id IS NULL
         OR a.class_id IN (SELECT class_id FROM public.teachings WHERE teacher_id = ${user.id})
      ORDER BY a.created_at DESC
    `;
    return rows.map((a) => {
      const iso = a.created_at.toISOString();
      return {
        id: a.id,
        title: a.title,
        body: a.body,
        when: relativeWhen(iso),
        date: iso,
        className: a.class_name,
        mine: a.mine,
        author: a.author ?? "Sekolah",
      };
    });
  } catch {
    return [];
  }
}

export async function deleteClassAnnouncement(id: string): Promise<void> {
  const user = await requireTeacher();
  await sql`
    DELETE FROM public.announcements
    WHERE id = ${id}
      AND class_id IN (SELECT class_id FROM public.teachings WHERE teacher_id = ${user.id})
  `;
}

/** Kelas baru + otomatis di-assign ke guru pembuat. */
export async function createTeacherClass(name: string, subject: string): Promise<void> {
  const user = await requireTeacher();
  await sql.begin(async (tx) => {
    const inserted = await tx<{ id: string }[]>`
      INSERT INTO public.classes (name) VALUES (${name}) RETURNING id
    `;
    await tx`
      INSERT INTO public.teachings (class_id, teacher_id, subject, kkm)
      VALUES (${inserted[0].id}, ${user.id}, ${subject}, 80)
    `;
  });
}

/** Jumlah siswa per kelas yang diampu guru — untuk kartu kelas di sidebar. */
export async function fetchClassTotals(): Promise<Record<string, number>> {
  try {
    const user = await requireTeacher();
    const rows = await sql<{ class_id: string; total: number }[]>`
      SELECT e.class_id, count(*)::int AS total
      FROM public.enrollments e
      WHERE e.class_id IN (SELECT class_id FROM public.teachings WHERE teacher_id = ${user.id})
      GROUP BY e.class_id
    `;
    const totals: Record<string, number> = {};
    for (const r of rows) totals[r.class_id] = r.total;
    return totals;
  } catch {
    return {};
  }
}

/**
 * Sel nilai untuk buku nilai (tabel grades guru): satu entri per
 * (siswa, tugas) dari nilai penilaian tugas, plus nilai UTS/UAS per siswa.
 * Hanya nilai milik guru ini (guru baru = kosong); kuis tidak masuk buku
 * nilai ini — rekap kuis ada di detail kuis dan halaman grades siswa.
 */
export type GradeCell = {
  studentId: string;
  taskId: string | null; // null = baris ujian (UTS/UAS)
  kind: string; // "Tugas" | "UTS" | "UAS" (kind lain diabaikan UI)
  score: number;
};

export async function fetchClassGradeRows(classId: string): Promise<GradeCell[]> {
  try {
    const user = await requireTeacher();
    await requireTeaching(user, classId);
    const rows = await sql<
      {
        studentId: string;
        taskId: string | null;
        kind: string;
        score: number;
        gradeDate: string;
        createdAt: Date;
      }[]
    >`
      SELECT g.student_id AS "studentId", g.task_id AS "taskId", g.kind, g.score,
             g.grade_date::text AS "gradeDate", g.created_at AS "createdAt"
      FROM public.grades g
      WHERE g.class_id = ${classId}
        AND (g.created_by = ${user.id} OR g.task_id IN (
          SELECT id FROM public.tasks WHERE created_by = ${user.id}
        ))
      ORDER BY g.grade_date ASC, g.created_at ASC
    `;
    // Nilai terakhir menang: per (siswa, tugas) untuk kolom tugas — kind tak
    // dipedulikan (baris seeded lama memakai judul tugas sebagai kind), dan
    // per (siswa, UTS|UAS) untuk kolom ujian. Kuis & kind lain diabaikan.
    const latest = new Map<string, GradeCell>();
    for (const r of rows) {
      if (r.taskId) {
        latest.set(`${r.studentId}|${r.taskId}`, {
          studentId: r.studentId,
          taskId: r.taskId,
          kind: "Tugas",
          score: r.score,
        });
      } else if (r.kind === "UTS" || r.kind === "UAS") {
        latest.set(`${r.studentId}|${r.kind}`, {
          studentId: r.studentId,
          taskId: null,
          kind: r.kind,
          score: r.score,
        });
      }
    }
    return [...latest.values()];
  } catch {
    return [];
  }
}

/**
 * Simpan/ubah nilai UTS atau UAS satu siswa (buku nilai, kolom ujian).
 * Satu baris per (siswa, kind): baris lama diganti dalam satu transaksi.
 */
export async function saveExamGrade(
  classId: string,
  studentId: string,
  kind: "UTS" | "UAS",
  score: number,
): Promise<void> {
  const user = await requireTeacher();
  await requireTeaching(user, classId);
  const enrolled = await sql<{ id: string }[]>`
    SELECT id FROM public.enrollments
    WHERE class_id = ${classId} AND student_id = ${studentId}
    LIMIT 1
  `;
  if (!enrolled[0]) throw new Error("Siswa tidak ada di kelas ini.");
  const clean = Math.max(0, Math.min(100, Math.round(score)));
  if (Number.isNaN(clean)) throw new Error("Nilai harus angka 0-100.");
  await sql.begin(async (tx) => {
    await tx`
      DELETE FROM public.grades
      WHERE class_id = ${classId} AND student_id = ${studentId}
        AND task_id IS NULL AND kind = ${kind}
    `;
    await tx`
      INSERT INTO public.grades (class_id, task_id, student_id, subject, kind, score, created_by)
      VALUES (${classId}, NULL, ${studentId}, ${kind}, ${kind}, ${clean}, ${user.id})
    `;
  });
}

// Rekomendasi AI per kelas di rightbar guru. Cache 15 menit per (guru, kelas)
// agar router tidak dipanggil setiap muat halaman; gagal → null, UI fallback.
const aiNoteCache = new Map<string, { note: string; at: number }>();
const AI_NOTE_TTL = 15 * 60_000;

export async function fetchClassAiNote(classId: string): Promise<string | null> {
  try {
    const user = await requireTeacher();
    await requireTeaching(user, classId);
    const key = `teacher:${user.id}:${classId}`;
    const hit = aiNoteCache.get(key);
    if (hit && Date.now() - hit.at < AI_NOTE_TTL) return hit.note;

    const [roster, classRow] = await Promise.all([
      fetchClassRoster(classId, 0),
      sql<{ name: string | null }[]>`
        SELECT name FROM public.classes WHERE id = ${classId} LIMIT 1
      `,
    ]);
    const rows = roster.filter((r) => r.gradeCount > 0);
    if (rows.length === 0) return null;

    const raw = await chatComplete(
      [
        {
          role: "system",
          content:
            "Kamu adalah AI Agent Grafidu, asisten guru pengampu kelas di platform Grafidu. Berdasarkan DATA rata-rata nilai siswa berikut, tulis SATU kalimat rekomendasi tindakan untuk guru (maksimal 25 kata) dalam Bahasa Indonesia. Sebut nama siswa yang paling perlu perhatian bila relevan. Jawab HANYA kalimatnya — tanpa sapaan, tanpa format, tanpa tanda kutip.",
        },
        {
          role: "user",
          content:
            `Kelas: ${clip(classRow[0]?.name, 60)}\nDATA:\n` +
            JSON.stringify(rows.map((r) => ({ nama: r.name, rata: r.avg }))),
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