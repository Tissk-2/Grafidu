"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { useRoutedClass } from "@/lib/guru";
import { fetchClassGradeRows } from "@/app/actions/teacher";
import { StatCard } from "@/components/ui/stat-card";
import MainSkeleton from "@/components/ui/main-skeleton";
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
  nilai: number[];
  rata: number;
  tuntas: boolean;
};

/**
 * Middle column only — the sidebar and rightbar come from the teacher layout.
 * Matriks nilai per siswa × mapel dari tabel grades (nilai terbaru per mapel),
 * bukan lagi per "Tugas 1..4" dummy. Kolom mengikuti mapel yang ada datanya.
 */
export default function TeacherGradesPage() {
  const u = useRequireUser("teacher");
  const { kelas } = useRoutedClass();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("tertinggi");
  const [cells, setCells] = useState<{ studentId: string; name: string; subject: string; score: number }[] | null>(null);
  useTitle(`Grades ${kelas?.name ?? ""} — Grafidu`);

  const classId = kelas?.id ?? null;
  const kkm = kelas?.kkm ?? 80;

  useEffect(() => {
    if (!classId) return;
    let cancelled = false;
    setCells(null);
    fetchClassGradeRows(classId).then((rows) => {
      if (!cancelled) setCells(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [classId]);

  // Pivot cells → baris siswa × kolom mapel (urut abjad).
  const { subjects, allRows } = useMemo(() => {
    if (!cells) return { subjects: [] as string[], allRows: [] as Row[] };
    const subjectSet = new Set<string>();
    const byStudent = new Map<string, { name: string; scores: Map<string, number> }>();
    for (const c of cells) {
      subjectSet.add(c.subject);
      let s = byStudent.get(c.studentId);
      if (!s) {
        s = { name: c.name, scores: new Map() };
        byStudent.set(c.studentId, s);
      }
      s.scores.set(c.subject, c.score);
    }
    const subs = [...subjectSet].sort((a, b) => a.localeCompare(b));
    const rows: Row[] = [...byStudent.entries()].map(([id, s]) => {
      const nilai = subs.map((sub) => s.scores.get(sub) ?? 0);
      const rata = nilai.length
        ? Math.round(nilai.reduce((a, b) => a + b, 0) / nilai.length)
        : 0;
      return { id, nama: s.name, nilai, rata, tuntas: rata >= kkm };
    });
    return { subjects: subs, allRows: rows };
  }, [cells, kkm]);

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

  // Rata-rata per kolom mapel.
  const colAvg = useMemo(
    () =>
      subjects.map((_, i) =>
        allRows.length
          ? Math.round(allRows.reduce((acc, r) => acc + (r.nilai[i] ?? 0), 0) / allRows.length)
          : 0,
      ),
    [subjects, allRows],
  );

  if (!u || !kelas || cells === null) return <MainSkeleton />;

  const filtering = query.trim().length > 0;

  return (
    <>
      <BodySync dataPage="teacher-grades" />

      <header className="mb-5">
        <h1 className="text-[28px] leading-tight font-medium tracking-[-0.015em] text-[#111] dark:text-[#F2F0F2]">
          Grades
        </h1>
        <p className="mt-1 text-[14px] text-[#8A8A8A] dark:text-[#8F8B91]">
          Rekap nilai siswa {kelas.name} terhadap KKM {kkm}.
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

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Urutkan siswa"
            className="h-11 appearance-none rounded-sm border border-[#E5E5E5] dark:border-[#2D2B30] bg-white dark:bg-[#1C1A1F] pr-9 pl-3.5 text-[14px] text-[#222] dark:text-[#EDEBF0] transition outline-none focus:border-[#5B3FD6] focus:ring-2 focus:ring-[#5B3FD6]/15"
          >
            {SORTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#AFAFAF] dark:text-[#6E6A73]"
          />
        </div>
      </div>

      {/* table */}
      {rows.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-[#E5E5E5] dark:border-[#2D2B30] px-6 py-14 text-center">
          <p className="text-[15px] font-medium text-[#222] dark:text-[#EDEBF0]">
            {allRows.length === 0 ? "Belum ada nilai" : "Siswa tidak ditemukan"}
          </p>
          <p className="mt-1 text-[13px] text-[#8A8A8A] dark:text-[#8F8B91]">
            {allRows.length === 0
              ? `Kelas ${kelas.name} belum punya nilai tercatat.`
              : "Coba kata kunci lain atau pilih kelas berbeda."}
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
            <table className="sub-table">
              <thead>
                <tr>
                  <th className="c">No</th>
                  <th>Siswa</th>
                  {subjects.map((s) => (
                    <th key={s} className="c">
                      {s}
                    </th>
                  ))}
                  <th className="c">Rata Rata</th>
                  <th className="act">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id}>
                    <td className="c">{i + 1}</td>
                    <td className="font-medium">{r.nama}</td>
                    {r.nilai.map((n, j) => (
                      <td key={j} className={"c tabular-nums" + (n < kkm ? " score-below" : "")}>
                        {n}
                      </td>
                    ))}
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
                    Rata-rata Mapel
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
    </>
  );
}
