import StudentHomeSkeleton from "@/components/ui/student-home-skeleton";

/**
 * Placeholder for the student dashboard's own layout.
 *
 * Segment-level, so it takes precedence over the section-wide
 * `loading.tsx` and renders inside the layout — the sidebar, rightbar and
 * floating nav stay mounted while only the middle column is replaced.
 */
export default function Loading() {
  return <StudentHomeSkeleton />;
}
