"use client";

import { useEffect, useState } from "react";
import { useRequireUser, type SessionUser } from "@/lib/auth";
import {
  fetchTasksToday,
  fetchSubjectScores,
  aiNoteFromScores,
  type SidebarTask,
} from "@/lib/supabase/queries";
import { useTitle } from "@/lib/hooks";
import DashboardShell from "@/components/layout/dashboard-shell";
import { StudentRightbar, type GradeRow } from "@/components/layout/rightbar";
import StudentTodoManager from "@/components/client/student-todo-manager";
import BodySync from "@/components/body-sync";

type TodoPageData = {
  tasksToday: SidebarTask[];
  grades: GradeRow[];
  aiNote: string;
};

async function loadTodoPage(u: SessionUser): Promise<TodoPageData> {
  const [tasksToday, scores] = await Promise.all([
    fetchTasksToday(u),
    fetchSubjectScores(u.id),
  ]);
  return {
    tasksToday,
    grades: scores.map((s) => ({ subject: s.subject, score: s.score, status: s.status })),
    aiNote: aiNoteFromScores(scores),
  };
}

export default function StudentTodoPage() {
  // Prototipe: guard role dimatikan supaya halaman bisa diakses tanpa login
  // sebagai guru. Kembalikan `useRequireUser("teacher")` sebelum production.
  const u = useRequireUser();
  const [data, setData] = useState<TodoPageData | null>(null);
  useTitle("To-Do List Pribadi — Grafidu");

  useEffect(() => {
    if (!u) return;
    let cancelled = false;
    loadTodoPage(u).then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, [u]);

  if (!u || !data) return null;

  return (
    <>
      <BodySync dataPage="student-todo" />
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
        <StudentTodoManager userId={u.id} />
      </DashboardShell>
    </>
  );
}
