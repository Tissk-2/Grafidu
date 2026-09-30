import PageSkeleton from "@/components/ui/page-skeleton";

/**
 * The todo body is <StudentTodoManager>, which fetches its own data; a generic
 * title + rows placeholder is all this can honestly claim.
 *
 * Segment-level, so it takes precedence over the section-wide
 * `loading.tsx` and renders inside the layout — the sidebar, rightbar and
 * floating nav stay mounted while only the middle column is replaced.
 */
export default function Loading() {
  return <PageSkeleton />;
}
