"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { useRoutedClass } from "@/lib/guru";
import { useTeacherShellData } from "../teacher-shell-data";
import { createQuiz } from "@/app/actions/teacher";
import MainSkeleton from "@/components/ui/main-skeleton";
import BodySync from "@/components/body-sync";

type Msg = { role: "user" | "ai"; text: string };
type QuizDraft = { title: string; topic: string; difficulty: string; questions: string[] };

const SUGGESTIONS = [
  "Siswa mana yang perlu perhatian?",
  "Ringkas nilai kelas saya",
  "Apa tenggat tugas ke depan?",
  "Buatkan kuis 5 soal dari materi terbaru",
];

const AI_UNAVAILABLE = "Layanan AI sedang tidak terjangkau. Coba kirim ulang sebentar lagi.";

/** Middle column only — the sidebar and rightbar come from the teacher layout. */
export default function TeacherAiAgentPage() {
  // Prototipe: guard role dimatikan supaya halaman bisa diakses tanpa login
  // sebagai guru. Kembalikan `useRequireUser("teacher")` sebelum production.
  const u = useRequireUser("teacher");
  const { kelas } = useRoutedClass();
  const { tasks, roster, materials, refresh } = useTeacherShellData();
  useTitle("AI Agent — Grafidu");

  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: `Hai ${u ? u.name.split(" ").slice(0, 2).join(" ") : "Bu"}! 👋 Aku AI Agent Grafidu. Aku sudah lihat nilai dan tugas kelas Anda minggu ini — mau mulai dari mana?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, busy]);

  if (!u || !kelas) return <MainSkeleton />;
  // TS narrowing tidak menembus closure setTimeout — kunci di konstanta lokal.
  const activeKelas = kelas;

  async function send(text?: string) {
    const t = (text ?? input).trim();
    if (!t || busy) return;
    setInput("");
    setBusy(true);
    // Riwayat diambil sebelum pesan user masuk (maks 10 giliran terakhir).
    const history = messages.slice(-10).map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, { role: "user", text: t }]);

    let answer: string | null = null;
    let quizDraft: QuizDraft | null = null;
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: t,
          history,
          context: {
            className: activeKelas.name,
            materials: materials.slice(0, 10).map((m) => ({
              title: m.title,
              description: m.description,
            })),
            tasks: tasks.slice(0, 8).map((x) => ({
              title: x.title,
              dueAt: x.dueAt,
              submitted: x.submitted,
              total: x.total,
            })),
            roster: roster.map((r) => ({ nama: r.name, rata: r.avg })),
          },
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok || typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("ai-unavailable");
      }
      answer = data.reply.trim();
      if (data.type === "create_quiz" && data.quiz && Array.isArray(data.quiz.questions)) {
        quizDraft = data.quiz as QuizDraft;
      }
    } catch {
      answer = null;
    }

    if (answer == null) {
      setMessages((prev) => [...prev, { role: "ai", text: AI_UNAVAILABLE }]);
      setBusy(false);
      return;
    }

    // Kuis dari chat langsung disimpan sebagai draft kelas aktif, sama seperti
    // yang dibuat lewat form Quiz Maker — muncul di Kuis Saya untuk ditinjau.
    let finalText = answer;
    if (quizDraft) {
      try {
        await createQuiz({
          classId: activeKelas.id,
          title: quizDraft.title,
          topic: quizDraft.topic || t,
          difficulty: quizDraft.difficulty,
          durationMin: Math.max(10, quizDraft.questions.length * 2),
          questions: quizDraft.questions,
        });
        refresh();
        finalText = `${answer}\n\n✅ ${quizDraft.questions.length} soal tersimpan sebagai draft di Quiz Maker — tinjau lalu tayangkan dari sana.`;
        window.gtoast?.("Kuis dari chat tersimpan sebagai draft ✨");
      } catch {
        finalText = `${answer}\n\n⚠️ Soalnya gagal disimpan. Coba kirim ulang, atau buat lewat halaman Quiz Maker ya.`;
        window.gtoast?.("Kuis dari chat gagal disimpan.", "error");
      }
    }

    setMessages((prev) => [...prev, { role: "ai", text: finalText }]);
    setBusy(false);
  }

  return (
    <>
      <BodySync dataPage="teacher-ai" />

      <div className="ai-header">
        <span className="ai-avatar">
          <Sparkles size={20} aria-hidden />
        </span>
        <div>
          <h2>AI Agent</h2>
          <div className="sub">Asisten pengajar — berbasis nilai, tugas, dan materi kelasmu</div>
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
        <div className="chat-foot">
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
              placeholder="Tanya apa saja soal kelasmu..."
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
      </div>
    </>
  );
}
