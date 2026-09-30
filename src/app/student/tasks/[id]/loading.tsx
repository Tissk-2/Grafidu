import StudentTaskDetailSkeleton from "@/components/ui/student-task-detail-skeleton";

/**
 * Placeholder for a single student task's own layout.
 *
 * Segment-level, so it takes precedence over the section-wide
 * `loading.tsx` and renders inside the layout — the sidebar, rightbar and
 * floating nav stay mounted while only the middle column is replaced.
 */
export default function Loading() {
  return <StudentTaskDetailSkeleton />;
}
