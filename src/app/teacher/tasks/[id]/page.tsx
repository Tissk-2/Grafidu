"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, ChevronLeft, ClipboardCheck, Clock, Search } from "lucide-react";
import { useRoutedClass } from "@/lib/guru";
import { useTitle } from "@/lib/hooks";
import BodySync from "@/components/body-sync";

/**
 * Teacher task detail: description, submission progress, and who has or has not
 * handed in. The class comes from the section shell (sidebar / URL / stored
 * choice) rather than the route, because task ids repeat per class.
 *
 * Middle column only — the sidebar, rightbar and floating nav come from the
 * teacher layout, so switching class or page keeps them mounted.
 */

/** One submission joined to the roster, ready to render. */
type Row = { no: number; nama: string; tanggal: string };

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
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#AAA]"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[45px] w-full rounded border border-[#CCC] bg-white pr-4 pl-[46px] text-[15px] text-[#222] outline-none placeholder:text-[#AAA] focus:border-[#5B48D0]"
      />
    </div>
  );
}

export default function TeacherTaskDetailPage() {
  const params = useParams<{ id: string }>();
  const { kelas } = useRoutedClass();
  const [qDone, setQDone] = useState("");
  const [qMiss, setQMiss] = useState("");

  const task = kelas.tugas.find((t) => t.id === Number(params?.id));
  useTitle(task ? `${task.name} — Grafidu` : "Detail Tugas — Grafidu");

  const { rowsDone, rowsMiss } = useMemo(() => {
    if (!task) return { rowsDone: [] as Row[], rowsMiss: [] as Row[] };
    const roster = new Map(kelas.dataMurid.map((m) => [m.id, m.nama]));
    const done = task.pengumpulan.map((p, i) => ({
      no: i + 1,
      nama: roster.get(p.muridId) ?? "—",
      tanggal: p.tanggal,
    }));
    const doneIds = new Set(task.pengumpulan.map((p) => p.muridId));
    const miss = kelas.dataMurid
      .filter((m) => !doneIds.has(m.id))
      .map((m, i) => ({ no: i + 1, nama: m.nama, tanggal: "" }));
    return { rowsDone: done, rowsMiss: miss };
  }, [task, kelas.dataMurid]);

  if (!task) {
    return (
      <div className="empty-state mt-10 block">
        <b>Tugas tidak ditemukan</b>
        <span>Kelas {kelas.kelas} tidak punya tugas dengan id tersebut.</span>
        <Link href="/teacher/tasks" className="link-underline mt-3 inline-block">
          Kembali ke Daftar Tugas
        </Link>
      </div>
    );
  }

  const total = kelas.totalMurid;
  const done = task.muridSelesai;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const match = (r: Row, q: string) => r.nama.toLowerCase().includes(q.trim().toLowerCase());
  const shownDone = rowsDone.filter((r) => match(r, qDone));
  const shownMiss = rowsMiss.filter((r) => match(r, qMiss));

  const cols = "w-[42px] w-[187px] w-[200px]";

  return (
    <>
      <BodySync dataPage="teacher-task-detail" />

      {/* 3.1 breadcrumb */}
      <nav className="flex items-center gap-2 text-[15px]">
        <Link
          href="/teacher/tasks"
          className="flex items-center gap-1 font-medium text-[#222] hover:text-[#5B48D0]"
        >
          <ChevronLeft size={16} aria-hidden />
          Daftar Tugas
        </Link>
        <span className="text-[#999]">/</span>
        <span className="text-[#999]">Detail Tugas</span>
      </nav>

      {/* 3.2 header */}
      <header className="mt-4.5 flex items-center gap-3.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#E9DDFB] text-[#5B3FD6]">
          <ClipboardCheck size={22} aria-hidden />
        </span>
        <h1 className="text-[32px] leading-tight font-medium tracking-[-0.01em] text-[#111]">
          {task.name}
        </h1>
      </header>

      {/* 3.3 meta row */}
      <p className="mt-2.5 flex flex-wrap items-center gap-2 text-[14px] text-[#666]">
        <span className="flex items-center gap-2">
          <Calendar size={16} aria-hidden className="text-[#888]" />
          Ditugaskan {task.ditugaskan}
        </span>
        <span className="px-1 text-[#999]">•</span>
        <span className="flex items-center gap-2">
          <Clock size={16} aria-hidden className="text-[#888]" />
          Tenggat: {task.deadline}
        </span>
      </p>

      {/* 3.4 progress + divider */}
      <section className="mt-8">
        <div className="text-[14px] font-medium text-[#222]">Progres Pengumpulan</div>
        <div className="flex items-center gap-5">
          <div className="flex-1">
            <div className="mt-2 h-[7px] w-full overflow-hidden rounded-full bg-[#E6E3F8]">
              <div className="h-full rounded-full bg-[#5B3FD6]" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="w-10 text-right text-[14px] text-[#222] whitespace-nowrap">
            {done} / {total}
          </div>
        </div>
        <div className="mt-6 h-px w-full bg-[#E5E5E5]" />
      </section>

      {/* 3.5 description */}
      <section className="mt-6">
        <h2 className="text-[12px] font-medium tracking-[0.05em] text-[#888] uppercase">
          Deskripsi Tugas
        </h2>
        <p className="mt-3 text-[15px] leading-[1.63] text-[#555]">{task.deskripsi}</p>
      </section>

      {/* 3.6 submitted */}
      <section className="mt-10.5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2.5 text-[17px] font-medium text-[#222]">
            <span className="size-2.5 rounded-full bg-[#16A34A]" />
            Sudah Mengumpulkan
          </h2>
          <span className="text-[14px] text-[#888]">{done} siswa</span>
        </div>

        <SearchField value={qDone} onChange={setQDone} placeholder="Cari Siswa…" />

        <table className="mt-3.5 w-full table-fixed border border-[#DDD] rounded border-separate border-spacing-0">
          <colgroup>
            <col className={cols.split(" ")[0]} />
            <col className={cols.split(" ")[1]} />
            <col className={cols.split(" ")[2]} />
            <col />
          </colgroup>
          <thead>
            <tr className="h-7 bg-[#F2F2F2] text-[12px] tracking-[0.04em] text-[#888] uppercase">
              <th className="px-3.5 text-left font-medium">No</th>
              <th className="px-3.5 text-left font-medium">Siswa</th>
              <th className="px-3.5 text-left font-medium">Turned In Date</th>
              <th className="px-3.5 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {shownDone.map((r) => (
              <tr key={r.nama} className="h-11 border-t border-[#E5E5E5] text-[15px]">
                <td className="px-3.5 text-[#888]">{r.no}</td>
                <td className="px-3.5 font-medium text-[#222]">{r.nama}</td>
                <td className="px-3.5 text-[#555]">{r.tanggal}</td>
                <td className="px-3.5 text-right">
                  {/* TODO: wire to the grading flow — the dialog is not built yet. */}
                  <button
                    type="button"
                    className="h-[34px] w-[74px] rounded bg-[#5B48D0] text-[14px] font-medium text-white hover:bg-[#4a3ab5]"
                  >
                    Grade
                  </button>
                </td>
              </tr>
            ))}
            {shownDone.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3.5 py-8 text-center text-[14px] text-[#999]">
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
          <h2 className="flex items-center gap-2.5 text-[17px] font-medium text-[#222]">
            <span className="size-2.5 rounded-full bg-[#B91C1C]" />
            Belum Mengumpulkan
          </h2>
          <span className="text-[14px] text-[#888]">{rowsMiss.length} siswa</span>
        </div>

        <SearchField value={qMiss} onChange={setQMiss} placeholder="Cari Siswa…" />

        <table className="mt-3.5 w-full table-fixed border border-[#DDD] rounded border-separate border-spacing-0">
          <colgroup>
            <col className={cols.split(" ")[0]} />
            <col className={cols.split(" ")[1]} />
            <col className={cols.split(" ")[2]} />
            <col />
          </colgroup>
          <thead>
            <tr className="h-7 bg-[#F2F2F2] text-[12px] tracking-[0.04em] text-[#888] uppercase">
              <th className="px-3.5 text-left font-medium">No</th>
              <th className="px-3.5 text-left font-medium">Siswa</th>
              <th className="px-3.5 text-left font-medium">Keterangan</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {shownMiss.map((r) => (
              <tr key={r.nama} className="h-11 border-t border-[#E5E5E5] text-[15px]">
                <td className="px-3.5 text-[#888]">{r.no}</td>
                <td className="px-3.5 font-medium text-[#222]">{r.nama}</td>
                <td className="px-3.5 text-[#999]">Belum mengumpulkan</td>
                <td />
              </tr>
            ))}
            {shownMiss.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3.5 py-8 text-center text-[14px] text-[#999]">
                  {rowsMiss.length === 0
                    ? "Semua siswa sudah mengumpulkan."
                    : "Tidak ada siswa yang cocok."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}
