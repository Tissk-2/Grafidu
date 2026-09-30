import TasksSkeleton from "@/components/ui/tasks-skeleton";

/**
 * Segment-level fallback for /teacher/tasks. Next.js prefers this over the
 * section-wide `teacher/loading.tsx`, so navigating here from the dashboard
 * shows the task list's own skeleton rather than the dashboard's.
 *
 * It renders inside the teacher layout, so the sidebar, rightbar and floating
 * nav stay mounted — only the middle column is replaced.
 */
export default function Loading() {
  return <TasksSkeleton />;
}
