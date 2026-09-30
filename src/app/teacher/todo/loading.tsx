import PageSkeleton from "@/components/ui/page-skeleton";

/**
 * Placeholder for the todo page.
 *
 * Segment-level, so it takes precedence over the section-wide
 * `loading.tsx` and renders inside the layout — the sidebar, rightbar and
 * floating nav stay mounted while only the middle column is replaced.
 */
export default function Loading() {
  return <PageSkeleton />;
}
