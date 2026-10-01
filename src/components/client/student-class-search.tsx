"use client";

import { useState } from "react";

export type TeacherClass = {
  teacher: string;
  subject: string;
  avatar: string;
};

export default function StudentClassSearch({ classes }: { classes: TeacherClass[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = classes.filter((c) => {
    const matchesFilter = filter === "all" || c.subject.toLowerCase() === filter.toLowerCase();
    const matchesQuery =
      !q ||
      c.teacher.toLowerCase().includes(q.toLowerCase()) ||
      c.subject.toLowerCase().includes(q.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <>
      <div className="search-row">
        <div className="search-box">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Cari tugas atau kelas guru..."
            data-search=".teacher-card"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="select-box">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Semua Mapel</option>
            <option value="Matematika">Matematika</option>
            <option value="Fisika">Fisika</option>
            <option value="Informatika">Informatika</option>
            <option value="Bahasa Indonesia">B. Indonesia</option>
            <option value="Seni Budaya">Seni</option>
          </select>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      <div className="chips">
        {[
          { value: "all", label: "Semua" },
          { value: "Matematika", label: "Matematika" },
          { value: "Fisika", label: "Fisika" },
          { value: "Informatika", label: "Informatika" },
          { value: "Bahasa Indonesia", label: "B. Indonesia" },
          { value: "Seni Budaya", label: "Seni" },
        ].map((f) => (
          <button
            key={f.value}
            className={"chip" + (filter === f.value ? " on" : "")}
            data-filter={f.value}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="teacher-grid">
        {filtered.map((c, i) => (
          <div key={i} className="teacher-card" data-subject={c.subject}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.avatar.startsWith("/") ? c.avatar : "/" + c.avatar}
              alt=""
              width={38}
              height={38}
            />
            <span style={{ flex: 1, minWidth: 0 }}>
              <b>{c.teacher}</b>
              <span
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span>{c.subject}</span>
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="count-note" data-count>
        {filtered.length} kelas
      </div>

      <div
        className="empty-state"
        data-empty-classes
        style={{ display: filtered.length === 0 ? "block" : "none" }}
      >
        <span className="es-ic">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        <p className="font-medium">Tidak ada kelas yang cocok</p>
        <span>Coba kata kunci lain atau pilih mapel berbeda.</span>
      </div>
    </>
  );
}
