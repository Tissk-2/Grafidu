"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Megaphone, Search } from "lucide-react";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import {
  fetchAllAnnouncements,
  type AnnouncementPageItem,
} from "@/lib/supabase/queries";
import { fmtDate } from "@/lib/format";
import PageSkeleton from "@/components/ui/page-skeleton";

type Range = "semua" | "7" | "30";
type Sort = "terbaru" | "terlama" | "judul";

const RANGES: { value: Range; label: string }[] = [
  { value: "semua", label: "Semua Waktu" },
  { value: "7", label: "7 Hari Terakhir" },
  { value: "30", label: "30 Hari Terakhir" },
];

const SORTS: { value: Sort; label: string }[] = [
  { value: "terbaru", label: "Terbaru" },
  { value: "terlama", label: "Terlama" },
  { value: "judul", label: "Judul A–Z" },
];

const MS_DAY = 86_400_000;

/**
 * Halaman Pengumuman yang dipakai siswa dan guru (link "Lihat Semua" di
 * rightbar mengarah ke route masing-masing). Data dari tabel announcements
 * yang sama; yang membedakan hanya route dan peran di guard.
 */
export default function AnnouncementsView() {
  const u = useRequireUser();
  const [items, setItems] = useState<AnnouncementPageItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<Range>("semua");
  const [sort, setSort] = useState<Sort>("terbaru");
  useTitle("Pengumuman — Grafidu");

  useEffect(() => {
    let cancelled = false;
    fetchAllAnnouncements().then((rows) => {
      if (!cancelled) setItems(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    const cutoff = range === "semua" ? 0 : Date.now() - Number(range) * MS_DAY;
    return items
      .filter((a) => {
        const inRange = cutoff === 0 || new Date(a.date).getTime() >= cutoff;
        const matches =
          !q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q);
        return inRange && matches;
      })
      .sort((a, b) => {
        if (sort === "judul") return a.title.localeCompare(b.title);
        const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
        return sort === "terbaru" ? diff : -diff;
      });
  }, [items, query, range, sort]);

  if (!u || !items) return <PageSkeleton />;

  const filtering = query.trim().length > 0 || range !== "semua";

  return (
    <>
      <header>
        <h1 className="text-[28px] leading-tight font-medium tracking-[-0.015em] text-[#111]">
          Pengumuman
        </h1>
        <p className="mt-1 text-[14px] text-[#8A8A8A]">
          Informasi dan pengumuman terbaru dari sekolah{u.role === "teacher" ? " untuk kelas yang kamu ampu" : " serta gurumu"}.
        </p>
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
            placeholder="Cari pengumuman…"
            aria-label="Cari pengumuman"
            className="h-11 w-full rounded-sm border border-[#E5E5E5] bg-white pr-4 pl-10 text-[14px] text-[#1A1A1A] transition outline-none placeholder:text-[#AFAFAF] focus:border-[#5B3FD6] focus:ring-2 focus:ring-[#5B3FD6]/15"
          />
        </div>

        <div className="relative">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
            aria-label="Filter waktu"
            className="h-11 appearance-none rounded-sm border border-[#E5E5E5] bg-white pr-9 pl-3.5 text-[14px] text-[#222] transition outline-none focus:border-[#5B3FD6] focus:ring-2 focus:ring-[#5B3FD6]/15"
          >
            {RANGES.map((o) => (
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

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Urutkan pengumuman"
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
      {items.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-[#E5E5E5] px-6 py-14 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-full bg-[#F4F1FE] text-[#5B3FD6]">
            <Megaphone size={18} aria-hidden />
          </span>
          <p className="mt-3.5 text-[15px] font-medium text-[#222]">Belum ada pengumuman</p>
          <p className="mt-1 text-[13px] text-[#8A8A8A]">
            Pengumuman dari sekolah akan muncul di sini.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-[#E5E5E5] px-6 py-14 text-center">
          <p className="text-[15px] font-medium text-[#222]">Pengumuman tidak ditemukan</p>
          <p className="mt-1 text-[13px] text-[#8A8A8A]">
            Coba kata kunci lain atau ubah filter waktu.
          </p>
        </div>
      ) : (
        <>
          {filtering && (
            <p className="mt-5 text-[13px] text-[#8A8A8A]">
              Menampilkan <span className="font-medium tabular-nums text-[#222]">{rows.length}</span>{" "}
              dari <span className="tabular-nums">{items.length}</span> pengumuman
            </p>
          )}
          <ul className="mt-4 flex flex-col gap-3">
            {rows.map((a, i) => (
              <li
                key={`${a.title}-${i}`}
                className={
                  "rounded-lg border bg-white p-5 transition " +
                  (i === 0 && sort === "terbaru" && !filtering
                    ? "border-[var(--purple-soft)] bg-[#fdfcff]"
                    : "border-[#E5E5E5] hover:border-[#D5D2D8]")
                }
              >
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                  <b className="text-[15.5px] font-semibold text-[#222]">{a.title}</b>
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-[#8A8A8A]">
                    <CalendarDays size={13} aria-hidden />
                    {a.when}
                    <span className="text-[#CFCFCF]">·</span>
                    {fmtDate(a.date)}
                  </span>
                </div>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#8A8A8A]">{a.body}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
