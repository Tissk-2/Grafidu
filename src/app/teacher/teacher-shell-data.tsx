"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/auth";
import {
  fetchClassMaterials,
  fetchClassQuizzes,
  fetchClassRoster,
  fetchClassAiNote,
  fetchClassTasks,
  fetchClassTotals,
  fetchTeacherClasses,
} from "@/app/actions/teacher";
import { fetchAnnouncements } from "@/app/actions/student";
import { studentsWithStatus } from "@/lib/guru";
import type {
  MaterialRow,
  QuizRow,
  RosterRow,
  TeacherClass,
  TeacherTask,
} from "@/lib/teacher-model";
import type { AnnouncementItem } from "@/lib/student-model";

export type TeacherShellData = {
  classes: TeacherClass[];
  classesLoading: boolean;
  /** Jumlah siswa per kelas id — untuk kartu kelas di sidebar. */
  classTotals: Record<string, number>;
  activeClassId: string | null;
  select: (id: string | number) => void;
  kelas: TeacherClass | null;
  tasks: TeacherTask[];
  roster: RosterRow[];
  materials: MaterialRow[];
  quizzes: QuizRow[];
  announcements: AnnouncementItem[];
  classLoading: boolean;
  /** Rekomendasi AI untuk kelas aktif — fallback lokal, dinaikkan ke AI asli. */
  aiNote: string;
  /** Panggil setelah CRUD agar data kelas diambil ulang. */
  refresh: () => void;
};

const Ctx = createContext<TeacherShellData>({
  classes: [],
  classesLoading: true,
  classTotals: {},
  activeClassId: null,
  select: () => {},
  kelas: null,
  tasks: [],
  roster: [],
  materials: [],
  quizzes: [],
  announcements: [],
  classLoading: true,
  aiNote: "",
  refresh: () => {},
});

/**
 * Sumber data bersama seluruh halaman guru: kelas yang diampu (dari tabel
 * teachings), kelas aktif (URL /teacher/home/[id] menang, fallback pilihan
 * terakhir di localStorage), dan data kelas aktif yang diambil sekali per
 * load — sama seperti pola sisi siswa.
 */
export function TeacherShellDataProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: React.ReactNode;
}) {
  const params = useParams<{ id?: string }>();
  const pathname = usePathname();

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classTotals, setClassTotals] = useState<Record<string, number>>({});
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [classData, setClassData] = useState<{
    tasks: TeacherTask[];
    roster: RosterRow[];
    materials: MaterialRow[];
    quizzes: QuizRow[];
  } | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [aiNote, setAiNote] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const select = useCallback((id: string | number) => {
    setActiveClassId(String(id));
    try {
      localStorage.setItem("teacher-class", String(id));
    } catch {}
  }, []);

  // Kelas yang diampu + total siswa per kelas.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const list = await fetchTeacherClasses();
      if (cancelled) return;
      setClasses(list);

      const totals = await fetchClassTotals();
      if (cancelled) return;
      setClassTotals(totals);
      setClassesLoading(false);

      // Kelas aktif: URL menang, lalu pilihan terakhir, lalu kelas pertama.
      let stored: string | null = null;
      try {
        stored = localStorage.getItem("teacher-class");
      } catch {}
      const routeId = pathname.startsWith("/teacher/home/") ? (params?.id ?? null) : null;
      const valid = (id: string | null | undefined) => list.some((c) => c.id === id);
      const next = [routeId, stored].find((id) => valid(id)) ?? list[0]?.id ?? null;
      if (next) {
        setActiveClassId(next);
        try {
          localStorage.setItem("teacher-class", next);
        } catch {}
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Data kelas aktif.
  useEffect(() => {
    if (!activeClassId) return;
    let cancelled = false;
    setClassData(null);
    (async () => {
      const kelas = classes.find((c) => c.id === activeClassId);
      const [tasks, roster, materials, quizzes, anns] = await Promise.all([
        fetchClassTasks(activeClassId),
        fetchClassRoster(activeClassId, kelas?.kkm ?? 80),
        fetchClassMaterials(activeClassId),
        fetchClassQuizzes(activeClassId),
        announcements.length ? Promise.resolve(announcements) : fetchAnnouncements(3),
      ]);
      if (cancelled) return;
      setClassData({ tasks, roster, materials, quizzes });
      setAnnouncements(anns);

      // Rekomendasi: fallback lokal dulu, lalu dinaikkan ke kalimat AI asli
      // (server action di-cache 15 menit per guru+kelas).
      const lowest = studentsWithStatus(roster)[0];
      setAiNote(
        `Nilai rata-rata ${lowest?.nama ?? "siswa"} masih paling rendah nih. Saya bakal siapin beberapa kuis tambahan buat bantu dia catch up.`
      );
      fetchClassAiNote(activeClassId).then((ai) => {
        if (!cancelled && ai) setAiNote(ai);
      });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClassId, refreshKey, classes]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const value = useMemo<TeacherShellData>(
    () => ({
      classes,
      classesLoading,
      classTotals,
      activeClassId,
      select,
      kelas: classes.find((c) => c.id === activeClassId) ?? null,
      tasks: classData?.tasks ?? [],
      roster: classData?.roster ?? [],
      materials: classData?.materials ?? [],
      quizzes: classData?.quizzes ?? [],
      announcements,
      classLoading: classData === null,
      aiNote,
      refresh,
    }),
    [
      classes,
      classesLoading,
      classTotals,
      activeClassId,
      select,
      classData,
      announcements,
      aiNote,
      refresh,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTeacherShellData() {
  return useContext(Ctx);
}

export default TeacherShellDataProvider;
