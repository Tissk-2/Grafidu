"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import ClassSearchSkeleton from "./class-search-skeleton";

/**
 * Placeholder for /student/tasks. Follows that page: title, To-Do progress
 * card, the school assignment list, then the class search.
 */
export function StudentTasksSkeleton() {
  return (
    <SkeletonTheme baseColor="var(--line-soft)" highlightColor="var(--surface-2)" duration={1.4}>
      <Skeleton width={180} height={26} />
      <Skeleton width={420} height={13} style={{ marginTop: 8 }} />

      <div className="progress-card" style={{ marginTop: 24 }}>
        <div className="head">
          <Skeleton width={180} height={14} />
          <Skeleton width={34} height={14} />
        </div>
        <div className="prog">
          <Skeleton height={8} borderRadius={999} />
        </div>
      </div>

      <div className="sec-row" style={{ marginTop: 28, marginBottom: 14 }}>
        <h2 className="h2" style={{ margin: 0 }}>
          <Skeleton width={120} height={20} />
        </h2>
        <Skeleton width={110} height={13} />
      </div>

      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="task-row">
          <Skeleton circle width={40} height={40} />
          <span className="info" style={{ flex: 1 }}>
            <Skeleton width="58%" height={14} />
            <Skeleton width={200} height={11} style={{ marginTop: 7 }} />
          </span>
          <span className="right">
            <Skeleton width={92} height={22} borderRadius={999} />
          </span>
        </div>
      ))}

      <h2 className="h2" style={{ marginTop: 32 }}>
        <Skeleton width={160} height={20} />
      </h2>
      <ClassSearchSkeleton />
    </SkeletonTheme>
  );
}

export default StudentTasksSkeleton;
