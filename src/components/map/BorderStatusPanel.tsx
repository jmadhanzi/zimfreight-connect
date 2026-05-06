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
  normal: "Clear",
  moderate: "Moderate",
  congested: "Congested",
  closed: "Closed",
};

export function BorderStatusPanel({ borders }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className={cn(
        "pointer-events-auto absolute right-3 top-3 z-[1000] transition-all duration-300",
        open ? "w-64" : "w-10",
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
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-[0_20px_50px_-15px_color-mix(in_oklab,var(--foreground)_25%,transparent)] backdrop-blur-xl">
          <span
            aria-hidden
            className="block h-1 w-full bg-gradient-to-r from-secondary via-primary to-secondary"
          />
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.4} />
            </span>
            <span className="font-display text-sm font-extrabold tracking-tight text-foreground">
              Border crossings
            </span>
            <span className="ml-auto font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {borders.length} active
            </span>
          </div>

          {/* Border list */}
          <div className="divide-y divide-border">
            {borders.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  No border data
                </p>
              </div>
            ) : (
              borders
                .slice()
                .sort((a, b) => Number(b.wait_hours) - Number(a.wait_hours))
                .map((border) => {
                  const waitColor = borderWaitColor(Number(border.wait_hours));
                  const statusLabel = STATUS_LABELS[border.status] ?? border.status;
                  const updatedAt = new Date(border.updated_at);
                  const minutesAgo = Math.floor((Date.now() - updatedAt.getTime()) / 60_000);
                  const ageLabel =
                    minutesAgo < 1
                      ? "just now"
                      : minutesAgo < 60
                        ? `${minutesAgo}m ago`
                        : `${Math.floor(minutesAgo / 60)}h ago`;

                  return (
                    <div key={border.id} className="px-4 py-3 transition-colors hover:bg-muted/30">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-display text-sm font-extrabold tracking-tight text-foreground">
                            {border.border_name}
                          </div>
                          <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
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
                            className="font-mono text-xs font-black tabular-nums"
                            style={{ color: waitColor }}
                          >
                            {borderWaitLabel(Number(border.wait_hours))}
                          </span>
                        </div>
                      </div>

                      {/* Status row */}
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
                          style={{
                            background: `${waitColor}18`,
                            color: waitColor,
                          }}
                        >
                          {statusLabel}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
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
          <div className="border-t border-border bg-[var(--bg-secondary)] px-4 py-2.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
              ZIMRA &amp; SADC reports &middot; updated every 30 min
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
