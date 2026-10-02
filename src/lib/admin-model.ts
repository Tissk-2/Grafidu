// Tipe view-model + helper untuk panel admin. Modul biasa — aman di client.

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

/** Pesan ramah untuk error Postgres yang umum (kode SQLSTATE). */
export function dbErrorMessage(err: unknown, fallback: string): string {
  const code = (err as { code?: string } | null)?.code;
  if (code === "23505") return fallback;
  const message = (err as { message?: string } | null)?.message;
  return message ? `${fallback} (${message})` : fallback;
}
