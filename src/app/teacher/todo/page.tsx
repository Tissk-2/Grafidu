"use client";

import { useEffect, useState } from "react";
import { useRequireUser } from "@/lib/auth";
import { fetchTasksToday, fetchSubjectScores } from "@/app/actions/student";
import { aiNoteFromScores, type SidebarTask } from "@/lib/student-model";
import { useTitle } from "@/lib/hooks";
import type { GradeRow } from "@/components/layout/rightbar";
import PageSkeleton from "@/components/ui/page-skeleton";
import StudentTodoManager from "@/components/client/student-todo-manager";
import BodySync from "@/components/body-sync";

type TodoPageData = {
  tasksToday: SidebarTask[];
  grades: GradeRow[];
  aiNote: string;
};

async function loadTodoPage(): Promise<TodoPageData> {
  const [tasksToday, scores] = await Promise.all([
    fetchTasksToday(),
    fetchSubjectScores(),
  ]);
  return {
    tasksToday,
    grades: scores.map((s) => ({ subject: s.subject, score: s.score, status: s.status })),
    aiNote: aiNoteFromScores(scores),
  };
}

export default function StudentTodoPage() {
  const u = useRequireUser("teacher");
  const [data, setData] = useState<TodoPageData | null>(null);
  useTitle("To-Do List Pribadi — Grafidu");

  useEffect(() => {
    if (!u) return;
    let cancelled = false;
    loadTodoPage().then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, [u]);

  // The shell (sidebar + rightbar) comes from the teacher layout, so waiting on
  // the session and the Supabase query only blanks the middle column — and even
  // that shows a skeleton rather than nothing.
  if (!u || !data) return <PageSkeleton />;

  return (
    <>
      <BodySync dataPage="student-todo" />
      <StudentTodoManager />
    </>
  );
}
