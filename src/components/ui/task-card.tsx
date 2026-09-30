import Link from "next/link";
import { ChevronRight, ClipboardCheck } from "lucide-react";

export type TaskCardTask = {
  id: number;
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
    return { label: "Selesai", dot: "bg-[#16A34A]", chip: "bg-[#EAF7EF] text-[#15803D]" };
  if (completed)
    return { label: "Ditutup", dot: "bg-[#8A8A8A]", chip: "bg-[#F2F2F2] text-[#5F5B5D]" };
  return { label: "Berjalan", dot: "bg-[#CA8A04]", chip: "bg-[#FDF6E3] text-[#96650A]" };
}

/**
 * One task, linking to its detail page.
 *
 * Shared by the dashboard's "List Tugas" and the full list at /teacher/tasks so
 * the two stay identical — they previously drifted (inline SVG vs. icon, one
 * line vs. two, no link at all on the dashboard).
 */
export function TaskCard({ task, total }: { task: TaskCardTask; total: number }) {
  const pct = total ? Math.round((task.muridSelesai / total) * 100) : 0;
  const s = taskStatus(task.muridSelesai, total, task.completed);

  return (
    <Link
      href={`/teacher/tasks/${task.id}`}
      className="group block rounded-sm border border-[#E5E5E5] bg-white p-4 transition-colors hover:border-[#DCD6F3] hover:bg-[#FDFCFF]"
    >
      <div className="flex items-start gap-3.5">
        <span className="mt-0.5 flex h-10 shrink-0 justify-center items-center rounded-sm bg-[#F4F1FE] aspect-square">
          <ClipboardCheck size={18} aria-hidden color="#5B3FD6" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium text-[#1A1A1A]">{task.name}</p>
          <p className=" flex flex-wrap items-center gap-x-2 text-[13px] text-[#8A8A8A]">
            <span>Ditugaskan {task.ditugaskan}</span>
            <span aria-hidden className="text-[#CFCFCF]">
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
          <span className="text-[12px] tabular-nums text-[#8A8A8A]">
            {task.muridSelesai}/{total}
          </span>
        </div>

        <ChevronRight
          size={16}
          aria-hidden
          className="mt-1 shrink-0 text-[#CFCFCF] transition group-hover:translate-x-0.5 group-hover:text-[#9A93A5]"
        />
      </div>
    </Link>
  );
}

export default TaskCard;
