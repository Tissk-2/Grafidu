"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Megaphone, Plus, Trash2 } from "lucide-react";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import {
  createClassAnnouncement,
  deleteClassAnnouncement,
  fetchTeacherAnnouncements,
  fetchTeacherClasses,
} from "@/app/actions/teacher";
import type { TeacherAnnouncement } from "@/lib/student-model";
import type { TeacherClass } from "@/lib/teacher-model";
import CustomSelect from "@/components/ui/custom-select";
import PageSkeleton from "@/components/ui/page-skeleton";

/**
 * Halaman Pengumuman milik guru: komposer pengumuman per kelas + daftar
 * pengumuman (sekolah-wide dan kelas yang diampu) dengan hapus untuk
 * postingan miliknya sendiri. Pengganti AnnouncementsView read-only.
 */
export default function TeacherAnnouncementsManager() {
  const u = useRequireUser();
  useTitle("Pengumuman — Grafidu");

  const [items, setItems] = useState<TeacherAnnouncement[] | null>(null);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [classId, setClassId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const rows = await fetchTeacherAnnouncements();
    setItems(rows);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [rows, cls] = await Promise.all([fetchTeacherAnnouncements(), fetchTeacherClasses()]);
      if (cancelled) return;
      setItems(rows);
      setClasses(cls);
      if (cls.length > 0) setClassId(String(cls[0].id));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (posting) return;
    setError(null);
    if (!classId || !title.trim() || !body.trim()) {
      setError("Pilih kelas dan isi judul serta isi pengumuman.");
      return;
    }
    setPosting(true);
    try {
      await createClassAnnouncement(classId, title.trim(), body.trim());
      window.gtoast?.("Pengumuman terkirim ke kelas.");
      setTitle("");
      setBody("");
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteClassAnnouncement(id);
      window.gtoast?.("Pengumuman dihapus.");
      setItems((rows) => rows?.filter((r) => r.id !== id) ?? null);
    } catch (err) {
      window.gtoast?.((err as Error).message, "error");
    }
  }

  if (!u || !items) return <PageSkeleton />;

  return (
    <>
      <header>
        <h1 className="text-[28px] leading-tight font-medium tracking-[-0.015em] text-[#111] dark:text-[#F2F0F2]">
          Pengumuman
        </h1>
        <p className="mt-1 text-[14px] text-[#8A8A8A] dark:text-[#8F8B91]">
          Kirim pengumuman ke kelas yang kamu ampu, dan lihat papan pengumuman sekolah.
        </p>
      </header>

      {/* composer */}
      <form
        onSubmit={handlePost}
        className="mt-6 rounded-lg border border-[#E5E5E5] dark:border-[#2D2B30] bg-white dark:bg-[#1C1A1F] p-5"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-[#F4F1FE] dark:bg-[#2C2150] text-[#5B3FD6] dark:text-[#A78BFA]">
            <Megaphone size={17} aria-hidden />
          </span>
          <b className="text-[15px] font-semibold text-[#222] dark:text-[#EDEBF0]">
            Tulis pengumuman kelas
          </b>
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
        <div style={{ minWidth: 190 }}>
          <CustomSelect
            value={classId}
            onChange={setClassId}
            options={classes.map((c) => ({ value: String(c.id), label: c.name }))}
            ariaLabel="Kelas tujuan"
            placeholder={classes.length === 0 ? "Belum mengampu kelas" : "Pilih kelas…"}
            disabled={classes.length === 0}
          />
        </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul pengumuman…"
            aria-label="Judul pengumuman"
            maxLength={140}
            className="h-11 min-w-[200px] flex-1 rounded-sm border border-[#E5E5E5] dark:border-[#2D2B30] bg-white dark:bg-[#1C1A1F] px-3.5 text-[14px] text-[#1A1A1A] dark:text-[#F2F0F2] outline-none placeholder:text-[#AFAFAF] dark:placeholder:text-[#6E6A73] focus:border-[#5B3FD6] focus:ring-2 focus:ring-[#5B3FD6]/15"
          />
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Isi pengumuman untuk kelas…"
          aria-label="Isi pengumuman"
          rows={3}
          maxLength={1200}
          className="mt-2.5 w-full rounded-sm border border-[#E5E5E5] dark:border-[#2D2B30] bg-white dark:bg-[#1C1A1F] p-3.5 text-[14px] text-[#1A1A1A] dark:text-[#F2F0F2] outline-none placeholder:text-[#AFAFAF] dark:placeholder:text-[#6E6A73] focus:border-[#5B3FD6] focus:ring-2 focus:ring-[#5B3FD6]/15"
        />

        {error ? (
          <p role="alert" className="mt-2 text-[13px] text-[#DC2626] dark:text-[#F87171]">
            {error}
          </p>
        ) : null}

        <div className="mt-3.5 flex justify-end">
          <button
            type="submit"
            disabled={posting || classes.length === 0}
            className="inline-flex h-10 items-center gap-2 rounded-sm bg-[#5B3FD6] px-4 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Plus size={16} aria-hidden />
            {posting ? "Mengirim…" : "Terbitkan"}
          </button>
        </div>
      </form>

      {/* list */}
      {items.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-[#E5E5E5] dark:border-[#2D2B30] px-6 py-14 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-full bg-[#F4F1FE] dark:bg-[#2C2150] text-[#5B3FD6] dark:text-[#A78BFA]">
            <Megaphone size={18} aria-hidden />
          </span>
          <p className="mt-3.5 text-[15px] font-medium text-[#222] dark:text-[#EDEBF0]">
            Belum ada pengumuman
          </p>
          <p className="mt-1 text-[13px] text-[#8A8A8A] dark:text-[#8F8B91]">
            Pengumuman dari sekolah dan kelasmu akan muncul di sini.
          </p>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {items.map((a) => (
            <li
              key={a.id}
              className="rounded-lg border border-[#E5E5E5] dark:border-[#2D2B30] bg-white dark:bg-[#1C1A1F] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <b className="text-[15.5px] font-semibold text-[#222] dark:text-[#EDEBF0]">
                    {a.title}
                  </b>
                  {a.className ? (
                    <span className="rounded-full bg-[#F4F1FE] dark:bg-[#2C2150] px-2.5 py-0.5 text-[11.5px] font-medium text-[#5B3FD6] dark:text-[#A78BFA]">
                      {a.className}
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#F2F2F2] dark:bg-[#2A282D] px-2.5 py-0.5 text-[11.5px] font-medium text-[#8A8A8A] dark:text-[#8F8B91]">
                      Sekolah
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#8A8A8A] dark:text-[#8F8B91]">
                  <CalendarDays size={13} aria-hidden />
                  {a.when}
                </span>
              </div>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#8A8A8A] dark:text-[#8F8B91]">
                {a.body}
              </p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[12.5px] text-[#AFAFAF] dark:text-[#6E6A73]">
                  Dari: {a.author}
                </span>
                {a.mine ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    aria-label={`Hapus pengumuman ${a.title}`}
                    className="inline-flex items-center gap-1.5 text-[12.5px] text-[#B91C1C] dark:text-[#F87171] transition hover:opacity-80"
                  >
                    <Trash2 size={14} aria-hidden />
                    Hapus
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
