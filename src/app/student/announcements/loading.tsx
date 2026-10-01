import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

/**
 * Segment-level fallback for /student/announcements. Renders inside the
 * student layout, so the sidebar, rightbar and floating nav stay mounted —
 * only the middle column is replaced. Reuses the real content classes so
 * nothing shifts when the data lands.
 */
export default function Loading() {
  return (
    <SkeletonTheme baseColor="#efedef" highlightColor="#f7f6f8" duration={1.4}>
      <Skeleton width={170} height={28} />
      <Skeleton width={330} height={14} style={{ marginTop: 10 }} />

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <Skeleton height={44} style={{ flex: 1, borderRadius: 4 }} />
        <Skeleton width={160} height={44} style={{ borderRadius: 4 }} />
        <Skeleton width={140} height={44} style={{ borderRadius: 4 }} />
      </div>

      <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={92} style={{ borderRadius: 12 }} />
        ))}
      </div>
    </SkeletonTheme>
  );
}
