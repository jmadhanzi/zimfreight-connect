import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ZIM_CITIES, LOAD_TYPES } from "@/types";

export interface Filters {
  q: string;
  origin: string;
  destination: string;
  loadType: string;
}

export function LoadFilters({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
  const reset = () => setFilters({ q: "", origin: "all", destination: "all", loadType: "all" });
  const isFiltered = filters.q || filters.origin !== "all" || filters.destination !== "all" || filters.loadType !== "all";

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="grid gap-2 md:grid-cols-[1fr_auto_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Search loads, commodities, routes…"
            className="pl-9"
          />
        </div>
        <Select value={filters.origin} onValueChange={(v) => setFilters({ ...filters, origin: v })}>
          <SelectTrigger className="md:w-[160px]"><SelectValue placeholder="From" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All origins</SelectItem>
            {ZIM_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.destination} onValueChange={(v) => setFilters({ ...filters, destination: v })}>
          <SelectTrigger className="md:w-[160px]"><SelectValue placeholder="To" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All destinations</SelectItem>
            {ZIM_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.loadType} onValueChange={(v) => setFilters({ ...filters, loadType: v })}>
          <SelectTrigger className="md:w-[170px]"><SelectValue placeholder="Load type" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All types</SelectItem>
            {LOAD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        {isFiltered && (
          <Button variant="ghost" size="icon" onClick={reset} aria-label="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
