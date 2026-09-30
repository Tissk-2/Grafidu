"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

/**
 * Placeholder for <StudentClassSearch> (search box, subject chips, then a 2-up
 * grid of teacher cards). Shared by the student dashboard and the student task
 * list, which both end with that component.
 *
 * It reuses the real `.search-row` / `.chips` / `.teacher-grid` classes so the
 * box model and column widths match without duplicating any measurements.
 */
export function ClassSearchSkeleton() {
  return (
    <SkeletonTheme baseColor="#efedef" highlightColor="#f7f6f8" duration={1.4}>
      <div className="search-row">
        <div className="search-box">
          <Skeleton height={44} borderRadius={8} />
        </div>
        <div className="select-box">
          <Skeleton height={44} width={150} borderRadius={8} />
        </div>
      </div>

      <div className="chips">
        {[64, 82, 74, 90].map((w, i) => (
          <Skeleton key={i} width={w} height={34} borderRadius={8} />
        ))}
      </div>

      <div className="teacher-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="teacher-card">
            <Skeleton circle width={44} height={44} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <Skeleton width="72%" height={13} />
              <Skeleton width="48%" height={11} style={{ marginTop: 7 }} />
            </span>
          </div>
        ))}
      </div>

      <Skeleton width={150} height={13} style={{ marginTop: 16 }} />
    </SkeletonTheme>
  );
}

export default ClassSearchSkeleton;
