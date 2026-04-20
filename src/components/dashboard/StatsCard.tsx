import { type LucideIcon } from "lucide-react";

export function StatsCard({ label, value, sub, icon: Icon, accent }: { label: string; value: string; sub?: string; icon: LucideIcon; accent?: "gold" | "green" | "blue" | "red" }) {
  const accentColor =
    accent === "gold" ? "text-primary"
    : accent === "green" ? "text-[color:var(--success)]"
    : accent === "blue" ? "text-[color:var(--info)]"
    : accent === "red" ? "text-destructive"
    : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${accentColor}`} />
      </div>
      <div className={`mt-2 font-display text-3xl font-black ${accentColor}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
