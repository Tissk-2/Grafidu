import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

/**
 * Segment-level fallback for /teacher/materi. Renders inside the teacher
 * layout, so the sidebar, rightbar and floating nav stay mounted — only the
 * middle column is replaced. Reuses the real content classes so nothing
 * shifts when the data lands.
 */
export default function Loading() {
  return (
    <SkeletonTheme baseColor="#efedef" highlightColor="#f7f6f8" duration={1.4}>
      <Skeleton width={100} height={28} />
      <Skeleton width={380} height={14} style={{ marginTop: 10 }} />

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <Skeleton height={44} style={{ flex: 1, borderRadius: 4 }} />
        <Skeleton width={140} height={44} style={{ borderRadius: 4 }} />
      </div>

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={190} style={{ borderRadius: 12 }} />
        ))}
      </div>
    </SkeletonTheme>
  );
}
