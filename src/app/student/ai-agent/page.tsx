"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { type SchoolTask, type SubjectScore } from "@/lib/supabase/queries";
import { fmtDate } from "@/lib/format";
import PageSkeleton from "@/components/ui/page-skeleton";
import BodySync from "@/components/body-sync";
import { useStudentShellData } from "../student-shell-data";

type Msg = { role: "user" | "ai"; text: string };
type PageData = { tasks: SchoolTask[]; subjects: SubjectScore[] };

const SUGGESTIONS = [
  "Buatkan rencana belajar",
  "Kapan tenggat tugasku?",
  "Ringkas nilai saya semester ini",
  "Mapel apa yang perlu aku fokuskan?",
];

/**
 * Prototipe AI lokal untuk siswa: jawaban deterministik dari keyword + data
 * asli siswa (tugas & nilai dari Supabase). Ganti dengan pemanggilan model
 * saat production.
 */
function studentAiReply(text: string, data: PageData): string {
  const t = text.toLowerCase();
  const undone = data.tasks
    .filter((x) => !x.done)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  const graded = data.tasks.filter((x) => x.grade != null);
  const taskAvg = graded.length
    ? Math.round(graded.reduce((acc, x) => acc + (x.grade ?? 0), 0) / graded.length)
    : null;
  const byScore = [...data.subjects].sort((a, b) => a.score - b.score);
  const weakest = byScore[0];
  const strongest = byScore[byScore.length - 1];

  if (/(tenggat|jadwal|deadline|agenda|kapan)/.test(t)) {
    if (!undone.length)
      return "Tidak ada tenggat yang akan datang. Waktunya santai, atau minta latihan soal tambahan?";
    return (
      "Tenggat tugasmu ke depan:\n" +
      undone
        .slice(0, 4)
        .map((x) => `- ${x.title} (${x.subject || "Umum"}): ${fmtDate(x.dueAt)}`)
        .join("\n")
    );
  }
  if (/(rencana|plan)/.test(t)) {
    if (!byScore.length)
      return "Belum ada nilai tercatat, jadi aku belum bisa menyusun rencana. Mulai dari mengerjakan tugas yang ada ya!";
    return (
      `Siap! Rencana minggu ini:\n` +
      `1. Review materi ${weakest.subject} 20 menit per hari.\n` +
      (byScore[1] ? `2. Latihan soal ${byScore[1].subject} dua kali seminggu.\n` : "") +
      (strongest ? `3. Jaga nilai ${strongest.subject} dengan kuis singkat tiap Jumat.` : "")
    );
  }
  if (/(nilai|ringkas|semester)/.test(t)) {
    if (!byScore.length && taskAvg == null)
      return "Belum ada nilai yang bisa kuringkas. Minta gurumu mengisi nilai dulu ya.";
    const bagian: string[] = [];
    if (taskAvg != null) bagian.push(`Rata-rata tugasmu ${taskAvg}/100`);
    if (byScore.length)
      bagian.push(
        `paling kuat di ${strongest.subject} (${strongest.score}), paling perlu perhatian di ${weakest.subject} (${weakest.score})`,
      );
    return bagian.join(", ") + ". Mau kubuatkan rencana belajar?";
  }
  if (/(fokus|lemah|perhatian)/.test(t)) {
    if (!byScore.length) return "Belum ada nilai per mapel. Setelah dinilai, aku bisa tunjukkan prioritas belajarmu.";
    return (
      "Prioritas belajarmu:\n" +
      byScore
        .slice(0, 3)
        .map((s, i) => `${i + 1}. ${s.subject} (${s.score})`)
        .join("\n")
    );
  }
  if (/(latihan|soal|kuis|quiz)/.test(t)) {
    return (
      `Aku rekomendasikan latihan kuis untuk ${weakest?.subject ?? "pelajaran terbaru"}. ` +
      "Kerjakan pelan-pelan, satu topik per hari."
    );
  }
  if (/(tugas|hari ini|PR)/.test(t)) {
    if (!data.tasks.length) return "Belum ada tugas dari gurumu. Nikmati dulu waktunya!";
    if (!undone.length) return "Semua tugas sudah selesai. Keren, pertahankan! 🎉";
    return (
      "Tugas yang belum selesai:\n" +
      undone
        .slice(0, 3)
        .map((x) => `- ${x.title} (${x.subject || "Umum"}): ${fmtDate(x.dueAt)}`)
        .join("\n")
    );
  }
  return 'Mau mulai dari mana: lihat tenggat tugas, ringkas nilai, atau minta rencana belajar? Bilang saja "buatkan to-do list" kalau mau kususunkan.';
}

/** Middle column only — the sidebar and rightbar come from the student layout. */
export default function StudentAiAgentPage() {
  const u = useRequireUser("student");
  const shell = useStudentShellData();
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

  function send(text?: string) {
    const t = (text ?? input).trim();
    if (!t || busy) return;
    setInput("");
    setBusy(true);
    setMessages((prev) => [...prev, { role: "user", text: t }]);
    // Jeda singkat supaya indikator mengetik terbaca.
    window.setTimeout(() => {
      let reply: string;
      try {
        reply = studentAiReply(t, dataRef.current ?? { tasks: [], subjects: [] });
      } catch {
        reply = "Maaf, aku tidak bisa menjawab sekarang.";
      }
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      setBusy(false);
    }, 600);
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
