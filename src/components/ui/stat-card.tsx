import { Pill } from "@/components/ui/pill";

import { TickSquare, ArrowUp, MessageQuestion } from "iconsax-reactjs";
import { Check } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  green: <Check size={64} />,
  blue: <ArrowUp size={64} />,
  purple: <p className="text-7xl font-light">?</p>,
};

export function StatCard({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  tone: "green" | "blue" | "purple";
  sub?: string;
}) {
  return (
    <div className="border border-stone-300 aspect-[1/1] p-5! relative overflow-hidden rounded-md">
      <p className="text-xl">{label}</p>
      <div className="absolute right-6 bottom-6">
        <span className="text-7xl font-light">{value}</span>
      </div>
      <span
        className={`c c-${tone} rounded-full flex justify-center items-center aspect-square w-35! absolute -bottom-6 -left-6`}
      >
        {ICONS[tone]}
      </span>
      {sub ? (
        <div className={`s-${tone}`} style={{ fontSize: 12.5, marginTop: 6 }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}
