"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useRequireUser } from "@/lib/auth";
import DashboardShell from "@/components/layout/dashboard-shell";
import { StudentRightbar } from "@/components/layout/rightbar";
import RightbarSkeleton from "@/components/ui/rightbar-skeleton";
import StudentTasksRightbar from "@/components/client/student-tasks-rightbar";
import { StudentShellDataProvider, useStudentShellData } from "./student-shell-data";

/**
 * Bottom-nav labels keyed by the URL segment, so one shared layout can serve
 * every student page without each page re-declaring which nav item is active.
 */
const NAV_LABEL: Record<string, string> = {
  home: "Home",
  tasks: "Tasks",
  todo: "Tasks",
  grades: "Grades",
  "ai-agent": "AI Agent",
};

/**
 * Renders the rightbar for the current route. /student/tasks has always had a
 * task-focused rightbar rather than the grades one, so keep that: the shell
 * re-reads the URL on navigation and swaps it without unmounting the column.
 */
function StudentShellRightbar() {
  const pathname = usePathname();
  const u = useRequireUser("student");
  const data = useStudentShellData();

  if (pathname.startsWith("/student/tasks")) {
    return (
      <StudentTasksRightbar
        userId={u?.id ?? ""}
        todos={data?.todos}
        aiNote="Selesaikan tugas dengan tenggat terdekat dulu."
      />
    );
  }

  if (!data) {
    return (
      <aside className="rightbar">
        <RightbarSkeleton />
      </aside>
    );
  }

  return (
    <StudentRightbar
      grades={data.grades}
      announcements={data.announcements as never}
      aiNote={data.aiNote}
      ctaHref="/student/todo"
      ctaLabel="Buat To-Do List"
    />
  );
}

/** Sidebar + rightbar for every student page, mounted once by the layout. */
function StudentShellInner({ children }: { children: React.ReactNode }) {
  const u = useRequireUser("student");
  const pathname = usePathname();
  const data = useStudentShellData();

  // Stabil agar Sidebar yang di-memo tidak ikut re-render tiap navigasi.
  const sidebar = useMemo(
    () => ({
      // The shell has to stay mounted before the session resolves, so fall
      // back to the logo rather than blanking the sidebar.
      user: {
        name: u?.name ?? "Siswa",
        sub: u?.className ?? "Siswa",
        avatar: u?.avatar ?? "/assets/logo.png",
      },
      tasksToday: data?.tasksToday ?? [],
    }),
    [u?.name, u?.className, u?.avatar, data?.tasksToday],
  );

  return (
    <DashboardShell
      role="student"
      sidebar={sidebar}
      activeNav={NAV_LABEL[pathname.split("/")[2] ?? ""] ?? ""}
      rightbar={<StudentShellRightbar />}
    >
      {children}
    </DashboardShell>
  );
}

export default function StudentShell({ children }: { children: React.ReactNode }) {
  // The provider needs the user to fetch, and the user comes from the guard
  // that the shell itself renders, so the two are nested: an outer guard for
  // data, an inner one for chrome.
  return (
    <StudentShellBoundary>
      <StudentShellInner>{children}</StudentShellInner>
    </StudentShellBoundary>
  );
}

function StudentShellBoundary({ children }: { children: React.ReactNode }) {
  const u = useRequireUser("student");
  return <StudentShellDataProvider user={u}>{children}</StudentShellDataProvider>;
}
