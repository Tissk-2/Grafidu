"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { update } from "@/lib/store";

export type QuestionItem = {
  n: number;
  text: string;
};

export type QuizRunnerProps = {
  quizId: number;
  title: string;
  topic: string;
  durationMin: number;
  difficulty: string;
  questions: QuestionItem[];
  creatorSubject?: string | null;
};

type QuizResult = {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  status: string;
  feedback: string;
};

export default function StudentQuizRunner({
  title,
  topic,
  durationMin,
  difficulty,
  questions,
  creatorSubject,
}: QuizRunnerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(durationMin * 60);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  function selectOption(optIdx: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }));
  }

  // Generate realistic options for each question
  function getOptionsForQuestion(idx: number, text: string) {
    const defaultOptions = [
      "Menyajikan gagasan utama yang didukung fakta konkret dan penalaran logis.",
      "Menceritakan alur peristiwa berdasarkan imajinasi bebas tanpa batasan struktur.",
      "Menggambarkan suasana emosional tokoh utama secara mendalam dan berulang.",
      "Menyusun perbandingan subjektif tanpa menyertakan argumen penjelas.",
    ];
    if (text.includes("tokoh") || text.includes("cerpen")) {
      return [
        "Tokoh adalah pelaku cerita, sedangkan penokohan adalah watak atau karakter pelaku.",
        "Tokoh adalah latar tempat terjadinya peristiwa, penokohan adalah sudut pandang penulis.",
        "Keduanya adalah istilah yang sama untuk menunjukkan alur maju dan alur mundur.",
        "Penokohan hanya berlaku bagi tokoh antagonis dalam sebuah karya fiksi.",
      ];
    }
    if (text.includes("struktur") || text.includes("eksposisi")) {
      return [
        "Tesis (pernyataan pendapat), Argumentasi, dan Penegasan Ulang.",
        "Orientasi, Komplikasi, Resolusi, dan Koda.",
        "Pernyataan umum, Urutan sebab-akibat, dan Interpretasi.",
        "Abstraksi, Orientasi, Krisis, Reaksi, dan Koda.",
      ];
    }
    return defaultOptions;
  }

  const handleSubmitQuiz = useCallback(() => {
    if (submitted) return;
    const u = getCurrentUser();
    if (!u) return;

    const totalQuestions = questions.length || 1;
    const answeredCount = Object.keys(answers).length;
    const baseCorrect = Math.max(1, Math.round(answeredCount * 0.85));
    const score = Math.min(100, Math.round((baseCorrect / totalQuestions) * 100));

    let subject = creatorSubject || "Umum";
    const titleLower = (title + " " + topic).toLowerCase();
    if (titleLower.includes("eksposisi") || titleLower.includes("cerpen") || titleLower.includes("pidato") || titleLower.includes("bahasa") || titleLower.includes("indonesia")) {
      subject = "Bahasa Indonesia";
    } else if (titleLower.includes("seni") || titleLower.includes("budaya") || titleLower.includes("rupa") || titleLower.includes("musik")) {
      subject = "Seni Budaya";
    } else if (titleLower.includes("matematika") || titleLower.includes("fungsi") || titleLower.includes("aljabar") || titleLower.includes("geometri")) {
      subject = "Matematika";
    } else if (titleLower.includes("fisika") || titleLower.includes("mekanika") || titleLower.includes("listrik")) {
      subject = "Fisika";
    } else if (titleLower.includes("informatika") || titleLower.includes("basis data") || titleLower.includes("coding") || titleLower.includes("algoritma")) {
      subject = "Informatika";
    }

    update((db) => {
      db.grades.push({
        id: db.nextId++,
        studentId: u.id,
        subject,
        kind: "Kuis",
        score,
        gradeDate: new Date().toISOString(),
      });
    });

    setResult({
      score,
      correctAnswers: baseCorrect,
      totalQuestions,
      status: score >= 70 ? "Atas Rata Rata" : "Bawah Rata Rata",
      feedback: score >= 75
        ? "Hasil bagus! Pertahankan pemahaman konsep dasar dan ketelitian analisis."
        : "Perlu latihan lebih lanjut pada beberapa pertanyaan kunci.",
    });
    setSubmitted(true);
    window.gtoast?.("Kuis berhasil diserahkan! Skor telah dicatat ke rapor nilaimu.");
  }, [answers, creatorSubject, questions, submitted, title, topic]);

  // Timer countdown
  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted, handleSubmitQuiz]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timerStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const currentQ = questions[currentIdx] || { n: 1, text: "Pertanyaan kuis" };
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPct = totalQ ? Math.round((answeredCount / totalQ) * 100) : 0;
  const options = getOptionsForQuestion(currentIdx, currentQ.text);

  if (submitted && result) {
    return (
      <div className="detail-card" style={{ marginTop: 24, textAlign: "center", padding: "40px 24px" }}>
        <span
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: result.score >= 70 ? "var(--green-soft)" : "var(--purple-soft)",
            color: result.score >= 70 ? "#2F9E5B" : "var(--purple)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 16px",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>

        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Kuis Selesai!</h2>
        <p style={{ color: "var(--gray-3)", fontSize: 14, margin: "0 auto 20px", maxWidth: 440 }}>
          Kamu telah menyelesaikan {title}. Hasil otomatis dicatat ke riwayat nilaimu.
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            background: "#F9FAFB",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "16px 28px",
            marginBottom: 24,
          }}
        >
          <div style={{ textAlign: "left" }}>
            <span style={{ fontSize: 12.5, color: "var(--gray-4)", display: "block" }}>Skor Kamu</span>
            <b style={{ fontSize: 36, color: "var(--purple)", lineHeight: 1 }}>{result.score}</b>
            <span style={{ fontSize: 14, color: "var(--gray-4)" }}> / 100</span>
          </div>
          <div style={{ width: 1, height: 44, background: "var(--line)" }} />
          <div style={{ textAlign: "left" }}>
            <span style={{ fontSize: 12.5, color: "var(--gray-4)", display: "block" }}>Ketepatan</span>
            <b style={{ fontSize: 20 }}>{result.correctAnswers} / {result.totalQuestions} Soal</b>
            <span className={`pill ${result.score >= 70 ? "pill-green" : "pill-red"}`} style={{ display: "inline-block", marginTop: 4 }}>
              {result.status}
            </span>
          </div>
        </div>

        <div
          className="grade-note"
          style={{
            maxWidth: 520,
            margin: "0 auto 28px",
            textAlign: "left",
            background: "var(--purple-soft)",
            borderLeft: "3px solid var(--purple)",
            padding: "14px 18px",
            borderRadius: 8,
          }}
        >
          <b style={{ color: "var(--purple)", display: "block", fontSize: 13.5, marginBottom: 4 }}>
            Ulasan Analisis AI:
          </b>
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6 }}>
            {result.feedback}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <Link href="/student/grades/report" className="btn btn-outline">
            Lihat Rapor Nilai
          </Link>
          <Link href="/student/quiz" className="btn btn-primary">
            Latihan Kuis Lainnya
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-card" style={{ marginTop: 24 }}>
      {/* Quiz Top bar: Progress & Timer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 16,
          borderBottom: "1px solid var(--line-soft)",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="pill pill-green-plain" style={{ fontWeight: 600 }}>
            {difficulty}
          </span>
          <span style={{ fontSize: 13, color: "var(--gray-3)" }}>
            Soal {currentIdx + 1} dari {totalQ}
          </span>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: secondsLeft < 180 ? "var(--red-soft)" : "var(--purple-soft)",
            color: secondsLeft < 180 ? "var(--red)" : "var(--purple)",
            fontWeight: 600,
            fontSize: 14,
            padding: "6px 14px",
            borderRadius: 999,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          Sisa Waktu: {timerStr}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="prog" style={{ height: 6, marginBottom: 24 }}>
        <i style={{ width: `${progressPct}%`, transition: "width .2s ease" }}></i>
      </div>

      {/* Question Text */}
      <div style={{ marginBottom: 22 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--purple)",
            letterSpacing: ".05em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 6,
          }}
        >
          Pertanyaan #{currentIdx + 1}
        </span>
        <h3 style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.5, color: "var(--ink)" }}>
          {currentQ.text}
        </h3>
      </div>

      {/* Options */}
      <div style={{ display: "grid", gap: 10, marginBottom: 28 }}>
        {options.map((opt, optI) => {
          const isSelected = answers[currentIdx] === optI;
          const letter = ["A", "B", "C", "D"][optI];
          return (
            <button
              key={optI}
              type="button"
              onClick={() => selectOption(optI)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "14px 18px",
                border: `1.5px solid ${isSelected ? "var(--purple)" : "var(--line)"}`,
                background: isSelected ? "var(--purple-soft)" : "#fff",
                borderRadius: 10,
                textAlign: "left",
                cursor: "pointer",
                transition: "all .15s ease",
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: isSelected ? "var(--purple)" : "#F3F1F5",
                  color: isSelected ? "#fff" : "var(--ink)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {letter}
              </span>
              <span style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55 }}>
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stepper Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid var(--line-soft)",
          paddingTop: 18,
        }}
      >
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
        >
          ← Soal Sebelumnya
        </button>

        {currentIdx < totalQ - 1 ? (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setCurrentIdx((i) => Math.min(totalQ - 1, i + 1))}
          >
            Soal Berikutnya →
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSubmitQuiz}
          >
            Kirim Jawaban &amp; Lihat Skor
          </button>
        )}
      </div>

      {/* Question Pills Map */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 22 }}>
        {questions.map((q, qi) => {
          const isCurrent = qi === currentIdx;
          const isAnswered = answers[qi] !== undefined;
          return (
            <button
              key={q.n}
              type="button"
              onClick={() => setCurrentIdx(qi)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1.5px solid ${isCurrent ? "var(--purple)" : isAnswered ? "#B8A2F8" : "var(--line)"}`,
                background: isCurrent ? "var(--purple)" : isAnswered ? "var(--purple-soft)" : "#fff",
                color: isCurrent ? "#fff" : isAnswered ? "var(--purple)" : "var(--gray-3)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {q.n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
