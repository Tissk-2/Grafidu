"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { classAvg, useRoutedClass } from "@/lib/guru";
import { dummyGuruData } from "@/lib/guru-demo";
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
  id: number;
  nama: string;
  nilai: number[];
  rata: number;
  tuntas: boolean;
};

/**
 * Middle column only — the sidebar and rightbar come from the teacher layout.
 * Reads the active class, so switching class in the sidebar swaps the table
 * in place. Each student's `nilai` array lines up with the class's tugas
 * order (Tugas 1..4) in the dummy data.
 */
export default function TeacherGradesPage() {
  // Prototipe: guard role dimatikan supaya halaman bisa diakses tanpa login
  // sebagai guru. Kembalikan `useRequireUser("teacher")` sebelum production.
  const u = useRequireUser();
  const { kelas } = useRoutedClass();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("tertinggi");
  useTitle(`Grades ${kelas.kelas} — Grafidu`);

  const kkm = dummyGuruData.kkm;
  const avgKelas = classAvg(kelas);

  const rows = useMemo<Row[]>(() => {
    const all = kelas.dataMurid.map((m) => {
      const rata = Math.round(m.nilai.reduce((a, b) => a + b, 0) / m.nilai.length);
      return { id: m.id, nama: m.nama, nilai: m.nilai, rata, tuntas: rata >= kkm };
    });
    const q = query.trim().toLowerCase();
    const filtered = q ? all.filter((r) => r.nama.toLowerCase().includes(q)) : all;
    return filtered.sort((a, b) => {
      if (sort === "nama") return a.nama.localeCompare(b.nama);
      if (sort === "terendah") return a.rata - b.rata || a.nama.localeCompare(b.nama);
      return b.rata - a.rata || a.nama.localeCompare(b.nama);
    });
  }, [kelas, query, sort, kkm]);

  // Stat cards always describe the whole class, not the filtered subset.
  const stats = useMemo(() => {
    const tuntasFlags = kelas.dataMurid.map((m) => {
      const rata = Math.round(m.nilai.reduce((a, b) => a + b, 0) / m.nilai.length);
      return rata >= kkm;
    });
    const tuntas = tuntasFlags.filter(Boolean).length;
    return { tuntas, remedial: tuntasFlags.length - tuntas };
  }, [kelas, kkm]);

  if (!u) return <MainSkeleton />;

  const filtering = query.trim().length > 0;
  const colAvg = kelas.dataMurid.length
    ? kelas.dataMurid[0].nilai.map((_, i) =>
        Math.round(
          kelas.dataMurid.reduce((acc, m) => acc + (m.nilai[i] ?? 0), 0) / kelas.dataMurid.length,
        ),
      )
    : [];

  return (
    <>
      <BodySync dataPage="teacher-grades" />

      <header className="mb-5">
        <h1 className="text-[28px] leading-tight font-medium tracking-[-0.015em] text-[#111]">
          Grades
        </h1>
        <p className="mt-1 text-[14px] text-[#8A8A8A]">
          Rekap nilai siswa {kelas.kelas} terhadap KKM {kkm}.
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
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#AFAFAF]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari siswa…"
            aria-label="Cari siswa"
            className="h-11 w-full rounded-sm border border-[#E5E5E5] bg-white pr-4 pl-10 text-[14px] text-[#1A1A1A] transition outline-none placeholder:text-[#AFAFAF] focus:border-[#5B3FD6] focus:ring-2 focus:ring-[#5B3FD6]/15"
          />
        </div>

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Urutkan siswa"
            className="h-11 appearance-none rounded-sm border border-[#E5E5E5] bg-white pr-9 pl-3.5 text-[14px] text-[#222] transition outline-none focus:border-[#5B3FD6] focus:ring-2 focus:ring-[#5B3FD6]/15"
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
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#AFAFAF]"
          />
        </div>
      </div>

      {/* table */}
      {rows.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-[#E5E5E5] px-6 py-14 text-center">
          <p className="text-[15px] font-medium text-[#222]">Siswa tidak ditemukan</p>
          <p className="mt-1 text-[13px] text-[#8A8A8A]">
            Coba kata kunci lain atau pilih kelas berbeda.
          </p>
        </div>
      ) : (
        <>
          {filtering && (
            <p className="mt-5 text-[13px] text-[#8A8A8A]">
              Menampilkan{" "}
              <span className="font-medium tabular-nums text-[#222]">{rows.length}</span> dari{" "}
              <span className="tabular-nums">{kelas.dataMurid.length}</span> siswa
            </p>
          )}
          <div className="grade-table-wrap" style={{ marginTop: filtering ? 12 : 20 }}>
            <table className="sub-table">
              <thead>
                <tr>
                  <th className="c">No</th>
                  <th>Siswa</th>
                  {kelas.dataMurid[0]?.nilai.map((_, i) => (
                    <th key={i} className="c">
                      Tugas {i + 1}
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
                    Rata-rata Tugas
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
