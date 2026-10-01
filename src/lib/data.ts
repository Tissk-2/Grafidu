import { pill } from "@/lib/format";
import type { DB, OwnerId } from "@/lib/store";

export type SubjectScore = {
  subject: string;
  score: number;
  trend: 1 | -1;
  status: "Atas Rata Rata" | "Bawah Rata Rata";
};

/** Latest score per subject + trend (latest vs previous), sorted by subject. */
export function studentSubjects(db: DB, studentId: OwnerId): SubjectScore[] {
  const rows = db.grades
    .filter((g) => g.studentId === studentId)
    .sort(
      (a, b) =>
        a.subject.localeCompare(b.subject) ||
        new Date(a.gradeDate).getTime() - new Date(b.gradeDate).getTime() ||
        a.id - b.id
    );

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

/** Round mean of all grades for a student. */
export function avgScore(db: DB, studentId: number): number {
  const rows = db.grades.filter((g) => g.studentId === studentId);
  if (rows.length === 0) return 0;
  return Math.round(rows.reduce((acc, g) => acc + g.score, 0) / rows.length);
}

/** Class names this teacher teaches, sorted. */
export function teacherClasses(db: DB, teacherId: OwnerId): string[] {
  return db.teachings
    .filter((t) => t.teacherId === teacherId)
    .map((t) => db.classes.find((c) => c.id === t.classId)?.name ?? "")
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export type ClassStudent = {
  id: number;
  name: string;
  avatar: string;
  avg: number;
  trend: 1 | -1;
};

/** Roster for a class with per-student average + trend. */
export function classStudents(db: DB, klass: string): ClassStudent[] {
  const cls = db.classes.find((c) => c.name === klass);
  if (!cls) return [];
  const rows = db.enrollments
    .filter((e) => e.classId === cls.id)
    .map((e) => db.users.find((u) => u.id === e.studentId))
    .filter((u): u is NonNullable<typeof u> => Boolean(u))
    .sort((a, b) => a.name.localeCompare(b.name));

  const out: ClassStudent[] = [];
  for (const st of rows) {
    const subs = studentSubjects(db, st.id);
    const avg =
      subs.length > 0
        ? Math.round(subs.reduce((acc, s) => acc + s.score, 0) / subs.length)
        : 0;
    const trend = subs[0]?.trend ?? 1;
    out.push({
      id: st.id,
      name: st.name,
      avatar: st.avatar || "/assets/logo.png",
      avg,
      trend,
    });
  }
  return out;
}
