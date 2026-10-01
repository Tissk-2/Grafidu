"use client";

import { useState } from "react";
import Link from "next/link";
import { addTodo, toggleTodo, type TodoItem } from "@/lib/supabase/queries";

const CHECK = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function StudentTasksRightbar({
  userId,
  aiNote,
  todos: initialTodos,
}: {
  userId: string;
  aiNote: string;
  /** From the shell's shared data — avoids a second todos query on this screen. */
  todos?: TodoItem[];
}) {
  // null = belum ada editan lokal → tampilkan data dari shell context.
  const [localTodos, setLocalTodos] = useState<TodoItem[] | null>(null);
  const [input, setInput] = useState("");
  const rows = localTodos ?? initialTodos ?? [];

  async function toggle(id: string, done: boolean) {
    setLocalTodos(rows.map((t) => (t.id === id ? { ...t, done: !done } : t)));
    try {
      await toggleTodo(id, !done);
    } catch (err) {
      setLocalTodos(rows.map((t) => (t.id === id ? { ...t, done } : t)));
      window.gtoast?.((err as Error).message, "error");
    }
  }

  async function handleAdd() {
    const v = input.trim();
    if (!v) return;
    setInput("");
    try {
      const row = await addTodo(userId, v);
      if (row) setLocalTodos([...rows, row]);
    } catch (err) {
      window.gtoast?.((err as Error).message, "error");
    }
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
