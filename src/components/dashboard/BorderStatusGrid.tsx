import { formatDistanceToNow } from "date-fns";
import { ArrowRight, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import type { BorderStatus } from "@/types";

type Severity = "success" | "warning" | "danger";

function severityFor(b: BorderStatus): Severity {
  if (b.status === "open" && b.wait_hours < 2) return "success";
  if (b.wait_hours < 4) return "warning";
  return "danger";
}

const TONE_BY_SEVERITY: Record<
  Severity,
  {
    strip: string;
    iconBg: string;
    iconText: string;
    valueText: string;
    chip: string;
    icon: typeof CheckCircle2;
  }
> = {
  success: {
    strip:
      "bg-gradient-to-r from-[color:var(--success)] to-[color-mix(in_oklab,var(--success)_60%,white)]",
    iconBg: "bg-[color-mix(in_oklab,var(--success)_15%,transparent)]",
    iconText: "text-[color:var(--success)]",
    valueText: "text-[color:var(--success)]",
    chip: "glass-chip-success",
    icon: CheckCircle2,
  },
  warning: {
    strip:
      "bg-gradient-to-r from-[color:var(--zim-yellow)] to-[color-mix(in_oklab,var(--zim-yellow)_60%,white)]",
    iconBg: "bg-[color-mix(in_oklab,var(--zim-yellow)_18%,transparent)]",
    iconText: "text-[color-mix(in_oklab,var(--zim-yellow)_70%,var(--foreground))]",
    valueText: "text-[color-mix(in_oklab,var(--zim-yellow)_70%,var(--foreground))]",
    chip: "glass-chip-amber",
    icon: Clock,
  },
  danger: {
    strip:
      "bg-gradient-to-r from-destructive to-[color-mix(in_oklab,var(--destructive)_60%,white)]",
    iconBg: "bg-destructive/12",
    iconText: "text-destructive",
    valueText: "text-destructive",
    chip: "glass-chip-danger",
    icon: AlertTriangle,
  },
};

export function BorderStatusGrid({ borders }: { borders: BorderStatus[] }) {
  if (borders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          No live border data
        </p>
        <p className="mt-1 text-sm text-foreground/70">
          We&rsquo;ll show wait times here as soon as feeds come in.
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {borders.map((b) => {
        const tone = TONE_BY_SEVERITY[severityFor(b)];
        const Icon = tone.icon;
        return (
          <div
            key={b.id}
            className="hover-lift relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 pt-[18px]"
          >
            <span aria-hidden className={`absolute inset-x-0 top-0 h-[3px] ${tone.strip}`} />
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="font-display text-base font-extrabold tracking-[-0.02em] text-foreground">
                  {b.border_name}
                </div>
                <div className="mt-1 flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                  <span>{b.country_from}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>{b.country_to}</span>
                </div>
              </div>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${tone.iconBg} ${tone.iconText}`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span
                className={`font-display text-3xl font-black leading-none tracking-[-0.035em] ${tone.valueText}`}
              >
                {Number(b.wait_hours).toFixed(1)}
              </span>
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                h wait
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className={`glass-chip ${tone.chip} uppercase`}>{b.status}</span>
              <span className="font-mono text-muted-foreground">
                {formatDistanceToNow(new Date(b.updated_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
