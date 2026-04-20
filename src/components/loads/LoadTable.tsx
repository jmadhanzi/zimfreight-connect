import { ArrowRight, Bookmark, BookmarkCheck, MessageCircle, Lock, Flame, ShieldCheck, ChevronUp, ChevronDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { formatUSD, timeAgo, transitProgress, cn } from "@/lib/utils";
import type { Load, SortKey } from "@/types";

const SAVED_KEY = "zf:saved_loads";

function getSaved(): string[] {
  if (typeof window === "undefined") return [];
  try { const v = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]"); return Array.isArray(v) ? v : []; } catch { return []; }
}
function toggleSaved(id: string) {
  const cur = getSaved();
  const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
  localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("zf:saved-changed"));
  return next;
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

export function LoadTable({ loads, onSelect, canSeeContacts, onUpgrade, sort, onSort, savedIds, onToggleSave }: LoadTableProps) {
  const sortBtn = (key: SortKey, label: string) => {
    const active = sort === key || (key === "rate_high" && sort === "rate_low");
    const dir = sort === "rate_high" ? "down" : sort === "rate_low" ? "up" : "down";
    return (
      <button type="button" onClick={() => onSort(key === "rate_high" ? (sort === "rate_high" ? "rate_low" : "rate_high") : key)}
        className={cn("inline-flex items-center gap-1 hover:text-foreground", active && "text-foreground")}>
        {label}
        {active && (dir === "down" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />)}
      </button>
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-[44px] z-20 bg-[color:var(--bg-secondary)] font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left">Route</th>
              <th className="px-3 py-2 text-left">Load type</th>
              <th className="px-3 py-2 text-left">Weight</th>
              <th className="px-3 py-2 text-right">{sortBtn("rate_high", "Rate")}</th>
              <th className="px-3 py-2 text-left">Broker</th>
              <th className="px-3 py-2 text-left">{sortBtn("newest", "Pickup")}</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loads.map(l => (
              <Row key={l.id} load={l} onSelect={onSelect} canSeeContacts={canSeeContacts} onUpgrade={onUpgrade}
                saved={savedIds.includes(l.id)} onToggleSave={onToggleSave} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ load, onSelect, canSeeContacts, onUpgrade, saved, onToggleSave }: {
  load: Load; onSelect: (l: Load) => void; canSeeContacts: boolean; onUpgrade: () => void;
  saved: boolean; onToggleSave: (id: string) => void;
}) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const progress = transitProgress(load.created_at);
  return (
    <tr
      onClick={() => onSelect(load)}
      style={{ ["--transit-progress" as string]: `${progress}%` }}
      className={cn(
        "group relative cursor-pointer border-b border-border/60 transition-colors hover:bg-background/40 transit-bar-row",
        !load.is_urgent && "hover:[&>td:first-child]:before:opacity-100",
      )}
    >
      <td className="px-3 py-3">
        <div className="flex items-center gap-2 font-display text-base font-bold leading-none">
          {load.origin}<ArrowRight className="h-3.5 w-3.5 text-primary" />{load.destination}
          {load.is_border_crossing && (
            <span className="glass-chip glass-chip-info ml-1 uppercase">
              <MapPin className="h-2.5 w-2.5" /> Border
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          {load.highway && <span className="rounded bg-background/60 px-1.5 py-0.5 text-foreground/80">{load.highway}</span>}
          {load.distance_km && <span>{load.distance_km}km</span>}
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="text-foreground">{load.load_type}</div>
        {load.equipment_required && <div className="font-mono text-[10px] text-muted-foreground">{load.equipment_required}</div>}
      </td>
      <td className="px-3 py-3">
        <div className="font-mono-num font-bold text-foreground">{load.weight_tonnes ? `${load.weight_tonnes}T` : "—"}</div>
        <div className="font-mono text-[10px] text-muted-foreground">×{load.num_loads} load{load.num_loads === 1 ? "" : "s"}</div>
      </td>
      <td className="px-3 py-3 text-right">
        <div className="font-display text-xl font-bold text-primary">{formatUSD(load.rate_usd)}</div>
        {load.rate_per_km && <div className="font-mono text-[10px] text-muted-foreground">${Number(load.rate_per_km).toFixed(2)}/km</div>}
      </td>
      <td className="px-3 py-3">
        {canSeeContacts ? (
          <div>
            <div className="text-foreground">Verified Broker</div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="text-[color:var(--zim-yellow)]">★ 4.8</span>
              <span>· 14d pay</span>
              {load.zimra_required && (
                <span className="glass-chip glass-chip-amber uppercase">
                  <ShieldCheck className="h-2.5 w-2.5" /> ZIMRA
                </span>
              )}
            </div>
          </div>
        ) : (
          <button onClick={(e) => { stop(e); onUpgrade(); }} className="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/20">
            <Lock className="h-3 w-3" /> Upgrade
          </button>
        )}
      </td>
      <td className="px-3 py-3">
        <div className="text-foreground">{load.pickup_date ?? "—"}</div>
        <div className="font-mono text-[10px] text-muted-foreground">posted {timeAgo(load.created_at)}</div>
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
          <Button size="sm" onClick={() => onSelect(load)} className="h-8 bg-primary px-2.5 text-xs text-primary-foreground hover:bg-primary/90">Book</Button>
          {canSeeContacts ? (
            <Button size="sm" variant="outline" className="h-8 border-[color:var(--success)]/40 px-2 text-[color:var(--success)] hover:bg-[color:var(--success)]/10" aria-label="WhatsApp">
              <MessageCircle className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onUpgrade} className="h-8 px-2 text-muted-foreground" aria-label="Locked">
              <Lock className="h-3.5 w-3.5" />
            </Button>
          )}
          <button onClick={() => onToggleSave(load.id)} aria-label={saved ? "Unsave" : "Save"}
            className={cn("rounded p-1.5", saved ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>
      </td>
    </tr>
  );
}

export { getSaved, toggleSaved };