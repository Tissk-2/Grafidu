"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  fetchAnnouncements,
  fetchSubjectScores,
  fetchTasksToday,
  avgOf,
  aiNoteFromScores,
  type AnnouncementItem,
  type SidebarTask,
} from "@/lib/supabase/queries";
import type { SessionUser } from "@/lib/auth";
import type { GradeRow } from "@/components/layout/rightbar";

export type StudentShellData = {
  /** null until the first load resolves — callers show a skeleton meanwhile. */
  data: {
    tasksToday: SidebarTask[];
    grades: GradeRow[];
    avg: number;
    announcements: AnnouncementItem[];
    aiNote: string;
  } | null;
};

/**
 * The sidebar and rightbar need the same rows on every student page, and the
 * dashboard also needs them for its stat cards. Fetching once here and sharing
 * it through context keeps the layout mounted across navigation and stops each
 * page from re-querying the same tables.
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

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    Promise.all([
      fetchTasksToday(user),
      fetchSubjectScores(user.id),
      fetchAnnouncements(3),
    ]).then(([tasksToday, scores, announcements]) => {
      if (cancelled) return;
      setData({
        tasksToday,
        grades: scores.map((s) => ({ subject: s.subject, score: s.score, status: s.status })),
        avg: avgOf(scores),
        announcements,
        aiNote: aiNoteFromScores(scores),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return <Ctx.Provider value={{ data }}>{children}</Ctx.Provider>;
}

export function useStudentShellData() {
  return useContext(Ctx).data;
}

export default StudentShellDataProvider;
