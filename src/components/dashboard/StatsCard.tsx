import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "gold" | "green" | "blue" | "red" | "neutral";

const ACCENT_BY_TONE: Record<
  Accent,
  { strip: string; iconBg: string; iconText: string; valueText: string }
> = {
  gold: {
    strip: "bg-gradient-to-r from-secondary to-[color-mix(in_oklab,var(--secondary)_60%,white)]",
    iconBg: "bg-secondary/15",
    iconText: "text-secondary",
    valueText: "text-foreground",
  },
  green: {
    strip:
      "bg-gradient-to-r from-[color:var(--success)] to-[color-mix(in_oklab,var(--success)_60%,white)]",
    iconBg: "bg-[color-mix(in_oklab,var(--success)_15%,transparent)]",
    iconText: "text-[color:var(--success)]",
    valueText: "text-foreground",
  },
  blue: {
    strip:
      "bg-gradient-to-r from-[color:var(--info)] to-[color-mix(in_oklab,var(--info)_60%,white)]",
    iconBg: "bg-[color-mix(in_oklab,var(--info)_15%,transparent)]",
    iconText: "text-[color:var(--info)]",
    valueText: "text-foreground",
  },
  red: {
    strip:
      "bg-gradient-to-r from-destructive to-[color-mix(in_oklab,var(--destructive)_60%,white)]",
    iconBg: "bg-destructive/12",
    iconText: "text-destructive",
    valueText: "text-foreground",
  },
  neutral: {
    strip: "bg-gradient-to-r from-foreground/40 to-foreground/15",
    iconBg: "bg-muted",
    iconText: "text-muted-foreground",
    valueText: "text-foreground",
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
  /** Optional small trend tag e.g. {+12%, "up"}. */
  trend?: { value: string; direction: "up" | "down" | "flat" };
}) {
  const tone = ACCENT_BY_TONE[accent];
  return (
    <div className="hover-lift relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 pt-[18px]">
      {/* top accent strip */}
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-[3px]", tone.strip)} />
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md",
            tone.iconBg,
            tone.iconText,
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={cn(
            "font-display text-3xl font-extrabold leading-none tracking-[-0.035em] md:text-[2rem]",
            tone.valueText,
          )}
        >
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "font-mono text-[10px] font-semibold tracking-tight",
              trend.direction === "up" && "text-[color:var(--success)]",
              trend.direction === "down" && "text-destructive",
              trend.direction === "flat" && "text-muted-foreground",
            )}
          >
            {trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "▬"} {trend.value}
          </span>
        )}
      </div>
      {sub && <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
