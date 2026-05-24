import { useEffect, useState } from "react";
import { AlertTriangle, Plus, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import {
  getRoadHazards,
  saveHazard,
  seedHazardsIfEmpty,
  HAZARD_META,
  type RoadHazard,
  type HazardKind,
} from "@/lib/operational";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function HazardOverlay() {
  const [hazards, setHazards] = useState<RoadHazard[]>([]);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    seedHazardsIfEmpty();
    const refresh = () => setHazards(getRoadHazards());
    refresh();
    window.addEventListener("zf:hazards-changed", refresh);
    const interval = setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener("zf:hazards-changed", refresh);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div className="pointer-events-auto absolute bottom-6 right-3 z-[1000] flex flex-col items-end gap-2">
        {!collapsed && hazards.length > 0 && (
          <div className="max-h-[40vh] w-72 overflow-hidden rounded-lg border border-border/70 bg-card/95 shadow-[0_20px_50px_-15px_color-mix(in_oklab,var(--foreground)_25%,transparent)] backdrop-blur-xl">
            <span
              aria-hidden
              className="block h-1 w-full bg-gradient-to-r from-destructive via-secondary to-destructive"
            />
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-destructive/15 text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.4} />
                </span>
                <span className="font-display text-sm font-bold tracking-tight">
                  Road alerts
                </span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {hazards.length} active
                </span>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Collapse"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="max-h-[30vh] divide-y divide-border overflow-auto">
              {hazards.slice(0, 10).map((h) => {
                const meta = HAZARD_META[h.kind];
                const ageMin = Math.floor((Date.now() - new Date(h.reported_at).getTime()) / 60000);
                const age = ageMin < 60 ? `${ageMin}m` : `${Math.floor(ageMin / 60)}h`;
                return (
                  <li key={h.id} className="px-4 py-3 transition-colors hover:bg-muted/30">
                    <div className="flex items-start gap-2.5">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm"
                        style={{ background: `${meta.color}22`, color: meta.color }}
                      >
                        {meta.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em]"
                            style={{ background: `${meta.color}18`, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            <Clock className="mr-0.5 inline h-2.5 w-2.5" /> {age} ago
                          </span>
                        </div>
                        <div className="mt-1 font-display text-xs font-bold tracking-tight text-foreground">
                          {h.label}
                        </div>
                        {h.notes && (
                          <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                            {h.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {collapsed && hazards.length > 0 && (
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card/95 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-foreground shadow-md backdrop-blur-xl hover:border-foreground/15"
          >
            <AlertTriangle className="h-3 w-3 text-destructive" />
            {hazards.length} alerts
          </button>
        )}

        <Button
          onClick={() => setOpen(true)}
          className="rounded-full bg-destructive font-bold text-destructive-foreground shadow-lg hover:bg-destructive/90"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Report hazard
        </Button>
      </div>

      <ReportHazardDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function ReportHazardDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
}) {
  const { user, profile } = useAuth();
  const [kind, setKind] = useState<HazardKind>("checkpoint");
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const useMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success("Location captured");
        setBusy(false);
      },
      (err) => {
        toast.error(err.message);
        setBusy(false);
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const submit = () => {
    if (!label) {
      toast.error("Describe what you see");
      return;
    }
    if (!coords) {
      toast.error("Capture your location first");
      return;
    }
    saveHazard({
      reporterId: user?.id ?? "anon",
      reporterName: profile?.full_name ?? "Anon",
      kind,
      lat: coords.lat,
      lng: coords.lng,
      label,
      notes: notes || undefined,
    });
    toast.success("Alert posted to drivers nearby");
    setLabel("");
    setNotes("");
    setCoords(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-border/70 bg-card p-0 sm:max-w-md">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-destructive via-secondary to-destructive"
        />
        <div className="p-6">
          <DialogHeader>
            <span className="section-kicker">
              <AlertTriangle className="h-3 w-3" /> Hazard
            </span>
            <DialogTitle className="mt-2 font-display text-2xl font-bold tracking-[-0.035em]">
              Report a road alert
            </DialogTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Posts visible to all drivers for the next 6 hours.
            </p>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            <div>
              <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Type
              </Label>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {(Object.keys(HAZARD_META) as HazardKind[]).map((k) => {
                  const meta = HAZARD_META[k];
                  const active = kind === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKind(k)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl border p-2.5 transition-all",
                        active
                          ? "border-current bg-card"
                          : "border-border bg-card/50 hover:border-foreground/15",
                      )}
                      style={active ? { color: meta.color, background: `${meta.color}15` } : {}}
                    >
                      <span className="text-base">{meta.emoji}</span>
                      <span className="font-display text-[9px] font-bold uppercase tracking-[0.1em]">
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Description
              </Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Police checkpoint at Norton turn-off"
                maxLength={80}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Location
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={useMyLocation}
                disabled={busy}
                className="mt-1.5 w-full rounded-lg justify-start"
              >
                {coords ? (
                  <>
                    <span className="text-[color:var(--success)]">●</span>
                    <span className="ml-2 font-mono tabular-nums text-xs">
                      {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
                    </span>
                  </>
                ) : (
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
                    {busy ? "Locating…" : "Use my current location"}
                  </span>
                )}
              </Button>
            </div>

            <div>
              <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Notes (optional)
              </Label>
              <Textarea
                rows={2}
                maxLength={200}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
                className="flex-1 rounded-full bg-destructive font-bold text-destructive-foreground hover:bg-destructive/90"
              >
                Post alert
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
