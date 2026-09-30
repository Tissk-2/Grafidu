"use client";

import { useMemo, useState } from "react";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { parseIdDate, useRoutedClass } from "@/lib/guru";
import MainSkeleton from "@/components/ui/main-skeleton";
import BodySync from "@/components/body-sync";

type Sort = "newest" | "oldest";

/** Middle column only — the sidebar and rightbar come from the teacher layout. */
export default function TeacherTasksPage() {
  // Prototipe: guard role dimatikan supaya halaman bisa diakses tanpa login
  // sebagai guru. Kembalikan `useRequireUser("teacher")` sebelum production.
  const u = useRequireUser();
  // This page has no :id segment, so useRoutedClass falls back to the class
  // last picked on /teacher/home — the same one the shell is showing.
  const { kelas: active } = useRoutedClass();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  useTitle("Daftar Tugas — Grafidu");

  const tasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return active.tugas
      .filter((t) => t.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const diff = parseIdDate(b.deadline).getTime() - parseIdDate(a.deadline).getTime();
        return sort === "newest" ? diff : -diff;
      });
  }, [active, query, sort]);

  if (!u) return <MainSkeleton />;

  return (
    <>
      <BodySync dataPage="teacher-tasks" />
      <h1 className="page-title">Daftar Tugas</h1>
      <p className="page-sub">Kelola tugas yang anda serahkan kepada siswa.</p>

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari tugas...."
          style={{
            flex: 1,
            height: 44,
            padding: "0 14px",
            border: "1px solid var(--gray-2, #ddd)",
            borderRadius: 4,
          }}
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          style={{
            width: 127,
            height: 44,
            padding: "0 10px",
            border: "1px solid var(--gray-2, #ddd)",
            borderRadius: 4,
          }}
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
        </select>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state" style={{ display: "block", marginTop: 24 }}>
          <b>Tugas tidak ditemukan</b>
          <span>Coba kata kunci lain atau pilih kelas berbeda.</span>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {tasks.map((t) => (
            <div key={t.id} className="task-row">
              <span className="task-ic">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="5" y="3" width="14" height="18" rx="2.5" />
                  <path d="M9 3.5V2h6v1.5" />
                  <path d="m8.6 12.4 2 2 4-4" />
                </svg>
              </span>
              <span className="info">
                <b>{t.name}</b>
                <span>Tenggat: {t.deadline}</span>
              </span>
              <span
                className="right"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 4,
                }}
              >
                <b>
                  {t.muridSelesai}/{active.totalMurid}
                </b>
                <span
                  style={{
                    fontSize: 12,
                    color: t.completed ? "var(--green, #16a34a)" : "#ca8a04",
                  }}
                >
                  {t.completed ? "Selesai" : "Belum Selesai"}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
