"use client";

/**
 * Data layer untuk halaman admin. Semua baca/tulis profil, kelas, enrollment,
 * penugasan mengajar, dan pengumuman berjalan langsung ke Supabase dari
 * browser (RLS membatasi: baca = login, tulis = admin). Operasi yang menyentuh
 * auth.users (buat akun, ganti email, reset sandi, ban) lewat route handler
 * /api/admin/users karena butuh service-role key.
 */

import { createClient } from "@/lib/supabase/client";

export type AdminAccount = {
  id: string;
  role: "student" | "teacher";
  name: string;
  email: string;
  phone: string;
  subject: string | null;
  className: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
};

export type AccountsData = {
  accounts: AdminAccount[];
  classes: { id: string; name: string }[];
  /** class_id per student_id dari tabel enrollments (sumber kebenaran kelas). */
  classByStudent: Map<string, string>;
};

export type ClassSummary = {
  id: string;
  name: string;
  studentCount: number;
  teachingCount: number;
};

export type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  creatorName: string | null;
};

export type OverviewData = {
  activeStudents: number;
  activeTeachers: number;
  classCount: number;
  announcements: AnnouncementRow[];
};

export type ClassDetailData = {
  cls: { id: string; name: string };
  students: { id: string; name: string; email: string; isActive: boolean }[];
  assignments: { teacherId: string; teacherName: string; subject: string }[];
  teachers: { id: string; name: string; subject: string | null }[];
  allStudents: { id: string; name: string; className: string | null }[];
};

/** Pesan ramah untuk error PostgREST yang umum. */
export function dbErrorMessage(err: unknown, fallback: string): string {
  const code = (err as { code?: string } | null)?.code;
  if (code === "23505") return fallback;
  const message = (err as { message?: string } | null)?.message;
  return message ? `${fallback} (${message})` : fallback;
}

// ---------------------------------------------------------------------------
// Akun (profiles)
// ---------------------------------------------------------------------------

export async function listAccounts(): Promise<AccountsData> {
  const supabase = createClient();
  const [profilesRes, classesRes, enrollRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, role, name, email, phone, subject, class_name, is_active, must_change_password")
      .in("role", ["student", "teacher"])
      .order("name"),
    supabase.from("classes").select("id, name").order("name"),
    supabase.from("enrollments").select("student_id, class_id"),
  ]);
  if (profilesRes.error) throw profilesRes.error;
  if (classesRes.error) throw classesRes.error;
  // enrollments boleh gagal dibaca jika policy belum diperbarui; jangan
  // bikin seluruh halaman kosong karena itu.
  const classByStudent = new Map<string, string>();
  for (const row of (enrollRes.data ?? []) as { student_id: string; class_id: string }[]) {
    classByStudent.set(row.student_id, row.class_id);
  }
  const accounts = (profilesRes.data ?? []).map((raw) => {
    const r = raw as {
      id: string;
      role: string;
      name: string | null;
      email: string | null;
      phone: string | null;
      subject: string | null;
      class_name: string | null;
      is_active: boolean | null;
      must_change_password: boolean | null;
    };
    return {
      id: r.id,
      role: r.role === "teacher" ? "teacher" : "student",
      name: r.name ?? "Tanpa nama",
      email: r.email ?? "",
      phone: r.phone ?? "",
      subject: r.subject,
      className: r.class_name,
      isActive: r.is_active !== false,
      mustChangePassword: r.must_change_password === true,
    } satisfies AdminAccount;
  });
  return {
    accounts,
    classes: ((classesRes.data ?? []) as { id: string; name: string }[]).sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
    classByStudent,
  };
}

// ---------------------------------------------------------------------------
// Kelas
// ---------------------------------------------------------------------------

export async function listClassesDetailed(): Promise<ClassSummary[]> {
  const supabase = createClient();
  const [classesRes, enrollRes, teachRes] = await Promise.all([
    supabase.from("classes").select("id, name"),
    supabase.from("enrollments").select("class_id"),
    supabase.from("teachings").select("class_id"),
  ]);
  if (classesRes.error) throw classesRes.error;
  if (enrollRes.error) throw enrollRes.error;
  if (teachRes.error) throw teachRes.error;
  const studentBy = new Map<string, number>();
  for (const r of (enrollRes.data ?? []) as { class_id: string }[]) {
    studentBy.set(r.class_id, (studentBy.get(r.class_id) ?? 0) + 1);
  }
  const teachBy = new Map<string, number>();
  for (const r of (teachRes.data ?? []) as { class_id: string }[]) {
    teachBy.set(r.class_id, (teachBy.get(r.class_id) ?? 0) + 1);
  }
  return ((classesRes.data ?? []) as { id: string; name: string }[])
    .map((c) => ({
      id: c.id,
      name: c.name,
      studentCount: studentBy.get(c.id) ?? 0,
      teachingCount: teachBy.get(c.id) ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function createClass(name: string): Promise<{ id: string; name: string }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("classes")
    .insert({ name })
    .select("id, name")
    .single();
  if (error) throw dbErrorMessage(error, "Nama kelas sudah dipakai.");
  return data as { id: string; name: string };
}

export async function renameClass(
  classId: string,
  oldName: string,
  newName: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("classes").update({ name: newName }).eq("id", classId);
  if (error) throw dbErrorMessage(error, "Nama kelas sudah dipakai.");
  // Sinkronkan label kelas pada profil (label lama dipakai dashboard siswa).
  if (oldName !== newName) {
    const { error: syncErr } = await supabase
      .from("profiles")
      .update({ class_name: newName })
      .eq("class_name", oldName);
    if (syncErr) throw syncErr;
  }
}

export async function deleteClass(classId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("classes").delete().eq("id", classId);
  if (error) throw error;
}

export async function fetchClassDetail(classId: string): Promise<ClassDetailData | null> {
  const supabase = createClient();
  const { data: cls } = await supabase
    .from("classes")
    .select("id, name")
    .eq("id", classId)
    .single();
  if (!cls) return null;
  const c = cls as { id: string; name: string };

  const [enrollRes, teachRes, teachersRes, studentsRes] = await Promise.all([
    supabase
      .from("enrollments")
      .select("student:profiles(id, name, email, is_active)")
      .eq("class_id", c.id),
    supabase
      .from("teachings")
      .select("teacher_id, subject, teacher:profiles(name)")
      .eq("class_id", c.id),
    supabase
      .from("profiles")
      .select("id, name, subject")
      .eq("role", "teacher")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("profiles")
      .select("id, name, class_name")
      .eq("role", "student")
      .order("name"),
  ]);
  if (enrollRes.error) throw enrollRes.error;
  if (teachRes.error) throw teachRes.error;
  if (teachersRes.error) throw teachersRes.error;
  if (studentsRes.error) throw studentsRes.error;

  // supabase-js menipe embed sebagai array (one-to-many default); FK ini
  // many-to-one sehingga runtime mengembalikan objek tunggal.
  const students = ((enrollRes.data ?? []) as unknown as { student: { id: string; name: string | null; email: string | null; is_active: boolean | null } | null }[])
    .map((r) => r.student)
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((s) => ({
      id: s.id,
      name: s.name ?? "Tanpa nama",
      email: s.email ?? "",
      isActive: s.is_active !== false,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const assignments = ((teachRes.data ?? []) as unknown as { teacher_id: string; subject: string; teacher: { name: string | null } | null }[])
    .map((r) => ({
      teacherId: r.teacher_id,
      teacherName: r.teacher?.name ?? "Guru",
      subject: r.subject || "Umum",
    }))
    .sort(
      (a, b) => a.subject.localeCompare(b.subject) || a.teacherName.localeCompare(b.teacherName)
    );

  return {
    cls: c,
    students,
    assignments,
    teachers: ((teachersRes.data ?? []) as { id: string; name: string | null; subject: string | null }[]).map(
      (t) => ({ id: t.id, name: t.name ?? "Guru", subject: t.subject })
    ),
    allStudents: ((studentsRes.data ?? []) as { id: string; name: string | null; class_name: string | null }[]).map(
      (s) => ({ id: s.id, name: s.name ?? "Tanpa nama", className: s.class_name })
    ),
  };
}

export async function moveStudent(
  studentId: string,
  classId: string,
  className: string
): Promise<void> {
  const supabase = createClient();
  const { error: delErr } = await supabase
    .from("enrollments")
    .delete()
    .eq("student_id", studentId);
  if (delErr) throw delErr;
  const { error: insErr } = await supabase
    .from("enrollments")
    .insert({ class_id: classId, student_id: studentId });
  if (insErr) throw insErr;
  const { error: profErr } = await supabase
    .from("profiles")
    .update({ class_name: className })
    .eq("id", studentId);
  if (profErr) throw profErr;
}

export async function assignTeaching(
  classId: string,
  teacherId: string,
  subject: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("teachings")
    .insert({ class_id: classId, teacher_id: teacherId, subject });
  if (error) throw dbErrorMessage(error, "Guru sudah ditugaskan untuk mapel tersebut di kelas ini.");
}

export async function removeTeaching(
  classId: string,
  teacherId: string,
  subject: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("teachings")
    .delete()
    .eq("class_id", classId)
    .eq("teacher_id", teacherId)
    .eq("subject", subject);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Pengumuman
// ---------------------------------------------------------------------------

type AnnouncementRaw = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  profiles: { name: string | null } | null;
};

function toAnnouncementRow(r: AnnouncementRaw): AnnouncementRow {
  return {
    id: r.id,
    title: r.title,
    body: r.body,
    createdAt: r.created_at,
    creatorName: r.profiles?.name ?? null,
  };
}

export async function listAnnouncements(limit?: number): Promise<AnnouncementRow[]> {
  const supabase = createClient();
  let query = supabase
    .from("announcements")
    .select("id, title, body, created_at, profiles:created_by(name)")
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as unknown as AnnouncementRaw[]).map(toAnnouncementRow);
}

export async function createAnnouncement(
  createdBy: string,
  title: string,
  body: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("announcements")
    .insert({ title, body, created_by: createdBy });
  if (error) throw error;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Ringkasan (admin home)
// ---------------------------------------------------------------------------

export async function fetchOverview(): Promise<OverviewData> {
  const supabase = createClient();
  const countOf = (role: "student" | "teacher") =>
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", role)
      .eq("is_active", true);

  const [studentsRes, teachersRes, classesRes, announceRes] = await Promise.all([
    countOf("student"),
    countOf("teacher"),
    supabase.from("classes").select("id", { count: "exact", head: true }),
    listAnnouncements(4),
  ]);

  if (studentsRes.error) throw studentsRes.error;
  if (teachersRes.error) throw teachersRes.error;
  if (classesRes.error) throw classesRes.error;

  return {
    activeStudents: studentsRes.count ?? 0,
    activeTeachers: teachersRes.count ?? 0,
    classCount: classesRes.count ?? 0,
    announcements: announceRes,
  };
}
