"use client";

import { usePathname } from "next/navigation";
import { useRequireUser } from "@/lib/auth";
import { dummyGuruData } from "@/lib/guru-demo";
import { useRoutedClass } from "@/lib/guru";
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
 * Sidebar + rightbar for every teacher page. Mounted once by the layout, so it
 * survives navigation; it only re-reads the URL to keep the active class and
 * nav highlight in sync.
 */
export default function TeacherShell({ children }: { children: React.ReactNode }) {
  // Prototipe: guard role dimatikan supaya halaman bisa diakses tanpa login
  // sebagai guru. Kembalikan `useRequireUser("teacher")` sebelum production.
  const u = useRequireUser();
  const pathname = usePathname();
  const { kelas, classes, select } = useRoutedClass();

  const sidebarClasses: SidebarClass[] = classes.map((c) => ({
    id: c.id,
    name: c.kelas,
    total: c.totalMurid,
  }));

  return (
    <DashboardShell
      role="teacher"
      sidebar={{
        // The shell has to stay mounted before the session resolves, so fall
        // back to the logo rather than blanking the sidebar.
        user: {
          name: dummyGuruData.name,
          sub: dummyGuruData.mapel,
          avatar: u?.avatar ?? "/assets/logo.png",
        },
        tasksToday: [],
        classes: sidebarClasses,
        activeClassId: kelas.id,
        onSelectClass: select,
      }}
      activeNav={NAV_LABEL[pathname.split("/")[2] ?? ""] ?? ""}
      rightbar={<TeacherRightbar />}
    >
      {children}
    </DashboardShell>
  );
}
