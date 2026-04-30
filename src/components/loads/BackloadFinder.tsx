import { ArrowLeftRight, Truck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * BackloadFinder — Zimbabwe-specific "return load" finder.
 * When a carrier is viewing a load from Harare → Beitbridge,
 * this banner suggests available loads going the other way
 * (Beitbridge → Harare) to help them avoid dead-heading.
 *
 * This is a key DAT feature adapted for the Zim market where
 * dead-heading on long corridors (e.g. Beit Bridge–Harare 580km)
 * is a major cost driver.
 */

interface BackloadFinderProps {
  origin: string;
  destination: string;
  returnCount: number;
  onFind: () => void;
  className?: string;
}

export function BackloadFinder({ origin, destination, returnCount, onFind, className }: BackloadFinderProps) {
  if (!origin || !destination || origin === "all" || destination === "all") return null;

  const savings = Math.round((returnCount > 0 ? 0.35 : 0.15) * 100);

  return (
    <div className={cn("backload-banner", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--success)]/15 text-[color:var(--success)]">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Truck className="h-3.5 w-3.5 text-[color:var(--success)]" />
              Return Load Finder
              {returnCount > 0 && (
                <span className="glass-chip glass-chip-success">
                  {returnCount} available
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {returnCount > 0 ? (
                <>
                  <strong className="text-foreground">{returnCount} load{returnCount === 1 ? "" : "s"}</strong> going{" "}
                  <strong className="text-foreground">{destination} → {origin}</strong> — avoid dead-heading and save up to{" "}
                  <span className="font-bold text-[color:var(--success)]">{savings}%</span> on fuel costs.
                </>
              ) : (
                <>
                  No return loads on <strong className="text-foreground">{destination} → {origin}</strong> right now.
                  Set an alert and we'll notify you when one is posted.
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {returnCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-[color:var(--success)]">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="font-bold">Save fuel</span>
            </div>
          )}
          <Button
            size="sm"
            variant={returnCount > 0 ? "default" : "outline"}
            onClick={onFind}
            className={cn(
              "h-8 text-xs font-bold",
              returnCount > 0
                ? "bg-[color:var(--success)] text-white hover:bg-[color:var(--success)]/90"
                : "border-[color:var(--success)]/40 text-[color:var(--success)] hover:bg-[color:var(--success)]/10"
            )}
          >
            {returnCount > 0 ? "Find return loads" : "Set alert"}
          </Button>
        </div>
      </div>
    </div>
  );
}
