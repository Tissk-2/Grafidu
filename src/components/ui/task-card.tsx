import Link from "next/link";
import { ChevronRight, ClipboardCheck } from "lucide-react";

export type TaskCardTask = {
  id: string | number;
  name: string;
  ditugaskan: string;
  deadline: string;
  completed: boolean;
  muridSelesai: number;
};

/**
 * Status is derived from the submission count rather than the `completed` flag
 * alone — a task can be closed while students are still missing work, and
 * showing "Selesai" next to "27 / 32" reads as a bug.
 */
export function taskStatus(muridSelesai: number, total: number, completed: boolean) {
  if (muridSelesai >= total)
    return { label: "Selesai", dot: "bg-[#16A34A]", chip: "bg-[#EAF7EF] text-[#15803D] dark:bg-[#16301F] dark:text-[#5BD98A]" };
  if (completed)
    return { label: "Ditutup", dot: "bg-[#8A8A8A]", chip: "bg-[#F2F2F2] dark:bg-[#2A282D] text-[#5F5B5D] dark:text-[#A9A5AB]" };
  return { label: "Berjalan", dot: "bg-[#CA8A04]", chip: "bg-[#FDF6E3] dark:bg-[#382C14] text-[#96650A] dark:text-[#E5B85C]" };
}

/**
 * One task, linking to its detail page.
 *
 * Shared by the dashboard's "List Tugas" and the full list at /teacher/tasks so
 * the two stay identical — they previously drifted (inline SVG vs. icon, one
 * line vs. two, no link at all on the dashboard).
 */
export function TaskCard({ task, total }: { task: TaskCardTask; total: number }) {
  const s = taskStatus(task.muridSelesai, total, task.completed);

  return (
    <Link
      href={`/teacher/tasks/${task.id}`}
      className="group block rounded-sm border border-[#E5E5E5] dark:border-[#2D2B30] bg-white dark:bg-[#1C1A1F] p-4 transition-colors hover:border-[#DCD6F3] dark:border-[#3B2F63] hover:bg-[#FDFCFF] dark:bg-[#1C1A1F]"
    >
      <div className="flex items-start gap-3.5">
        <span className="mt-0.5 flex h-10 shrink-0 justify-center items-center rounded-sm bg-[#F4F1FE] dark:bg-[#2C2150] aspect-square">
          <ClipboardCheck size={18} aria-hidden color="#5B3FD6" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium text-[#1A1A1A] dark:text-[#F2F0F2]">{task.name}</p>
          <p className=" flex flex-wrap items-center gap-x-2 text-[13px] text-[#8A8A8A] dark:text-[#8F8B91]">
            <span>Ditugaskan {task.ditugaskan}</span>
            <span aria-hidden className="text-[#CFCFCF] dark:text-[#4C484E]">
              •
            </span>
            <span>Tenggat {task.deadline}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span
            className={`mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${s.chip}`}
          >
            <span className={`size-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
          <span className="text-[12px] tabular-nums text-[#8A8A8A] dark:text-[#8F8B91]">
            {task.muridSelesai}/{total}
          </span>
        </div>

        <ChevronRight
          size={16}
          aria-hidden
          className="mt-1 shrink-0 text-[#CFCFCF] dark:text-[#4C484E] transition group-hover:translate-x-0.5 group-hover:text-[#9A93A5] dark:text-[#8F8B91]"
        />
      </div>
    </Link>
  );
}

export default TaskCard;
