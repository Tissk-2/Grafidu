"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { dummyGuruData, type GuruClass } from "@/lib/guru-demo";
import { classAvg, parseIdDate, studentsWithStatus, useRoutedClass } from "@/lib/guru";
import MainSkeleton from "@/components/ui/main-skeleton";
import BodySync from "@/components/body-sync";

type Msg = { role: "user" | "ai"; text: string };

const SUGGESTIONS = [
  "Buatkan rencana belajar Seni Budaya",
  "Materi apa yang harus saya pelajari?",
  "Ringkas nilai saya semester ini",
  "Buatkan latihan soal Fisika",
];

/**
 * Prototipe AI lokal: jawaban deterministik dari keyword + data dummy kelas
 * yang sedang aktif (rata-rata, siswa terlemah, materi, tenggat) supaya chat
 * terasa hidup tanpa backend. Ganti dengan pemanggilan model saat production.
 */
function teacherAiReply(text: string, kelas: GuruClass): string {
  const t = text.toLowerCase();
  const students = studentsWithStatus(kelas); // terlemah dulu
  const lowest = students[0];
  const avg = classAvg(kelas);

  if (/(rencana|plan)/.test(t)) {
    const m1 = kelas.materi[0]?.title ?? "materi kelas";
    const m2 = kelas.materi[1]?.title ?? m1;
    return (
      `Siap! Rencana seminggu untuk ${kelas.kelas}:\n` +
      `1. Review materi "${m1}" 20 menit per hari.\n` +
      `2. Kuis pendek "${m2}" tiap Rabu.\n` +
      `3. Pendampingan khusus ${lowest?.nama ?? "siswa terlemah"} (rata-rata ${lowest?.rata ?? 0}).`
    );
  }
  if (/(materi|pelajari)/.test(t)) {
    return (
      `Materi yang sudah kamu bagikan di ${kelas.kelas}:\n` +
      kelas.materi.map((m, i) => `${i + 1}. ${m.title}`).join("\n") +
      `\n\nMau kubuatkan kuis dari salah satunya?`
    );
  }
  if (/(nilai|ringkas|semester)/.test(t)) {
    const dua = students
      .slice(0, 2)
      .map((s) => `${s.nama} (${s.rata})`)
      .join(" dan ");
    return (
      `Rata-rata ${kelas.kelas} semester ini ${avg}/100. ` +
      `Yang paling perlu perhatian: ${dua}. Mau kubuatkan kuis tambahan untuk mereka?`
    );
  }
  if (/(latihan|soal|kuis|quiz)/.test(t)) {
    return (
      "Buka menu Quiz Maker: pilih kelas, tulis topik materimu, lalu tekan Generate. " +
      "Aku susunkan soal beserta kunci jawabannya otomatis."
    );
  }
  if (/(tenggat|jadwal|deadline|agenda)/.test(t)) {
    const rows = [...kelas.tugas]
      .sort((a, b) => parseIdDate(b.deadline).getTime() - parseIdDate(a.deadline).getTime())
      .slice(0, 3);
    return (
      `Tenggat tugas ${kelas.kelas} terdekat:\n` +
      rows.map((r) => `- ${r.name}: ${r.deadline}`).join("\n")
    );
  }
  if (/(siswa|perhatian|rendah|remedial)/.test(t)) {
    return (
      `Siswa yang perlu pendampingan di ${kelas.kelas}: ` +
      students
        .slice(0, 3)
        .map((s) => `${s.nama} (${s.rata})`)
        .join(", ") +
      ". Mau kubuatkan kuis remedial?"
    );
  }
  return (
    "Mau mulai dari mana: cek siswa yang perlu perhatian, lihat jadwal tenggat, " +
    'atau bilang "buatkan kuis tentang [topik]"?'
  );
}

/** Middle column only — the sidebar and rightbar come from the teacher layout. */
export default function TeacherAiAgentPage() {
  // Prototipe: guard role dimatikan supaya halaman bisa diakses tanpa login
  // sebagai guru. Kembalikan `useRequireUser("teacher")` sebelum production.
  const u = useRequireUser();
  const { kelas } = useRoutedClass();
  useTitle("AI Agent — Grafidu");

  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: `Hai ${dummyGuruData.name.split(" ").slice(0, 2).join(" ")}! 👋 Aku AI Agent Grafidu. Aku sudah lihat nilai dan tugas kelas Anda minggu ini — mau mulai dari mana?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, busy]);

  if (!u) return <MainSkeleton />;

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
        reply = teacherAiReply(t, kelas);
      } catch {
        reply = "Maaf, aku tidak bisa menjawab sekarang.";
      }
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      setBusy(false);
    }, 600);
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
      </div>
    </>
  );
}
