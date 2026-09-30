"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

/**
 * Generic page placeholder: a title, a subtitle, and a card of rows.
 *
 * Used for the simpler pages whose body is a form or a list managed by its own
 * component — /student/settings, /student/todo, /teacher/settings and
 * /teacher/todo — where a bespoke skeleton would be guessing at internals.
 */
export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <SkeletonTheme baseColor="#efedef" highlightColor="#f7f6f8" duration={1.4}>
      <Skeleton width={200} height={26} />
      <Skeleton width={400} height={13} style={{ marginTop: 8 }} />

      <div style={{ marginTop: 24, display: "grid", gap: 14 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="task-row">
            <span className="info" style={{ flex: 1 }}>
              <Skeleton width={150} height={13} />
              <Skeleton width="62%" height={11} style={{ marginTop: 7 }} />
            </span>
            <Skeleton width={110} height={34} borderRadius={6} />
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}

export default PageSkeleton;
