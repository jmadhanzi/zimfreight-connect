import { ArrowRight, MapPin, Calendar, Truck as TruckIcon, Flame, ShieldCheck, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { formatUSD, transitProgress, cn } from "@/lib/utils";
import type { Load } from "@/types";

export const SAVED_KEY = "zf:saved_loads";

/** DAT-style colour-coded age badge */
function AgeBadge({ iso }: { iso: string }) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  const hours = Math.floor(mins / 60);
  let cls = "age-badge ";
  let label = "";
  if (mins < 60) { cls += "age-badge-fresh"; label = mins < 1 ? "just now" : `${mins}m`; }
  else if (hours < 6) { cls += "age-badge-recent"; label = `${hours}h`; }
  else if (hours < 24) { cls += "age-badge-old"; label = `${hours}h`; }
  else { cls += "age-badge-stale"; label = `${Math.floor(hours / 24)}d`; }
  return <span className={cls}><Clock className="h-2.5 w-2.5" />{label}</span>;
}

interface LoadCardProps {
  load: Load;
  onClick?: () => void;
  saved?: boolean;
  onSave?: () => void;
}

export function LoadCard({ load, onClick, saved, onSave }: LoadCardProps) {
  const progress = transitProgress(load.created_at);

  return (
    <button
      onClick={onClick}
      style={{ ["--transit-progress" as string]: `${progress}%` }}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border border-border bg-card p-4 text-left transition-all hover-lift",
        "hover:border-primary/40 hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_20%,transparent)]",
        load.is_urgent && "border-destructive/30 bg-[color-mix(in_oklab,var(--destructive)_3%,transparent)]",
      )}
    >
      {/* Transit progress bar */}
      <div className="absolute inset-x-0 top-0 transit-bar" aria-hidden="true" />

      {/* Top row: route + rate */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-foreground">
            <span className="font-display text-[18px] font-black leading-none truncate">{load.origin}</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
            <span className="font-display text-[18px] font-black leading-none truncate">{load.destination}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <AgeBadge iso={load.created_at} />
            {load.distance_km && (
              <span className="font-mono text-[11px] text-muted-foreground">{load.distance_km} km</span>
            )}
            {load.highway && (
              <span className="rounded bg-[color:var(--bg-secondary)] px-1.5 py-0.5 font-mono text-[10px] text-foreground/70">
                {load.highway}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-mono-num text-2xl font-black text-primary leading-none">
            {formatUSD(load.rate_usd)}
          </div>
          {load.rate_per_km && (
            <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
              ${Number(load.rate_per_km).toFixed(2)}/km
            </div>
          )}
        </div>
      </div>

      {/* Chips row */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="glass-chip">
          <TruckIcon className="h-3 w-3" /> {load.load_type}
        </span>
        {load.equipment_required && (
          <span className="glass-chip text-muted-foreground">{load.equipment_required}</span>
        )}
        {load.weight_tonnes && (
          <span className="glass-chip font-mono text-muted-foreground">{load.weight_tonnes}t</span>
        )}
        {load.is_border_crossing && (
          <span className="glass-chip glass-chip-info">
            <MapPin className="h-3 w-3" /> Border
          </span>
        )}
        {load.zimra_required && (
          <span className="glass-chip glass-chip-amber">
            <ShieldCheck className="h-3 w-3" /> ZIMRA
          </span>
        )}
        {load.is_urgent && (
          <span className="glass-chip glass-chip-danger">
            <Flame className="h-3 w-3" /> Urgent
          </span>
        )}
        {load.pickup_date && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" /> {load.pickup_date}
          </span>
        )}
      </div>

      {/* Save button overlay */}
      {onSave && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSave(); }}
          aria-label={saved ? "Unsave" : "Save load"}
          className={cn(
            "absolute right-3 bottom-3 rounded-md p-1.5 transition-colors",
            saved ? "text-primary" : "text-muted-foreground opacity-0 group-hover:opacity-100",
          )}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
      )}
    </button>
  );
}
