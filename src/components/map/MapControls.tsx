/**
 * MapControls — floating control panel for the Map View.
 * Provides layer toggles, origin/destination filters, and a legend.
 */
import { useState } from "react";
import { Layers, MapPin, Navigation, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ZIM_CITIES, ALL_DEST_CITIES } from "@/types";
import { borderWaitColor } from "@/lib/zimGeo";

interface Props {
  loadCount: number;
  filteredCount: number;
  showLoads: boolean;
  showBorders: boolean;
  showCorridors: boolean;
  filterOrigin: string;
  filterDestination: string;
  onToggleLoads: () => void;
  onToggleBorders: () => void;
  onToggleCorridors: () => void;
  onOriginChange: (v: string) => void;
  onDestinationChange: (v: string) => void;
}

export function MapControls({
  loadCount,
  filteredCount,
  showLoads,
  showBorders,
  showCorridors,
  filterOrigin,
  filterDestination,
  onToggleLoads,
  onToggleBorders,
  onToggleCorridors,
  onOriginChange,
  onDestinationChange,
}: Props) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="pointer-events-auto absolute left-3 top-3 z-[1000] w-64 rounded-xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-3"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span className="font-display text-sm font-bold text-foreground">Map filters</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {filteredCount}/{loadCount}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
          {/* Layer toggles */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Layers
            </p>
            <ToggleRow
              icon={<MapPin className="h-3.5 w-3.5" />}
              label="Loads"
              active={showLoads}
              color="bg-primary"
              onClick={onToggleLoads}
            />
            <ToggleRow
              icon={<Navigation className="h-3.5 w-3.5" />}
              label="Border crossings"
              active={showBorders}
              color="bg-[color:var(--success)]"
              onClick={onToggleBorders}
            />
            <ToggleRow
              icon={<Layers className="h-3.5 w-3.5" />}
              label="City markers"
              active={showCorridors}
              color="bg-muted-foreground"
              onClick={onToggleCorridors}
            />
          </div>

          {/* Origin / destination filter */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Filter loads
            </p>
            <div className="space-y-1.5">
              <select
                value={filterOrigin}
                onChange={(e) => onOriginChange(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All origins</option>
                {ZIM_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={filterDestination}
                onChange={(e) => onDestinationChange(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All destinations</option>
                {ALL_DEST_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {(filterOrigin || filterDestination) && (
              <button
                onClick={() => { onOriginChange(""); onDestinationChange(""); }}
                className="text-[11px] text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Legend */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Legend
            </p>
            <div className="space-y-1.5 text-[11px] text-muted-foreground">
              <LegendRow color="#1e3a8a" label="Origin city (load count)" shape="circle" />
              <LegendRow color="#d97706" label="Destination city" shape="circle" />
              <LegendRow color="#ef4444" label="Urgent load route" shape="line" />
              <LegendRow color="#3b82f6" label="Cross-border route" shape="dashed" />
              <LegendRow color="#d97706" label="Domestic route" shape="line" />
            </div>
            <div className="mt-2 space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Border wait time
              </p>
              {[
                { label: "≤ 1h — clear", hours: 0.5 },
                { label: "1–3h — moderate", hours: 2 },
                { label: "3–6h — congested", hours: 4 },
                { label: "> 6h — severe", hours: 8 },
              ].map(({ label, hours }) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ background: borderWaitColor(hours) }}
                  />
                  <span className="text-[11px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  active,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "bg-muted/40 text-muted-foreground hover:bg-muted"
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("flex h-5 w-5 items-center justify-center rounded", active ? color + " text-white" : "bg-muted text-muted-foreground")}>
          {icon}
        </span>
        <span className="font-medium">{label}</span>
      </div>
      <div
        className={cn(
          "h-4 w-7 rounded-full transition-colors",
          active ? "bg-primary" : "bg-muted"
        )}
      >
        <div
          className={cn(
            "mt-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform",
            active ? "translate-x-3.5" : "translate-x-0.5"
          )}
        />
      </div>
    </button>
  );
}

function LegendRow({
  color,
  label,
  shape,
}: {
  color: string;
  label: string;
  shape: "circle" | "line" | "dashed";
}) {
  return (
    <div className="flex items-center gap-2">
      {shape === "circle" && (
        <div className="h-3 w-3 rounded-full border-2 border-white/30" style={{ background: color }} />
      )}
      {shape === "line" && (
        <div className="h-0.5 w-5 rounded-full" style={{ background: color }} />
      )}
      {shape === "dashed" && (
        <div
          className="h-0.5 w-5"
          style={{
            background: `repeating-linear-gradient(90deg, ${color} 0, ${color} 4px, transparent 4px, transparent 7px)`,
          }}
        />
      )}
      <span>{label}</span>
    </div>
  );
}
