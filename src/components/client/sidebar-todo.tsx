"use client";

import { useState } from "react";
import Link from "next/link";
import { useStudentTodos } from "@/app/student/student-shell-data";

const CHECK = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/**
 * To-Do List Pribadi di dalam panel sidebar. Hanya tampil di layar kecil
 * (kelas `.m-only` disembunyikan CSS di desktop, di mana To-Do sudah ada di
 * rightbar halaman Tasks). Datanya sama dengan rightbar dan halaman To-Do.
 */
export default function SidebarTodo() {
  const { todos, toggle, add } = useStudentTodos();
  const [input, setInput] = useState("");

  if (todos === null) return null;
  const done = todos.filter((t) => t.done).length;

  async function handleAdd() {
    const v = input.trim();
    if (!v) return;
    setInput("");
    await add(v);
  }

  return (
    <div className="m-only side-todo">
      <div className="side-list-head">
        <h3>
          To-Do List Pribadi{" "}
          <small style={{ fontWeight: 400, color: "var(--gray-4)" }}>
            {done}/{todos.length}
          </small>
        </h3>
        <Link className="link-underline" href="/student/todo">
          Kelola
        </Link>
      </div>

      <div className="search-row" style={{ marginBottom: 12 }}>
        <div className="search-box">
          <input
            type="text"
            placeholder="Tambah kegiatan pribadi..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
        </div>
        <button
          type="button"
          className="chat-send"
          style={{ width: 44, height: 44, borderRadius: 10, flex: "none" }}
          aria-label="Tambah"
          onClick={handleAdd}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {todos.map((t) => (
        <div
          key={t.id}
          className={"task-card" + (t.done ? " done" : "")}
          role="checkbox"
          aria-checked={t.done}
          tabIndex={0}
          onClick={() => toggle(t.id, t.done)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle(t.id, t.done);
            }
          }}
        >
          <span className="tbox">{CHECK}</span>
          <span>
            <b>{t.title}</b>
            <span>{t.subtitle}</span>
          </span>
        </div>
      ))}
    </div>
  );
}