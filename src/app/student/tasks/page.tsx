"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireUser, type SessionUser } from "@/lib/auth";
import {
  fetchTodos,
  fetchSchoolTasks,
  fetchClassTeachers,
  type SchoolTask,
  type ClassTeacher,
} from "@/lib/supabase/queries";
import { fmtDate } from "@/lib/format";
import { useTitle } from "@/lib/hooks";
import StudentTasksSkeleton from "@/components/ui/student-tasks-skeleton";
import StudentClassSearch from "@/components/client/student-class-search";
import BodySync from "@/components/body-sync";

type TasksData = {
  todoPct: number;
  schoolTasks: SchoolTask[];
  classes: ClassTeacher[];
};

async function loadTasks(u: SessionUser): Promise<TasksData> {
  const [todos, schoolTasks, classes] = await Promise.all([
    fetchTodos(u.id),
    fetchSchoolTasks(u),
    fetchClassTeachers(u.className),
  ]);
  const todoPct = todos.length
    ? Math.round((todos.filter((t) => t.done).length / todos.length) * 100)
    : 0;
  return { todoPct, schoolTasks, classes };
}

/** Middle column only — the sidebar and rightbar come from the student layout. */
export default function StudentTasksPage() {
  const u = useRequireUser("student");
  const [data, setData] = useState<TasksData | null>(null);
  useTitle("Daftar Tugas — Grafidu");

  useEffect(() => {
    if (!u) return;
    let cancelled = false;
    loadTasks(u).then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, [u]);

  // The shell (sidebar + rightbar) comes from the student layout and is already
  // rendered, so this wait only affects the middle column — and even that shows
  // a skeleton rather than nothing.
  if (!u || !data) return <StudentTasksSkeleton />;

  return (
    <>
      <BodySync dataPage="student-tasks" />
      <h1 className="page-title">Daftar Tugas</h1>
      <p className="page-sub">Kelola pengerjaan tugas sekolah, project dan target harianmu.</p>

      <div className="progress-card" style={{ marginTop: 24 }}>
        <div className="head">
          <span>Progres Penyelesaian To-Do</span>
          <b data-progress-label>{data.todoPct}%</b>
        </div>
        <div className="prog">
          <i data-progress-fill style={{ width: `${data.todoPct}%` }}></i>
        </div>
      </div>

      {/* School Assignments Section */}
      <div className="sec-row" style={{ marginTop: 28, marginBottom: 14 }}>
        <h2 className="h2" style={{ margin: 0 }}>Tugas Sekolah</h2>
        <span style={{ fontSize: 13, color: "var(--gray-4)" }}>
          {data.schoolTasks.length} tugas terdaftar
        </span>
      </div>

      {data.schoolTasks.length === 0 ? (
        <div className="empty-state" style={{ display: "block" }}>
          <span className="es-ic">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="5" y="3" width="14" height="18" rx="2.5" />
              <path d="m8.6 12.4 2 2 4-4" />
            </svg>
          </span>
          <b>Belum ada tugas</b>
          <span>
            {u.className
              ? `Kelas ${u.className} belum memiliki tugas di database.`
              : "Akunmu belum terdaftar di kelas mana pun."}
          </span>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {data.schoolTasks.map((t) => {
            const isGraded = t.grade != null;
            return (
              <Link
                key={t.id}
                href={`/student/tasks/${t.id}`}
                className="task-row hover-lift"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="task-ic">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="5" y="3" width="14" height="18" rx="2.5" />
                    <path d="M9 3.5V2h6v1.5" />
                    <path d="m8.6 12.4 2 2 4-4" />
                  </svg>
                </span>
                <span className="info">
                  <b>{t.title}</b>
                  <span>{t.subject} • Tenggat: {fmtDate(t.dueAt)}</span>
                </span>
                <span className="right" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  {isGraded ? (
                    <span className="pill pill-green">Nilai: {t.grade}</span>
                  ) : t.done ? (
                    <span className="pill pill-green-plain">Sudah Dikumpulkan</span>
                  ) : (
                    <span className="pill pill-red">Belum Selesai</span>
                  )}
                  <span style={{ fontSize: 11, color: "var(--gray-4)" }}>Buka Detail →</span>
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Classes search */}
      <h2 className="h2" style={{ marginTop: 32 }}>Kelas yang Diikuti</h2>
      <StudentClassSearch classes={data.classes} />
    </>
  );
}
