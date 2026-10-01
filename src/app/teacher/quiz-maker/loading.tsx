import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

/**
 * Segment-level fallback for /teacher/quiz-maker. Renders inside the teacher
 * layout, so the sidebar, rightbar and floating nav stay mounted — only the
 * middle column is replaced. Reuses the real content classes so nothing
 * shifts when the data lands.
 */
export default function Loading() {
  return (
    <SkeletonTheme baseColor="#efedef" highlightColor="#f7f6f8" duration={1.4}>
      <Skeleton width={170} height={28} />
      <Skeleton width={420} height={14} style={{ marginTop: 10 }} />

      <div className="quiz-grid" style={{ marginTop: 26 }}>
        <div className="panel">
          <Skeleton height={330} />
        </div>
        <div className="panel">
          <Skeleton height={330} />
        </div>
      </div>

      <div className="sec-row" style={{ marginTop: 30 }}>
        <Skeleton width={110} height={20} />
        <Skeleton width={80} height={13} />
      </div>
      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={68} />
        ))}
      </div>
    </SkeletonTheme>
  );
}
