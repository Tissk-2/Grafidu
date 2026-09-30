"use client";

import { useTitle } from "@/lib/hooks";
import { useRequireUser } from "@/lib/auth";
import PageSkeleton from "@/components/ui/page-skeleton";
import StudentTodoManager from "@/components/client/student-todo-manager";
import BodySync from "@/components/body-sync";

/** Middle column only — the sidebar and rightbar come from the student layout. */
export default function StudentTodoPage() {
  const u = useRequireUser("student");
  useTitle("To-Do List Pribadi — Grafidu");

  // The shell (sidebar + rightbar) comes from the student layout and is already
  // rendered, so waiting on the session only ever affects the middle column —
  // and even that shows a skeleton rather than nothing.
  if (!u) return <PageSkeleton />;

  return (
    <>
      <BodySync dataPage="student-todo" />
      <StudentTodoManager userId={u.id} />
    </>
  );
}
