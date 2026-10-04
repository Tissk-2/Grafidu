"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { type SchoolTask, type SubjectScore, type TodoItem } from "@/lib/student-model";
import PageSkeleton from "@/components/ui/page-skeleton";
import BodySync from "@/components/body-sync";
import { useStudentShellData, useStudentTodos } from "../student-shell-data";

type Msg = { role: "user" | "ai"; text: string };
type PageData = { tasks: SchoolTask[]; subjects: SubjectScore[] };

const SUGGESTIONS = [
  "Buatkan rencana belajar",
  "Kapan tenggat tugasku?",
  "Ringkas nilai saya semester ini",
  "Mapel apa yang perlu aku fokuskan?",
];

const AI_UNAVAILABLE = "Layanan AI sedang tidak terjangkau. Coba kirim ulang sebentar lagi.";

/** Middle column only — the sidebar and rightbar come from the student layout. */
export default function StudentAiAgentPage() {
  const u = useRequireUser("student");
  const shell = useStudentShellData();
  const { add: addTodoShared } = useStudentTodos();
  useTitle("AI Agent — Grafidu");

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<PageData | null>(null);
  dataRef.current = shell
    ? { tasks: shell.schoolTasks, subjects: shell.subjects }
    : null;

  // Greeting butuh nama user — isi begitu sesi & data siap.
  useEffect(() => {
    if (!u || !shell) return;
    setMessages((prev) =>
      prev.length
        ? prev
        : [
            {
              role: "ai",
              text: `Hai ${u.name.split(" ")[0]}! 👋 Aku AI Agent Grafidu. Aku sudah lihat nilai dan tugasmu minggu ini — mau mulai dari mana?`,
            },
          ],
    );
  }, [u, shell]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, busy]);

  if (!u || !shell) return <PageSkeleton />;

  async function send(text?: string) {
    const t = (text ?? input).trim();
    if (!t || busy) return;
    setInput("");
    setBusy(true);
    // Riwayat diambil sebelum pesan user masuk (maks 10 giliran terakhir).
    const history = messages.slice(-10).map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, { role: "user", text: t }]);

    let answer: string | null = null;
    let todoItems: { title: string; subtitle?: string }[] = [];

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: t,
          history,
          context: {
            tasks: (dataRef.current?.tasks ?? []).slice(0, 12).map((x) => ({
              title: x.title,
              subject: x.subject,
              dueAt: x.dueAt,
              done: x.done,
              grade: x.grade ?? null,
            })),
            subjects: dataRef.current?.subjects ?? [],
          },
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok || typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("ai-unavailable");
      }
      answer = data.reply.trim();
      if (data.type === "create_todos" && Array.isArray(data.items)) {
        todoItems = data.items.slice(0, 5);
      }
    } catch {
      answer = null;
    }

    if (answer == null) {
      setMessages((prev) => [...prev, { role: "ai", text: AI_UNAVAILABLE }]);
      setBusy(false);
      return;
    }

    // Aksi create_todos dieksekusi via server action milik siswa, lalu hasilnya
    // masuk data bersama supaya sidebar & halaman To-Do ikut ter-update.
    const created: TodoItem[] = [];
    for (const item of todoItems) {
      const row = await addTodoShared(item.title, item.subtitle);
      if (row) created.push(row);
    }

    let finalText = answer;
    if (todoItems.length > 0) {
      if (created.length) {
        const lines = created.map((t) => `• ${t.title}`).join("\n");
        finalText = `${answer}\n\n✅ ${created.length} to-do masuk ke daftarmu:\n${lines}`;
        window.gtoast?.(`${created.length} to-do ditambahkan ke daftar To-Do-mu ✨`);
      } else {
        finalText = `${answer}\n\n⚠️ To-do-nya gagal disimpan. Coba kirim ulang, atau tambahkan manual di halaman To-Do List ya.`;
        window.gtoast?.("To-do dari AI gagal disimpan.", "error");
      }
    }

    setMessages((prev) => [...prev, { role: "ai", text: finalText }]);
    setBusy(false);
  }

  return (
    <>
      <BodySync dataPage="student-ai" />

      <div className="ai-header">
        <span className="ai-avatar">
          <Sparkles size={20} aria-hidden />
        </span>
        <div>
          <h2>AI Agent</h2>
          <div className="sub">Asisten belajar pribadimu — berbasis nilai dan tugasmu</div>
        </div>
        <span className="ai-online">
          <span className="d" />
          Online
        </span>
      </div>

      <div className="chat-area">
        <div className="chat-log" ref={logRef}>
          {messages.map((m, i) => (
            <div key={i} className={"msg" + (m.role === "user" ? " user" : "")}>
              {m.role === "ai" && (
                <span className="ai-avatar">
                  <Sparkles size={15} aria-hidden />
                </span>
              )}
              <div className="bubble">{m.text}</div>
            </div>
          ))}
          {busy ? (
            <div className="msg">
              <span className="ai-avatar">
                <Sparkles size={15} aria-hidden />
              </span>
              <div className="bubble">
                <span className="typing">Mengetik</span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="suggests">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="suggest" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Tanya apa saja soal belajarmu..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
          />
          <button className="chat-send" aria-label="Kirim" onClick={() => send()}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m22 2-7 20-4-9-9-4z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
