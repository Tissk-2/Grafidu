"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { avgOf } from "@/lib/student-model";
import { fetchStudentQuizzes } from "@/app/actions/student";
import type { StudentQuiz } from "@/lib/student-model";
import { fmtDate } from "@/lib/format";
import { StatCard } from "@/components/ui/stat-card";
import PageSkeleton from "@/components/ui/page-skeleton";
import CustomSelect from "@/components/ui/custom-select";
import BodySync from "@/components/body-sync";
import { useStudentShellData } from "../student-shell-data";

type Filter = "semua" | "dinilai" | "belum";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "semua", label: "Semua Tugas" },
  { value: "dinilai", label: "Sudah Dinilai" },
  { value: "belum", label: "Belum Dinilai" },
];

/** Pill per task grade. Threshold 70 follows the rest of the student side. */
function gradePill(grade: number | null): { cls: string; label: string } {
  if (grade == null) return { cls: "pill-gray", label: "Belum Dinilai" };
  if (grade < 70) return { cls: "pill-red", label: "Perlu Fokus" };
  return { cls: "pill-green", label: "Bagus" };
}

/**
 * Middle column only — the sidebar and rightbar come from the student layout.
 * Reads the shell's shared data (fetched once per load, stays mounted across
 * navigation) instead of re-querying tasks + grades on every visit.
 */
export default function StudentGradesPage() {
  const u = useRequireUser("student");
  const shell = useStudentShellData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("semua");
  const [quizzes, setQuizzes] = useState<StudentQuiz[] | null>(null);
  useTitle("Grades — Grafidu");

  useEffect(() => {
    if (!u) return;
    let cancelled = false;
    fetchStudentQuizzes().then((rows) => {
      if (!cancelled) setQuizzes(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [u]);

  const tasks = useMemo(() => shell?.schoolTasks ?? [], [shell]);
  const subjects = shell?.subjects ?? [];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (filter === "dinilai" && t.grade == null) return false;
        if (filter === "belum" && t.grade != null) return false;
        return !q || t.title.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.dueAt).getTime() - new Date(a.dueAt).getTime());
  }, [tasks, query, filter]);

  if (!u || !shell) return <PageSkeleton />;

  const graded = tasks.filter((t) => t.grade != null);
  const taskAvg = graded.length
    ? Math.round(graded.reduce((acc, t) => acc + (t.grade ?? 0), 0) / graded.length)
    : null;
  const avgSubject = avgOf(subjects);
  const filtering = query.trim().length > 0 || filter !== "semua";

  return (
    <>
      <BodySync dataPage="student-grades" />

      <header>
        <h1 className="text-[28px] leading-tight font-medium tracking-[-0.015em] text-[#111] dark:text-[#F2F0F2]">
          Grades
        </h1>
        <p className="mt-1 text-[14px] text-[#8A8A8A] dark:text-[#8F8B91]">
          Rekap nilai tiap tugasmu{u.className ? ` di ${u.className}` : ""}.
        </p>
      </header>

      <div className="stat-grid">
        <StatCard label="Rata-rata Tugas" value={taskAvg ?? "-"} tone="blue" />
        <StatCard label="Tugas Dinilai" value={graded.length} tone="green" />
        <StatCard label="Rata-rata Mapel" value={avgSubject || "-"} tone="purple" />
      </div>

      {/* toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1">
          <Search
            size={16}
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#AFAFAF] dark:text-[#6E6A73]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari tugas…"
            aria-label="Cari tugas"
            className="h-11 w-full rounded-sm border border-[#E5E5E5] dark:border-[#2D2B30] bg-white dark:bg-[#1C1A1F] pr-4 pl-10 text-[14px] text-[#1A1A1A] dark:text-[#F2F0F2] transition outline-none placeholder:text-[#AFAFAF] dark:text-[#6E6A73] focus:border-[#5B3FD6] focus:ring-2 focus:ring-[#5B3FD6]/15"
          />
        </div>

        <div style={{ minWidth: 170 }}>
          <CustomSelect
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
            options={FILTERS}
            ariaLabel="Filter nilai"
            placeholder="Semua Tugas"
          />
        </div>
      </div>

      {/* table */}
      {tasks.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-[#E5E5E5] dark:border-[#2D2B30] px-6 py-14 text-center">
          <p className="text-[15px] font-medium text-[#222] dark:text-[#EDEBF0]">Belum ada tugas</p>
          <p className="mt-1 text-[13px] text-[#8A8A8A] dark:text-[#8F8B91]">
            Nilai per tugas akan muncul di sini begitu gurumu membagikan tugas.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-[#E5E5E5] dark:border-[#2D2B30] px-6 py-14 text-center">
          <p className="text-[15px] font-medium text-[#222] dark:text-[#EDEBF0]">Tugas tidak ditemukan</p>
          <p className="mt-1 text-[13px] text-[#8A8A8A] dark:text-[#8F8B91]">Coba kata kunci atau filter lain.</p>
        </div>
      ) : (
        <>
          {filtering && (
            <p className="mt-5 text-[13px] text-[#8A8A8A] dark:text-[#8F8B91]">
              Menampilkan <span className="font-medium tabular-nums text-[#222] dark:text-[#EDEBF0]">{rows.length}</span>{" "}
              dari <span className="tabular-nums">{tasks.length}</span> tugas
            </p>
          )}
          <div className="grade-table-wrap" style={{ marginTop: filtering ? 12 : 20 }}>
            <table className="sub-table">
              <thead>
                <tr>
                  <th className="c">No</th>
                  <th>Tugas</th>
                  <th>Mapel</th>
                  <th>Tenggat</th>
                  <th className="c">Nilai</th>
                  <th className="act">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t, i) => {
                  const pill = gradePill(t.grade);
                  return (
                    <tr key={t.id}>
                      <td className="c">{i + 1}</td>
                      <td className="font-medium">{t.title}</td>
                      <td>{t.subject || "Umum"}</td>
                      <td>{fmtDate(t.dueAt)}</td>
                      <td className="c">
                        {t.grade != null ? (
                          <span className="inline-flex items-center gap-2">
                            <b className="tabular-nums">{t.grade}</b>
                            <span className="score-bar" aria-hidden>
                              <span style={{ width: `${Math.min(100, t.grade)}%` }} />
                            </span>
                          </span>
                        ) : (
                          <span className="text-[var(--gray-4)]">—</span>
                        )}
                      </td>
                      <td className="act">
                        <span className={"pill " + pill.cls}>{pill.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {taskAvg != null && (
                <tfoot>
                  <tr>
                    <td className="c"></td>
                    <td
                      colSpan={4}
                      className="text-[12.5px] font-medium tracking-wide text-[var(--gray-3)] uppercase"
                    >
                      Rata-rata Nilai Tugas
                    </td>
                    <td className="act">
                      <b className="tabular-nums text-[var(--purple)]">{taskAvg}</b>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}

      {/* quiz grades (#6): nilai kuis yang sudah dikerjakan */}
      {quizzes === null ? null : quizzes.length > 0 ? (
        <div style={{ marginTop: 26 }}>
          <div className="sec-row" style={{ marginBottom: 12 }}>
            <h2 className="h2" style={{ margin: 0 }}>Nilai Kuis</h2>
            <span style={{ fontSize: 13, color: "var(--gray-4)" }}>
              {quizzes.filter((q) => q.attempt).length} dari {quizzes.length} kuis dikerjakan
            </span>
          </div>
          <div className="grade-table-wrap">
            <table className="sub-table">
              <thead>
                <tr>
                  <th className="c">No</th>
                  <th>Kuis</th>
                  <th>Mapel</th>
                  <th className="c">Soal</th>
                  <th className="c">Nilai</th>
                  <th className="act">Status</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((q, i) => (
                  <tr key={q.id}>
                    <td className="c">{i + 1}</td>
                    <td className="font-medium">{q.title}</td>
                    <td>{q.subject || "Umum"}</td>
                    <td className="c tabular-nums">{q.numQuestions}</td>
                    <td className="c">
                      {q.attempt ? (
                        <span className="inline-flex items-center gap-2">
                          <b className="tabular-nums">{q.attempt.score}</b>
                          <span className="score-bar" aria-hidden>
                            <span style={{ width: `${Math.min(100, q.attempt.score)}%` }} />
                          </span>
                        </span>
                      ) : (
                        <span className="text-[var(--gray-4)]">—</span>
                      )}
                    </td>
                    <td className="act">
                      <span className={"pill " + (q.attempt ? "pill-green" : "pill-gray")}>
                        {q.attempt ? `Dikerjakan ${fmtDate(q.attempt.submittedAt)}` : "Belum Dikerjakan"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* subject averages */}
      {subjects.length > 0 && (
        <div className="set-card" style={{ marginTop: 26 }}>
          <h3>Rata-rata per Mapel</h3>
          <p className="sub">Gabungan semua nilai yang sudah dinilai gurumu.</p>
          <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
            {subjects.map((s) => (
              <div key={s.subject} className="flex items-center gap-4">
                <span className="w-40 shrink-0 truncate text-[14px] font-medium text-[#222] dark:text-[#EDEBF0]">
                  {s.subject}
                </span>
                <span className="score-bar" style={{ width: 140 }} aria-hidden>
                  <span style={{ width: `${Math.min(100, s.score)}%` }} />
                </span>
                <b className="tabular-nums text-[15px]">{s.score}</b>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
