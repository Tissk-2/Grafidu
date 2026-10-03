"use client";

import { useEffect, useState } from "react";
import { fetchTodos, addTodo, toggleTodo } from "@/app/actions/student";
import type { TodoItem } from "@/lib/student-model";

const CHECK = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function StudentTodoManager() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchTodos().then((rows) => {
      if (!cancelled) setTodos(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const doneCount = todos.filter((t) => t.done).length;
  const pct = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;

  async function toggle(id: string, done: boolean) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !done } : t)));
    try {
      await toggleTodo(id, !done);
    } catch (err) {
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: done } : t)));
      window.gtoast?.((err as Error).message, "error");
    }
  }

  async function handleAdd() {
    const v = input.trim();
    if (!v) return;
    setInput("");
    try {
      const row = await addTodo(v);
      if (row) setTodos((prev) => [...prev, row]);
    } catch (err) {
      window.gtoast?.((err as Error).message, "error");
    }
  }

  return (
    <>
      <h1 className="page-title">To-Do List Pribadi</h1>
      <p className="page-sub">Kelola target harianmu — catat, centang, dan selesaikan satu per satu.</p>

      <div className="progress-card" style={{ marginTop: 24, maxWidth: 640 }}>
        <div className="head">
          <span>Progres To-Do Hari Ini</span>
          <b data-progress-label>{pct}%</b>
        </div>
        <div className="prog">
          <i data-progress-fill style={{ width: `${pct}%` }}></i>
        </div>
      </div>

      <div className="search-row" style={{ display: "flex", flexDirection: "row", gap: 14, maxWidth: 640, marginTop: 22 }}>
        <div className="search-box">
          <input
            type="text"
            id="todo-input"
            placeholder="Tambah kegiatan pribadi..."
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

      <div id="todo-list" style={{ maxWidth: 640, marginTop: 18 }}>
        {todos.map((t) => (
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

      <div
        className="empty-state"
        id="todo-empty"
        style={{ display: todos.length === 0 ? "block" : "none", maxWidth: 640 }}
      >
        <span className="es-ic">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </span>
        <b>Belum ada kegiatan</b>
        <span>Tambahkan target barumu di atas — tersimpan di database.</span>
      </div>
    </>
  );
}
