import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lock,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Flame,
  MapPin,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatUSD, timeAgo, transitProgress, cn } from "@/lib/utils";
import { usdToZwl } from "@/lib/fx";
import type { Load, SortKey } from "@/types";

export const SAVED_KEY = "zf:saved_loads";

export function getSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
export function toggleSaved(id: string) {
  const cur = getSaved();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("zf:saved-changed"));
  return next;
}

/** DAT-style colour-coded freshness badge */
function AgeBadge({ iso }: { iso: string }) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  const hours = Math.floor(mins / 60);
  let cls = "age-badge ";
  let label = "";
  if (mins < 60) {
    cls += "age-badge-fresh";
    label = mins < 1 ? "just now" : `${mins}m`;
  } else if (hours < 6) {
    cls += "age-badge-recent";
    label = `${hours}h`;
  } else if (hours < 24) {
    cls += "age-badge-old";
    label = `${hours}h`;
  } else {
    cls += "age-badge-stale";
    label = `${Math.floor(hours / 24)}d`;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cls}>
          <Clock className="h-2.5 w-2.5" />
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent side="right" className="font-mono text-[10px] uppercase tracking-widest">
        Posted {timeAgo(iso)}
      </TooltipContent>
    </Tooltip>
  );
}

/** Zimbabwe broker trust score */
function TrustScore({ verified, zimra }: { verified?: boolean; zimra?: boolean }) {
  const score = 60 + (verified ? 25 : 0) + (zimra ? 15 : 0);
  const cls =
    score >= 90
      ? "text-[color:var(--success)]"
      : score >= 75
        ? "text-[color:var(--zim-yellow)]"
        : "text-destructive";
  const label = score >= 90 ? "High" : score >= 75 ? "Med" : "Low";
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold ${cls}`}>
      <ShieldCheck className="h-3 w-3" />
      {label} ({score})
    </span>
  );
}

interface LoadTableProps {
  loads: Load[];
  onSelect: (l: Load) => void;
  canSeeContacts: boolean;
  onUpgrade: () => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
}

export function LoadTable({
  loads,
  onSelect,
  canSeeContacts,
  onUpgrade,
  sort,
  onSort,
  savedIds,
  onToggleSave,
}: LoadTableProps) {
  const sortBtn = (key: SortKey, label: string) => {
    const isRate = key === "rate_high";
    const active = sort === key || (isRate && sort === "rate_low");
    const dir = sort === "rate_high" ? "down" : sort === "rate_low" ? "up" : "down";
    return (
      <button
        type="button"
        onClick={() => onSort(isRate ? (sort === "rate_high" ? "rate_low" : "rate_high") : key)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
          active ? "text-foreground font-semibold" : "text-muted-foreground",
        )}
      >
        {label}
        {active &&
          (dir === "down" ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronUp className="h-3 w-3" />
          ))}
      </button>
    );
  };
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_1px_0_color-mix(in_oklab,var(--foreground)_5%,transparent),0_8px_24px_-12px_color-mix(in_oklab,var(--foreground)_15%,transparent)]">
      <div className="overflow-x-auto">
        <TooltipProvider delayDuration={150}>
          <table className="w-full text-sm">
            <thead className="sticky top-[44px] z-20 bg-[color:var(--bg-secondary)]/95 backdrop-blur">
              <tr className="border-b border-border">
                <th className="px-3 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Age
                </th>
                <th className="px-3 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Route
                </th>
                <th className="px-3 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Commodity
                </th>
                <th className="px-3 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Weight
                </th>
                <th className="px-3 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {sortBtn("rate_high", "Rate")}
                </th>
                <th className="px-3 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Broker / Trust
                </th>
                <th className="px-3 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {sortBtn("newest", "Pickup")}
                </th>
                <th className="px-3 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Status
                </th>
                <th className="px-3 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loads.map((l) => (
                <Row
                  key={l.id}
                  load={l}
                  onSelect={onSelect}
                  canSeeContacts={canSeeContacts}
                  onUpgrade={onUpgrade}
                  saved={savedIds.includes(l.id)}
                  onToggleSave={onToggleSave}
                />
              ))}
            </tbody>
          </table>
        </TooltipProvider>
      </div>
    </div>
  );
}

function Row({
  load,
  onSelect,
  canSeeContacts,
  onUpgrade,
  saved,
  onToggleSave,
}: {
  load: Load;
  onSelect: (l: Load) => void;
  canSeeContacts: boolean;
  onUpgrade: () => void;
  saved: boolean;
  onToggleSave: (id: string) => void;
}) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const progress = transitProgress(load.created_at);
  return (
    <tr
      onClick={() => onSelect(load)}
      style={{ ["--transit-progress" as string]: `${progress}%` }}
      className={cn(
        "group relative cursor-pointer border-b border-border/50 transition-colors transit-bar-row animate-fade-in",
        load.is_urgent
          ? "bg-[color-mix(in_oklab,var(--destructive)_3%,transparent)] hover:bg-[color-mix(in_oklab,var(--destructive)_6%,transparent)]"
          : "hover:bg-[color-mix(in_oklab,var(--primary)_3%,transparent)]",
      )}
    >
      <td className="px-3 py-3" onClick={stop}>
        <AgeBadge iso={load.created_at} />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5 font-display text-[15px] font-bold leading-none text-foreground">
          <span>{load.origin}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>{load.destination}</span>
          {load.is_border_crossing && (
            <span className="glass-chip glass-chip-info ml-1 uppercase">
              <MapPin className="h-2.5 w-2.5" /> Border
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          {load.highway && (
            <span className="rounded bg-[color:var(--bg-secondary)] px-1.5 py-0.5 text-foreground/70">
              {load.highway}
            </span>
          )}
          {load.distance_km && <span>{load.distance_km} km</span>}
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="text-foreground">{load.load_type}</div>
        {load.equipment_required && (
          <div className="font-mono text-[10px] text-muted-foreground">
            {load.equipment_required}
          </div>
        )}
      </td>
      <td className="px-3 py-3">
        <div className="font-mono-num font-bold text-foreground">
          {load.weight_tonnes ? `${load.weight_tonnes}T` : "—"}
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">
          ×{load.num_loads} load{load.num_loads === 1 ? "" : "s"}
        </div>
      </td>
      <td className="px-3 py-3 text-right">
        <div className="font-display text-xl font-bold text-primary">
          {formatUSD(load.rate_usd)}
        </div>
        {load.rate_per_km && (
          <div className="font-mono text-[10px] text-muted-foreground">
            ${Number(load.rate_per_km).toFixed(2)}/km
          </div>
        )}
        <div className="font-mono text-[9px] tabular-nums text-secondary/70">
          ZWL {usdToZwl(Number(load.rate_usd)).toLocaleString()}
        </div>
      </td>
      <td className="px-3 py-3">
        {canSeeContacts ? (
          <div>
            <div className="text-sm font-medium text-foreground">Verified Broker</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <TrustScore verified={true} zimra={load.zimra_required} />
              {load.payment_terms && (
                <span className="font-mono text-[10px] text-muted-foreground">
                  {load.payment_terms}
                </span>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={(e) => {
              stop(e);
              onUpgrade();
            }}
            className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/8 px-2.5 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15"
          >
            <Lock className="h-3 w-3" /> Upgrade to view
          </button>
        )}
      </td>
      <td className="px-3 py-3">
        <div className="text-sm text-foreground">{load.pickup_date ?? "—"}</div>
        {load.delivery_deadline && (
          <div className="font-mono text-[10px] text-muted-foreground">
            → {load.delivery_deadline}
          </div>
        )}
      </td>
      <td className="px-3 py-3">
        {load.is_urgent ? (
          <span className="glass-chip glass-chip-danger uppercase">
            <Flame className="h-3 w-3" /> Urgent
          </span>
        ) : load.status === "available" ? (
          <span className="glass-chip glass-chip-success uppercase">Available</span>
        ) : load.status === "booked" ? (
          <span className="glass-chip glass-chip-danger uppercase">Booked</span>
        ) : (
          <span className="glass-chip uppercase">{load.status}</span>
        )}
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-1.5" onClick={stop}>
          <Button
            size="sm"
            onClick={() => onSelect(load)}
            className={cn(
              "h-8 px-3 text-xs font-bold tracking-wide transition-all",
              load.is_urgent
                ? "bg-secondary text-secondary-foreground shadow-[0_0_0_1px_color-mix(in_oklab,var(--secondary)_50%,transparent),0_4px_12px_-2px_color-mix(in_oklab,var(--secondary)_45%,transparent)] hover:bg-secondary/90"
                : "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
            )}
          >
            {load.is_urgent ? "Bid Now" : "View"}
          </Button>
          {canSeeContacts ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-[color:var(--success)]/40 px-2 text-[color:var(--success)] hover:bg-[color:var(--success)]/10"
                  aria-label="WhatsApp"
                  onClick={(e) => {
                    stop(e);
                    onSelect(load);
                  }}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-mono text-[10px]">
                WhatsApp broker
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={onUpgrade}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
              aria-label="Locked"
            >
              <Lock className="h-3.5 w-3.5" />
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onToggleSave(load.id)}
                aria-label={saved ? "Unsave" : "Save"}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  saved
                    ? "text-primary hover:text-primary/80"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="font-mono text-[10px]">
              {saved ? "Saved" : "Save load"}
            </TooltipContent>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
}
