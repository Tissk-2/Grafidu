"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, ChevronLeft, ClipboardCheck, Clock, FileText, Search, X } from "lucide-react";
import { useTitle } from "@/lib/hooks";
import { fetchTask, fetchTaskSubmissions, saveGrade } from "@/app/actions/teacher";
import { useTeacherShellData } from "../../teacher-shell-data";
import { fmtDate } from "@/lib/format";
import type { SubmissionRow, TaskDetail } from "@/lib/teacher-model";
import BodySync from "@/components/body-sync";

/**
 * Teacher task detail: description, submission progress, and who has or has not
 * handed in — semuanya live dari tabel tasks/task_statuses. Grade button
 * membuka dialog penilaian yang menyimpan ke database (saveGrade).
 *
 * Middle column only — the sidebar, rightbar and floating nav come from the
 * teacher layout, so switching class or page keeps them mounted.
 */

/** One submission joined to the roster, ready to render. */
type Row = { no: number; nama: string; tanggal: string; sub: SubmissionRow };

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative mt-3">
      <Search
        size={16}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#AAA] dark:text-[#6E6A73]"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[45px] w-full rounded border border-[#CCC] dark:border-[#333136] bg-white dark:bg-[#1C1A1F] pr-4 pl-[46px] text-[15px] text-[#222] dark:text-[#EDEBF0] outline-none placeholder:text-[#AAA] dark:text-[#6E6A73] focus:border-[#5B48D0]"
      />
    </div>
  );
}

export default function TeacherTaskDetailPage() {
  const params = useParams<{ id: string }>();
  const taskId = params?.id ?? "";
  const { roster } = useTeacherShellData();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [subs, setSubs] = useState<SubmissionRow[] | null>(null);
  const [qDone, setQDone] = useState("");
  const [qMiss, setQMiss] = useState("");
  const [grading, setGrading] = useState<SubmissionRow | null>(null);
  const [scoreInput, setScoreInput] = useState(85);
  const [feedbackInput, setFeedbackInput] = useState("");
  const [saving, setSaving] = useState(false);

  useTitle(task ? `${task.title} — Grafidu` : "Detail Tugas — Grafidu");

  const loadSubs = useCallback(() => {
    fetchTaskSubmissions(taskId).then((rows) => setSubs(rows));
  }, [taskId]);

  useEffect(() => {
    let cancelled = false;
    setTask(null);
    setSubs(null);
    fetchTask(taskId).then((t) => {
      if (!cancelled) setTask(t);
    });
    loadSubs();
    return () => {
      cancelled = true;
    };
  }, [taskId, loadSubs]);

  const doneSubs = useMemo(() => (subs ?? []).filter((s) => s.done), [subs]);

  const { rowsDone, rowsMiss } = useMemo(() => {
    const done = doneSubs.map((s, i) => ({
      no: i + 1,
      nama: s.name,
      tanggal: s.submittedAt ? fmtDate(s.submittedAt) : "—",
      sub: s,
    }));
    const doneIds = new Set(doneSubs.map((s) => s.studentId));
    const miss = roster
      .filter((m) => !doneIds.has(m.id))
      .map((m, i) => ({
        no: i + 1,
        nama: m.name,
        tanggal: "",
        sub: null as unknown as SubmissionRow,
      }));
    return { rowsDone: done, rowsMiss: miss };
  }, [doneSubs, roster]);

  if (!task) {
    return (
      <div className="empty-state mt-10 block">
        <b>{subs === null ? "Memuat tugas…" : "Tugas tidak ditemukan"}</b>
        <span>
          {subs === null
            ? "Mengambil data tugas dari database."
            : "Tugas tersebut tidak ada di amanahmu."}
        </span>
        <Link href="/teacher/tasks" className="link-underline mt-3 inline-block">
          Kembali ke Daftar Tugas
        </Link>
      </div>
    );
  }

  const total = roster.length;
  const done = doneSubs.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const match = (r: Row, q: string) => r.nama.toLowerCase().includes(q.trim().toLowerCase());
  const shownDone = rowsDone.filter((r) => match(r, qDone));
  const shownMiss = rowsMiss.filter((r) => match(r, qMiss));

  const cols = "w-[42px] w-[187px] w-[200px]";

  function openGrade(sub: SubmissionRow) {
    setGrading(sub);
    setScoreInput(sub.grade ?? 85);
    setFeedbackInput(sub.feedback ?? "");
  }

  async function handleSaveGrade() {
    if (!grading || saving) return;
    const score = Math.max(0, Math.min(100, Math.round(Number(scoreInput))));
    if (Number.isNaN(score)) {
      window.gtoast?.("Nilai harus angka 0-100.", "error");
      return;
    }
    setSaving(true);
    try {
      await saveGrade(grading.id, score, feedbackInput.trim());
      window.gtoast?.("Nilai disimpan.");
      setGrading(null);
      loadSubs();
    } catch (err) {
      window.gtoast?.((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <BodySync dataPage="teacher-task-detail" />

      {/* 3.1 breadcrumb */}
      <nav className="flex items-center gap-2 text-[15px]">
        <Link
          href="/teacher/tasks"
          className="flex items-center gap-1 font-medium text-[#222] dark:text-[#EDEBF0] hover:text-[#5B48D0] dark:text-[#A78BFA]"
        >
          <ChevronLeft size={16} aria-hidden />
          Daftar Tugas
        </Link>
        <span className="text-[#999] dark:text-[#716D73]">/</span>
        <span className="text-[#999] dark:text-[#716D73]">Detail Tugas</span>
      </nav>

      {/* 3.2 header */}
      <header className="mt-4.5 flex items-center gap-3.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#E9DDFB] text-[#5B3FD6] dark:text-[#A78BFA]">
          <ClipboardCheck size={22} aria-hidden />
        </span>
        <h1 className="text-[32px] leading-tight font-medium tracking-[-0.01em] text-[#111] dark:text-[#F2F0F2]">
          {task.title}
        </h1>
      </header>

      {/* 3.3 meta row */}
      <p className="mt-2.5 flex flex-wrap items-center gap-2 text-[14px] text-[#666] dark:text-[#A9A5AB]">
        <span className="flex items-center gap-2">
          <Calendar size={16} aria-hidden className="text-[#888] dark:text-[#8F8B91]" />
          Ditugaskan {fmtDate(task.assignedAt)}
        </span>
        <span className="px-1 text-[#999] dark:text-[#716D73]">•</span>
        <span className="flex items-center gap-2">
          <Clock size={16} aria-hidden className="text-[#888] dark:text-[#8F8B91]" />
          Tenggat: {fmtDate(task.dueAt)}
        </span>
      </p>

      {/* 3.4 progress + divider */}
      <section className="mt-8">
        <div className="text-[14px] font-medium text-[#222] dark:text-[#EDEBF0]">Progres Pengumpulan</div>
        <div className="flex items-center gap-5">
          <div className="flex-1">
            <div className="mt-2 h-[7px] w-full overflow-hidden rounded-full bg-[#E6E3F8]">
              <div className="h-full rounded-full bg-[#5B3FD6]" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="w-10 text-right text-[14px] text-[#222] dark:text-[#EDEBF0] whitespace-nowrap">
            {done} / {total}
          </div>
        </div>
        <div className="mt-6 h-px w-full bg-[#E5E5E5] dark:bg-[#333136]" />
      </section>

      {/* 3.5 description */}
      <section className="mt-6">
        <h2 className="text-[12px] font-medium tracking-[0.05em] text-[#888] dark:text-[#8F8B91] uppercase">
          Deskripsi Tugas
        </h2>
        <p className="mt-3 text-[15px] leading-[1.63] text-[#555] dark:text-[#A9A5AB]">{task.description}</p>
        {task.material ? (
          <a
            href={task.material.url ?? "#"}
            target={task.material.url?.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="task-material-link mt-4"
          >
            <FileText size={14} aria-hidden />
            Lampiran: {task.material.title}
          </a>
        ) : null}
      </section>

      {/* 3.6 submitted */}
      <section className="mt-10.5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2.5 text-[17px] font-medium text-[#222] dark:text-[#EDEBF0]">
            <span className="size-2.5 rounded-full bg-[#16A34A]" />
            Sudah Mengumpulkan
          </h2>
          <span className="text-[14px] text-[#888] dark:text-[#8F8B91]">{done} siswa</span>
        </div>

        <SearchField value={qDone} onChange={setQDone} placeholder="Cari Siswa…" />

        <table className="mt-3.5 w-full table-fixed border border-[#DDD] dark:border-[#2D2B30] rounded border-separate border-spacing-0">
          <colgroup>
            <col className={cols.split(" ")[0]} />
            <col className={cols.split(" ")[1]} />
            <col className={cols.split(" ")[2]} />
            <col />
          </colgroup>
          <thead>
            <tr className="h-7 bg-[#F2F2F2] dark:bg-[#2A282D] text-[12px] tracking-[0.04em] text-[#888] dark:text-[#8F8B91] uppercase">
              <th className="px-3.5 text-left font-medium">No</th>
              <th className="px-3.5 text-left font-medium">Siswa</th>
              <th className="px-3.5 text-left font-medium">Turned In Date</th>
              <th className="px-3.5 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {shownDone.map((r) => (
              <tr key={r.sub.id} className="h-11 border-t border-[#E5E5E5] dark:border-[#2D2B30] text-[15px]">
                <td className="px-3.5 text-[#888] dark:text-[#8F8B91]">{r.no}</td>
                <td className="px-3.5 font-medium text-[#222] dark:text-[#EDEBF0]">
                  {r.nama}
                  {r.sub.grade != null && (
                    <span className="ml-2 text-[12px] tabular-nums text-[#5B3FD6] dark:text-[#A78BFA]">
                      {r.sub.grade}
                    </span>
                  )}
                </td>
                <td className="px-3.5 text-[#555] dark:text-[#A9A5AB]">{r.tanggal}</td>
                <td className="px-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => openGrade(r.sub)}
                    className="h-[34px] w-[74px] rounded bg-[#5B48D0] text-[14px] font-medium text-white hover:bg-[#4a3ab5]"
                  >
                    Grade
                  </button>
                </td>
              </tr>
            ))}
            {shownDone.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3.5 py-8 text-center text-[14px] text-[#999] dark:text-[#716D73]">
                  Tidak ada siswa yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* 3.7 not submitted */}
      <section className="mt-[42px] pb-40">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2.5 text-[17px] font-medium text-[#222] dark:text-[#EDEBF0]">
            <span className="size-2.5 rounded-full bg-[#B91C1C]" />
            Belum Mengumpulkan
          </h2>
          <span className="text-[14px] text-[#888] dark:text-[#8F8B91]">{rowsMiss.length} siswa</span>
        </div>

        <SearchField value={qMiss} onChange={setQMiss} placeholder="Cari Siswa…" />

        <table className="mt-3.5 w-full table-fixed border border-[#DDD] dark:border-[#2D2B30] rounded border-separate border-spacing-0">
          <colgroup>
            <col className={cols.split(" ")[0]} />
            <col className={cols.split(" ")[1]} />
            <col className={cols.split(" ")[2]} />
            <col />
          </colgroup>
          <thead>
            <tr className="h-7 bg-[#F2F2F2] dark:bg-[#2A282D] text-[12px] tracking-[0.04em] text-[#888] dark:text-[#8F8B91] uppercase">
              <th className="px-3.5 text-left font-medium">No</th>
              <th className="px-3.5 text-left font-medium">Siswa</th>
              <th className="px-3.5 text-left font-medium">Keterangan</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {shownMiss.map((r) => (
              <tr key={r.nama} className="h-11 border-t border-[#E5E5E5] dark:border-[#2D2B30] text-[15px]">
                <td className="px-3.5 text-[#888] dark:text-[#8F8B91]">{r.no}</td>
                <td className="px-3.5 font-medium text-[#222] dark:text-[#EDEBF0]">{r.nama}</td>
                <td className="px-3.5 text-[#999] dark:text-[#716D73]">Belum mengumpulkan</td>
                <td />
              </tr>
            ))}
            {shownMiss.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3.5 py-8 text-center text-[14px] text-[#999] dark:text-[#716D73]">
                  {rowsMiss.length === 0
                    ? "Semua siswa sudah mengumpulkan."
                    : "Tidak ada siswa yang cocok."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Grade dialog */}
      <dialog
        className="gdialog"
        open={grading !== null}
        onClick={(e) => {
          if (e.target === e.currentTarget) setGrading(null);
        }}
      >
        {grading && (
          <>
            <div className="gdialog-head">
              <div>
                <h3>Nilai — {grading.name}</h3>
                <p>Beri nilai 0-100 dan umpan balik untuk tugas ini.</p>
              </div>
              <button className="gdialog-close" aria-label="Tutup" onClick={() => setGrading(null)}>
                <X size={14} aria-hidden />
              </button>
            </div>
            <form
              className="gdialog-body"
              style={{ paddingBottom: 0 }}
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveGrade();
              }}
            >
              <div className="f2">
                <div className="field-d">
                  <label htmlFor="grade-score">Nilai</label>
                  <div className="control">
                    <input
                      id="grade-score"
                      type="number"
                      min={0}
                      max={100}
                      value={scoreInput}
                      onChange={(e) => setScoreInput(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
                <div className="field-d">
                  <label htmlFor="grade-feedback">Umpan Balik</label>
                  <div className="control">
                    <input
                      id="grade-feedback"
                      type="text"
                      placeholder="Contoh: Analisisnya bagus, perjelas kesimpulan."
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="gdialog-foot">
                <button
                  className="btn btn-outline btn-sm"
                  type="button"
                  onClick={() => setGrading(null)}
                >
                  Batal
                </button>
                <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan Nilai"}
                </button>
              </div>
            </form>
          </>
        )}
      </dialog>
    </>
  );
}
