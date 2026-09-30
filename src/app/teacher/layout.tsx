import TeacherShell from "./teacher-shell";

/**
 * Shell for the whole teacher section.
 *
 * Next.js preserves a layout across navigation inside its segment, so this one
 * layout is shared by /teacher/home, /teacher/tasks, /teacher/todo and
 * /teacher/settings. Moving between them (or between classes) re-renders only
 * the page in the middle — the sidebar and rightbar stay mounted, and a
 * `loading.tsx` in this segment can therefore be scoped to the middle column.
 */
export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <TeacherShell>{children}</TeacherShell>;
}
