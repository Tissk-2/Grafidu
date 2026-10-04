"use client";

import { useState } from "react";
import Link from "next/link";
import type { TodoItem } from "@/lib/student-model";
import { useStudentTodos } from "@/app/student/student-shell-data";

const CHECK = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function StudentTasksRightbar({
  aiNote,
}: {
  aiNote: string;
  /** Tidak dipakai lagi: data to-do dibaca langsung dari data bersama shell. */
  todos?: TodoItem[];
}) {
  const { todos, toggle, add } = useStudentTodos();
  const [input, setInput] = useState("");
  const rows = todos ?? [];

  async function handleAdd() {
    const v = input.trim();
    if (!v) return;
    setInput("");
    await add(v);
  }

  return (
    <aside className="rightbar">
      <div className="rb-head">
        <h3>To–Do List Pribadi</h3>
      </div>
      <div className="search-row" style={{ marginBottom: 16 }}>
        <div className="search-box">
          <input
            type="text"
            placeholder="Tambah kegiatan pribadi..."
            id="todo-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
        </div>
        <button
          className="chat-send"
          style={{ width: 44, height: 44, borderRadius: 10, flex: "none" }}
          id="todo-add"
          aria-label="Tambah"
          onClick={handleAdd}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
      <div id="todo-list">
        {rows.map((t) => (
          <div
            key={t.id}
            className={"task-card" + (t.done ? " done" : "")}
            data-check
            data-todo-id={t.id}
            onClick={() => toggle(t.id, t.done)}
            role="checkbox"
            aria-checked={t.done}
            tabIndex={0}
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

      <div className="ai-card">
        <div className="ai-card-head">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
          </svg>
          Rekomendasi AI Untukmu
        </div>
        <div className="ai-note">{aiNote}</div>
        <Link className="btn btn-primary" href="/student/todo">
          Buat To-Do List
        </Link>
      </div>
    </aside>
  );
}