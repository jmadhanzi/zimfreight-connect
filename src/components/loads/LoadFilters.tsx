import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  ZIM_CITIES,
  ALL_DEST_CITIES,
  LOAD_TYPES,
  EQUIPMENT_TYPES,
  PAYMENT_TERMS_OPTIONS,
} from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

export interface Filters {
  q: string;
  origin: string;
  destination: string;
  loadType: string;
  equipment: string;
  pickup: string; // ISO date
  minRate: number;
  maxDistance: number;
  border: boolean;
  zimra: boolean;
  urgent: boolean;
  minWeight: number;
  maxWeight: number;
  payment: string;
}

export const DEFAULT_FILTERS: Filters = {
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
};

export function LoadFilters({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const update = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    setFilters({ ...filters, [k]: v });
  const reset = () => setFilters(DEFAULT_FILTERS);

  const activeChips: { label: string; clear: () => void }[] = [];
  if (filters.q) activeChips.push({ label: `"${filters.q}"`, clear: () => update("q", "") });
  if (filters.origin !== "all")
    activeChips.push({ label: `From: ${filters.origin}`, clear: () => update("origin", "all") });
  if (filters.destination !== "all")
    activeChips.push({
      label: `To: ${filters.destination}`,
      clear: () => update("destination", "all"),
    });
  if (filters.loadType !== "all")
    activeChips.push({ label: filters.loadType, clear: () => update("loadType", "all") });
  if (filters.equipment !== "all")
    activeChips.push({ label: filters.equipment, clear: () => update("equipment", "all") });
  if (filters.pickup)
    activeChips.push({ label: `Pickup ${filters.pickup}`, clear: () => update("pickup", "") });
  if (filters.minRate > 0)
    activeChips.push({ label: `Min $${filters.minRate}`, clear: () => update("minRate", 0) });
  if (filters.maxDistance < 2000)
    activeChips.push({
      label: `≤${filters.maxDistance}km`,
      clear: () => update("maxDistance", 2000),
    });
  if (filters.border) activeChips.push({ label: "Border", clear: () => update("border", false) });
  if (filters.zimra)
    activeChips.push({ label: "ZIMRA brokers", clear: () => update("zimra", false) });
  if (filters.urgent) activeChips.push({ label: "Urgent", clear: () => update("urgent", false) });
  if (filters.payment !== "all")
    activeChips.push({ label: filters.payment, clear: () => update("payment", "all") });

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-border/70 bg-card p-3.5 shadow-[0_1px_0_color-mix(in_oklab,var(--foreground)_5%,transparent)]">
        <div className="grid gap-2 md:grid-cols-[1fr_auto_auto_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.q}
              onChange={(e) => update("q", e.target.value)}
              placeholder="Search loads, commodities, routes…"
              className="pl-9"
            />
          </div>
          <Select value={filters.origin} onValueChange={(v) => update("origin", v)}>
            <SelectTrigger className="md:w-[150px]">
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any origin</SelectItem>
              {ZIM_CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.destination} onValueChange={(v) => update("destination", v)}>
            <SelectTrigger className="md:w-[150px]">
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any destination</SelectItem>
              {ALL_DEST_CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal md:w-[150px]",
                  !filters.pickup && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.pickup ? (
                  format(new Date(filters.pickup), "MMM d")
                ) : (
                  <span>Pickup date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.pickup ? new Date(filters.pickup) : undefined}
                onSelect={(d) => update("pickup", d ? format(d, "yyyy-MM-dd") : "")}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <Select value={filters.loadType} onValueChange={(v) => update("loadType", v)}>
            <SelectTrigger className="md:w-[160px]">
              <SelectValue placeholder="Load type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {LOAD_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-primary font-bold tracking-wide text-primary-foreground hover:bg-primary/90">
            Search loads
          </Button>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced((s) => !s)}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontal className="mr-1.5 h-3 w-3" />
            Advanced filters {showAdvanced ? "▴" : "▾"}
          </Button>
          {activeChips.length > 0 && (
            <button
              onClick={reset}
              className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {showAdvanced && (
          <div className="mt-3 grid gap-4 border-t border-border pt-3 md:grid-cols-3">
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Equipment
              </Label>
              <Select value={filters.equipment} onValueChange={(v) => update("equipment", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any equipment</SelectItem>
                  {EQUIPMENT_TYPES.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Min rate (USD)
              </Label>
              <Input
                type="number"
                min={0}
                value={filters.minRate || ""}
                onChange={(e) => update("minRate", Number(e.target.value) || 0)}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Payment terms
              </Label>
              <Select value={filters.payment} onValueChange={(v) => update("payment", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any terms</SelectItem>
                  {PAYMENT_TERMS_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>Max distance</span>
                <span className="text-foreground">{filters.maxDistance}km</span>
              </Label>
              <Slider
                min={50}
                max={2000}
                step={50}
                value={[filters.maxDistance]}
                onValueChange={([v]) => update("maxDistance", v)}
                className="mt-3"
              />
            </div>
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Weight (tonnes)
              </Label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min={0}
                  placeholder="Min"
                  value={filters.minWeight || ""}
                  onChange={(e) => update("minWeight", Number(e.target.value) || 0)}
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Max"
                  value={filters.maxWeight || ""}
                  onChange={(e) => update("maxWeight", Number(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="md:col-span-3 flex flex-wrap items-center gap-5 border-t border-border pt-3">
              <Toggle
                checked={filters.border}
                onChange={(v) => update("border", v)}
                label="Border crossing only"
              />
              <Toggle
                checked={filters.zimra}
                onChange={(v) => update("zimra", v)}
                label="ZIMRA brokers only"
              />
              <Toggle
                checked={filters.urgent}
                onChange={(v) => update("urgent", v)}
                label="Urgent only"
              />
            </div>
          </div>
        )}
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeChips.map((c, i) => (
            <Badge
              key={i}
              variant="outline"
              className="gap-1 border-border bg-card pr-1 text-xs font-normal"
            >
              {c.label}
              <button
                onClick={c.clear}
                className="ml-0.5 rounded-full p-0.5 hover:bg-background/60"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <Switch checked={checked} onCheckedChange={onChange} />
      <span className="text-foreground">{label}</span>
    </label>
  );
}
