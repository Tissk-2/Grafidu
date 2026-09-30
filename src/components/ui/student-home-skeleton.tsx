"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import ClassSearchSkeleton from "./class-search-skeleton";

/**
 * Placeholder for /student/home. Follows that page: profile header, an Overview
 * stat grid, then the class search.
 */
export function StudentHomeSkeleton() {
  return (
    <SkeletonTheme baseColor="#efedef" highlightColor="#f7f6f8" duration={1.4}>
      <div className="profile-head">
        <Skeleton circle width={96} height={96} />
        <div style={{ flex: 1 }}>
          <Skeleton width={280} height={28} />
          <Skeleton width={380} height={13} style={{ marginTop: 12 }} />
        </div>
      </div>

      <h2 className="h2">
        <Skeleton width={110} height={20} />
      </h2>
      <div className="stat-grid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="stat-card">
            <Skeleton width={90} height={15} />
            <Skeleton width={70} height={40} style={{ marginTop: 18 }} />
          </div>
        ))}
      </div>

      <h2 className="h2">
        <Skeleton width={70} height={20} />
      </h2>
      <ClassSearchSkeleton />
    </SkeletonTheme>
  );
}

export default StudentHomeSkeleton;
