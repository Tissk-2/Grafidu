import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

/**
 * Segment-level fallback for /teacher/grades. Renders inside the teacher
 * layout, so the sidebar, rightbar and floating nav stay mounted — only the
 * middle column is replaced. Reuses the real content classes so nothing
 * shifts when the data lands.
 */
export default function Loading() {
  return (
    <SkeletonTheme baseColor="#efedef" highlightColor="#f7f6f8" duration={1.4}>
      <Skeleton width={110} height={28} />
      <Skeleton width={320} height={14} style={{ marginTop: 10 }} />

      <div className="stat-grid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="stat-card">
            <Skeleton width={90} height={15} />
            <Skeleton width={110} height={44} style={{ marginTop: 18 }} />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <Skeleton height={44} style={{ flex: 1, borderRadius: 4 }} />
        <Skeleton width={180} height={44} style={{ borderRadius: 4 }} />
      </div>

      <Skeleton height={340} style={{ marginTop: 20, borderRadius: 10 }} />
    </SkeletonTheme>
  );
}
