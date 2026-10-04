import Link from "next/link";
import { Home, TaskSquare, Chart1, Book, MessageQuestion, Graph } from "iconsax-reactjs";
import { Sparkles } from "lucide-react";

type Item = { label: string; href: string; icon: React.ReactNode };

export function BottomNav({ role, active }: { role: "student" | "teacher"; active: string }) {
  const items: Item[] =
    role === "student"
      ? [
          { label: "Home", href: "/student/home", icon: <Home /> },
          { label: "Tasks", href: "/student/tasks", icon: <TaskSquare /> },
          { label: "Grades", href: "/student/grades", icon: <Graph /> },
          { label: "AI Agent", href: "/student/ai-agent", icon: <Sparkles /> },
        ]
      : [
          { label: "Home", href: "/teacher/home", icon: <Home /> },
          { label: "Tasks", href: "/teacher/tasks", icon: <TaskSquare /> },
          { label: "Materi", href: "/teacher/materi", icon: <Book /> },
          { label: "Grades", href: "/teacher/grades", icon: <Chart1 /> },
          { label: "Quiz Maker", href: "/teacher/quiz-maker", icon: <MessageQuestion /> },
          { label: "AI Agent", href: "/teacher/ai-agent", icon: <Sparkles /> },
        ];

  // Desktop/tablet (>= md): persis seperti sebelumnya (kapsul melayang di tengah).
  // HP (< md): bar penuh di tepi bawah, item berbagi lebar rata supaya 6 menu guru muat.
  return (
    <nav className="z-50 fixed inset-x-0 bottom-0 flex justify-around gap-1 border-t border-[#DDD] dark:border-[#2D2B30] bg-white dark:bg-[#1C1A1F] px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-8 md:left-[50%] md:-translate-x-[50%] md:justify-start md:gap-8 md:rounded md:border md:p-4">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={`flex min-w-0 flex-1 flex-col items-center justify-between gap-1 text-[10px] text-gray-600 hover:text-gray-900 dark:text-[#8F8B91] dark:hover:text-[#F2F0F2] md:min-w-[44px] md:flex-none md:text-[11px] ${active === it.label ? "text-purple-600 hover:text-purple-600" : ""}`}
        >
          {it.icon}
          <span className="max-w-full truncate">{it.label}</span>
        </Link>
      ))}
    </nav>
  );
}