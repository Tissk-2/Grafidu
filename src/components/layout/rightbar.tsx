import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { dummyGuruData } from "@/lib/guru-demo";

export type GradeRow = { subject: string; score: number; status: string };
export type StudentRow = { name: string; avg: number };
export type Announcement = { title: string; body: string; when: string; hl: boolean };

/**
 * Marks a score against the class average: green with an up chevron once it
 * reaches the KKM (Kriteria Ketuntasan Minimal, `dummyGuruData.kkm`), red with
 * a down chevron when it falls short. The label is fixed — the score alone
 * decides the tone, so callers no longer pass their own text.
 */
function PillMean({ score }: { score: number }) {
  const meets = score >= dummyGuruData.kkm;
  return (
    <span
      className={`pill inline-flex items-center gap-1 ${meets ? "pill-green" : "pill-red"}`}
    >
      {meets ? <ChevronUp size={12} aria-hidden /> : <ChevronDown size={12} aria-hidden />}
      Rata Rata
    </span>
  );
}

export function StudentRightbar({
  grades,
  aiNote,
  ctaHref,
  ctaLabel,
  announcements,
  gradesHref = "/student/grades",
}: {
  grades: GradeRow[];
  aiNote: string;
  ctaHref: string;
  ctaLabel: string;
  announcements?: Announcement[];
  /** Where "Lihat Semua" points; the teacher slot overrides it. */
  gradesHref?: string;
}) {
  return (
    <aside className="rightbar">
      <div className="rb-head">
        <h3>Nilai Terbaru</h3>
        <Link className="link-underline" href={gradesHref}>
          Lihat Semua
        </Link>
      </div>
      <table className="rb-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th className="num">Score</th>
            <th className="st">Status</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((g) => (
            <tr key={g.subject}>
              <td>{g.subject}</td>
              <td className="num">{g.score}</td>
              <td className="st">
                <PillMean score={g.score} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {announcements && announcements.length > 0 && (
        <div className="ann-card">
          <div className="rb-head" style={{ marginBottom: 4 }}>
            <h3>Pengumuman</h3>
            <Link className="link-underline" href="/student/announcements">
              Lihat Semua
            </Link>
          </div>
          {announcements.map((a) => (
            <div key={a.title} className={"ann-item " + (a.hl ? "hl" : "gy")}>
              <b>{a.title}</b>
              <p>{a.body}</p>
              <time>{a.when}</time>
            </div>
          ))}
        </div>
      )}

      <div className="ai-card">
        <div className="ai-card-head">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
          </svg>
          Rekomendasi AI Untukmu
        </div>
        <div className="ai-note">{aiNote}</div>
        <Link className="btn btn-primary" href={ctaHref}>
          {ctaLabel}
        </Link>
      </div>
    </aside>
  );
}

export function TeacherRightbar({
  students,
  aiNote,
  announcements,
}: {
  students: StudentRow[];
  aiNote: string;
  announcements: Announcement[];
}) {
  return (
    <aside className="rightbar">
      <div className="rb-head">
        <h3>Rata Rata Per Siswa</h3>
        <Link className="link-underline" href="/teacher/students">
          Lihat Semua
        </Link>
      </div>
      <table className="rb-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th className="num">Rata Rata</th>
            <th className="st">Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.name}>
              <td>{s.name}</td>
              <td className="num">{s.avg}</td>
              <td className="st">
                <PillMean score={s.avg} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ai-card">
        <div className="ai-card-head">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
          </svg>
          Rekomendasi AI Untukmu
        </div>
        <div className="ai-note">{aiNote}</div>
        <Link className="btn btn-primary" href="/teacher/quiz">
          Buat Kuis
        </Link>
      </div>

      <div className="ann-card">
        <div className="rb-head" style={{ marginBottom: 4 }}>
          <h3>Pengumuman</h3>
          <Link className="link-underline" href="/teacher/announcements">
            Lihat Semua
          </Link>
        </div>
        {announcements.map((a) => (
          <div key={a.title} className={"ann-item " + (a.hl ? "hl" : "gy")}>
            <b>{a.title}</b>
            <p>{a.body}</p>
            <time>{a.when}</time>
          </div>
        ))}
      </div>
    </aside>
  );
}