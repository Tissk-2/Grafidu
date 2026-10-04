"use client";

import { useState } from "react";
import Link from "next/link";
import CustomSelect from "@/components/ui/custom-select";

/**
 * Teacher tasks page: class cards (left sidebar) + search + task list.
 * The class card click (sidebar) sets the active class and reloads the list.
 */
export function TeacherTaskFilter({
  tasks,
}: {
  tasks: { id: number; title: string; due: string; submitted: number; total: number; status: string }[];
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("Terbaru");

  const filtered = tasks
    .filter((t) => t.title.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      if (sort === "Terlama") return a.due.localeCompare(b.due);
      if (sort === "Tenggat Terdekat") return a.due.localeCompare(b.due);
      return b.due.localeCompare(a.due);
    });

  return (
    <>
      <div className="search-row" style={{ marginTop: 24, maxWidth: 600 }}>
        <div className="search-box">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input type="text" placeholder="Cari tugas...." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="select-box" style={{ minWidth: 170 }}>
          <CustomSelect
            value={sort}
            onChange={setSort}
            options={[
              { value: "Terbaru", label: "Terbaru" },
              { value: "Terlama", label: "Terlama" },
              { value: "Tenggat Terdekat", label: "Tenggat Terdekat" },
            ]}
            ariaLabel="Urutkan tugas"
            placeholder="Terbaru"
          />
        </div>
      </div>

      <div id="task-list" style={{ marginTop: 22, maxWidth: 600 }}>
        {filtered.map((t) => (
          <Link key={t.id} className="task-row" href={`/teacher/tasks/${t.id}`}>
            <span className="task-ic">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="5" y="3" width="14" height="18" rx="2.5" />
                <path d="M9 3.5V2h6v1.5" />
                <path d="m8.6 12.4 2 2 4-4" />
              </svg>
            </span>
            <span className="info">
              <b>{t.title}</b>
              <span>Tenggat: {t.due}</span>
            </span>
            <span className="right">
              <span className="cnt">{t.submitted}/{t.total}</span>
              <span className={"st " + (t.status === "Selesai" ? "st-green" : "st-orange")}>{t.status}</span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}