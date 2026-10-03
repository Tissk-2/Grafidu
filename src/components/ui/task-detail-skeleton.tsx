"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

/** Header + search + table, used for both the submitted and missing sections. */
function Section({ dot, rows, grade }: { dot: string; rows: number; grade?: boolean }) {
  return (
    <section className="mt-[42px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`size-2.5 rounded-full ${dot}`} />
          <Skeleton width={168} height={17} />
        </div>
        <Skeleton width={58} height={14} />
      </div>

      <div className="mt-3">
        <Skeleton height={45} borderRadius={4} />
      </div>

      <div className="mt-3.5 overflow-hidden rounded border border-[#DDD] dark:border-[#2D2B30]">
        <div className="flex h-7 items-center gap-3.5 px-3.5">
          <Skeleton width={20} height={9} />
          <Skeleton width={44} height={9} />
          <Skeleton width={90} height={9} />
          <span className="flex-1" />
          <Skeleton width={40} height={9} />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex h-11 items-center gap-3.5 border-t border-[#E5E5E5] dark:border-[#2D2B30] px-3.5">
            <Skeleton width={16} height={12} />
            <Skeleton width={142} height={13} />
            <Skeleton width={118} height={12} />
            <span className="flex-1" />
            {grade ? <Skeleton width={74} height={34} borderRadius={4} /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Placeholder for /teacher/tasks/[id]. Mirrors that page section for section —
 * breadcrumb, title tile, meta, progress, description, then the two roster
 * tables — so opening a task doesn't flash another route's layout.
 */
export function TaskDetailSkeleton() {
  return (
    <SkeletonTheme baseColor="var(--line-soft)" highlightColor="var(--surface-2)" duration={1.4}>
      {/* breadcrumb */}
      <nav className="flex items-center gap-2">
        <Skeleton width={16} height={16} />
        <Skeleton width={84} height={14} />
        <Skeleton width={4} height={14} />
        <Skeleton width={78} height={14} />
      </nav>

      {/* title */}
      <header className="mt-[18px] flex items-center gap-3.5">
        <Skeleton width={48} height={48} borderRadius={8} />
        <Skeleton width={340} height={30} />
      </header>

      {/* assigned / due */}
      <div className="mt-2.5 flex items-center gap-2">
        <Skeleton width={16} height={16} />
        <Skeleton width={158} height={13} />
        <Skeleton width={4} height={4} />
        <Skeleton width={16} height={16} />
        <Skeleton width={146} height={13} />
      </div>

      {/* submission progress */}
      <section className="mt-8">
        <div className="flex items-center gap-5">
          <div className="flex-1">
            <Skeleton width={138} height={14} />
            <Skeleton height={7} borderRadius={999} style={{ marginTop: 8 }} />
          </div>
          <Skeleton width={40} height={14} />
        </div>
        <div className="mt-6 h-px w-full bg-[#E5E5E5] dark:bg-[#333136]" />
      </section>

      {/* description */}
      <section className="mt-6">
        <Skeleton width={138} height={12} />
        <div className="mt-3 flex flex-col gap-2.5">
          <Skeleton width="100%" height={15} />
          <Skeleton width="97%" height={15} />
          <Skeleton width="88%" height={15} />
          <Skeleton width="61%" height={15} />
        </div>
      </section>

      <Section dot="bg-[#16A34A]" rows={5} grade />
      <div className="pb-40">
        <Section dot="bg-[#B91C1C]" rows={3} />
      </div>
    </SkeletonTheme>
  );
}

export default TaskDetailSkeleton;
