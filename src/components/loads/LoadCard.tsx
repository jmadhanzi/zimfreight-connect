import { ArrowRight, MapPin, Calendar, Truck as TruckIcon, Flame, ShieldCheck } from "lucide-react";
import { formatUSD, timeAgo, transitProgress, cn } from "@/lib/utils";
import type { Load } from "@/types";

export function LoadCard({ load, onClick }: { load: Load; onClick?: () => void }) {
  const progress = transitProgress(load.created_at);
  return (
    <button
      onClick={onClick}
      style={{ ["--transit-progress" as string]: `${progress}%` }}
      className={cn(
        "group relative w-full overflow-hidden rounded-lg border border-border bg-card p-4 text-left transition-all",
        "hover:border-primary/40 hover:bg-card/80 hover:shadow-[0_0_0_1px_var(--primary)/20]",
      )}
    >
      {/* Amber transit bar — animated route progress indicator */}
      <div className="absolute inset-x-0 top-0 transit-bar" aria-hidden="true" />

      {load.is_urgent && (
        <span className="glass-chip glass-chip-danger absolute right-3 top-3">
          <Flame className="h-3 w-3" /> Urgent
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-foreground">
            <span className="font-display text-xl font-bold leading-none">{load.origin}</span>
            <ArrowRight className="h-4 w-4 text-primary" />
            <span className="font-display text-xl font-bold leading-none">{load.destination}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {load.distance_km && <span className="font-mono">{load.distance_km} km</span>}
            {load.highway && <span>· {load.highway}</span>}
            <span>· {timeAgo(load.created_at)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono-num text-2xl font-bold text-primary">{formatUSD(load.rate_usd)}</div>
          {load.rate_per_km && <div className="font-mono text-[10px] text-muted-foreground">${load.rate_per_km}/km</div>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="glass-chip">
          <TruckIcon className="h-3 w-3" /> {load.load_type}
        </span>
        {load.equipment_required && (
          <span className="glass-chip text-muted-foreground">{load.equipment_required}</span>
        )}
        {load.weight_tonnes && (
          <span className="glass-chip text-muted-foreground font-mono">{load.weight_tonnes}t</span>
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
        {load.pickup_date && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" /> {load.pickup_date}
          </span>
        )}
      </div>
    </button>
  );
}
