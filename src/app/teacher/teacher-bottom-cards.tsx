import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import type { AnnouncementItem } from "@/lib/student-model";
import type { TeacherTask } from "@/lib/teacher-model";

/**
 * The dashboard's two bottom cards: recent announcements, and tasks that have
 * submissions waiting to be graded.
 *
 * Values follow the supplied spec: 4px card, 38px tiles, 6px tile radius,
 * #7C3AED accent on #EDE9FE. Written as Tailwind utilities rather than inline
 * styles so it sits in the same layer as the task cards above it.
 */
export function BottomCards({
  pengumuman,
  perluDinilai,
}: {
  pengumuman: AnnouncementItem[];
  perluDinilai: TeacherTask[];
}) {
  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 items-start gap-[13px]">
      {/* Aktivitas Terbaru */}
      <section className="min-w-0 rounded border border-[#DDD] dark:border-[#2D2B30] bg-white dark:bg-[#1C1A1F] px-4 pt-3.5 pb-1.5">
        <div className="mb-1.5 flex items-center justify-between">
          <h2 className="m-0 text-[15px] font-normal text-[#1F1F1F] dark:text-[#F2F0F2]">Aktivitas Terbaru</h2>
          {/* TODO: /teacher/activity does not exist yet — same as the other
              unbuilt /teacher/* links in the nav. */}
          <Link href="/teacher/activity" className="text-[15px] text-[#7C3AED] dark:text-[#A78BFA] underline">
            Lihat Semua
          </Link>
        </div>

        <div>
          {pengumuman.map((p, i) => (
            <div
              key={`${p.title}-${i}`}
              className={`flex items-center gap-3 py-3 ${
                i < pengumuman.length - 1 ? "border-b border-[#E5E5E5] dark:border-[#2D2B30]" : ""
              }`}
            >
              <span className="grid size-[38px] shrink-0 place-items-center rounded-[6px] bg-[#EDE9FE] dark:bg-[#2C2150]">
                <ClipboardCheck size={18} aria-hidden className="text-[#7C3AED] dark:text-[#A78BFA]" />
              </span>
              <span className="min-w-0 flex-1">
                <div className="truncate text-[14px] leading-[18px] font-medium text-[#222] dark:text-[#EDEBF0]">
                  {p.title}
                </div>
                <div className="mt-0.5 truncate text-[12px] leading-4 text-[#777] dark:text-[#9B97A0]">{p.when}</div>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Tugas Perlu Dinilai */}
      <section className="min-w-0 rounded border border-[#DDD] dark:border-[#2D2B30] bg-white dark:bg-[#1C1A1F] px-4 pt-3.5 pb-1.5">
        <div className="mb-1.5 flex items-center justify-between">
          <h2 className="m-0 text-[15px] font-normal text-[#1F1F1F] dark:text-[#F2F0F2]">Tugas Perlu Dinilai</h2>
          <Link href="/teacher/tasks" className="text-[15px] text-[#7C3AED] dark:text-[#A78BFA] underline">
            Lihat Semua
          </Link>
        </div>

        <div>
          {perluDinilai.map((t, i) => (
            <Link
              key={t.id}
              href={`/teacher/tasks/${t.id}`}
              className={`flex items-center gap-3 py-3 ${
                i < perluDinilai.length - 1 ? "border-b border-[#E5E5E5] dark:border-[#2D2B30]" : ""
              }`}
            >
              <span className="grid size-[38px] shrink-0 place-items-center rounded-[6px] bg-[#EDE9FE] dark:bg-[#2C2150]">
                <ClipboardCheck size={18} aria-hidden className="text-[#7C3AED] dark:text-[#A78BFA]" />
              </span>
              <span className="min-w-0 flex-1">
                <div className="truncate text-[14px] leading-[18px] font-medium text-[#222] dark:text-[#EDEBF0]">
                  {t.title}
                </div>
                <div className="mt-0.5 truncate text-[12px] leading-4 text-[#777] dark:text-[#9B97A0]">
                  {t.submitted} pengumpulan
                </div>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default BottomCards;
