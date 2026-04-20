import { Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import type { Load } from "@/types";

export function SavedLoadsGrid({ items }: { items: Load[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-card/50 p-6 text-center text-xs text-muted-foreground">
        <Bookmark className="mx-auto mb-1 h-4 w-4 opacity-50" />
        No saved loads. Bookmark loads from the <Link to="/board" search={{ q: "", origin: "all", destination: "all", loadType: "all", equipment: "all", pickup: "", minRate: 0, maxDistance: 2000, border: false, zimra: false, urgent: false, minWeight: 0, maxWeight: 40, payment: "all", sort: "newest", load: undefined }} className="text-primary hover:underline">Load Board</Link>.
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((l) => (
        <Link key={l.id} to="/board" search={{ q: "", origin: "all", destination: "all", loadType: "all", equipment: "all", pickup: "", minRate: 0, maxDistance: 2000, border: false, zimra: false, urgent: false, minWeight: 0, maxWeight: 40, payment: "all", sort: "newest", load: undefined }} className="group rounded-md border border-border bg-card p-3 transition-colors hover:border-primary">
          <div className="font-display text-sm font-bold uppercase tracking-tight text-foreground">{l.origin} → {l.destination}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">{l.load_type}{l.pickup_date ? ` · ${l.pickup_date}` : ""}</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono-num text-primary">${Number(l.rate_usd).toLocaleString()}</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary group-hover:underline">Book →</span>
          </div>
        </Link>
      ))}
    </div>
  );
}