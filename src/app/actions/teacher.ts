"use server";

import { sql } from "@/lib/db";
import { getSessionUser, type SessionUser } from "@/lib/session";
import { relativeWhen, type TeacherAnnouncement } from "@/lib/student-model";
import type {
  MaterialRow,
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

/** Tugas satu kelas + rekap pengumpulan/penilaian dari task_statuses. */
export async function fetchClassTasks(classId: string): Promise<TeacherTask[]> {
  try {
    const user = await requireTeacher();
    await requireTeaching(user, classId);
    const [tasks, aggs] = await Promise.all([
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
        ORDER BY position ASC
      `,
      sql<{ task_id: string; done_count: number; graded_count: number }[]>`
        SELECT ts.task_id,
          count(*) FILTER (WHERE ts.done)::int AS done_count,
          count(*) FILTER (WHERE ts.grade IS NOT NULL)::int AS graded_count
        FROM public.task_statuses ts
        WHERE ts.task_id IN (SELECT id FROM public.tasks WHERE class_id = ${classId})
        GROUP BY ts.task_id
      `,
    ]);
    const byTask = new Map(aggs.map((a) => [a.task_id, a]));
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
        total: agg?.done_count ?? 0,
        submitted: agg?.done_count ?? 0,
        graded: agg?.graded_count ?? 0,
      };
    });
  } catch {
    return [];
  }
}

/** Siswa satu kelas + rata-rata nilai (dari tabel grades per class). */
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
          avatar: r.avatar || "/assets/logo.png",
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
  await sql`
    INSERT INTO public.materials
      (class_id, teacher_id, title, description, attachments, status, pages)
    VALUES
      (${input.classId}, ${user.id}, ${input.title}, ${input.description},
       ${input.attachments}, ${input.status}, 0)
  `;
}

export async function updateMaterial(
  id: string,
  patch: { title: string; description: string; attachments: string[]; status: string },
): Promise<void> {
  const user = await requireTeacher();
  // Boleh dikelola guru pengampu kelas materinya (bukan hanya pembuatnya).
  await sql`
    UPDATE public.materials SET
      title = ${patch.title},
      description = ${patch.description},
      attachments = ${patch.attachments},
      status = ${patch.status}
    WHERE id = ${id}
      AND class_id IN (SELECT class_id FROM public.teachings WHERE teacher_id = ${user.id})
  `;
}

export async function deleteMaterial(id: string): Promise<void> {
  const user = await requireTeacher();
  await sql`
    DELETE FROM public.materials
    WHERE id = ${id}
      AND class_id IN (SELECT class_id FROM public.teachings WHERE teacher_id = ${user.id})
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

/** Pengumpulan satu tugas, tergabung dengan nama siswa. */
export async function fetchTaskSubmissions(taskId: string): Promise<SubmissionRow[]> {
  try {
    const user = await requireTeacher();
    const rows = await sql<
      {
        id: string;
        student_id: string;
        done: boolean;
        submitted_at: Date | null;
        grade: number | null;
        feedback: string;
        name: string | null;
        avatar: string | null;
      }[]
    >`
      SELECT ts.id, ts.student_id, ts.done, ts.submitted_at, ts.grade, ts.feedback,
             p.name, p.avatar
      FROM public.task_statuses ts
      LEFT JOIN public.profiles p ON p.id = ts.student_id
      WHERE ts.task_id = ${taskId}
        AND ts.task_id IN (
          SELECT id FROM public.tasks
          WHERE class_id IN (SELECT class_id FROM public.teachings WHERE teacher_id = ${user.id})
        )
    `;
    return rows
      .map((s) => ({
        id: s.id,
        studentId: s.student_id,
        name: s.name ?? "Siswa",
        avatar: s.avatar || "/assets/logo.png",
        done: s.done,
        submittedAt: s.submitted_at ? s.submitted_at.toISOString() : null,
        grade: s.grade,
        feedback: s.feedback,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

/** Simpan nilai + umpan balik ke task_statuses, lalu sinkron ke tabel grades. */
export async function saveGrade(
  submissionId: string,
  score: number,
  feedback: string,
): Promise<void> {
  const user = await requireTeacher();

  // Konteks submission + otorisasi: tugas harus milik kelas yang diampu.
  const rows = await sql<
    { task_id: string; student_id: string; class_id: string; subject: string }[]
  >`
    SELECT ts.task_id, ts.student_id, t.class_id, t.subject
    FROM public.task_statuses ts
    JOIN public.tasks t ON t.id = ts.task_id
    WHERE ts.id = ${submissionId}
      AND t.class_id IN (SELECT class_id FROM public.teachings WHERE teacher_id = ${user.id})
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return;

  await sql`
    UPDATE public.task_statuses
    SET grade = ${score}, feedback = ${feedback}
    WHERE id = ${submissionId}
  `;

  // Satu sumber kebenaran: nilai tugas ikut tercatat di tabel grades agar
  // rata-rata per mapel (dashboard siswa & guru) dan matriks nilai tetap
  // sinkron dengan penilaian tugas.
  await sql`
    INSERT INTO public.grades (class_id, task_id, student_id, subject, kind, score)
    VALUES (${row.class_id}, ${row.task_id}, ${row.student_id}, ${row.subject}, 'Tugas', ${score})
    ON CONFLICT (task_id, student_id)
    DO UPDATE SET score = EXCLUDED.score
  `;
}

export async function createTask(classId: string, input: TaskInput): Promise<void> {
  const user = await requireTeacher();
  await requireTeaching(user, classId);
  await sql`
    INSERT INTO public.tasks
      (class_id, created_by, title, description, subject, due_at, is_completed, material_id)
    VALUES
      (${classId}, ${user.id}, ${input.title}, ${input.description},
       ${input.subject}, ${input.dueAt}, false, ${input.materialId ?? null})
  `;
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
      AND class_id IN (SELECT class_id FROM public.teachings WHERE teacher_id = ${user.id})
  `;
}

export async function deleteTask(id: string): Promise<void> {
  const user = await requireTeacher();
  // task_statuses tercascade di database; quiz_questions tidak berelasi ke tasks.
  await sql`
    DELETE FROM public.tasks
    WHERE id = ${id}
      AND class_id IN (SELECT class_id FROM public.teachings WHERE teacher_id = ${user.id})
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
          difficulty: string | null;
          num_questions: number | null;
          duration_min: number | null;
          status: string | null;
          created_at: Date;
        }[]
      >`
        SELECT id, title, topic, difficulty, num_questions, duration_min, status, created_at
        FROM public.quizzes
        WHERE class_id = ${classId}
        ORDER BY created_at DESC
      `,
      sql<{ quiz_id: string; idx: number; text: string }[]>`
        SELECT qq.quiz_id, qq.idx, qq.text
        FROM public.quiz_questions qq
        WHERE qq.quiz_id IN (SELECT id FROM public.quizzes WHERE class_id = ${classId})
        ORDER BY qq.idx ASC
      `,
    ]);
    const byQuiz = new Map<string, string[]>();
    for (const q of questions) {
      const arr = byQuiz.get(q.quiz_id) ?? [];
      arr[q.idx - 1] = q.text;
      byQuiz.set(q.quiz_id, arr);
    }
    return quizzes.map((q) => ({
      id: q.id,
      title: q.title ?? "",
      topic: q.topic ?? "",
      difficulty: q.difficulty ?? "Sedang",
      numQuestions: q.num_questions ?? 0,
      durationMin: q.duration_min ?? 20,
      status: q.status ?? "draft",
      createdAt: q.created_at.toISOString(),
      questions: byQuiz.get(q.id) ?? [],
    }));
  } catch {
    return [];
  }
}

export async function createQuiz(input: {
  classId: string;
  title: string;
  topic: string;
  difficulty: string;
  durationMin: number;
  questions: string[];
}): Promise<void> {
  const user = await requireTeacher();
  await requireTeaching(user, input.classId);
  await sql.begin(async (tx) => {
    const inserted = await tx<{ id: string }[]>`
      INSERT INTO public.quizzes
        (class_id, created_by, title, topic, difficulty, num_questions, duration_min, status)
      VALUES
        (${input.classId}, ${user.id}, ${input.title}, ${input.topic}, ${input.difficulty},
         ${input.questions.length}, ${input.durationMin}, 'draft')
      RETURNING id
    `;
    const quizId = inserted[0].id;
    for (let i = 0; i < input.questions.length; i++) {
      await tx`
        INSERT INTO public.quiz_questions (quiz_id, idx, text)
        VALUES (${quizId}, ${i + 1}, ${input.questions[i]})
      `;
    }
  });
}

export async function setQuizStatus(id: string, status: string): Promise<void> {
  const user = await requireTeacher();
  await sql`
    UPDATE public.quizzes SET status = ${status}
    WHERE id = ${id}
      AND class_id IN (SELECT class_id FROM public.teachings WHERE teacher_id = ${user.id})
  `;
}

export async function deleteQuiz(id: string): Promise<void> {
  const user = await requireTeacher();
  // quiz_questions tanpa FK cascade — hapus manual dulu dalam satu transaksi.
  await sql.begin(async (tx) => {
    await tx`
      DELETE FROM public.quiz_questions
      WHERE quiz_id = ${id}
        AND quiz_id IN (
          SELECT id FROM public.quizzes
          WHERE class_id IN (SELECT class_id FROM public.teachings WHERE teacher_id = ${user.id})
        )
    `;
    await tx`
      DELETE FROM public.quizzes
      WHERE id = ${id}
        AND class_id IN (SELECT class_id FROM public.teachings WHERE teacher_id = ${user.id})
    `;
  });
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
 * Nilai terbaru per siswa per mapel untuk satu kelas (untuk tabel grades).
 * DISTINCT ON memberi nilai terakhir tiap (siswa, mapel) — semantik sama
 * dengan fetchSubjectScores sisi siswa.
 */
export type GradeCell = { studentId: string; name: string; subject: string; score: number };

export async function fetchClassGradeRows(classId: string): Promise<GradeCell[]> {
  try {
    const user = await requireTeacher();
    await requireTeaching(user, classId);
    return await sql<GradeCell[]>`
      SELECT DISTINCT ON (g.student_id, g.subject)
        g.student_id AS "studentId", p.name AS name, g.subject, g.score
      FROM public.grades g
      JOIN public.profiles p ON p.id = g.student_id
      WHERE g.class_id = ${classId}
      ORDER BY g.student_id, g.subject, g.grade_date
    `;
  } catch {
    return [];
  }
}
