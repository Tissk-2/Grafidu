import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

/**
 * Segment-level fallback for /student/ai-agent. Renders inside the student
 * layout, so the sidebar, rightbar and floating nav stay mounted — only the
 * middle column is replaced. Reuses the real content classes so nothing
 * shifts when the data lands.
 */
export default function Loading() {
  return (
    <SkeletonTheme baseColor="#efedef" highlightColor="#f7f6f8" duration={1.4}>
      <div className="ai-header">
        <Skeleton circle width={46} height={46} />
        <div style={{ flex: 1 }}>
          <Skeleton width={110} height={20} />
          <Skeleton width={280} height={13} style={{ marginTop: 8 }} />
        </div>
      </div>

      <div className="chat-log">
        <div className="msg">
          <Skeleton circle width={34} height={34} />
          <Skeleton width={420} height={58} style={{ borderRadius: 12 }} />
        </div>
        <div className="msg user">
          <Skeleton width={300} height={46} style={{ borderRadius: 12 }} />
        </div>
        <div className="msg">
          <Skeleton circle width={34} height={34} />
          <Skeleton width={360} height={46} style={{ borderRadius: 12 }} />
        </div>
      </div>

      <div className="suggests">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} width={210} height={38} style={{ borderRadius: 10 }} />
        ))}
      </div>

      <div className="chat-input">
        <Skeleton height={48} style={{ borderRadius: 12, flex: 1 }} />
        <Skeleton width={48} height={48} style={{ borderRadius: 12 }} />
      </div>
    </SkeletonTheme>
  );
}
