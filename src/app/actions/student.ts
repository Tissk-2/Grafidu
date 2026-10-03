"use server";

import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { pill, relativeWhen } from "@/lib/student-model";
import type {
  AnnouncementItem,
  AnnouncementPageItem,
  ClassTeacher,
  SchoolTask,
  SidebarTask,
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
      ORDER BY subject, grade_date
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

export async function fetchAnnouncements(limit = 3): Promise<AnnouncementItem[]> {
  try {
    const rows = await sql<{ title: string; body: string; created_at: Date }[]>`
      SELECT title, body, created_at
      FROM public.announcements
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows.map((a, i) => {
      const iso = a.created_at.toISOString();
      return {
        title: a.title,
        body: a.body.length > 120 ? a.body.slice(0, 120) + "..." : a.body,
        when: relativeWhen(iso),
        hl: i === 0,
      };
    });
  } catch {
    return [];
  }
}

/** Semua pengumuman tanpa dipotong, plus ISO date untuk filter & sort halaman. */
export async function fetchAllAnnouncements(): Promise<AnnouncementPageItem[]> {
  try {
    const rows = await sql<{ title: string; body: string; created_at: Date }[]>`
      SELECT title, body, created_at
      FROM public.announcements
      ORDER BY created_at DESC
    `;
    return rows.map((a) => {
      const iso = a.created_at.toISOString();
      return {
        title: a.title,
        body: a.body,
        when: relativeWhen(iso),
        date: iso,
      };
    });
  } catch {
    return [];
  }
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

export async function addTodo(title: string): Promise<TodoItem | null> {
  const user = await getSessionUser();
  if (!user) throw new Error("Sesi berakhir. Silakan login ulang.");
  const rows = await sql<TodoItem[]>`
    INSERT INTO public.todos (user_id, title, subtitle, done)
    VALUES (${user.id}, ${title}, 'Kegiatan pribadi', false)
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
      }[]
    >`
      SELECT t.id, t.title, t.description, t.subject, t.assigned_at, t.due_at, p.name AS creator_name
      FROM public.tasks t
      LEFT JOIN public.profiles p ON p.id = t.created_by
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
      { done: boolean; submitted_at: Date | null; grade: number | null; feedback: string }[]
    >`
      SELECT done, submitted_at, grade, feedback
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
    };
  } catch {
    return null;
  }
}

export async function submitTask(taskId: string): Promise<void> {
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
    INSERT INTO public.task_statuses (task_id, student_id, done, submitted_at)
    VALUES (${taskId}, ${user.id}, true, now())
    ON CONFLICT (task_id, student_id)
    DO UPDATE SET done = true, submitted_at = EXCLUDED.submitted_at
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
      avatar: r.avatar || "/assets/logo.png",
    }));
    out.sort((a, b) => a.subject.localeCompare(b.subject));
    return out;
  } catch {
    return [];
  }
}
