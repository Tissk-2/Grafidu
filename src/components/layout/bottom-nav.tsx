import Link from "next/link";
import { Home, TaskSquare, Chart1, Star, Book, MessageQuestion, Graph } from "iconsax-reactjs";
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
          { label: "Quiz Maker", href: "/teacher/quiz", icon: <MessageQuestion /> },
          { label: "AI Agent", href: "/teacher/ai", icon: <Star /> },
        ];

  return (
    <nav className="z-50 fixed bottom-8 left-[50%] flex !p-4 rounded border border-[#DDD] -translate-x-[50%] gap-8 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={`flex flex-col items-center justify-between gap-1 min-w-[44px] text-[11px] text-gray-600! hover:text-gray-900! ${active === it.label ? "text-purple-600! hover:text-purple-600!" : ""}`}
        >
          {it.icon}
          {it.label}
        </Link>
      ))}
    </nav>
  );
}
