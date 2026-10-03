"use client";

import { useState } from "react";
import { ChevronDown, FileText, Plus, Search, Trash2, Pencil } from "lucide-react";
import { Book } from "iconsax-reactjs";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { useRoutedClass } from "@/lib/guru";
import { createMaterial, deleteMaterial, updateMaterial } from "@/app/actions/teacher";
import { useTeacherShellData } from "../teacher-shell-data";
import type { MaterialRow } from "@/lib/teacher-model";
import MainSkeleton from "@/components/ui/main-skeleton";
import BodySync from "@/components/body-sync";
import MateriFormDialog, { type MateriFormValue } from "./materi-form-dialog";

/** "/materi/eksposisi-modul.pdf" | "https://…" -> file label for the chip. */
function fileLabel(path: string): string {
  try {
    const url = new URL(path, "https://contoh.id");
    const last = url.pathname.split("/").filter(Boolean).pop();
    return decodeURIComponent(last ?? path);
  } catch {
    return path;
  }
}

/**
 * Middle column only — the sidebar and rightbar come from the teacher layout.
 * Materi ter-scoped ke kelas aktif; create/update/delete langsung ke tabel
 * materials lewat server action, lalu shell.refresh() menarik ulang dari DB.
 */
export default function TeacherMateriPage() {
  const u = useRequireUser("teacher");
  const { kelas } = useRoutedClass();
  const { materials, refresh } = useTeacherShellData();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"terbaru" | "nama">("terbaru");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialRow | null>(null);
  const [busy, setBusy] = useState(false);
  useTitle(`Materi ${kelas?.name ?? ""} — Grafidu`);

  if (!u || !kelas) return <MainSkeleton />;
  const activeKelas = kelas;

  const q = query.trim().toLowerCase();
  const filtered = materials
    .filter((m) => !q || m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q))
    .sort((a, b) =>
      sort === "nama" ? a.title.localeCompare(b.title) : b.createdAt.localeCompare(a.createdAt),
    );

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(m: MaterialRow) {
    setEditing(m);
    setDialogOpen(true);
  }

  async function handleSubmit(value: MateriFormValue) {
    if (busy) return;
    const attachments = value.files
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setBusy(true);
    try {
      if (editing) {
        await updateMaterial(editing.id, {
          title: value.title,
          description: value.desc,
          attachments,
          status: editing.status,
        });
        window.gtoast?.("Materi berhasil diperbarui.");
      } else {
        await createMaterial({
          classId: activeKelas.id,
          title: value.title,
          description: value.desc,
          attachments,
          status: "published",
        });
        window.gtoast?.("Materi berhasil dibagikan ke " + activeKelas.name + ".");
      }
      refresh();
      setDialogOpen(false);
      setEditing(null);
    } catch (err) {
      window.gtoast?.((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMaterial(id);
      window.gtoast?.("Materi dihapus.");
      refresh();
    } catch (err) {
      window.gtoast?.((err as Error).message, "error");
    }
  }

  return (
    <>
      <BodySync dataPage="teacher-materi" />

      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h1 className="text-[28px] leading-tight font-medium tracking-[-0.015em] text-[#111]">
            Materi
          </h1>
          <p className="mt-1 text-[14px] text-[#8A8A8A]">
            Materi {kelas.name} yang bisa dipakai siswa — dan dijadikan bahan kuis oleh AI.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" type="button" onClick={openCreate}>
          <Plus size={16} aria-hidden />
          Bagikan Materi
        </button>
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
            placeholder="Cari materi…"
            aria-label="Cari materi"
            className="h-11 w-full rounded-sm border border-[#E5E5E5] bg-white pr-4 pl-10 text-[14px] text-[#1A1A1A] transition outline-none placeholder:text-[#AFAFAF] focus:border-[#5B3FD6] focus:ring-2 focus:ring-[#5B3FD6]/15"
          />
        </div>

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "terbaru" | "nama")}
            aria-label="Urutkan materi"
            className="h-11 appearance-none rounded-sm border border-[#E5E5E5] bg-white pr-9 pl-3.5 text-[14px] text-[#222] transition outline-none focus:border-[#5B3FD6] focus:ring-2 focus:ring-[#5B3FD6]/15"
          >
            <option value="terbaru">Terbaru</option>
            <option value="nama">Nama A–Z</option>
          </select>
          <ChevronDown
            size={15}
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#AFAFAF]"
          />
        </div>
      </div>

      {/* cards */}
      {filtered.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-[#E5E5E5] px-6 py-14 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-full bg-[#F4F1FE] text-[#5B3FD6]">
            <Book size={18} aria-hidden />
          </span>
          <p className="mt-3.5 text-[15px] font-medium text-[#222]">
            {materials.length === 0 ? "Belum ada materi" : "Materi tidak ditemukan"}
          </p>
          <p className="mt-1 text-[13px] text-[#8A8A8A]">
            {materials.length === 0
              ? `Kelas ${kelas.name} belum punya materi. Klik "Bagikan Materi" untuk memulai.`
              : "Coba kata kunci lain atau pilih kelas berbeda."}
          </p>
        </div>
      ) : (
        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {filtered.map((m) => (
            <li
              key={m.id}
              className="group flex flex-col rounded-lg border border-[#E5E5E5] bg-white p-5 transition hover:border-[#D5D2D8]"
            >
              <div className="flex items-start gap-3.5">
                <span className="task-ic">
                  <Book size={20} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block text-[15px] font-semibold text-[#222]">{m.title}</b>
                  <p className="mt-1.5 line-clamp-3 text-[13.5px] leading-relaxed text-[#8A8A8A]">
                    {m.description}
                  </p>
                </div>
              </div>

              {m.attachments.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {m.attachments.map((f) => (
                    <span
                      key={f}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-[var(--purple-soft)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--purple)]"
                      title={f}
                    >
                      <FileText size={12} aria-hidden className="shrink-0" />
                      <span className="truncate">{fileLabel(f)}</span>
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-[var(--line-soft)] pt-3.5">
                <span className="text-[12px] text-[#8A8A8A]">
                  {m.attachments.length} lampiran
                </span>
                <span className="flex gap-2">
                  <button className="btn-mini btn-mini-ghost" type="button" onClick={() => openEdit(m)}>
                    <Pencil size={13} aria-hidden />
                    Edit
                  </button>
                  <button
                    className="btn-mini btn-mini-danger"
                    type="button"
                    onClick={() => handleDelete(m.id)}
                  >
                    <Trash2 size={13} aria-hidden />
                    Hapus
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <MateriFormDialog
        open={dialogOpen}
        initial={
          editing
            ? { title: editing.title, desc: editing.description, files: editing.attachments.join(", ") }
            : undefined
        }
        kelasLabel={kelas.name}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
}
