import MainSkeleton from "@/components/ui/main-skeleton";

/**
 * Applies to the whole student section. Because the shell lives in this
 * segment's layout, Next.js renders this *inside* it — so the sidebar and
 * rightbar stay mounted and only the middle column shows the skeleton.
 */
export default function Loading() {
  return <MainSkeleton />;
}
