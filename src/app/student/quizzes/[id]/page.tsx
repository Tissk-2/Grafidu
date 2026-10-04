"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, ChevronLeft, HelpCircle, XCircle } from "lucide-react";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { fetchQuizPlay, submitQuizAttempt, type QuizSubmitResult } from "@/app/actions/student";
import { fmtDate } from "@/lib/format";
import PageSkeleton from "@/components/ui/page-skeleton";
import BodySync from "@/components/body-sync";

/**
 * Pemain kuis siswa (#6). Satu soal per layar dengan progres + hitung waktu;
 * kunci jawaban TIDAK pernah dikirim ke klien — penilaian terjadi di server
 * (submitQuizAttempt) dan hasilnya masuk tabel grades. Satu kali kerjakan:
 * setelah mengumpulkan, halaman berubah menjadi review jawaban.
 */

const LETTERS = ["A", "B", "C", "D", "E"];

function fmtClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function StudentQuizPlayPage() {
  const params = useParams<{ id: string }>();
  const quizId = params?.id ?? "";
  const u = useRequireUser("student");
  const router = useRouter();
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchQuizPlay>>>(null);
  const [notFound, setNotFound] = useState(false);

  // status pengerjaan
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const startedAtRef = useRef<number>(0);

  useTitle(data ? `${data.title} — Grafidu` : "Kuis — Grafidu");

  useEffect(() => {
    if (!u || !quizId) return;
    let cancelled = false;
    fetchQuizPlay(quizId).then((d) => {
      if (cancelled) return;
      if (!d) setNotFound(true);
      else {
        setData(d);
        setAnswers(Array(d.questions.length).fill(null));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [u, quizId]);

  const submit = useCallback(
    async (auto = false) => {
      if (submitting) return;
      setSubmitting(true);
      try {
        const res = await submitQuizAttempt(quizId, answers);
        setResult(res);
        setStarted(false);
        window.gtoast?.(
          (auto ? "Waktu habis — jawaban dikumpulkan otomatis. " : "") +
            `Nilai kamu: ${res.score}`,
        );
      } catch (err) {
        window.gtoast?.((err as Error).message, "error");
        if ((err as Error).message.includes("sudah mengerjakan")) {
          router.replace("/student/quizzes");
        }
      } finally {
        setSubmitting(false);
      }
    },
    [answers, quizId, router, submitting],
  );

  // Countdown: mulai saat pengerjaan dimulai; habis → kumpulkan otomatis.
  useEffect(() => {
    if (!started || result) return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.round((startedAtRef.current + (data?.durationMin ?? 20) * 60_000 - Date.now()) / 1000),
      );
      setRemaining(left);
      if (left === 0) {
        void submit(true);
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [started, result, data?.durationMin, submit]);

  const total = data?.questions.length ?? 0;
  const answered = useMemo(() => answers.filter((a) => a !== null).length, [answers]);
  const progress = total ? Math.round((answered / total) * 100) : 0;
  const attempt = data?.attempt ?? null;
  const review = result?.review ?? attempt?.review ?? null;

  if (!u || (!data && !notFound)) return <PageSkeleton />;

  if (notFound || !data) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <b>Kuis tidak ditemukan atau belum tayang.</b>
        <div style={{ marginTop: 12 }}>
          <Link href="/student/quizzes" className="link-underline">Kembali ke Daftar Kuis</Link>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Hasil (segar dari submit atau dari attempt tersimpan)
  // ---------------------------------------------------------------------------
  if (result || attempt) {
    const shownScore = result?.score ?? attempt!.score;
    const shownCorrect = result?.correct ?? review!.filter((r) => r.chosen === r.answerIdx).length;
    const shownTotal = result?.total ?? review!.length;
    return (
      <>
        <BodySync dataPage="student-quiz" />
        <nav className="crumbs">
          <Link href="/student/quizzes">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Daftar Kuis
          </Link>
          <span className="sep">/</span>
          <b>{data.title}</b>
        </nav>

        <div className="detail-card" style={{ textAlign: "center", padding: "36px 24px" }}>
          <span
            className="mx-auto grid size-14 place-items-center rounded-full"
            style={{
              background: shownScore >= 70 ? "var(--green-soft)" : "var(--red-soft)",
              color: shownScore >= 70 ? "#2F9E5B" : "#B0504C",
            }}
          >
            {shownScore >= 70 ? <CheckCircle2 size={26} aria-hidden /> : <AlertTriangle size={26} aria-hidden />}
          </span>
          <h2 style={{ fontSize: 22, marginTop: 14, marginBottom: 2 }}>
            {shownScore >= 70 ? "Kerja Bagus!" : "Terus Semangat Belajar!"}
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--gray-4)", margin: 0 }}>
            Kuis {data.title} • dikerjakan {fmtDate(result ? new Date().toISOString() : attempt!.submittedAt)}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 26, marginTop: 22, flexWrap: "wrap" }}>
            <div>
              <b style={{ fontSize: 32, color: "var(--purple)" }}>{shownScore}</b>
              <span style={{ display: "block", fontSize: 12.5, color: "var(--gray-4)" }}>Nilai (0-100)</span>
            </div>
            <div>
              <b style={{ fontSize: 32 }}>{shownCorrect}</b>
              <span style={{ display: "block", fontSize: 12.5, color: "var(--gray-4)" }}>Jawaban Benar</span>
            </div>
            <div>
              <b style={{ fontSize: 32 }}>{shownTotal}</b>
              <span style={{ display: "block", fontSize: 12.5, color: "var(--gray-4)" }}>Total Soal</span>
            </div>
          </div>
          <p className="hint" style={{ marginTop: 18 }}>
            Nilai ini sudah otomatis tercatat di halaman <Link href="/student/grades" className="link-underline">Grades</Link>.
          </p>
        </div>

        {review ? (
          <div style={{ marginTop: 24 }}>
            <h2 className="h2" style={{ marginBottom: 12 }}>Review Jawaban</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {review.map((r, i) => {
                const isRight = r.chosen === r.answerIdx;
                return (
                  <div key={i} className="detail-card" style={{ margin: 0, padding: 18 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ flexShrink: 0, marginTop: 1, color: isRight ? "#2F9E5B" : "#B0504C" }}>
                        {isRight ? <CheckCircle2 size={17} aria-hidden /> : <XCircle size={17} aria-hidden />}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <b style={{ fontSize: 14.5 }}>
                          {i + 1}. {r.text}
                        </b>
                        <div style={{ display: "grid", gap: 5, marginTop: 10 }}>
                          {r.options.map((opt, j) => {
                            const isAnswer = j === r.answerIdx;
                            const isChosen = j === r.chosen;
                            return (
                              <div
                                key={j}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  fontSize: 13.5,
                                  padding: "7px 12px",
                                  borderRadius: 8,
                                  border: `1px solid ${isAnswer ? "#2F9E5B55" : isChosen ? "#B0504C55" : "var(--line)"}`,
                                  background: isAnswer
                                    ? "var(--green-soft)"
                                    : isChosen
                                      ? "var(--red-soft)"
                                      : "transparent",
                                  fontWeight: isAnswer || isChosen ? 600 : 400,
                                }}
                              >
                                <b style={{ flexShrink: 0 }}>{LETTERS[j] ?? j + 1}.</b>
                                <span style={{ flex: 1 }}>{opt}</span>
                                {isAnswer ? (
                                  <span style={{ fontSize: 11.5, color: "#2F9E5B", flexShrink: 0 }}>Kunci</span>
                                ) : isChosen ? (
                                  <span style={{ fontSize: 11.5, color: "#B0504C", flexShrink: 0 }}>Jawabanmu</span>
                                ) : null}
                              </div>
                            );
                          })}
                          {r.chosen == null ? (
                            <span style={{ fontSize: 12.5, color: "var(--gray-4)" }}>
                              Kamu tidak menjawab soal ini.
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // Pembuka: info kuis + tombol mulai
  // ---------------------------------------------------------------------------
  if (!started) {
    return (
      <>
        <BodySync dataPage="student-quiz" />
        <nav className="crumbs">
          <Link href="/student/quizzes">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Daftar Kuis
          </Link>
          <span className="sep">/</span>
          <b>{data.title}</b>
        </nav>

        <div className="detail-card">
          <div className="detail-head">
            <span className="task-ic">
              <HelpCircle size={22} aria-hidden />
            </span>
            <div>
              <h2 style={{ fontSize: 24, marginBottom: 4 }}>{data.title}</h2>
              <span style={{ fontSize: 13, color: "var(--purple)", fontWeight: 500 }}>
                {data.subject} • {data.teacherName}
              </span>
            </div>
          </div>

          <div className="detail-meta">
            <span>{total} soal</span>
            <span>•</span>
            <span>{data.durationMin} menit</span>
            <span>•</span>
            <span>Kesulitan: {data.difficulty}</span>
          </div>

          <div className="desc-label">Petunjuk Pengerjaan</div>
          <p className="desc-text" style={{ whiteSpace: "pre-line" }}>
            {data.topic
              ? `Kuis tentang ${data.topic}. `
              : ""}
            Jawab semua {total} soal pilihan ganda, lalu kumpulkan. Waktu pengerjaan{" "}
            {data.durationMin} menit dan berjalan otomatis setelah kamu menekan Mulai —
            bila waktu habis, jawaban terkumpul otomatis. Nilai kuis langsung masuk ke halaman Grades.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            disabled={total === 0}
            onClick={() => {
              startedAtRef.current = Date.now();
              setRemaining((data.durationMin ?? 20) * 60);
              setStarted(true);
            }}
          >
            {total === 0 ? "Kuis belum punya soal" : "Mulai Kerjakan"}
          </button>
        </div>
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // Pemain: satu soal per layar
  // ---------------------------------------------------------------------------
  const q = data.questions[current];
  const lowTime = remaining <= 30;
  return (
    <>
      <BodySync dataPage="student-quiz" />

      <div className="detail-card" style={{ margin: 0 }}>
        {/* header waktu + progres */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <b style={{ fontSize: 15 }}>{data.title}</b>
          <span
            className="tabular-nums"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 700,
              fontSize: 15,
              color: lowTime ? "#B0504C" : "var(--purple)",
              background: lowTime ? "var(--red-soft)" : "var(--purple-soft)",
              padding: "5px 12px",
              borderRadius: 999,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            {fmtClock(remaining)}
          </span>
        </div>
        <div className="prog" style={{ marginTop: 12 }}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <span style={{ fontSize: 12.5, color: "var(--gray-4)" }}>
          {answered}/{total} terjawab
        </span>

        {/* soal aktif */}
        <div style={{ marginTop: 22 }}>
          <span
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 700,
              color: "var(--purple)",
              background: "var(--purple-soft)",
              padding: "3px 10px",
              borderRadius: 999,
            }}
          >
            Soal {current + 1} / {total}
          </span>
          <p style={{ fontSize: 16.5, fontWeight: 600, lineHeight: 1.55, margin: "12px 0 16px" }}>{q.text}</p>

          <div style={{ display: "grid", gap: 9 }}>
            {q.options.map((opt, j) => {
              const on = answers[current] === j;
              return (
                <button
                  key={j}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => prev.map((a, i) => (i === current ? j : a)))
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    textAlign: "left",
                    fontSize: 14.5,
                    lineHeight: 1.5,
                    padding: "12px 15px",
                    borderRadius: 10,
                    border: `1.6px solid ${on ? "var(--purple)" : "var(--line)"}`,
                    background: on ? "var(--purple-soft)" : "var(--surface)",
                    fontWeight: on ? 600 : 400,
                    transition: "border-color .12s, background .12s",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: on ? "#fff" : "var(--gray-4)",
                      background: on ? "var(--purple)" : "var(--surface-2)",
                    }}
                  >
                    {LETTERS[j] ?? j + 1}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* navigasi */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginTop: 24,
            borderTop: "1px solid var(--line)",
            paddingTop: 16,
          }}
        >
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={current === 0}
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          >
            <ChevronLeft size={14} aria-hidden /> Sebelumnya
          </button>

          {current < total - 1 ? (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
            >
              Soal Berikutnya
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={submitting}
              onClick={() => void submit()}
            >
              {submitting ? "Mengumpulkan…" : `Kumpulkan Jawaban (${answered}/${total})`}
            </button>
          )}
        </div>
      </div>

      {/* kumpulkan dari tengah: akses cepat dari soal mana pun */}
      {current < total - 1 ? (
        <button
          type="button"
          className="btn btn-outline"
          style={{ marginTop: 14, alignSelf: "center" }}
          disabled={submitting}
          onClick={() => void submit()}
        >
          {submitting ? "Mengumpulkan…" : `Kumpulkan Sekarang (${answered}/${total})`}
        </button>
      ) : null}
    </>
  );
}
