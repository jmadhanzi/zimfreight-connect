import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "gold" | "green" | "blue" | "red" | "neutral";

const ACCENT_STYLES: Record<Accent, { iconBg: string; iconText: string; trendUp: string; trendDown: string }> = {
  gold: {
    iconBg: "bg-[color-mix(in_oklab,var(--warning)_12%,transparent)]",
    iconText: "text-[color:var(--warning)]",
    trendUp: "text-[color:var(--success)]",
    trendDown: "text-destructive",
  },
  green: {
    iconBg: "bg-[color-mix(in_oklab,var(--success)_12%,transparent)]",
    iconText: "text-[color:var(--success)]",
    trendUp: "text-[color:var(--success)]",
    trendDown: "text-destructive",
  },
  blue: {
    iconBg: "bg-[color-mix(in_oklab,var(--info)_12%,transparent)]",
    iconText: "text-[color:var(--info)]",
    trendUp: "text-[color:var(--success)]",
    trendDown: "text-destructive",
  },
  red: {
    iconBg: "bg-destructive/10",
    iconText: "text-destructive",
    trendUp: "text-[color:var(--success)]",
    trendDown: "text-destructive",
  },
  neutral: {
    iconBg: "bg-muted",
    iconText: "text-muted-foreground",
    trendUp: "text-[color:var(--success)]",
    trendDown: "text-destructive",
  },
};

export function StatsCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "neutral",
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  accent?: Accent;
  trend?: { value: string; direction: "up" | "down" | "flat" };
}) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div className="rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:border-foreground/15 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
            {value}
          </div>
          {sub && (
            <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
          )}
          {trend && (
            <div
              className={cn(
                "mt-1.5 text-xs font-medium",
                trend.direction === "up" && styles.trendUp,
                trend.direction === "down" && styles.trendDown,
                trend.direction === "flat" && "text-muted-foreground",
              )}
            >
              {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"} {trend.value}
            </div>
          )}
        </div>
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", styles.iconBg, styles.iconText)}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
