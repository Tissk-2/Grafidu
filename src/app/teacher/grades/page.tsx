"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { useRoutedClass } from "@/lib/guru";
import { fetchClassGradeRows, fetchClassRoster, saveExamGrade } from "@/app/actions/teacher";
import { useTeacherShellData } from "../teacher-shell-data";
import { StatCard } from "@/components/ui/stat-card";
import MainSkeleton from "@/components/ui/main-skeleton";
import CustomSelect from "@/components/ui/custom-select";
import BodySync from "@/components/body-sync";

type Sort = "tertinggi" | "terendah" | "nama";

const SORTS: { value: Sort; label: string }[] = [
  { value: "tertinggi", label: "Rata-rata Tertinggi" },
  { value: "terendah", label: "Rata-rata Terendah" },
  { value: "nama", label: "Nama A–Z" },
];

type Row = {
  id: string;
  nama: string;
  /** Nilai per tugas (kolom 1..N) — 0 bila belum dinilai. */
  taskScores: number[];
  uts: number;
  uas: number;
  rata: number;
  tuntas: boolean;
};

/**
 * Buku nilai kelas (middle column only — sidebar/rightbar dari layout guru).
 * Semua siswa kelas selalu tampil; kolom = tugas guru ini (1..N) sesuai
 * urutan posisi + UTS + UAS. Nilai kosong tampil 0. Sel UTS/UAS bisa diklik
 * untuk mengisi nilai (saveExamGrade); kolom tugas terisi lewat penilaian
 * di halaman detail tugas.
 */
export default function TeacherGradesPage() {
  const u = useRequireUser("teacher");
  const { kelas } = useRoutedClass();
  const { tasks } = useTeacherShellData();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("tertinggi");
  const [roster, setRoster] = useState<{ id: string; name: string }[] | null>(null);
  const [cells, setCells] = useState<
    { studentId: string; taskId: string | null; kind: string; score: number }[] | null
  >(null);
  // UTS/UAS: sel yang sedang diedit { studentId, nama, kind, nilai awal }
  const [exam, setExam] = useState<{ studentId: string; nama: string; kind: "UTS" | "UAS"; score: number } | null>(null);
  const [savingExam, setSavingExam] = useState(false);
  useTitle(`Grades ${kelas?.name ?? ""} — Grafidu`);

  const classId = kelas?.id ?? null;
  const kkm = kelas?.kkm ?? 80;

  const load = useCallback(async () => {
    if (!classId) return;
    const [r, c] = await Promise.all([fetchClassRoster(classId, 0), fetchClassGradeRows(classId)]);
    setRoster(r.map((s) => ({ id: s.id, name: s.name })));
    setCells(c);
  }, [classId]);

  useEffect(() => {
    setRoster(null);
    setCells(null);
    load();
  }, [load]);

  // Pivot: seluruh siswa × (tugas 1..N + UTS + UAS), nilai kosong = 0.
  const { allRows, colAvg } = useMemo(() => {
    if (!roster || !cells) return { allRows: [] as Row[], colAvg: [] as number[] };
    const byKey = new Map(cells.map((c) => [`${c.studentId}|${c.taskId ?? c.kind}`, c.score]));
    const cols = tasks.length + 2; // + UTS + UAS
    const sums = new Array(cols).fill(0);

    const rows: Row[] = roster.map((s) => {
      const taskScores = tasks.map((t) => {
        const v = byKey.get(`${s.id}|${t.id}`) ?? 0;
        return v;
      });
      taskScores.forEach((v, i) => (sums[i] += v));
      const uts = byKey.get(`${s.id}|UTS`) ?? 0;
      const uas = byKey.get(`${s.id}|UAS`) ?? 0;
      sums[tasks.length] += uts;
      sums[tasks.length + 1] += uas;

      const values = [...taskScores, uts, uas];
      const rata = values.length
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : 0;
      return { id: s.id, nama: s.name, taskScores, uts, uas, rata, tuntas: rata >= kkm };
    });

    const n = roster.length || 1;
    return {
      allRows: rows,
      colAvg: sums.map((sum) => Math.round(sum / n)),
    };
  }, [roster, cells, tasks, kkm]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? allRows.filter((r) => r.nama.toLowerCase().includes(q)) : allRows;
    return [...filtered].sort((a, b) => {
      if (sort === "nama") return a.nama.localeCompare(b.nama);
      if (sort === "terendah") return a.rata - b.rata || a.nama.localeCompare(b.nama);
      return b.rata - a.rata || a.nama.localeCompare(b.nama);
    });
  }, [allRows, query, sort]);

  // Stat cards selalu menggambarkan seluruh kelas, bukan subset terfilter.
  const stats = useMemo(() => {
    const tuntas = allRows.filter((r) => r.tuntas).length;
    return { tuntas, remedial: allRows.length - tuntas };
  }, [allRows]);

  const avgKelas = allRows.length
    ? Math.round((allRows.reduce((a, r) => a + r.rata, 0) / allRows.length) * 10) / 10
    : 0;

  async function handleSaveExam() {
    if (!exam || savingExam || !classId) return;
    const score = Math.round(Number(exam.score));
    if (Number.isNaN(score) || score < 0 || score > 100) {
      window.gtoast?.("Nilai harus angka 0-100.", "error");
      return;
    }
    setSavingExam(true);
    try {
      await saveExamGrade(classId, exam.studentId, exam.kind, score);
      window.gtoast?.(`${exam.kind} ${exam.nama}: ${score} tersimpan.`);
      setExam(null);
      await load();
    } catch (err) {
      window.gtoast?.((err as Error).message, "error");
    } finally {
      setSavingExam(false);
    }
  }

  if (!u || !kelas || roster === null || cells === null) return <MainSkeleton />;

  const filtering = query.trim().length > 0;
  const cellCls = "c tabular-nums";

  return (
    <>
      <BodySync dataPage="teacher-grades" />

      <header className="mb-5">
        <h1 className="text-[28px] leading-tight font-medium tracking-[-0.015em] text-[#111] dark:text-[#F2F0F2]">
          Grades
        </h1>
        <p className="mt-1 text-[14px] text-[#8A8A8A] dark:text-[#8F8B91]">
          Buku nilai {kelas.name} — {tasks.length} tugas + UTS/UAS terhadap KKM {kkm}. Siswa tanpa
          nilai tercatat 0.
        </p>
      </header>

      <div className="stat-grid">
        <StatCard label="Rata Rata Kelas" value={avgKelas} tone="blue" />
        <StatCard label="Tuntas KKM" value={stats.tuntas} tone="green" />
        <StatCard label="Perlu Remedial" value={stats.remedial} tone="purple" />
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
            placeholder="Cari siswa…"
            aria-label="Cari siswa"
            className="h-11 w-full rounded-sm border border-[#E5E5E5] dark:border-[#2D2B30] bg-white dark:bg-[#1C1A1F] pr-4 pl-10 text-[14px] text-[#1A1A1A] dark:text-[#F2F0F2] transition outline-none placeholder:text-[#AFAFAF] dark:text-[#6E6A73] focus:border-[#5B3FD6] focus:ring-2 focus:ring-[#5B3FD6]/15"
          />
        </div>

        <div style={{ minWidth: 190 }}>
          <CustomSelect
            value={sort}
            onChange={(v) => setSort(v as Sort)}
            options={SORTS}
            ariaLabel="Urutkan siswa"
            placeholder="Urutkan"
          />
        </div>
      </div>

      {/* gradebook */}
      {roster.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-[#E5E5E5] dark:border-[#2D2B30] px-6 py-14 text-center">
          <p className="text-[15px] font-medium text-[#222] dark:text-[#EDEBF0]">Belum ada siswa</p>
          <p className="mt-1 text-[13px] text-[#8A8A8A] dark:text-[#8F8B91]">
            Pindahkan atau buat akun siswa untuk {kelas.name} lewat panel admin.
          </p>
        </div>
      ) : (
        <>
          {filtering && (
            <p className="mt-5 text-[13px] text-[#8A8A8A] dark:text-[#8F8B91]">
              Menampilkan{" "}
              <span className="font-medium tabular-nums text-[#222] dark:text-[#EDEBF0]">{rows.length}</span> dari{" "}
              <span className="tabular-nums">{allRows.length}</span> siswa
            </p>
          )}
          <div className="grade-table-wrap" style={{ marginTop: filtering ? 12 : 20 }}>
            <table className="sub-table" style={{ minWidth: 640 + tasks.length * 64 }}>
              <thead>
                <tr>
                  <th className="c">No</th>
                  <th>Siswa</th>
                  {tasks.map((t, i) => (
                    <th key={t.id} className="c" title={t.title}>
                      {i + 1}
                    </th>
                  ))}
                  <th className="c" title="Ujian Tengah Semester">UTS</th>
                  <th className="c" title="Ujian Akhir Semester">UAS</th>
                  <th className="c">Rata Rata</th>
                  <th className="act">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id}>
                    <td className="c">{i + 1}</td>
                    <td className="font-medium">{r.nama}</td>
                    {r.taskScores.map((n, j) => (
                      <td key={j} className={cellCls + (n < kkm ? " score-below" : "")}>
                        {n}
                      </td>
                    ))}
                    <td className={cellCls + (r.uts < kkm ? " score-below" : "")}>
                      <button
                        type="button"
                        onClick={() => setExam({ studentId: r.id, nama: r.nama, kind: "UTS", score: r.uts })}
                        title="Klik untuk mengisi nilai UTS"
                        className="inline-grid size-7 place-items-center rounded hover:bg-[var(--purple-soft)] hover:text-[var(--purple)]"
                      >
                        {r.uts}
                      </button>
                    </td>
                    <td className={cellCls + (r.uas < kkm ? " score-below" : "")}>
                      <button
                        type="button"
                        onClick={() => setExam({ studentId: r.id, nama: r.nama, kind: "UAS", score: r.uas })}
                        title="Klik untuk mengisi nilai UAS"
                        className="inline-grid size-7 place-items-center rounded hover:bg-[var(--purple-soft)] hover:text-[var(--purple)]"
                      >
                        {r.uas}
                      </button>
                    </td>
                    <td className="c">
                      <span className="inline-flex items-center gap-2">
                        <b className="tabular-nums">{r.rata}</b>
                        <span className="score-bar" aria-hidden>
                          <span style={{ width: `${Math.min(100, r.rata)}%` }} />
                        </span>
                      </span>
                    </td>
                    <td className="act">
                      <span className={"pill " + (r.tuntas ? "pill-green" : "pill-red")}>
                        {r.tuntas ? "Tuntas" : "Remedial"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="c"></td>
                  <td className="text-[12.5px] font-medium tracking-wide text-[var(--gray-3)] uppercase">
                    Rata-rata
                  </td>
                  {colAvg.map((n, i) => (
                    <td key={i} className="c tabular-nums">
                      {n}
                    </td>
                  ))}
                  <td className="c">
                    <b className="tabular-nums text-[var(--purple)]">{avgKelas}</b>
                  </td>
                  <td className="act"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {/* Dialog isi nilai UTS/UAS */}
      <dialog
        className="gdialog"
        open={exam !== null}
        onClick={(e) => {
          if (e.target === e.currentTarget) setExam(null);
        }}
      >
        {exam && (
          <>
            <div className="gdialog-head">
              <div>
                <h3>{exam.kind} — {exam.nama}</h3>
                <p>Nilai {exam.kind} 0-100. Kosong dianggap 0.</p>
              </div>
              <button className="gdialog-close" aria-label="Tutup" onClick={() => setExam(null)}>
                <X size={14} aria-hidden />
              </button>
            </div>
            <form
              className="gdialog-body"
              style={{ paddingBottom: 0 }}
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveExam();
              }}
            >
              <div className="field-d">
                <label htmlFor="exam-score">Nilai {exam.kind}</label>
                <div className="control">
                  <input
                    id="exam-score"
                    type="number"
                    min={0}
                    max={100}
                    value={exam.score}
                    onChange={(e) => setExam({ ...exam, score: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="gdialog-foot">
                <button className="btn btn-outline btn-sm" type="button" onClick={() => setExam(null)}>
                  Batal
                </button>
                <button className="btn btn-primary btn-sm" type="submit" disabled={savingExam}>
                  {savingExam ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </>
        )}
      </dialog>
    </>
  );
}
