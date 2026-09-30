"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

/**
 * Placeholder for the dashboard's middle column only.
 *
 * The sidebar and rightbar live in the route's layout, so they stay mounted
 * while this shows — switching class never blanks the whole screen. Reuses the
 * real content classes so nothing shifts when the data lands.
 */
export function MainSkeleton() {
  return (
    <SkeletonTheme baseColor="#efedef" highlightColor="#f7f6f8" duration={1.4}>
      <div className="profile-head">
        <Skeleton circle width={96} height={96} />
        <div style={{ flex: 1 }}>
          <Skeleton width={280} height={28} />
          <Skeleton width={340} height={13} style={{ marginTop: 12 }} />
        </div>
      </div>

      <h2 className="h2">
        <Skeleton width={200} height={20} />
      </h2>
      <div className="stat-grid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="stat-card">
            <Skeleton width={90} height={15} />
            <Skeleton width={110} height={44} style={{ marginTop: 18 }} />
          </div>
        ))}
      </div>

      <div className="sec-row" style={{ marginTop: 28, marginBottom: 14 }}>
        <Skeleton width={120} height={20} />
        <Skeleton width={80} height={13} />
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="task-row">
            <Skeleton circle width={40} height={40} />
            <span className="info" style={{ flex: 1 }}>
              <Skeleton width={220} height={14} />
              <Skeleton width={140} height={11} style={{ marginTop: 7 }} />
            </span>
            <Skeleton width={70} height={14} />
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 28 }}>
        {[0, 1].map((col) => (
          <div key={col} style={{ display: "grid", gap: 10 }}>
            <Skeleton width={140} height={18} />
            {[0, 1, 2].map((i) => (
              <div key={i} className="task-row">
                <span className="info" style={{ flex: 1 }}>
                  <Skeleton width={200} height={13} />
                  <Skeleton width={110} height={11} style={{ marginTop: 7 }} />
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}

export default MainSkeleton;
