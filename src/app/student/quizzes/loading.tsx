import PageSkeleton from "@/components/ui/page-skeleton";

/**
 * Segment-level loading untuk /student/quizzes — sidebar, rightbar dan nav
 * tetap terpasang; hanya kolom tengah yang diganti kerangka.
 */
export default function Loading() {
  return <PageSkeleton />;
}
