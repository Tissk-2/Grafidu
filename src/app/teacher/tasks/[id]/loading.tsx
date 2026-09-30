import TaskDetailSkeleton from "@/components/ui/task-detail-skeleton";

/**
 * Segment-level fallback for a single task. Takes precedence over
 * `teacher/tasks/loading.tsx`, so opening a task shows the detail layout.
 */
export default function Loading() {
  return <TaskDetailSkeleton />;
}
