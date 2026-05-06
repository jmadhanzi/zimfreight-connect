/**
 * MapStatsBar — bottom overlay showing live load and border stats on the map.
 */
import { Truck, Clock, AlertTriangle, Globe } from "lucide-react";
import type { Load, BorderStatus } from "@/types";
import { borderWaitColor } from "@/lib/zimGeo";
import { formatUSD } from "@/lib/utils";

interface Props {
  loads: Load[];
  borders: BorderStatus[];
}

export function MapStatsBar({ loads, borders }: Props) {
  const urgentCount = loads.filter((l) => l.is_urgent).length;
  const borderCount = loads.filter((l) => l.is_border_crossing).length;
  const avgRate =
    loads.length > 0 ? loads.reduce((sum, l) => sum + Number(l.rate_usd), 0) / loads.length : 0;

  const worstBorder = borders.reduce<BorderStatus | null>((worst, b) => {
    if (!worst) return b;
    return Number(b.wait_hours) > Number(worst.wait_hours) ? b : worst;
  }, null);

  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2">
      <div className="flex items-center gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-[0_20px_50px_-15px_color-mix(in_oklab,var(--foreground)_25%,transparent)] backdrop-blur-xl">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/60 to-transparent"
        />
        <StatCell
          icon={<Truck className="h-3.5 w-3.5" strokeWidth={2.4} />}
          value={String(loads.length)}
          label="Active loads"
          color="text-foreground"
          iconBg="bg-primary/10 text-primary"
        />
        <Divider />
        <StatCell
          icon={<AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.4} />}
          value={String(urgentCount)}
          label="Urgent"
          color="text-destructive"
          iconBg="bg-destructive/12 text-destructive"
        />
        <Divider />
        <StatCell
          icon={<Globe className="h-3.5 w-3.5" strokeWidth={2.4} />}
          value={String(borderCount)}
          label="Cross-border"
          color="text-foreground"
          iconBg="bg-[color-mix(in_oklab,var(--info)_15%,transparent)] text-[color:var(--info)]"
        />
        <Divider />
        <StatCell
          icon={<span className="font-mono text-sm font-bold">$</span>}
          value={avgRate > 0 ? formatUSD(avgRate) : "—"}
          label="Avg rate"
          color="text-secondary"
          iconBg="bg-secondary/15 text-secondary"
        />
        {worstBorder && (
          <>
            <Divider />
            <div className="flex items-center gap-2.5 px-4 py-2.5">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{
                  background: `${borderWaitColor(Number(worstBorder.wait_hours))}22`,
                  color: borderWaitColor(Number(worstBorder.wait_hours)),
                }}
              >
                <Clock className="h-3.5 w-3.5" strokeWidth={2.4} />
              </span>
              <div>
                <div
                  className="font-display text-sm font-extrabold tracking-tight tabular-nums"
                  style={{ color: borderWaitColor(Number(worstBorder.wait_hours)) }}
                >
                  {Number(worstBorder.wait_hours).toFixed(1)}h
                </div>
                <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {worstBorder.border_name}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCell({
  icon,
  value,
  label,
  color,
  iconBg,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
  iconBg: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5">
      <span className={`flex h-7 w-7 items-center justify-center rounded-md ${iconBg}`}>
        {icon}
      </span>
      <div>
        <div className={`font-display text-sm font-extrabold tracking-tight ${color}`}>{value}</div>
        <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-8 w-px bg-border" />;
}
