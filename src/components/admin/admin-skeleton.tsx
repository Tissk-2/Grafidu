"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

/**
 * Placeholder for the admin main column.
 *
 * The admin shell lives in `src/app/admin/layout.tsx`, so it stays mounted
 * while this shows — navigating between admin pages never blanks the sidebar.
 * Reuses the real admin classes so nothing shifts when the data lands.
 */
export function AdminSkeleton() {
  return (
    <SkeletonTheme baseColor="var(--line-soft)" highlightColor="var(--surface-2)" duration={1.4}>
      <div className="adm-head">
        <div>
          <Skeleton width={260} height={26} />
          <Skeleton width={380} height={13} style={{ marginTop: 10 }} />
        </div>
        <Skeleton width={140} height={38} borderRadius={8} />
      </div>

      <div className="adm-stat-grid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="adm-stat">
            <Skeleton circle width={46} height={46} />
            <span style={{ flex: 1 }}>
              <Skeleton width={90} height={12} />
              <Skeleton width={64} height={22} style={{ marginTop: 10 }} />
            </span>
          </div>
        ))}
      </div>

      <div className="adm-card">
        <Skeleton width={180} height={16} />
        <Skeleton width={300} height={12} style={{ marginTop: 10 }} />
        <div className="adm-table-wrap">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{ display: "flex", gap: 16, padding: "15px 16px", alignItems: "center" }}
            >
              <Skeleton width={190} height={13} />
              <Skeleton width={150} height={13} />
              <Skeleton width={90} height={13} />
              <span style={{ flex: 1 }} />
              <Skeleton width={64} height={26} borderRadius={6} />
            </div>
          ))}
        </div>
      </div>
    </SkeletonTheme>
  );
}

export default AdminSkeleton;
