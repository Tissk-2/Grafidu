import PageSkeleton from "@/components/ui/page-skeleton";

/**
 * Catch-all for the student section. Every student route now has its own
 * segment-level `loading.tsx` that takes precedence, so this only covers
 * routes added later — it stays generic rather than borrowing the dashboard's
 * layout, which is the bug this replaced.
 *
 * It renders inside the student layout, so the sidebar, rightbar and floating
 * nav stay mounted while only the middle column is replaced.
 */
export default function Loading() {
  return <PageSkeleton />;
}
