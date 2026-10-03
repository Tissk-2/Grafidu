"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

/**
 * Placeholder for the rightbar column. Shown while the shared student shell
 * data (grades, announcements, AI note) is still loading, so the column keeps
 * its width instead of flashing an empty table.
 */
export function RightbarSkeleton() {
  return (
    <SkeletonTheme baseColor="var(--line-soft)" highlightColor="var(--surface-2)" duration={1.4}>
      <div className="rb-head">
        <Skeleton width={110} height={16} />
        <Skeleton width={60} height={12} />
      </div>
      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Skeleton width={110} height={12} />
            <span style={{ flex: 1 }} />
            <Skeleton width={34} height={12} />
            <Skeleton width={62} height={20} borderRadius={999} />
          </div>
        ))}
      </div>

      <Skeleton width={120} height={16} style={{ marginTop: 24 }} />
      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: "grid", gap: 7 }}>
            <Skeleton width={170} height={12} />
            <Skeleton width="92%" height={10} />
            <Skeleton width={64} height={9} />
          </div>
        ))}
      </div>

      <div className="ai-card" style={{ marginTop: 20 }}>
        <Skeleton width={150} height={14} />
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <Skeleton width="100%" height={10} />
          <Skeleton width="86%" height={10} />
        </div>
        <Skeleton width={130} height={38} borderRadius={8} style={{ marginTop: 16 }} />
      </div>
    </SkeletonTheme>
  );
}

export default RightbarSkeleton;
