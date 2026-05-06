import { useEffect, useState } from "react";
import { Repeat, Plus, Pause, Play, Trash2, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ZIM_CITIES, ALL_DEST_CITIES } from "@/types";
import {
  getRecurring,
  saveRecurring,
  togglePause,
  deleteRecurring,
  nextOccurrence,
  WEEKDAYS,
  type RecurringLoad,
  type Weekday,
} from "@/lib/recurringLoads";
import { formatUSD, cn } from "@/lib/utils";
import { toast } from "sonner";

export function RecurringLoadsWidget() {
  const [items, setItems] = useState<RecurringLoad[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setItems(getRecurring());
    refresh();
    window.addEventListener("zf:recurring-changed", refresh);
    return () => window.removeEventListener("zf:recurring-changed", refresh);
  }, []);

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="section-kicker">
            <Repeat className="h-3 w-3" /> Recurring
          </span>
          <h2 className="mt-2 font-display text-lg font-extrabold tracking-[-0.025em]">
            Standing routes
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Auto-post the same load every week on the same day.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setOpen(true)}
          className="rounded-full bg-secondary text-xs font-bold text-secondary-foreground hover:bg-secondary/90"
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
          <Repeat className="mx-auto h-5 w-5 text-muted-foreground/60" />
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            No standing routes yet
          </p>
          <p className="mt-1 text-xs text-foreground/70">
            Set one up if you ship the same lane every week.
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {items.slice(0, 5).map((r) => {
            const next = nextOccurrence(r.weekday);
            return (
              <li
                key={r.id}
                className={cn("flex items-center gap-3 py-3", r.paused && "opacity-50")}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-display text-sm font-bold tracking-tight">
                    <span>{r.origin}</span>
                    <ArrowRight className="h-3 w-3 text-secondary" />
                    <span>{r.destination}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" /> Every{" "}
                      {WEEKDAYS.find((w) => w.id === r.weekday)?.label}
                    </span>
                    <span className="text-border">·</span>
                    <span className="font-bold tabular-nums text-foreground">
                      {formatUSD(r.rate_usd)}
                    </span>
                    <span className="text-border">·</span>
                    <span>
                      Next: {next.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    togglePause(r.id);
                    toast.success(r.paused ? "Resumed" : "Paused");
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={r.paused ? "Resume" : "Pause"}
                >
                  {r.paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                </button>
                <button
                  onClick={() => {
                    deleteRecurring(r.id);
                    toast.success("Deleted");
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <RecurringDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function RecurringDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
}) {
  const { user } = useAuth();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [loadType, setLoadType] = useState("General");
  const [weight, setWeight] = useState("30");
  const [rate, setRate] = useState("");
  const [terms, setTerms] = useState("Net 7");
  const [weekday, setWeekday] = useState<Weekday>("mon");

  const submit = () => {
    if (!origin || !destination || !rate) {
      toast.error("Fill in route and rate");
      return;
    }
    saveRecurring({
      ownerId: user?.id ?? "anon",
      origin,
      destination,
      load_type: loadType,
      weight_tonnes: Number(weight),
      rate_usd: Number(rate),
      payment_terms: terms,
      weekday,
      active_from: new Date().toISOString().slice(0, 10),
    });
    toast.success("Standing route saved");
    setOrigin("");
    setDestination("");
    setRate("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-border/70 bg-card p-0 sm:max-w-md">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-secondary via-primary to-secondary"
        />
        <div className="p-6">
          <DialogHeader>
            <span className="section-kicker">Standing route</span>
            <DialogTitle className="mt-2 font-display text-2xl font-black tracking-[-0.035em]">
              Set up a recurring load
            </DialogTitle>
          </DialogHeader>
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Origin
                </Label>
                <Select value={origin} onValueChange={setOrigin}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Pick" />
                  </SelectTrigger>
                  <SelectContent>
                    {ZIM_CITIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Destination
                </Label>
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Pick" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_DEST_CITIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Day of week
              </Label>
              <Select value={weekday} onValueChange={(v) => setWeekday(v as Weekday)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      Every {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Type
                </Label>
                <Input
                  value={loadType}
                  onChange={(e) => setLoadType(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Weight (t)
                </Label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Rate (USD)
                </Label>
                <Input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="1200"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Terms
                </Label>
                <Select value={terms} onValueChange={setTerms}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash on delivery">Cash on delivery</SelectItem>
                    <SelectItem value="Net 7">Net 7</SelectItem>
                    <SelectItem value="Net 14">Net 14</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                className="flex-1 rounded-full bg-secondary font-bold text-secondary-foreground btn-amber-glow hover:bg-secondary/90"
              >
                Save standing route
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
