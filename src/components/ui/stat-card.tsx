import { Pill } from "@/components/ui/pill";

const ICONS: Record<string, React.ReactNode> = {
  green: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  blue: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  purple: <span style={{ fontSize: 26, fontWeight: 700 }}>?</span>,
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
    <div className="stat-card">
      <b>{label}</b>
      <div className="row">
        <span className={`c c-${tone}`}>{ICONS[tone]}</span>
        <span className="num">{value} hh</span>
      </div>
      {sub ? (
        <div className={`s-${tone}`} style={{ fontSize: 12.5, marginTop: 6 }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}