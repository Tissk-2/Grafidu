"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck, Search } from "lucide-react";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { useRoutedClass } from "@/lib/guru";
import { useTeacherShellData } from "../teacher-shell-data";
import { createTask } from "@/app/actions/teacher";
import TaskDialog, { type TaskFormValue } from "../task-dialog";
import { fmtDate } from "@/lib/format";
import TasksSkeleton from "@/components/ui/tasks-skeleton";
import TaskCard from "@/components/ui/task-card";
import CustomSelect from "@/components/ui/custom-select";
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
  const { tasks: liveTasks, classTotals, materials, refresh } = useTeacherShellData();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  useTitle("Daftar Tugas — Grafidu");

  const total = (active ? classTotals[active.id] : 0) ?? 0;

  // View-model TaskCard: uuid id + tanggal terformat dari data live.
  const all = useMemo(
    () =>
      liveTasks.map((t) => ({
        id: t.id,
        name: t.title,
        ditugaskan: fmtDate(t.assignedAt),
        deadline: fmtDate(t.dueAt),
        completed: t.isCompleted,
        muridSelesai: t.submitted,
      })),
    [liveTasks],
  );

  const tasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((t) => t.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const diff = new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        return sort === "newest" ? diff : -diff;
      });
  }, [all, query, sort]);

  if (!u || !active) return <TasksSkeleton />;

  const submitted = all.reduce((sum, t) => sum + t.muridSelesai, 0);
  const capacity = all.length * total;
  const filtering = query.trim().length > 0;

  return (
    <>
      <BodySync dataPage="teacher-tasks" />

      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="text-[28px] leading-tight font-medium tracking-[-0.015em] text-[#111] dark:text-[#F2F0F2]">
            Daftar Tugas
          </h1>
          <p className="mt-1 text-[14px] text-[#8A8A8A] dark:text-[#8F8B91]">
            Kelola tugas yang Anda serahkan kepada siswa.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={() => setDialogOpen(true)}
          disabled={!active}
        >
          Buat Tugas
        </button>
        {all.length > 0 && (
          <p className="text-[13px] text-[#8A8A8A] dark:text-[#8F8B91]">
            <span className="font-medium tabular-nums text-[#222] dark:text-[#EDEBF0]">{all.length}</span> tugas
            <span className="px-1.5 text-[#CFCFCF] dark:text-[#4C484E]">·</span>
            <span className="font-medium tabular-nums text-[#222] dark:text-[#EDEBF0]">{submitted}</span> dari
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

        <div style={{ minWidth: 150 }}>
          <CustomSelect
            value={sort}
            onChange={(v) => setSort(v as Sort)}
            options={SORTS}
            ariaLabel="Urutkan tugas"
            placeholder="Urutkan"
          />
        </div>
      </div>

      {/* list */}
      {tasks.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-[#E5E5E5] dark:border-[#2D2B30] px-6 py-14 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-full bg-[#F4F1FE] dark:bg-[#2C2150] text-[#5B3FD6] dark:text-[#A78BFA]">
            <ClipboardCheck size={18} aria-hidden />
          </span>
          <p className="mt-3.5 text-[15px] font-medium text-[#222] dark:text-[#EDEBF0]">
            {all.length === 0 ? "Belum ada tugas" : "Tugas tidak ditemukan"}
          </p>
          <p className="mt-1 text-[13px] text-[#8A8A8A] dark:text-[#8F8B91]">
            {all.length === 0
              ? `Kelas ${active.name} belum punya tugas.`
              : "Coba kata kunci lain atau pilih kelas berbeda."}
          </p>
        </div>
      ) : (
        <>
          {filtering && (
            <p className="mt-5 text-[13px] text-[#8A8A8A] dark:text-[#8F8B91]">
              Menampilkan{" "}
              <span className="font-medium tabular-nums text-[#222] dark:text-[#EDEBF0]">{tasks.length}</span> dari{" "}
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

      <TaskDialog
        open={dialogOpen}
        kelasLabel={active?.name ?? ""}
        materials={materials
          .filter((m) => m.status === "published")
          .map((m) => ({ id: m.id, title: m.title }))}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (value: TaskFormValue) => {
          if (!active || creating) return;
          setCreating(true);
          try {
            await createTask(active.id, {
              title: value.title,
              description: value.description,
              subject: active.subject,
              dueAt: new Date(value.dueDate).toISOString(),
              materialId: value.materialId || null,
            });
            refresh();
            window.gtoast?.("Tugas berhasil dibuat untuk " + active.name + ".");
            setDialogOpen(false);
          } catch (err) {
            window.gtoast?.((err as Error).message, "error");
          } finally {
            setCreating(false);
          }
        }}
      />
    </>
  );
}
