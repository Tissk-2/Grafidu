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
import type { GradeRow } from "@/components/layout/rightbar";
import MainSkeleton from "@/components/ui/main-skeleton";
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

  // The shell (sidebar + rightbar) comes from the teacher layout, so waiting on
  // the session and the Supabase query only blanks the middle column — and even
  // that shows a skeleton rather than nothing.
  if (!u || !data) return <MainSkeleton />;

  return (
    <>
      <BodySync dataPage="student-todo" />
      <StudentTodoManager userId={u.id} />
    </>
  );
}
