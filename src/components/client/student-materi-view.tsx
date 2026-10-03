"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Book,
  Download,
  Eye,
  FileText,
  Link as LinkIcon,
  Search,
} from "lucide-react";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { fetchStudentMaterials, markMaterialViewed } from "@/app/actions/student";
import type { StudentMaterial } from "@/lib/student-model";
import { fmtDate } from "@/lib/format";
import PageSkeleton from "@/components/ui/page-skeleton";

/** Halaman Materi siswa: materi terbit dari guru kelas, dengan pencarian. */
export default function StudentMateriView() {
  const u = useRequireUser();
  useTitle("Materi — Grafidu");

  const [items, setItems] = useState<StudentMaterial[] | null>(null);
  const [query, setQuery] = useState("");
  const [viewed, setViewed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    fetchStudentMaterials().then((rows) => {
      if (!cancelled) setItems(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.teacherName.toLowerCase().includes(q),
    );
  }, [items, query]);

  function openMaterial(m: StudentMaterial) {
    if (!viewed[m.id]) {
      setViewed((v) => ({ ...v, [m.id]: true }));
      void markMaterialViewed(m.id);
    }
  }

  if (!u || !items) return <PageSkeleton />;

  return (
    <>
      <header>
        <h1 className="text-[28px] leading-tight font-medium tracking-[-0.015em] text-[#111] dark:text-[#F2F0F2]">
          Materi
        </h1>
        <p className="mt-1 text-[14px] text-[#8A8A8A] dark:text-[#8F8B91]">
          Materi ajar yang dibagikan guru untuk kelas kamu — satu tempat, tidak perlu mencari.
        </p>
      </header>

      <div className="relative mt-6 max-w-[420px]">
        <Search
          size={16}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#AFAFAF] dark:text-[#6E6A73]"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari materi atau nama guru…"
          aria-label="Cari materi"
          className="h-11 w-full rounded-sm border border-[#E5E5E5] dark:border-[#2D2B30] bg-white dark:bg-[#1C1A1F] pr-4 pl-10 text-[14px] text-[#1A1A1A] dark:text-[#F2F0F2] outline-none placeholder:text-[#AFAFAF] dark:placeholder:text-[#6E6A73] focus:border-[#5B3FD6] focus:ring-2 focus:ring-[#5B3FD6]/15"
        />
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-[#E5E5E5] dark:border-[#2D2B30] px-6 py-14 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-full bg-[#F4F1FE] dark:bg-[#2C2150] text-[#5B3FD6] dark:text-[#A78BFA]">
            <Book size={18} aria-hidden />
          </span>
          <p className="mt-3.5 text-[15px] font-medium text-[#222] dark:text-[#EDEBF0]">
            Belum ada materi
          </p>
          <p className="mt-1 text-[13px] text-[#8A8A8A] dark:text-[#8F8B91]">
            Materi yang dibagikan guru kelasmu akan muncul di sini.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-[#E5E5E5] dark:border-[#2D2B30] px-6 py-14 text-center">
          <p className="text-[15px] font-medium text-[#222] dark:text-[#EDEBF0]">
            Materi tidak ditemukan
          </p>
          <p className="mt-1 text-[13px] text-[#8A8A8A] dark:text-[#8F8B91]">
            Coba kata kunci lain.
          </p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {rows.map((m) => (
            <li
              key={m.id}
              onFocus={() => openMaterial(m)}
              onMouseEnter={() => openMaterial(m)}
              className="rounded-lg border border-[#E5E5E5] dark:border-[#2D2B30] bg-white dark:bg-[#1C1A1F] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                <b className="text-[15.5px] font-semibold text-[#222] dark:text-[#EDEBF0]">
                  {m.title}
                </b>
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#8A8A8A] dark:text-[#8F8B91]">
                  <Eye size={13} aria-hidden />
                  {m.views + (viewed[m.id] ? 1 : 0)} kali dibaca
                </span>
              </div>
              {m.description ? (
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#8A8A8A] dark:text-[#8F8B91]">
                  {m.description}
                </p>
              ) : null}
              {m.attachments.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.attachments.map((att) => (
                    <a
                      key={att}
                      href={att}
                      target={att.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      onClick={() => openMaterial(m)}
                      className="inline-flex h-9 items-center gap-2 rounded-sm border border-[#E5E5E5] dark:border-[#2D2B30] px-3 text-[13px] font-medium text-[#5B3FD6] dark:text-[#A78BFA] transition hover:border-[#5B3FD6]"
                    >
                      {att.startsWith("http") ? (
                        <LinkIcon size={14} aria-hidden />
                      ) : (
                        <Download size={14} aria-hidden />
                      )}
                      {att.split("/").pop()}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-[#AFAFAF] dark:text-[#6E6A73]">
                  <FileText size={13} aria-hidden />
                  Tidak ada lampiran
                </p>
              )}
              <p className="mt-3 text-[12.5px] text-[#AFAFAF] dark:text-[#6E6A73]">
                Dari: {m.teacherName} · {fmtDate(m.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
