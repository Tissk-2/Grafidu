"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

/**
 * Placeholder for /teacher/tasks. Mirrors that page's real layout — header,
 * search + sort toolbar, then task cards — so switching from the dashboard to
 * the list doesn't flash the dashboard's skeleton instead.
 *
 * Every dimension is taken from the page it stands in for (see TaskCard), so
 * nothing shifts when the data lands.
 */
export function TasksSkeleton() {
  return (
    <SkeletonTheme baseColor="#efedef" highlightColor="#f7f6f8" duration={1.4}>
      {/* header */}
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <Skeleton width={200} height={28} />
          <Skeleton width={320} height={14} style={{ marginTop: 8 }} />
        </div>
        <Skeleton width={210} height={13} />
      </header>

      {/* search + sort */}
      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <div className="min-w-[200px] flex-1">
          <Skeleton height={44} borderRadius={8} />
        </div>
        <Skeleton width={127} height={44} borderRadius={8} />
      </div>

      {/* task cards */}
      <div className="mt-5 flex flex-col gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-sm border border-[#E5E5E5] bg-white p-4">
            <div className="flex items-start gap-3.5">
              <Skeleton width={40} height={40} borderRadius={8} />
              <div className="min-w-0 flex-1">
                <Skeleton width="62%" height={15} />
                <div className="mt-1.5 flex items-center gap-2">
                  <Skeleton width={150} height={12} />
                  <Skeleton width={4} height={4} />
                  <Skeleton width={118} height={12} />
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <Skeleton width={72} height={22} borderRadius={999} />
                <Skeleton width={34} height={12} />
              </div>
              <Skeleton width={16} height={16} />
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}

export default TasksSkeleton;
