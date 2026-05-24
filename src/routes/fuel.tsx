import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Fuel, MapPin, Clock, Plus, RefreshCw, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import {
  getLatestByStation,
  saveFuelReport,
  seedFuelIfEmpty,
  STATIONS,
  FUEL_STATUS_META,
  type FuelReport,
  type FuelStatus,
  type FuelType,
} from "@/lib/fuel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/fuel")({
  head: () => ({
    meta: [
      { title: "Fuel Availability — ZimFreight" },
      {
        name: "description",
        content:
          "Live community-sourced fuel availability across Zimbabwe. Find stations with diesel before you drive there.",
      },
    ],
  }),
  component: FuelPage,
});

function FuelPage() {
  const [reports, setReports] = useState<Map<string, FuelReport>>(new Map());
  const [filter, setFilter] = useState<"all" | "available" | "queue" | "dry">("all");
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    seedFuelIfEmpty();
    const refresh = () => setReports(getLatestByStation());
    refresh();
    window.addEventListener("zf:fuel-changed", refresh);
    return () => window.removeEventListener("zf:fuel-changed", refresh);
  }, []);

  const grouped = useMemo(() => {
    const byCity = new Map<string, { station: (typeof STATIONS)[number]; report?: FuelReport }[]>();
    for (const station of STATIONS) {
      const arr = byCity.get(station.city) ?? [];
      arr.push({ station, report: reports.get(`${station.name}|${station.city}`) });
      byCity.set(station.city, arr);
    }
    return Array.from(byCity.entries())
      .map(([city, items]) => {
        const filtered =
          filter === "all"
            ? items
            : items.filter(({ report }) => {
                if (!report) return false;
                if (filter === "available") return report.status === "available";
                if (filter === "queue")
                  return report.status === "queue_short" || report.status === "queue_long";
                if (filter === "dry") return report.status === "dry";
                return true;
              });
        return { city, items: filtered };
      })
      .filter((g) => g.items.length > 0);
  }, [reports, filter]);

  const stats = useMemo(() => {
    const all = Array.from(reports.values());
    return {
      available: all.filter((r) => r.status === "available").length,
      queueing: all.filter((r) => r.status === "queue_short" || r.status === "queue_long").length,
      dry: all.filter((r) => r.status === "dry").length,
      total: all.length,
    };
  }, [reports]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="section-kicker">
            <Fuel className="h-3 w-3" /> Fuel
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.04em] md:text-5xl">
            Where&rsquo;s the <span className="text-secondary">diesel</span> today?
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Community-reported fuel availability at major stations. Reports stay live for 6 hours,
            so what you see is current.
          </p>
        </div>
        <Button
          onClick={() => setReportOpen(true)}
          className="bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/90"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Report fuel
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <StatTile color="success" label="Available" count={stats.available} />
        <StatTile color="warning" label="Queueing" count={stats.queueing} />
        <StatTile color="danger" label="Dry" count={stats.dry} />
        <StatTile color="muted" label="Total reports" count={stats.total} />
      </div>

      {/* Filter row */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Filter:
        </span>
        {(["all", "available", "queue", "dry"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition-all",
              filter === f
                ? "border-secondary/50 bg-secondary/[0.06] text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-foreground/15 hover:text-foreground",
            )}
          >
            {f === "queue" ? "Queueing" : f}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          <span className="dot-live" /> Live · 6h decay
        </span>
      </div>

      {/* Cities */}
      <div className="mt-6 space-y-6">
        {grouped.map(({ city, items }) => (
          <section key={city}>
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-secondary" />
              <h2 className="font-display text-xl font-bold tracking-[-0.025em]">{city}</h2>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {items.filter((i) => i.report).length} of {items.length} reported
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {items.map(({ station, report }) => (
                <FuelStationCard
                  key={`${station.name}|${station.city}`}
                  station={station}
                  report={report}
                  onReport={() => setReportOpen(true)}
                />
              ))}
            </div>
          </section>
        ))}
        {grouped.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
            <AlertTriangle className="mx-auto h-5 w-5 text-muted-foreground/60" />
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              No reports match
            </p>
            <p className="mt-1 text-sm text-foreground/70">
              Try a different filter or be the first to report.
            </p>
          </div>
        )}
      </div>

      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} />
    </div>
  );
}

function StatTile({
  color,
  label,
  count,
}: {
  color: "success" | "warning" | "danger" | "muted";
  label: string;
  count: number;
}) {
  const cls =
    color === "success"
      ? "bg-[color-mix(in_oklab,var(--success)_15%,transparent)] text-[color:var(--success)] border-[color:var(--success)]/30"
      : color === "warning"
        ? "bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] text-[color-mix(in_oklab,var(--warning)_70%,var(--foreground))] border-[color:var(--warning)]/30"
        : color === "danger"
          ? "bg-destructive/12 text-destructive border-destructive/25"
          : "bg-card text-foreground border-border/70";
  return (
    <div className={cn("rounded-lg border p-4", cls)}>
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
        {label}
      </div>
      <div className="mt-1 font-display text-3xl font-bold leading-none tracking-[-0.035em] tabular-nums">
        {count}
      </div>
    </div>
  );
}

function FuelStationCard({
  station,
  report,
  onReport,
}: {
  station: (typeof STATIONS)[number];
  report?: FuelReport;
  onReport: () => void;
}) {
  if (!report) {
    return (
      <button
        onClick={onReport}
        className=" group flex flex-col items-start rounded-lg border border-dashed border-border bg-card/40 p-4 text-left transition-colors hover:border-secondary/40 hover:bg-card"
      >
        <div className="font-display text-sm font-bold tracking-tight text-foreground">
          {station.name}
        </div>
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {station.city}
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground group-hover:text-secondary">
          <Plus className="h-3 w-3" /> Be first to report
        </div>
      </button>
    );
  }

  const meta = FUEL_STATUS_META[report.status];
  const ageMin = Math.floor((Date.now() - new Date(report.reported_at).getTime()) / 60000);
  const age = ageMin < 60 ? `${ageMin}m ago` : `${Math.floor(ageMin / 60)}h ago`;

  return (
    <div className=" relative overflow-hidden rounded-lg border border-border/70 bg-card p-4 pt-[15px]">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: meta.color }}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display text-sm font-bold tracking-tight text-foreground">
            {station.name}
          </div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {station.city}
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ background: meta.tint, color: meta.color }}
        >
          {meta.label}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-3">
        {report.price_usd && (
          <div>
            <span className="font-display text-xl font-bold tracking-[-0.025em] tabular-nums text-foreground">
              ${report.price_usd.toFixed(2)}
            </span>
            <span className="ml-0.5 font-mono text-[10px] font-medium text-muted-foreground">
              /L
            </span>
          </div>
        )}
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {report.fuel_type === "both" ? "Diesel + petrol" : report.fuel_type}
        </span>
        {report.wait_minutes !== undefined && report.wait_minutes > 0 && (
          <span
            className="ml-auto inline-flex items-center gap-1 font-mono text-[11px] font-bold tabular-nums"
            style={{ color: meta.color }}
          >
            <Clock className="h-3 w-3" /> {report.wait_minutes}m
          </span>
        )}
      </div>

      {report.notes && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{report.notes}</p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>By {report.reporter_name ?? "anon"}</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {age}
        </span>
      </div>
    </div>
  );
}

function ReportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
}) {
  const { user, profile } = useAuth();
  const [station, setStation] = useState(STATIONS[0]);
  const [status, setStatus] = useState<FuelStatus>("available");
  const [fuelType, setFuelType] = useState<FuelType>("diesel");
  const [price, setPrice] = useState("");
  const [waitMin, setWaitMin] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = () => {
    setSubmitting(true);
    try {
      saveFuelReport({
        station_name: station.name,
        city: station.city,
        status,
        fuel_type: fuelType,
        price_usd: price ? Number(price) : undefined,
        wait_minutes: waitMin ? Number(waitMin) : undefined,
        reporter_id: user?.id ?? "anon",
        reporter_name: profile?.full_name ?? "Anon",
        notes: notes || undefined,
      });
      toast.success("Thanks — report posted live");
      onOpenChange(false);
      setNotes("");
      setPrice("");
      setWaitMin("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to post report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-border/70 bg-card p-0 sm:max-w-md">
        <span
          aria-hidden
          className="hidden"
        />
        <div className="p-6">
          <DialogHeader>
            <span className="section-kicker">Report</span>
            <DialogTitle className="mt-2 font-display text-2xl font-bold tracking-[-0.035em]">
              Tell drivers what you see
            </DialogTitle>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            <div>
              <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Station
              </Label>
              <Select
                value={`${station.name}|${station.city}`}
                onValueChange={(v) => {
                  const [name, city] = v.split("|");
                  const found = STATIONS.find((s) => s.name === name && s.city === city);
                  if (found) setStation(found);
                }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATIONS.map((s) => (
                    <SelectItem key={`${s.name}|${s.city}`} value={`${s.name}|${s.city}`}>
                      {s.name} — {s.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Status
              </Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(Object.keys(FUEL_STATUS_META) as FuelStatus[]).map((s) => {
                  const meta = FUEL_STATUS_META[s];
                  const active = status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={cn(
                        "rounded-xl border-2 px-3 py-2.5 text-left transition-all",
                        active
                          ? "border-current shadow-[0_0_0_1px_currentColor] "
                          : "border-border hover:border-foreground/20",
                      )}
                      style={active ? { color: meta.color, background: meta.tint } : {}}
                    >
                      <div className="font-display text-sm font-bold tracking-tight">
                        {meta.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Fuel
                </Label>
                <Select value={fuelType} onValueChange={(v) => setFuelType(v as FuelType)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Price/L (USD)
                </Label>
                <Input
                  type="number"
                  step={0.01}
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1.62"
                  className="mt-1.5"
                />
              </div>
            </div>

            {(status === "queue_short" || status === "queue_long") && (
              <div>
                <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Wait (minutes)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={waitMin}
                  onChange={(e) => setWaitMin(e.target.value)}
                  placeholder="30"
                  className="mt-1.5"
                />
              </div>
            )}

            <div>
              <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Notes (optional)
              </Label>
              <Textarea
                rows={2}
                maxLength={120}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="USD only · No coupons · etc."
                className="mt-1.5"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={submit}
                disabled={submitting}
                className="flex-1 bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/90"
              >
                {submitting && <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Post report <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
