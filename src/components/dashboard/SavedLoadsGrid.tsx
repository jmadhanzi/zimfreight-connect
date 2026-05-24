import { Link } from "@tanstack/react-router";
import { Bookmark, ArrowRight } from "lucide-react";
import type { Load } from "@/types";

const BOARD_SEARCH = {
  q: "",
  origin: "all",
  destination: "all",
  loadType: "all",
  equipment: "all",
  pickup: "",
  minRate: 0,
  maxDistance: 2000,
  border: false,
  zimra: false,
  urgent: false,
  minWeight: 0,
  maxWeight: 40,
  payment: "all",
  sort: "newest" as const,
  load: undefined as string | undefined,
};

export function SavedLoadsGrid({ items }: { items: Load[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
        <Bookmark className="mx-auto h-5 w-5 text-muted-foreground/60" />
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          No saved loads
        </p>
        <p className="mt-1 text-sm text-foreground/70">
          Bookmark loads from the{" "}
          <Link
            to="/board"
            search={BOARD_SEARCH}
            className="font-bold text-primary hover:underline"
          >
            Load Board
          </Link>{" "}
          to see them here.
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((l) => (
        <Link
          key={l.id}
          to="/board"
          search={BOARD_SEARCH}
          className=" group flex flex-col rounded-lg border border-border/70 bg-card p-4 transition-colors hover:border-foreground/15"
        >
          <div className="flex items-center gap-1.5 font-display text-sm font-bold tracking-[-0.02em] text-foreground">
            <span className="truncate">{l.origin}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-secondary" />
            <span className="truncate">{l.destination}</span>
          </div>
          <div className="mt-1.5 text-[11px] text-muted-foreground">
            {l.load_type}
            {l.pickup_date ? ` · ${l.pickup_date}` : ""}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-display text-xl font-bold tracking-[-0.025em] text-foreground">
              ${Number(l.rate_usd).toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-secondary group-hover:underline">
              Book{" "}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
