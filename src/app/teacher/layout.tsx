import { requireRole } from "@/lib/session";
import TeacherShellDataProvider from "./teacher-shell-data";
import TeacherShell from "./teacher-shell";

/**
 * Shell for the whole teacher section.
 *
 * Server-side guard jalan dulu (login + role + must_change_password), lalu
 * provider data kelas + shell client merender seperti biasa. Identitas user
 * dari session server diteruskan ke provider (bukan lagi persona demo).
 *
 * Next.js preserves a layout across navigation inside its segment, so this one
 * layout is shared by /teacher/home, /teacher/tasks, /teacher/todo and
 * /teacher/settings. Moving between them (or between classes) re-renders only
 * the page in the middle — the sidebar and rightbar stay mounted, and a
 * `loading.tsx` in this segment can therefore be scoped to the middle column.
 */
export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("teacher");
  return (
    <TeacherShellDataProvider user={user}>
      <TeacherShell>{children}</TeacherShell>
    </TeacherShellDataProvider>
  );
}
