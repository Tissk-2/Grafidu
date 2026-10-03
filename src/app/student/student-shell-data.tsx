"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addTodo,
  fetchAnnouncements,
  fetchSchoolTasks,
  fetchSubjectScores,
  fetchTodos,
  fetchTasksToday,
  toggleTodo,
} from "@/app/actions/student";
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
type StudentShellContext = StudentShellData & {
  /** Ubah daftar to-do di data bersama, supaya semua tampilan ikut berubah. */
  setTodos: (fn: (prev: TodoItem[]) => TodoItem[]) => void;
};

const Ctx = createContext<StudentShellContext>({ data: null, setTodos: () => {} });

export function StudentShellDataProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: React.ReactNode;
}) {
  const [data, setData] = useState<StudentShellData["data"]>(null);
  const setTodos = useCallback((fn: (prev: TodoItem[]) => TodoItem[]) => {
    setData((d) => (d ? { ...d, todos: fn(d.todos) } : d));
  }, []);
  const value = useMemo(() => ({ data, setTodos }), [data, setTodos]);

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

/**
 * To-do pribadi dari data bersama + aksi centang/tambah. Dipakai oleh rightbar,
 * halaman To-Do, dan panel To-Do di HP, jadi progres di halaman Tasks langsung
 * ikut berubah begitu satu item dicentang di mana pun.
 */
export function useStudentTodos() {
  const { data, setTodos } = useContext(Ctx);

  const toggle = useCallback(
    async (id: string, done: boolean) => {
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !done } : t)));
      try {
        await toggleTodo(id, !done);
      } catch (err) {
        setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));
        window.gtoast?.((err as Error).message, "error");
      }
    },
    [setTodos],
  );

  const add = useCallback(
    async (title: string) => {
      try {
        const row = await addTodo(title);
        if (row) setTodos((prev) => [...prev, row]);
      } catch (err) {
        window.gtoast?.((err as Error).message, "error");
      }
    },
    [setTodos],
  );

  return { todos: data?.todos ?? null, toggle, add };
}

export default StudentShellDataProvider;