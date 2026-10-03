"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchAnnouncements, fetchSchoolTasks, fetchSubjectScores, fetchTodos, fetchTasksToday } from "@/app/actions/student";
import {
  avgOf,
  aiNoteFromScores,
  type AnnouncementItem,
  type SchoolTask,
  type SidebarTask,
  type SubjectScore,
  type TodoItem,
} from "@/lib/student-model";
import type { SessionUser } from "@/lib/auth";
import type { GradeRow } from "@/components/layout/rightbar";

export type StudentShellData = {
  /** null until the first load resolves — callers show a skeleton meanwhile. */
  data: {
    tasksToday: SidebarTask[];
    grades: GradeRow[];
    subjects: SubjectScore[];
    avg: number;
    announcements: AnnouncementItem[];
    aiNote: string;
    schoolTasks: SchoolTask[];
    todos: TodoItem[];
  } | null;
};

/**
 * The sidebar, rightbar AND most student pages need the same rows. Fetching
 * once here (the provider stays mounted across navigation) and sharing it
 * through context means /student/grades, /student/ai-agent and /student/tasks
 * render from cache instead of re-querying the same tables on every visit.
 */
const Ctx = createContext<StudentShellData>({ data: null });

export function StudentShellDataProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: React.ReactNode;
}) {
  const [data, setData] = useState<StudentShellData["data"]>(null);
  const value = useMemo(() => ({ data }), [data]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    Promise.all([
      fetchTasksToday(),
      fetchSubjectScores(),
      fetchAnnouncements(3),
      fetchSchoolTasks(),
      fetchTodos(),
    ]).then(([tasksToday, scores, announcements, schoolTasks, todos]) => {
      if (cancelled) return;
      setData({
        tasksToday,
        grades: scores.map((s) => ({ subject: s.subject, score: s.score, status: s.status })),
        subjects: scores,
        avg: avgOf(scores),
        announcements,
        aiNote: aiNoteFromScores(scores),
        schoolTasks,
        todos,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudentShellData() {
  return useContext(Ctx).data;
}

export default StudentShellDataProvider;
