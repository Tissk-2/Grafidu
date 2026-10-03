"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

/**
 * Placeholder for /student/tasks/[id]. Follows that page: breadcrumb, the
 * detail card (title, meta, description), then the submission card.
 *
 * Reuses the real `.crumbs` / `.detail-card` / `.detail-head` / `.detail-meta`
 * classes so the card geometry matches without duplicating measurements.
 */
export function StudentTaskDetailSkeleton() {
  return (
    <SkeletonTheme baseColor="var(--line-soft)" highlightColor="var(--surface-2)" duration={1.4}>
      <div className="crumbs">
        <Skeleton width={15} height={15} />
        <Skeleton width={82} height={14} />
        <Skeleton width={4} height={14} />
        <Skeleton width={150} height={14} />
      </div>

      <div className="detail-card">
        <div className="detail-head">
          <span className="task-ic">
            <Skeleton width={22} height={22} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Skeleton width="70%" height={24} />
            <Skeleton width={220} height={13} style={{ marginTop: 8 }} />
          </div>
        </div>

        <div className="detail-meta">
          <Skeleton width={150} height={14} />
          <Skeleton width={6} height={14} />
          <Skeleton width={140} height={14} />
        </div>

        <div className="desc-label">
          <Skeleton width={178} height={12} />
        </div>
        <div className="desc-text">
          <Skeleton width="100%" height={14} />
          <Skeleton width="96%" height={14} style={{ marginTop: 8 }} />
          <Skeleton width="89%" height={14} style={{ marginTop: 8 }} />
          <Skeleton width="58%" height={14} style={{ marginTop: 8 }} />
        </div>
      </div>

      {/* Pengumpulan Tugas */}
      <div className="detail-card" style={{ marginTop: 24 }}>
        <div className="sec-row" style={{ margin: "0 0 16px" }}>
          <h3>
            <Skeleton width={132} height={17} />
          </h3>
          <Skeleton width={96} height={24} borderRadius={999} />
        </div>
        <div className="field-d">
          <Skeleton height={96} borderRadius={8} />
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <Skeleton width={120} height={36} borderRadius={6} />
          <Skeleton width={150} height={36} borderRadius={6} />
        </div>
      </div>

      <div className="pb-40" />
    </SkeletonTheme>
  );
}

export default StudentTaskDetailSkeleton;
