/**
 * /map — Full-screen interactive freight map for ZimFreight.
 *
 * Displays:
 *  • Live load pins grouped by city with route polylines
 *  • Border crossing markers with colour-coded wait times
 *  • Floating filter/layer control panel (top-left)
 *  • Border status panel (top-right, collapsible)
 *  • Stats bar (bottom-centre)
 *  • Load detail sheet on pin click
 */
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useState, useCallback } from "react";
import { Loader2, Map as MapIcon } from "lucide-react";
import { useLoads } from "@/hooks/useLoads";
import { useBorderStatus } from "@/hooks/useDashboard";
import { LoadDetailSheet } from "@/components/loads/LoadDetailSheet";
import { MapControls } from "@/components/map/MapControls";
import { MapStatsBar } from "@/components/map/MapStatsBar";
import { BorderStatusPanel } from "@/components/map/BorderStatusPanel";
import type { Load } from "@/types";
import { useAuth } from "@/hooks/useAuth";

// Lazy-load the heavy Leaflet map to avoid SSR issues
const FreightMap = lazy(() =>
  import("@/components/map/FreightMap").then((m) => ({ default: m.FreightMap }))
);

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Freight Map — ZimFreight" },
      {
        name: "description",
        content:
          "Interactive map of Zimbabwe freight loads, routes, and live border crossing wait times.",
      },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { loads, loading: loadsLoading } = useLoads();
  const borders = useBorderStatus();
  const { user, subscription } = useAuth();

  // Layer toggles
  const [showLoads, setShowLoads] = useState(true);
  const [showBorders, setShowBorders] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);

  // Filters
  const [filterOrigin, setFilterOrigin] = useState("");
  const [filterDestination, setFilterDestination] = useState("");

  // Selected load for detail sheet
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [savedLoads, setSavedLoads] = useState<Set<string>>(new Set());

  const handleSelectLoad = useCallback((load: Load) => {
    setSelectedLoad(load);
  }, []);

  const handleToggleSave = useCallback((id: string) => {
    setSavedLoads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Filtered load count for the controls panel
  const filteredLoads = loads.filter((l) => {
    if (filterOrigin && l.origin.toLowerCase() !== filterOrigin.toLowerCase()) return false;
    if (filterDestination && l.destination.toLowerCase() !== filterDestination.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden bg-background">
      {/* Page title bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card/80 px-4 py-2.5 backdrop-blur">
        <MapIcon className="h-4 w-4 text-primary" />
        <h1 className="font-display text-sm font-bold uppercase tracking-tight text-foreground">
          Freight Map
        </h1>
        <span className="font-mono text-xs text-muted-foreground">
          Zimbabwe &amp; SADC corridors
        </span>
        {loadsLoading && (
          <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-muted-foreground" />
        )}
        {!loadsLoading && (
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            {loads.length} loads · {borders.length} crossings
          </span>
        )}
      </div>

      {/* Map container */}
      <div className="relative flex-1 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center bg-[#0d0e18]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="font-mono text-xs text-muted-foreground">Loading map…</p>
              </div>
            </div>
          }
        >
          <FreightMap
            loads={loads}
            borders={borders}
            onSelectLoad={handleSelectLoad}
            showLoads={showLoads}
            showBorders={showBorders}
            showCorridors={showCorridors}
            filterOrigin={filterOrigin}
            filterDestination={filterDestination}
          />
        </Suspense>

        {/* Floating controls — pointer-events-none wrapper so map clicks pass through */}
        <div className="pointer-events-none absolute inset-0 z-[999]">
          {/* Top-left: filter panel */}
          <MapControls
            loadCount={loads.length}
            filteredCount={filteredLoads.length}
            showLoads={showLoads}
            showBorders={showBorders}
            showCorridors={showCorridors}
            filterOrigin={filterOrigin}
            filterDestination={filterDestination}
            onToggleLoads={() => setShowLoads((v) => !v)}
            onToggleBorders={() => setShowBorders((v) => !v)}
            onToggleCorridors={() => setShowCorridors((v) => !v)}
            onOriginChange={setFilterOrigin}
            onDestinationChange={setFilterDestination}
          />

          {/* Top-right: border status panel */}
          <BorderStatusPanel borders={borders} />

          {/* Bottom-centre: stats bar */}
          <MapStatsBar loads={filteredLoads} borders={borders} />
        </div>
      </div>

      {/* Load detail sheet */}
      <LoadDetailSheet
        load={selectedLoad}
        onClose={() => setSelectedLoad(null)}
        onRequestAuth={() => setSelectedLoad(null)}
        onUpgrade={() => setSelectedLoad(null)}
        saved={selectedLoad ? savedLoads.has(selectedLoad.id) : false}
        onToggleSave={handleToggleSave}
      />
    </div>
  );
}
