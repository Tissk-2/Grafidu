"use server";

import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { dbErrorMessage } from "@/lib/admin-model";
import type {
  AccountsData,
  AdminAccount,
  AnnouncementRow,
  ClassDetailData,
  ClassSummary,
  OverviewData,
} from "@/lib/admin-model";

/**
 * Data layer panel admin — pengganti lib/admin.ts.
 * Semua aksi dijalankan server-side dan wajib admin (dicek dari session,
 * bukan RLS). Error dilempar sebagai Error dengan pesan Indonesia — form
 * client menangkapnya dan menampilkan toast.
 */

async function requireAdmin(): Promise<string> {
  const user = await getSessionUser();
  if (!user) throw new Error("Sesi berakhir. Silakan login ulang.");
  if (user.role !== "admin") {
    throw new Error("Hanya admin yang boleh melakukan aksi ini.");
  }
  return user.id;
}

// ---------------------------------------------------------------------------
// Akun (profiles)
// ---------------------------------------------------------------------------

export async function listAccounts(): Promise<AccountsData> {
  await requireAdmin();
  const [profiles, classes, enrollments] = await Promise.all([
    sql<{
      id: string;
      role: string;
      name: string | null;
      email: string | null;
      phone: string | null;
      subject: string | null;
      class_name: string | null;
      is_active: boolean | null;
      must_change_password: boolean | null;
    }[]>`
      SELECT id, role, name, email, phone, subject, class_name, is_active, must_change_password
      FROM public.profiles
      WHERE role IN ('student', 'teacher')
      ORDER BY name
    `,
    sql<{ id: string; name: string }[]>`
      SELECT id, name FROM public.classes ORDER BY name
    `,
    sql<{ student_id: string; class_id: string }[]>`
      SELECT student_id, class_id FROM public.enrollments
    `,
  ]);

  const classByStudent = new Map<string, string>();
  for (const row of enrollments) {
    classByStudent.set(row.student_id, row.class_id);
  }
  const accounts: AdminAccount[] = profiles.map((r) => ({
    id: r.id,
    role: r.role === "teacher" ? "teacher" : "student",
    name: r.name ?? "Tanpa nama",
    email: r.email ?? "",
    phone: r.phone ?? "",
    subject: r.subject,
    className: r.class_name,
    isActive: r.is_active !== false,
    mustChangePassword: r.must_change_password === true,
  }));
  return {
    accounts,
    classes: [...classes].sort((a, b) => a.name.localeCompare(b.name)),
    classByStudent,
  };
}

// ---------------------------------------------------------------------------
// Kelas
// ---------------------------------------------------------------------------

export async function listClassesDetailed(): Promise<ClassSummary[]> {
  await requireAdmin();
  const rows = await sql<{ id: string; name: string; student_count: number; teaching_count: number }[]>`
    SELECT c.id, c.name,
      (SELECT count(*)::int FROM public.enrollments e WHERE e.class_id = c.id) AS student_count,
      (SELECT count(*)::int FROM public.teachings t WHERE t.class_id = c.id) AS teaching_count
    FROM public.classes c
    ORDER BY c.name
  `;
  return rows
    .map((r) => ({
      id: r.id,
      name: r.name,
      studentCount: r.student_count,
      teachingCount: r.teaching_count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function createClass(name: string): Promise<{ id: string; name: string }> {
  await requireAdmin();
  try {
    const rows = await sql<{ id: string; name: string }[]>`
      INSERT INTO public.classes (name) VALUES (${name})
      RETURNING id, name
    `;
    return rows[0];
  } catch (err) {
    throw new Error(dbErrorMessage(err, "Nama kelas sudah dipakai."));
  }
}

export async function renameClass(classId: string, oldName: string, newName: string): Promise<void> {
  await requireAdmin();
  try {
    await sql.begin(async (tx) => {
      await tx`UPDATE public.classes SET name = ${newName} WHERE id = ${classId}`;
      // Sinkronkan label kelas pada profil (label lama dipakai dashboard siswa).
      if (oldName !== newName) {
        await tx`
          UPDATE public.profiles SET class_name = ${newName}
          WHERE class_name = ${oldName}
        `;
      }
    });
  } catch (err) {
    throw new Error(dbErrorMessage(err, "Nama kelas sudah dipakai."));
  }
}

export async function deleteClass(classId: string): Promise<void> {
  await requireAdmin();
  await sql`DELETE FROM public.classes WHERE id = ${classId}`;
}

export async function fetchClassDetail(classId: string): Promise<ClassDetailData | null> {
  await requireAdmin();
  const classes = await sql<{ id: string; name: string }[]>`
    SELECT id, name FROM public.classes WHERE id = ${classId} LIMIT 1
  `;
  const c = classes[0];
  if (!c) return null;

  const [enrolled, teachings, teachers, students] = await Promise.all([
    sql<{ id: string; name: string | null; email: string | null; is_active: boolean | null }[]>`
      SELECT p.id, p.name, p.email, p.is_active
      FROM public.enrollments e
      JOIN public.profiles p ON p.id = e.student_id
      WHERE e.class_id = ${c.id}
    `,
    sql<{ teacher_id: string; subject: string; teacher_name: string | null }[]>`
      SELECT t.teacher_id, t.subject, p.name AS teacher_name
      FROM public.teachings t
      LEFT JOIN public.profiles p ON p.id = t.teacher_id
      WHERE t.class_id = ${c.id}
    `,
    sql<{ id: string; name: string | null; subject: string | null }[]>`
      SELECT id, name, subject
      FROM public.profiles
      WHERE role = 'teacher' AND is_active = true
      ORDER BY name
    `,
    sql<{ id: string; name: string | null; class_name: string | null }[]>`
      SELECT id, name, class_name
      FROM public.profiles
      WHERE role = 'student'
      ORDER BY name
    `,
  ]);

  return {
    cls: c,
    students: enrolled
      .map((s) => ({
        id: s.id,
        name: s.name ?? "Tanpa nama",
        email: s.email ?? "",
        isActive: s.is_active !== false,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    assignments: teachings
      .map((r) => ({
        teacherId: r.teacher_id,
        teacherName: r.teacher_name ?? "Guru",
        subject: r.subject || "Umum",
      }))
      .sort(
        (a, b) => a.subject.localeCompare(b.subject) || a.teacherName.localeCompare(b.teacherName)
      ),
    teachers: teachers.map((t) => ({ id: t.id, name: t.name ?? "Guru", subject: t.subject })),
    allStudents: students.map((s) => ({
      id: s.id,
      name: s.name ?? "Tanpa nama",
      className: s.class_name,
    })),
  };
}

export async function moveStudent(studentId: string, classId: string, className: string): Promise<void> {
  await requireAdmin();
  // Satu transaksi: pindah enrollment + label profil bersama-sama.
  await sql.begin(async (tx) => {
    await tx`DELETE FROM public.enrollments WHERE student_id = ${studentId}`;
    await tx`
      INSERT INTO public.enrollments (class_id, student_id)
      VALUES (${classId}, ${studentId})
    `;
    await tx`
      UPDATE public.profiles SET class_name = ${className}
      WHERE id = ${studentId}
    `;
  });
}

export async function assignTeaching(classId: string, teacherId: string, subject: string): Promise<void> {
  await requireAdmin();
  try {
    await sql`
      INSERT INTO public.teachings (class_id, teacher_id, subject)
      VALUES (${classId}, ${teacherId}, ${subject})
    `;
  } catch (err) {
    throw new Error(
      dbErrorMessage(err, "Guru sudah ditugaskan untuk mapel tersebut di kelas ini.")
    );
  }
}

export async function removeTeaching(classId: string, teacherId: string, subject: string): Promise<void> {
  await requireAdmin();
  await sql`
    DELETE FROM public.teachings
    WHERE class_id = ${classId} AND teacher_id = ${teacherId} AND subject = ${subject}
  `;
}

// ---------------------------------------------------------------------------
// Pengumuman
// ---------------------------------------------------------------------------

export async function listAnnouncements(limit?: number): Promise<AnnouncementRow[]> {
  await requireAdmin();
  const rows = await sql<
    { id: string; title: string; body: string; created_at: Date; creator_name: string | null }[]
  >`
    SELECT a.id, a.title, a.body, a.created_at, p.name AS creator_name
    FROM public.announcements a
    LEFT JOIN public.profiles p ON p.id = a.created_by
    ORDER BY a.created_at DESC
    ${limit ? sql`LIMIT ${limit}` : sql``}
  `;
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    createdAt: r.created_at.toISOString(),
    creatorName: r.creator_name ?? null,
  }));
}

export async function createAnnouncement(title: string, body: string): Promise<void> {
  const adminId = await requireAdmin();
  await sql`
    INSERT INTO public.announcements (title, body, created_by)
    VALUES (${title}, ${body}, ${adminId})
  `;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await requireAdmin();
  await sql`DELETE FROM public.announcements WHERE id = ${id}`;
}

// ---------------------------------------------------------------------------
// Ringkasan (admin home)
// ---------------------------------------------------------------------------

export async function fetchOverview(): Promise<OverviewData> {
  await requireAdmin();
  const [students, teachers, classes, announcements] = await Promise.all([
    sql<{ count: number }[]>`
      SELECT count(*)::int AS count FROM public.profiles
      WHERE role = 'student' AND is_active = true
    `,
    sql<{ count: number }[]>`
      SELECT count(*)::int AS count FROM public.profiles
      WHERE role = 'teacher' AND is_active = true
    `,
    sql<{ count: number }[]>`
      SELECT count(*)::int AS count FROM public.classes
    `,
    listAnnouncements(4),
  ]);

  return {
    activeStudents: students[0]?.count ?? 0,
    activeTeachers: teachers[0]?.count ?? 0,
    classCount: classes[0]?.count ?? 0,
    announcements,
  };
}
