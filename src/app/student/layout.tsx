import StudentShell from "./student-shell";

/**
 * Shell for the whole student section.
 *
 * Next.js preserves a layout across navigation inside its segment, so this one
 * layout is shared by /student/home, /student/tasks, /student/todo and
 * /student/settings. Moving between them re-renders only the page in the middle
 * — the sidebar and rightbar stay mounted, and this segment's `loading.tsx` is
 * therefore scoped to the middle column.
 */
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <StudentShell>{children}</StudentShell>;
}
