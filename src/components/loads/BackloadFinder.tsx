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

export function BackloadFinder({
  origin,
  destination,
  returnCount,
  onFind,
  className,
}: BackloadFinderProps) {
  if (!origin || !destination || origin === "all" || destination === "all") return null;

  const savings = Math.round((returnCount > 0 ? 0.35 : 0.15) * 100);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-[color:var(--success)]/30 bg-gradient-to-br from-[color:var(--success)]/[0.06] via-card to-card p-4 md:p-5",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[color:var(--success)]/15 blur-2xl"
      />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--success)]/15 text-[color:var(--success)]">
            <ArrowLeftRight className="h-4.5 w-4.5" strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 font-display text-sm font-bold tracking-tight text-foreground">
              <Truck className="h-3.5 w-3.5 text-[color:var(--success)]" />
              Return Load Finder
              {returnCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md border border-[color:var(--success)]/20 bg-[color-mix(in_oklab,var(--success)_10%,transparent)] px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--success)] uppercase">
                  {returnCount} available
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {returnCount > 0 ? (
                <>
                  <strong className="text-foreground">
                    {returnCount} load{returnCount === 1 ? "" : "s"}
                  </strong>{" "}
                  going{" "}
                  <strong className="text-foreground">
                    {destination} → {origin}
                  </strong>{" "}
                  &mdash; avoid dead-heading and save up to{" "}
                  <span className="font-bold text-[color:var(--success)]">{savings}%</span> on fuel
                  costs.
                </>
              ) : (
                <>
                  No return loads on{" "}
                  <strong className="text-foreground">
                    {destination} → {origin}
                  </strong>{" "}
                  right now. Set an alert and we&rsquo;ll notify you when one is posted.
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {returnCount > 0 && (
            <div className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--success)]">
              <TrendingUp className="h-3 w-3" strokeWidth={3} />
              Save fuel
            </div>
          )}
          <Button
            size="sm"
            variant={returnCount > 0 ? "default" : "outline"}
            onClick={onFind}
            className={cn(
              "h-9 rounded-full px-4 text-xs font-bold tracking-wide",
              returnCount > 0
                ? "bg-[color:var(--success)] text-white hover:bg-[color-mix(in_oklab,var(--success)_85%,black)]"
                : "border-[color:var(--success)]/40 text-[color:var(--success)] hover:bg-[color:var(--success)]/10",
            )}
          >
            {returnCount > 0 ? "Find return loads" : "Set alert"}
          </Button>
        </div>
      </div>
    </div>
  );
}
