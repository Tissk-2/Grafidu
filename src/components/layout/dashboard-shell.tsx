import type { SidebarPropsData } from "@/components/layout/sidebar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import AddClassDialog from "@/components/dialogs/add-class-dialog";

export default function DashboardShell({
  role,
  sidebar,
  rightbar,
  children,
  activeNav,
}: {
  role: "student" | "teacher";
  sidebar: SidebarPropsData;
  rightbar: React.ReactNode;
  children: React.ReactNode;
  activeNav: string;
}) {
  return (
    <div className="app">
      <Sidebar
        role={role}
        user={sidebar.user}
        tasksToday={sidebar.tasksToday}
        classes={sidebar.classes}
        activeClassId={sidebar.activeClassId}
        onSelectClass={sidebar.onSelectClass}
      />
      <main className="main">{children}</main>
      {rightbar}
      <BottomNav role={role} active={activeNav} />
      {role === "teacher" ? <AddClassDialog /> : null}
    </div>
  );
}
