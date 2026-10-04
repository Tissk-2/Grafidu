"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useRequireUser } from "@/lib/auth";
import { useTeacherShellData } from "./teacher-shell-data";
import DashboardShell from "@/components/layout/dashboard-shell";
import type { SidebarClass } from "@/components/layout/sidebar";
import TeacherRightbar from "./teacher-rightbar";

/**
 * Bottom-nav labels keyed by the URL segment, so one shared layout can serve
 * every teacher page without each page re-declaring which nav item is active.
 */
const NAV_LABEL: Record<string, string> = {
  home: "Home",
  tasks: "Tasks",
  todo: "Tasks",
  materi: "Materi",
  grades: "Grades",
  "quiz-maker": "Quiz Maker",
  "ai-agent": "AI Agent",
};

/**
 * Sidebar + rightbar untuk setiap halaman guru. Dipasang sekali oleh layout
 * dan bertahan antar navigasi. Identitas dari session (bukan lagi persona
 * demo), kelas dari shell context (tabel teachings — data live).
 */
export default function TeacherShell({ children }: { children: React.ReactNode }) {
  const u = useRequireUser("teacher");
  const pathname = usePathname();
  const { classes, classTotals, kelas, select } = useTeacherShellData();

  // Stabil agar Sidebar yang di-memo tidak ikut re-render tiap navigasi.
  const sidebarClasses: SidebarClass[] = useMemo(
    () =>
      classes.map((c) => ({
        id: c.id,
        name: c.name,
        total: classTotals[c.id] ?? 0,
      })),
    [classes, classTotals],
  );

  // Mapel tampil di bawah nama — gabungan unik dari kelas yang diampu.
  const mapel = useMemo(() => {
    const set = new Set(classes.map((c) => c.subject).filter(Boolean));
    return [...set].join(" • ");
  }, [classes]);

  const sidebar = useMemo(
    () => ({
      // Shell harus tetap terpasang sebelum session resolve — fallback ke logo.
      user: {
        name: u?.name ?? "Guru",
        sub: mapel,
        avatar: u?.avatar ?? "/assets/defaultpfp.jpg",
      },
      tasksToday: [],
      classes: sidebarClasses,
      activeClassId: kelas?.id ?? undefined,
      onSelectClass: select,
    }),
    [u?.name, u?.avatar, mapel, sidebarClasses, kelas?.id, select],
  );

  return (
    <DashboardShell
      role="teacher"
      sidebar={sidebar}
      activeNav={NAV_LABEL[pathname.split("/")[2] ?? ""] ?? ""}
      rightbar={<TeacherRightbar />}
    >
      {children}
    </DashboardShell>
  );
}
