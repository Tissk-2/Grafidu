import AdminSkeleton from "@/components/admin/admin-skeleton";

/**
 * The admin shell already lives in this segment's layout, so Next.js renders
 * this *inside* it — the sidebar stays mounted and only the main column shows
 * the skeleton.
 */
export default function Loading() {
  return <AdminSkeleton />;
}
