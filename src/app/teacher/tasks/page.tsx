"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ClipboardCheck, Search } from "lucide-react";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { parseIdDate, useRoutedClass } from "@/lib/guru";
import TasksSkeleton from "@/components/ui/tasks-skeleton";
import TaskCard from "@/components/ui/task-card";
import BodySync from "@/components/body-sync";

type Sort = "newest" | "oldest";

const SORTS: { value: Sort; label: string }[] = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
];

/** Middle column only — the sidebar and rightbar come from the teacher layout. */
export default function TeacherTasksPage() {
  const u = useRequireUser("teacher");
  // This page has no :id segment, so useRoutedClass falls back to the class
  // last picked on /teacher/home — the same one the shell is showing.
  const { kelas: active } = useRoutedClass();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  useTitle("Daftar Tugas — Grafidu");

  const total = active.totalMurid;

  const tasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return active.tugas
      .filter((t) => t.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const diff = parseIdDate(b.deadline).getTime() - parseIdDate(a.deadline).getTime();
        return sort === "newest" ? diff : -diff;
      });
  }, [active, query, sort]);

  if (!u) return <TasksSkeleton />;

  const all = active.tugas;
  const submitted = all.reduce((sum, t) => sum + t.muridSelesai, 0);
  const capacity = all.length * total;
  const filtering = query.trim().length > 0;

  return (
    <>
      <BodySync dataPage="teacher-tasks" />

      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="text-[28px] leading-tight font-medium tracking-[-0.015em] text-[#111]">
            Daftar Tugas
          </h1>
          <p className="mt-1 text-[14px] text-[#8A8A8A]">
            Kelola tugas yang Anda serahkan kepada siswa.
          </p>
        </div>
        {all.length > 0 && (
          <p className="text-[13px] text-[#8A8A8A]">
            <span className="font-medium tabular-nums text-[#222]">{all.length}</span> tugas
            <span className="px-1.5 text-[#CFCFCF]">·</span>
            <span className="font-medium tabular-nums text-[#222]">{submitted}</span> dari
            <span className="tabular-nums"> {capacity}</span> pengumpulan
          </p>
        )}
      </header>

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
            placeholder="Cari tugas…"
            aria-label="Cari tugas"
            className="h-11 w-full rounded-sm border border-[#E5E5E5] bg-white pr-4 pl-10 text-[14px] text-[#1A1A1A] transition outline-none placeholder:text-[#AFAFAF] focus:border-[#5B3FD6] focus:ring-2 focus:ring-[#5B3FD6]/15"
          />
        </div>

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Urutkan tugas"
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

      {/* list */}
      {tasks.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-[#E5E5E5] px-6 py-14 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-full bg-[#F4F1FE] text-[#5B3FD6]">
            <ClipboardCheck size={18} aria-hidden />
          </span>
          <p className="mt-3.5 text-[15px] font-medium text-[#222]">
            {all.length === 0 ? "Belum ada tugas" : "Tugas tidak ditemukan"}
          </p>
          <p className="mt-1 text-[13px] text-[#8A8A8A]">
            {all.length === 0
              ? `Kelas ${active.kelas} belum punya tugas.`
              : "Coba kata kunci lain atau pilih kelas berbeda."}
          </p>
        </div>
      ) : (
        <>
          {filtering && (
            <p className="mt-5 text-[13px] text-[#8A8A8A]">
              Menampilkan{" "}
              <span className="font-medium tabular-nums text-[#222]">{tasks.length}</span> dari{" "}
              <span className="tabular-nums">{all.length}</span> tugas
            </p>
          )}
          <ul className={`flex flex-col gap-2.5 ${filtering ? "mt-3" : "mt-5"}`}>
            {tasks.map((t) => (
              <li key={t.id}>
                <TaskCard task={t} total={total} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
