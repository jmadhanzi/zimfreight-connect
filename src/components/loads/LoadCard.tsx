import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Calendar, Truck as TruckIcon, Flame, ShieldCheck } from "lucide-react";
import { formatUSD, timeAgo, cn } from "@/lib/utils";
import type { Load } from "@/types";

export function LoadCard({ load, onClick }: { load: Load; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-lg border border-border bg-card p-4 text-left transition-all",
        "hover:border-primary/40 hover:bg-card/80 hover:shadow-[0_0_0_1px_var(--primary)/20]",
      )}
    >
      {load.is_urgent && (
        <div className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-lg bg-destructive px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive-foreground">
          <Flame className="h-3 w-3" /> Urgent
        </div>
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
        <Badge variant="outline" className="border-border bg-background/40 text-xs font-normal text-foreground">
          <TruckIcon className="mr-1 h-3 w-3" /> {load.load_type}
        </Badge>
        {load.equipment_required && (
          <Badge variant="outline" className="border-border bg-background/40 text-xs font-normal text-muted-foreground">
            {load.equipment_required}
          </Badge>
        )}
        {load.weight_tonnes && (
          <Badge variant="outline" className="border-border bg-background/40 text-xs font-normal text-muted-foreground font-mono">
            {load.weight_tonnes}t
          </Badge>
        )}
        {load.is_border_crossing && (
          <Badge className="bg-[color-mix(in_oklab,var(--info)_20%,transparent)] text-[color:var(--info)] border-0 text-xs font-normal">
            <MapPin className="mr-1 h-3 w-3" /> Border
          </Badge>
        )}
        {load.zimra_required && (
          <Badge className="bg-[color-mix(in_oklab,var(--gold)_20%,transparent)] text-primary border-0 text-xs font-normal">
            <ShieldCheck className="mr-1 h-3 w-3" /> ZIMRA
          </Badge>
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
