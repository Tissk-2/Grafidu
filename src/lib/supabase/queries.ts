import { createClient } from "@/lib/supabase/client";
import type { SessionUser } from "@/lib/auth";

// Semua tipe memakai id string (uuid Supabase).

export type SidebarTask = { id: string; title: string; sub: string; done: boolean };

export type SubjectScore = {
  subject: string;
  score: number;
  trend: 1 | -1;
  status: "Atas Rata Rata" | "Bawah Rata Rata";
};

export type AnnouncementItem = { title: string; body: string; when: string; hl: boolean };

export type TodoItem = { id: string; title: string; subtitle: string; done: boolean };

export type SchoolTask = {
  id: string;
  title: string;
  subject: string;
  dueAt: string;
  done: boolean;
  grade: number | null;
};

export type TaskDetail = {
  id: string;
  title: string;
  description: string;
  subject: string;
  assignedAt: string;
  dueAt: string;
  creatorName: string;
};

export type TaskStatus = {
  done: boolean;
  submittedAt: string | null;
  grade: number | null;
  feedback: string;
};

export type ClassTeacher = { teacher: string; subject: string; avatar: string };

function pill(score: number): "Atas Rata Rata" | "Bawah Rata Rata" {
  return score >= 70 ? "Atas Rata Rata" : "Bawah Rata Rata";
}

/** Label relatif ala "Kemarin" / "3 Hari lalu" dari created_at. */
export function relativeWhen(iso: string): string {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diffDays <= 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  return `${diffDays} Hari lalu`;
}

const classIdCache = new Map<string, { id: string | null; at: number }>();
const CLASS_ID_TTL = 60_000; // lookup nama→id kelas di-cache 60 detik

async function classIdByName(className: string | null): Promise<string | null> {
  if (!className) return null;
  const hit = classIdCache.get(className);
  if (hit && Date.now() - hit.at < CLASS_ID_TTL) return hit.id;
  const supabase = createClient();
  const { data } = await supabase
    .from("classes")
    .select("id")
    .eq("name", className)
    .single();
  const id = (data as { id: string } | null)?.id ?? null;
  classIdCache.set(className, { id, at: Date.now() });
  return id;
}

/** Tugas sidebar: yang tenggatnya hari ini, fallback 3 tenggat terdekat. */
export async function fetchTasksToday(u: SessionUser): Promise<SidebarTask[]> {
  const classId = await classIdByName(u.className);
  if (!classId) return [];
  const supabase = createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, subject, description, due_at")
    .eq("class_id", classId)
    .order("due_at", { ascending: false });
  const rows = (tasks ?? []) as {
    id: string;
    title: string;
    subject: string;
    description: string;
    due_at: string;
  }[];
  if (rows.length === 0) return [];

  const { data: statuses } = await supabase
    .from("task_statuses")
    .select("task_id, done")
    .eq("student_id", u.id);
  const doneBy = new Map(
    ((statuses ?? []) as { task_id: string; done: boolean }[]).map((s) => [s.task_id, s.done])
  );

  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const dueToday = rows.filter((t) => {
    const d = new Date(t.due_at);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === startToday.getTime();
  });
  const picked = (dueToday.length > 0 ? dueToday : rows.slice(0, 3)).slice(0, 3);
  return picked.map((t) => ({
    id: t.id,
    title: t.title,
    sub: t.subject || t.description,
    done: doneBy.get(t.id) ?? false,
  }));
}

/** Nilai terbaru per mapel + tren, dari tabel grades. */
export async function fetchSubjectScores(userId: string): Promise<SubjectScore[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("grades")
    .select("subject, score, grade_date")
    .eq("student_id", userId)
    .order("subject")
    .order("grade_date");
  const rows = (data ?? []) as { subject: string; score: number; grade_date: string }[];
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
}

export function avgOf(scores: SubjectScore[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((acc, s) => acc + s.score, 0) / scores.length);
}

/** Catatan AI sederhana yang diturunkan dari data nilai asli. */
export function aiNoteFromScores(scores: SubjectScore[]): string {
  if (scores.length === 0) return "Data nilai belum tersedia. Minta gurumu mengisi nilai agar rekomendasi muncul.";
  const lowest = [...scores].sort((a, b) => a.score - b.score)[0];
  if (lowest.score < 70)
    return `Fokuskan pembelajaranmu ke ${lowest.subject} dan lanjutkan mempertahankan mapel lainnya.`;
  return "Semua nilai dalam kondisi aman. Pertahankan!";
}

export async function fetchAnnouncements(limit = 3): Promise<AnnouncementItem[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("announcements")
    .select("title, body, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  const rows = (data ?? []) as { title: string; body: string; created_at: string }[];
  return rows.map((a, i) => ({
    title: a.title,
    body: a.body.length > 120 ? a.body.slice(0, 120) + "..." : a.body,
    when: relativeWhen(a.created_at),
    hl: i === 0,
  }));
}

export async function fetchTodos(userId: string): Promise<TodoItem[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("todos")
    .select("id, title, subtitle, done")
    .eq("user_id", userId)
    .order("created_at");
  return (data ?? []) as TodoItem[];
}

export async function addTodo(userId: string, title: string): Promise<TodoItem | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("todos")
    .insert({ user_id: userId, title, subtitle: "Kegiatan pribadi", done: false })
    .select("id, title, subtitle, done")
    .single();
  if (error) throw new Error(error.message);
  return data as TodoItem | null;
}

export async function toggleTodo(id: string, done: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("todos").update({ done }).eq("id", id);
  if (error) throw new Error(error.message);
}

/** Daftar tugas sekolah untuk kelas siswa + status miliknya. */
export async function fetchSchoolTasks(u: SessionUser): Promise<SchoolTask[]> {
  const classId = await classIdByName(u.className);
  if (!classId) return [];
  const supabase = createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, subject, due_at")
    .eq("class_id", classId)
    .order("due_at", { ascending: false });
  const rows = (tasks ?? []) as { id: string; title: string; subject: string; due_at: string }[];
  const { data: statuses } = await supabase
    .from("task_statuses")
    .select("task_id, done, grade")
    .eq("student_id", u.id);
  const byTask = new Map(
    ((statuses ?? []) as { task_id: string; done: boolean; grade: number | null }[]).map((s) => [
      s.task_id,
      s,
    ])
  );
  return rows.map((t) => ({
    id: t.id,
    title: t.title,
    subject: t.subject,
    dueAt: t.due_at,
    done: byTask.get(t.id)?.done ?? false,
    grade: byTask.get(t.id)?.grade ?? null,
  }));
}

export async function fetchTaskDetail(taskId: string): Promise<TaskDetail | null> {
  const supabase = createClient();
  const { data: task } = await supabase
    .from("tasks")
    .select("id, title, description, subject, assigned_at, due_at, created_by")
    .eq("id", taskId)
    .single();
  const t = task as {
    id: string;
    title: string;
    description: string;
    subject: string;
    assigned_at: string;
    due_at: string;
    created_by: string | null;
  } | null;
  if (!t) return null;
  let creatorName = "Guru";
  if (t.created_by) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", t.created_by)
      .single();
    creatorName = (prof as { name: string } | null)?.name ?? "Guru";
  }
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    subject: t.subject,
    assignedAt: t.assigned_at,
    dueAt: t.due_at,
    creatorName,
  };
}

export async function fetchTaskStatus(
  taskId: string,
  userId: string
): Promise<TaskStatus | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("task_statuses")
    .select("done, submitted_at, grade, feedback")
    .eq("task_id", taskId)
    .eq("student_id", userId)
    .single();
  const s = data as {
    done: boolean;
    submitted_at: string | null;
    grade: number | null;
    feedback: string;
  } | null;
  if (!s) return null;
  return { done: s.done, submittedAt: s.submitted_at, grade: s.grade, feedback: s.feedback };
}

export async function submitTask(taskId: string, userId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("task_statuses").upsert(
    {
      task_id: taskId,
      student_id: userId,
      done: true,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "task_id,student_id" }
  );
  if (error) throw new Error(error.message);
}

/** Daftar guru pengajar kelas siswa (nama kelas dari database). */
export async function fetchClassTeachers(className: string | null): Promise<ClassTeacher[]> {
  if (!className) return [];
  const supabase = createClient();
  const { data: cls } = await supabase
    .from("classes")
    .select("id")
    .eq("name", className)
    .single();
  const classId = (cls as { id: string } | null)?.id;
  if (!classId) return [];
  const { data: teachings } = await supabase
    .from("teachings")
    .select("subject, teacher_id")
    .eq("class_id", classId);
  const rows = (teachings ?? []) as { subject: string; teacher_id: string }[];
  // Satu query batch untuk semua guru (hindari N+1).
  const ids = [...new Set(rows.map((r) => r.teacher_id))];
  if (ids.length === 0) return [];
  const { data: profs } = await supabase
    .from("profiles")
    .select("id, name, avatar")
    .in("id", ids);
  const byId = new Map(
    ((profs ?? []) as { id: string; name: string; avatar: string }[]).map((p) => [p.id, p])
  );
  const out: ClassTeacher[] = rows.map((r) => {
    const p = byId.get(r.teacher_id);
    return {
      teacher: p?.name ?? "Guru",
      subject: r.subject || "Umum",
      avatar: p?.avatar || "/assets/logo.png",
    };
  });
  out.sort((a, b) => a.subject.localeCompare(b.subject));
  return out;
}
