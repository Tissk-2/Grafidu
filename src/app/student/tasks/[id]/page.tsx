"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRequireUser, type SessionUser } from "@/lib/auth";
import {
  fetchTasksToday,
  fetchSubjectScores,
  fetchTaskDetail,
  fetchTaskStatus,
  aiNoteFromScores,
  type SidebarTask,
  type TaskDetail,
  type TaskStatus,
} from "@/lib/supabase/queries";
import { fmtDate } from "@/lib/format";
import { useTitle } from "@/lib/hooks";
import DashboardShell from "@/components/layout/dashboard-shell";
import { StudentRightbar, type GradeRow } from "@/components/layout/rightbar";
import StudentTaskSubmission from "@/components/client/student-task-submission";
import BodySync from "@/components/body-sync";

type DetailData = {
  tasksToday: SidebarTask[];
  grades: GradeRow[];
  aiNote: string;
  task: TaskDetail;
  status: TaskStatus | null;
};

async function loadDetail(u: SessionUser, taskId: string): Promise<DetailData | null> {
  const [tasksToday, scores, task, status] = await Promise.all([
    fetchTasksToday(u),
    fetchSubjectScores(u.id),
    fetchTaskDetail(taskId),
    fetchTaskStatus(taskId, u.id),
  ]);
  if (!task) return null;
  return {
    tasksToday,
    grades: scores.map((s) => ({ subject: s.subject, score: s.score, status: s.status })),
    aiNote: aiNoteFromScores(scores),
    task,
    status,
  };
}

export default function StudentTaskDetailPage() {
  const params = useParams<{ id: string }>();
  const taskId = params.id;
  const u = useRequireUser("student");
  const [data, setData] = useState<DetailData | null>(null);
  const [notFound, setNotFound] = useState(false);
  useTitle("Detail Tugas — Grafidu");

  useEffect(() => {
    if (!u || !taskId) return;
    let cancelled = false;
    loadDetail(u, taskId).then((d) => {
      if (cancelled) return;
      if (!d) setNotFound(true);
      else setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, [u, taskId]);

  if (!u) return null;
  if (notFound) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <b>Tugas tidak ditemukan di database.</b>
        <div style={{ marginTop: 12 }}>
          <Link href="/student/tasks" className="link-underline">Kembali ke Daftar Tugas</Link>
        </div>
      </div>
    );
  }
  if (!data) return null;

  const isSubmitted = Boolean(data.status?.submittedAt);
  const submittedAtStr = data.status?.submittedAt
    ? fmtDate(data.status.submittedAt)
    : undefined;

  return (
    <>
      <BodySync dataPage="student-task-detail" />
      <DashboardShell
        role="student"
        sidebar={{
          user: { name: u.name, sub: u.className ?? "Siswa", avatar: u.avatar },
          tasksToday: data.tasksToday,
        }}
        activeNav="Tasks"
        rightbar={
          <StudentRightbar
            grades={data.grades}
            aiNote={data.aiNote}
            ctaHref="/student/todo"
            ctaLabel="Buat To-Do List"
          />
        }
      >
        <div className="crumbs">
          <Link href="/student/tasks">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Daftar Tugas
          </Link>
          <span className="sep">/</span>
          <b>{data.task.title}</b>
        </div>

        <div className="detail-card">
          <div className="detail-head">
            <span className="task-ic">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="5" y="3" width="14" height="18" rx="2.5" />
                <path d="M9 3.5V2h6v1.5" />
                <path d="m8.6 12.4 2 2 4-4" />
              </svg>
            </span>
            <div>
              <h2 style={{ fontSize: 24, marginBottom: 4 }}>{data.task.title}</h2>
              <span style={{ fontSize: 13, color: "var(--purple)", fontWeight: 500 }}>
                {data.task.subject} • {data.task.creatorName}
              </span>
            </div>
          </div>

          <div className="detail-meta">
            <span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              Ditugaskan {fmtDate(data.task.assignedAt)}
            </span>
            <span>•</span>
            <span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              Tenggat: {fmtDate(data.task.dueAt)}
            </span>
          </div>

          <div className="desc-label">Deskripsi &amp; Petunjuk Tugas</div>
          <p className="desc-text" style={{ whiteSpace: "pre-line" }}>
            {data.task.description || "Tidak ada instruksi tambahan untuk tugas ini."}
          </p>
        </div>

        <StudentTaskSubmission
          taskId={data.task.id}
          userId={u.id}
          isSubmitted={isSubmitted}
          submittedAtStr={submittedAtStr}
          grade={data.status?.grade}
          feedback={data.status?.feedback}
        />

      </DashboardShell>
    </>
  );
}
