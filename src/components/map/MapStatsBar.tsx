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
    loads.length > 0
      ? loads.reduce((sum, l) => sum + Number(l.rate_usd), 0) / loads.length
      : 0;

  const worstBorder = borders.reduce<BorderStatus | null>((worst, b) => {
    if (!worst) return b;
    return Number(b.wait_hours) > Number(worst.wait_hours) ? b : worst;
  }, null);

  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2">
      <div className="flex items-center gap-0 overflow-hidden rounded-xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl">
        <StatCell
          icon={<Truck className="h-3.5 w-3.5" />}
          value={String(loads.length)}
          label="Active loads"
          color="text-primary"
        />
        <Divider />
        <StatCell
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          value={String(urgentCount)}
          label="Urgent"
          color="text-destructive"
        />
        <Divider />
        <StatCell
          icon={<Globe className="h-3.5 w-3.5" />}
          value={String(borderCount)}
          label="Cross-border"
          color="text-[color:var(--info)]"
        />
        <Divider />
        <StatCell
          icon={<span className="font-mono text-xs font-bold">$</span>}
          value={avgRate > 0 ? formatUSD(avgRate) : "—"}
          label="Avg rate"
          color="text-[color:var(--secondary)]"
        />
        {worstBorder && (
          <>
            <Divider />
            <div className="flex items-center gap-2 px-4 py-2.5">
              <Clock
                className="h-3.5 w-3.5"
                style={{ color: borderWaitColor(Number(worstBorder.wait_hours)) }}
              />
              <div>
                <div
                  className="font-mono text-xs font-bold"
                  style={{ color: borderWaitColor(Number(worstBorder.wait_hours)) }}
                >
                  {Number(worstBorder.wait_hours).toFixed(1)}h
                </div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
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
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5">
      <span className={color}>{icon}</span>
      <div>
        <div className={`font-mono text-xs font-black ${color}`}>{value}</div>
        <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-8 w-px bg-border" />;
}
