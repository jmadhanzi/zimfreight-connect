/**
 * BorderStatusPanel — right-side collapsible panel listing all border crossings.
 * Shows live wait times, status badges, and last-updated timestamps.
 */
import { useState } from "react";
import { ChevronRight, ChevronLeft, Clock, ShieldCheck } from "lucide-react";
import type { BorderStatus } from "@/types";
import { borderWaitColor, borderWaitLabel } from "@/lib/zimGeo";
import { cn } from "@/lib/utils";

interface Props {
  borders: BorderStatus[];
}

const STATUS_LABELS: Record<string, string> = {
  normal:    "Clear",
  moderate:  "Moderate",
  congested: "Congested",
  closed:    "Closed",
};

export function BorderStatusPanel({ borders }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className={cn(
        "pointer-events-auto absolute right-3 top-3 z-[1000] transition-all duration-300",
        open ? "w-64" : "w-10"
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="absolute -left-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-md"
        title={open ? "Hide border panel" : "Show border panel"}
      >
        {open ? (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="rounded-xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="font-display text-sm font-bold text-foreground">
              Border crossings
            </span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">
              {borders.length} active
            </span>
          </div>

          {/* Border list */}
          <div className="divide-y divide-border">
            {borders.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                No border data available
              </div>
            ) : (
              borders
                .slice()
                .sort((a, b) => Number(b.wait_hours) - Number(a.wait_hours))
                .map((border) => {
                  const waitColor = borderWaitColor(Number(border.wait_hours));
                  const statusLabel = STATUS_LABELS[border.status] ?? border.status;
                  const updatedAt = new Date(border.updated_at);
                  const minutesAgo = Math.floor(
                    (Date.now() - updatedAt.getTime()) / 60_000
                  );
                  const ageLabel =
                    minutesAgo < 1
                      ? "just now"
                      : minutesAgo < 60
                      ? `${minutesAgo}m ago`
                      : `${Math.floor(minutesAgo / 60)}h ago`;

                  return (
                    <div key={border.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-display text-sm font-bold text-foreground truncate">
                            {border.border_name}
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {border.country_from} → {border.country_to}
                          </div>
                        </div>
                        {/* Wait time badge */}
                        <div
                          className="flex shrink-0 flex-col items-center rounded-lg px-2.5 py-1.5"
                          style={{
                            background: `${waitColor}22`,
                            border: `1px solid ${waitColor}44`,
                          }}
                        >
                          <Clock className="h-3 w-3" style={{ color: waitColor }} />
                          <span
                            className="font-mono text-xs font-black"
                            style={{ color: waitColor }}
                          >
                            {borderWaitLabel(Number(border.wait_hours))}
                          </span>
                        </div>
                      </div>

                      {/* Status row */}
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            background: `${waitColor}18`,
                            color: waitColor,
                          }}
                        >
                          {statusLabel}
                        </span>
                        <span className="font-mono text-[9px] text-muted-foreground">
                          {ageLabel}
                        </span>
                      </div>

                      {/* Wait time bar */}
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, (Number(border.wait_hours) / 12) * 100)}%`,
                            background: waitColor,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5">
            <p className="text-[10px] text-muted-foreground">
              Data sourced from ZIMRA & SADC border reports. Updated every 30 min.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
