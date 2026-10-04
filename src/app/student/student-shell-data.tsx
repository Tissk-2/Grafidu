"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addTodo,
  fetchAiNote,
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
  /** false di dalam shell siswa; true saat hook dipakai di luar shell (mis. guru). */
  standalone: boolean;
};

const Ctx = createContext<StudentShellContext>({
  data: null,
  setTodos: () => {},
  standalone: true,
});

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
  const value = useMemo(() => ({ data, setTodos, standalone: false }), [data, setTodos]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    Promise.all([
      fetchTasksToday(),
      fetchSubjectScores(),
      fetchAnnouncements(3),
      fetchSchoolTasks(),
      fetchTodos(),
    ]).then(async ([tasksToday, scores, announcements, schoolTasks, todos]) => {
      if (cancelled) return;
      setData({
        tasksToday,
        grades: scores.map((s) => ({ subject: s.subject, score: s.score, status: s.status })),
        subjects: scores,
        avg: avgOf(scores),
        announcements,
        // Tampil dulu dengan tip lokal, lalu dinaikkan ke rekomendasi AI asli.
        aiNote: aiNoteFromScores(scores),
        schoolTasks,
        todos,
      });
      const aiNote = await fetchAiNote();
      if (!cancelled && aiNote) {
        setData((d) => (d ? { ...d, aiNote } : d));
      }
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
 *
 * Di luar StudentShellDataProvider (halaman To-Do guru) hook bersifat mandiri:
 * daftar diambil sendiri ke database dan disimpan di state lokal.
 */
export function useStudentTodos() {
  const { data, setTodos, standalone } = useContext(Ctx);
  const [local, setLocal] = useState<TodoItem[] | null>(null);

  useEffect(() => {
    if (!standalone) return;
    let cancelled = false;
    fetchTodos().then((rows) => {
      if (!cancelled) setLocal(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [standalone]);

  const apply = useCallback(
    (fn: (prev: TodoItem[]) => TodoItem[]) => {
      if (standalone) setLocal((prev) => (prev ? fn(prev) : prev));
      else setTodos(fn);
    },
    [standalone, setTodos],
  );

  const toggle = useCallback(
    async (id: string, done: boolean) => {
      apply((prev) => prev.map((t) => (t.id === id ? { ...t, done: !done } : t)));
      try {
        await toggleTodo(id, !done);
      } catch (err) {
        apply((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));
        window.gtoast?.((err as Error).message, "error");
      }
    },
    [apply],
  );

  const add = useCallback(
    async (title: string, subtitle?: string) => {
      try {
        const row = await addTodo(title, subtitle);
        if (row) apply((prev) => [...prev, row]);
        return row;
      } catch (err) {
        window.gtoast?.((err as Error).message, "error");
        return null;
      }
    },
    [apply],
  );

  return { todos: standalone ? local : (data?.todos ?? null), toggle, add };
}

export default StudentShellDataProvider;