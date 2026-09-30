"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Teacher tasks page: class cards (left sidebar) + search + task list.
 * The class card click (sidebar) sets the active class and reloads the list.
 */
export function TeacherTaskFilter({
  classes,
  tasks,
}: {
  classes: { name: string; active?: boolean }[];
  tasks: { id: number; title: string; due: string; submitted: number; total: number; status: string }[];
}) {
  const [q, setQ] = useState("");
  const [activeClass, setActiveClass] = useState(classes.find((c) => c.active)?.name ?? classes[0]?.name ?? "");

  const filtered = tasks.filter((t) => t.title.toLowerCase().includes(q.toLowerCase()));

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
        <div className="select-box">
          <select>
            <option>Terbaru</option>
            <option>Terlama</option>
            <option>Tenggat Terdekat</option>
          </select>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
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