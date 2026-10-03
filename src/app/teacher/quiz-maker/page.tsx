"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { useRoutedClass } from "@/lib/guru";
import { createQuiz, deleteQuiz, setQuizStatus } from "@/app/actions/teacher";
import { useTeacherShellData } from "../teacher-shell-data";
import { fmtDate } from "@/lib/format";
import MainSkeleton from "@/components/ui/main-skeleton";
import BodySync from "@/components/body-sync";

const SPARK = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
  </svg>
);

const CHEVRON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/**
 * Prototipe AI lokal: soal disusun dari template per tingkat kesulitan, {t}
 * diganti topik yang diketik guru. Cukup untuk demo sebelum backend AI siap.
 * Kuis jadi tersimpan ke tabel quizzes/quiz_questions lewat server action.
 */
const SOAL_TEMPLATES: Record<string, string[]> = {
  Mudah: [
    "Apa yang dimaksud dengan {t}?",
    "Sebutkan dua contoh {t} yang kamu ketahui.",
    "Apa fungsi utama {t}?",
    "Sebutkan ciri dasar dari {t}.",
    "Apa manfaat mempelajari {t}?",
    "Jelaskan pengertian {t} dengan bahasamu sendiri.",
  ],
  Sedang: [
    "Jelaskan perbedaan {t} dengan konsep yang mirip dengannya.",
    "Analisislah contoh {t} berikut, lalu tentukan bagian-bagiannya.",
    "Diberikan teks tentang {t}, tentukan strukturnya.",
    "Mengapa {t} penting dalam keseharian? Berikan dua alasan.",
    "Bandingkan dua pendekatan dalam memahami {t}.",
    "Temukan kesalahan dalam contoh {t} berikut dan jelaskan.",
  ],
  Sulit: [
    "Evaluasilah penerapan {t} pada studi kasus yang diberikan guru.",
    "Buatlah analisis kritis mengenai {t} beserta argumen pendukung.",
    "Rancang sebuah karya/teks {t} atau turunannya, lalu jelaskan alasannya.",
    "Simpulkan benang merah dari materi {t} yang telah dipelajari.",
  ],
};

/** Contoh soal statis untuk panel Pratinjau Soal sebelum kuis dibuat. */
const PREVIEW_SOAL = [
  "Apa yang dimaksud dengan gagasan pokok dalam sebuah teks?",
  "Pilihlah kalimat yang menggunakan ejaan baku dengan benar.",
  "Tentukan struktur teks dari paragraf berikut.",
  "Makna kata \"persuasif\" paling tepat adalah...",
  "Cocokkan jenis teks dengan ciri-cirinya berikut.",
];

/** Middle column only — the sidebar and rightbar come from the teacher layout. */
export default function TeacherQuizMakerPage() {
  const u = useRequireUser("teacher");
  const { kelas, classes } = useRoutedClass();
  const { quizzes, refresh } = useTeacherShellData();
  useTitle("Quiz Maker — Grafidu");

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Sedang");
  const [generating, setGenerating] = useState(false);
  const [invalidTopic, setInvalidTopic] = useState(false);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  // Kelas default: kelas aktif, fallback kelas pertama.
  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(kelas?.id ?? classes[0].id);
    }
  }, [classes, kelas?.id, selectedClassId]);

  if (!u || !kelas) return <MainSkeleton />;

  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? kelas;

  function toggleAccordion(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleGenerate() {
    const rawTopic = topic.trim();
    if (!rawTopic) {
      setInvalidTopic(true);
      window.gtoast?.("Isi topik / materi dulu agar AI bisa menyusun soal.", "error");
      return;
    }
    if (generating) return;
    setInvalidTopic(false);
    setGenerating(true);

    try {
      const label = rawTopic.split("—")[0].trim().replace(/-+$/, "").trim() || rawTopic;
      const templates = SOAL_TEMPLATES[difficulty] ?? SOAL_TEMPLATES.Sedang;
      const soal: string[] = [];
      for (let i = 0; i < numQuestions; i++) {
        soal.push(templates[i % templates.length].replace(/\{t\}/g, label));
      }

      await createQuiz({
        classId: selectedClass.id,
        title: `Kuis: ${label}`,
        topic: rawTopic,
        difficulty,
        durationMin: Math.max(10, soal.length * 2),
        questions: soal,
      });
      refresh();
      window.gtoast?.("Kuis berhasil dibuat oleh AI dan disimpan sebagai draft.");
    } catch (err) {
      window.gtoast?.((err as Error).message, "error");
    } finally {
      setGenerating(false);
    }
  }

  async function handlePublish(id: string) {
    try {
      await setQuizStatus(id, "published");
      refresh();
      window.gtoast?.("Kuis tayang ke siswa.");
    } catch (err) {
      window.gtoast?.((err as Error).message, "error");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteQuiz(id);
      refresh();
      window.gtoast?.("Kuis dihapus.");
    } catch (err) {
      window.gtoast?.((err as Error).message, "error");
    }
  }

  return (
    <>
      <BodySync dataPage="teacher-quiz" />

      <header>
        <h1 className="text-[28px] leading-tight font-medium tracking-[-0.015em] text-[#111] dark:text-[#F2F0F2]">
          Quiz Maker
        </h1>
        <p className="mt-1 text-[14px] text-[#8A8A8A] dark:text-[#8F8B91]">
          Buat kuis dari materi yang sudah kamu bagikan — praktik tetap nyambung dengan apa yang
          diajarkan.
        </p>
      </header>

      <div className="quiz-grid" style={{ marginTop: 26 }}>
        {/* builder */}
        <div className="panel">
          <div className="panel-head">
            <span
              className="task-ic"
              style={{
                background: "#fff",
                border: "1.4px solid var(--purple)",
                color: "var(--purple)",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15 }}>?</span>
            </span>
            <b>Buat Kuis Baru</b>
          </div>
          <div className="f2">
            <div className="field-d">
              <label>Kelas</label>
              <div className="control">
                <select
                  value={selectedClass.id}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field-d">
              <label>Jumlah Soal</label>
              <div className="control">
                <select value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))}>
                  <option value={10}>10 soal</option>
                  <option value={15}>15 soal</option>
                  <option value={20}>20 soal</option>
                </select>
              </div>
            </div>
          </div>
          <div className="field-d">
            <label>Topik / Materi</label>
            <div className={"control" + (invalidTopic ? " invalid" : "")}>
              <textarea
                placeholder="Contoh: Teks Eksposisi — struktur, kebahasaan, dan contoh ..."
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (e.target.value.trim()) setInvalidTopic(false);
                }}
              />
            </div>
            <p className="hint">AI menyusun soal dari materi yang kamu bagikan di menu Materi.</p>
          </div>
          <div className="field-d">
            <label>Tingkat Kesulitan</label>
            <div className="diff-chips">
              {["Mudah", "Sedang", "Sulit"].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={"diff" + (difficulty === d ? " on" : "")}
                  onClick={() => setDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <button
            className={"btn btn-primary btn-generate" + (generating ? " is-loading" : "")}
            type="button"
            onClick={handleGenerate}
            disabled={generating}
          >
            {SPARK}
            Generate Kuis dengan AI
          </button>
        </div>

        {/* preview */}
        <div className="panel">
          <div className="panel-head">
            <span className="task-ic" style={{ background: "var(--purple-soft)", color: "var(--purple)" }}>
              {SPARK}
            </span>
            <span>
              <b>Pratinjau Soal</b>
              <span className="sub">
                {difficulty} · {numQuestions} soal · {selectedClass.name}
              </span>
            </span>
          </div>
          <div className="preview-list">
            {PREVIEW_SOAL.map((s, i) => (
              <div key={i} className="preview-item">
                <span className="n">{i + 1}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
          <div className="preview-note">Soal lengkap beserta kunci jawaban otomatis tersimpan saat kuis dibuat.</div>
        </div>
      </div>

      <div className="sec-row">
        <h3>Kuis Saya</h3>
        <Link className="link-underline" href="/teacher/quiz-maker">
          Lihat Semua
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-[#E5E5E5] dark:border-[#2D2B30] px-6 py-14 text-center">
          <p className="text-[15px] font-medium text-[#222] dark:text-[#EDEBF0]">Belum ada kuis</p>
          <p className="mt-1 text-[13px] text-[#8A8A8A] dark:text-[#8F8B91]">
            Isi topik di atas lalu Generate — kuis buatan AI muncul di sini.
          </p>
        </div>
      ) : (
        <div>
          {quizzes.map((qz) => {
            const isOpen = openIds.has(qz.id);
            const tayang = qz.status === "published";
            return (
              <div key={qz.id} className={"quiz-row acc-row" + (isOpen ? " open" : "")}>
                <span className="task-ic">
                  <span style={{ color: "var(--purple)", fontWeight: 700 }}>?</span>
                </span>
                <span className="info">
                  <b>{qz.title}</b>
                  <span>
                    {kelas.name} · {qz.numQuestions} soal · {qz.durationMin} menit ·{" "}
                    {fmtDate(qz.createdAt)}
                  </span>
                </span>
                <span className="right">
                  <span className={"pill " + (tayang ? "pill-green-plain" : "pill-gray")}>
                    {tayang ? "Tayang" : "Draft"}
                  </span>
                  <button
                    className="chev"
                    aria-expanded={isOpen}
                    aria-label="Detail kuis"
                    onClick={() => toggleAccordion(qz.id)}
                  >
                    {CHEVRON}
                  </button>
                </span>
                <div className="acc-body">
                  <div>
                    <div className="acc-inner">
                      <div className="acc-title">Pratinjau Soal</div>
                      <ul className="acc-list">
                        {qz.questions.map((s, i) => (
                          <li key={i}>
                            <span className="n">{i + 1}</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="acc-meta" style={{ marginTop: 12 }}>
                        <span>
                          <b>Topik:</b> {qz.topic}
                        </span>
                        <span>
                          <b>Kelas:</b> {kelas.name}
                        </span>
                      </div>
                      <div className="acc-actions">
                        {!tayang ? (
                          <button className="btn-mini btn-mini-primary" onClick={() => handlePublish(qz.id)}>
                            Tayangkan
                          </button>
                        ) : null}
                        <button className="btn-mini btn-mini-danger" onClick={() => handleDelete(qz.id)}>
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
