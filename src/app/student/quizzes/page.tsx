"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, HelpCircle, Sparkles } from "lucide-react";
import { useRequireUser } from "@/lib/auth";
import { useTitle } from "@/lib/hooks";
import { fetchStudentQuizzes } from "@/app/actions/student";
import type { StudentQuiz } from "@/lib/student-model";
import { fmtDate } from "@/lib/format";
import PageSkeleton from "@/components/ui/page-skeleton";
import BodySync from "@/components/body-sync";

/**
 * Daftar kuis tayang untuk kelas siswa (#6) — pintu masuk pengerjaan kuis.
 * Belum dikerjakan → tombol "Kerjakan"; sudah → skor + "Lihat Hasil".
 */
export default function StudentQuizzesPage() {
  const u = useRequireUser("student");
  const [quizzes, setQuizzes] = useState<StudentQuiz[] | null>(null);
  useTitle("Kuis — Grafidu");

  useEffect(() => {
    if (!u) return;
    let cancelled = false;
    fetchStudentQuizzes().then((rows) => {
      if (!cancelled) setQuizzes(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [u]);

  if (!u || quizzes === null) return <PageSkeleton />;

  const done = quizzes.filter((q) => q.attempt).length;

  return (
    <>
      <BodySync dataPage="student-quiz" />

      <header>
        <h1 className="text-[28px] leading-tight font-medium tracking-[-0.015em] text-[#111] dark:text-[#F2F0F2]">
          Kuis
        </h1>
        <p className="mt-1 text-[14px] text-[#8A8A8A] dark:text-[#8F8B91]">
          Kuis dari gurumu{u.className ? ` untuk ${u.className}` : ""} — kerjakan sebelum waktu habis.
        </p>
      </header>

      {quizzes.length > 0 && (
        <p className="mt-4 text-[13px] text-[#8A8A8A] dark:text-[#8F8B91]">
          <span className="font-medium tabular-nums text-[#222] dark:text-[#EDEBF0]">{quizzes.length}</span> kuis tayang
          <span className="px-1.5 text-[#CFCFCF] dark:text-[#4C484E]">·</span>
          <span className="font-medium tabular-nums text-[#222] dark:text-[#EDEBF0]">{done}</span> sudah dikerjakan
        </p>
      )}

      {quizzes.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-[#E5E5E5] dark:border-[#2D2B30] px-6 py-14 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-full bg-[#F4F1FE] dark:bg-[#2C2150] text-[#5B3FD6] dark:text-[#A78BFA]">
            <HelpCircle size={18} aria-hidden />
          </span>
          <p className="mt-3.5 text-[15px] font-medium text-[#222] dark:text-[#EDEBF0]">Belum ada kuis</p>
          <p className="mt-1 text-[13px] text-[#8A8A8A] dark:text-[#8F8B91]">
            Kuis dari gurumu akan muncul di sini setelah ditayangkan.
          </p>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {quizzes.map((q) => {
            const isDone = Boolean(q.attempt);
            return (
              <li key={q.id}>
                <Link
                  href={`/student/quizzes/${q.id}`}
                  className="task-row hover-lift"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span className="task-ic">
                    <HelpCircle size={20} aria-hidden />
                  </span>
                  <span className="info">
                    <b>{q.title}</b>
                    <span>
                      {q.subject} • {q.numQuestions} soal • {q.durationMin} menit • {fmtDate(q.createdAt)}
                    </span>
                  </span>
                  <span
                    className="right"
                    style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}
                  >
                    {q.attempt ? (
                      <span className="pill pill-green">Nilai: {q.attempt.score}</span>
                    ) : (
                      <span className="pill pill-red">Belum Dikerjakan</span>
                    )}
                    <span style={{ fontSize: 11, color: "var(--gray-4)", display: "inline-flex", alignItems: "center", gap: 2 }}>
                      {isDone ? "Lihat Hasil" : "Kerjakan Sekarang"} <ChevronRight size={11} aria-hidden />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-6 flex items-center gap-2 text-[13px] text-[#8A8A8A] dark:text-[#8F8B91]">
        <Sparkles size={14} aria-hidden style={{ color: "var(--purple)" }} />
        Nilai kuis otomatis masuk ke halaman Grades begitu kamu mengumpulkan.
      </p>
    </>
  );
}
