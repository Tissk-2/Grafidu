import StudentTasksSkeleton from "@/components/ui/student-tasks-skeleton";

/**
 * Placeholder for the student task list's own layout.
 *
 * Segment-level, so it takes precedence over the section-wide
 * `loading.tsx` and renders inside the layout — the sidebar, rightbar and
 * floating nav stay mounted while only the middle column is replaced.
 */
export default function Loading() {
  return <StudentTasksSkeleton />;
}
