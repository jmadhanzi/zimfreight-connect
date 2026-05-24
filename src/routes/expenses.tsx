import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Receipt, Calendar, Trash2, Download, MapPin } from "lucide-react";
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
  getExpenses,
  saveExpense,
  deleteExpense,
  seedExpensesIfEmpty,
  expensesByCategory,
  expensesByMonth,
  EXPENSE_META,
  type Expense,
  type ExpenseCategory,
} from "@/lib/expenses";
import { formatUSD } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/expenses")({
  head: () => ({
    meta: [
      { title: "Expense log — ZimFreight" },
      {
        name: "description",
        content:
          "Log fuel, tolls, repairs, food, and trip expenses. Export monthly summaries for accounting.",
      },
    ],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | ExpenseCategory>("all");

  useEffect(() => {
    if (user?.id) seedExpensesIfEmpty(user.id);
    const refresh = () => setExpenses(getExpenses());
    refresh();
    window.addEventListener("zf:expenses-changed", refresh);
    return () => window.removeEventListener("zf:expenses-changed", refresh);
  }, [user?.id]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => filter === "all" || e.category === filter);
  }, [expenses, filter]);

  const total = useMemo(() => filtered.reduce((s, e) => s + e.amount_usd, 0), [filtered]);
  const byCat = useMemo(() => expensesByCategory(expenses), [expenses]);
  const byMonth = useMemo(() => expensesByMonth(expenses), [expenses]);
  const thisMonthKey = new Date().toISOString().slice(0, 7);
  const thisMonth = byMonth.get(thisMonthKey) ?? 0;
  const lastMonthKey = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 7);
  const lastMonth = byMonth.get(lastMonthKey) ?? 0;

  const exportCsv = () => {
    const lines = [
      ["Date", "Category", "Amount USD", "Location", "Notes"].join(","),
      ...expenses.map((e) =>
        [
          e.date,
          e.category,
          e.amount_usd.toFixed(2),
          `"${(e.location ?? "").replace(/"/g, '""')}"`,
          `"${(e.notes ?? "").replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zimfreight-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="section-kicker">
            <Receipt className="h-3 w-3" /> Expenses
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.04em] md:text-5xl">
            Trip <span className="text-secondary">expenses</span>
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Log fuel, tolls, repairs, and other trip costs. Export a monthly CSV at the end of the
            month for your accountant.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={exportCsv}
            disabled={expenses.length === 0}
          >
            <Download className="mr-1.5 h-4 w-4" /> Export CSV
          </Button>
          <Button
            onClick={() => setOpen(true)}
            className="bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/90"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add expense
          </Button>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryTile
          label="This month"
          value={formatUSD(thisMonth)}
          sub={`vs last ${formatUSD(lastMonth)}`}
          accent
        />
        <SummaryTile
          label="All time"
          value={formatUSD(expenses.reduce((s, e) => s + e.amount_usd, 0))}
          sub={`${expenses.length} entries`}
        />
        <SummaryTile
          label="Top category"
          value={topCategoryLabel(byCat)}
          sub={topCategoryAmount(byCat)}
        />
      </div>

      {/* Category breakdown */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4 md:grid-cols-8">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-xl border bg-card p-3 text-left transition-all",
            filter === "all"
              ? "border-secondary/50 shadow-[0_0_0_1px_color-mix(in_oklab,var(--secondary)_30%,transparent)]"
              : "border-border/70 hover:border-foreground/15",
          )}
        >
          <div className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            All
          </div>
          <div className="mt-1 font-display text-base font-bold tabular-nums">
            {formatUSD(expenses.reduce((s, e) => s + e.amount_usd, 0))}
          </div>
        </button>
        {(Object.keys(EXPENSE_META) as ExpenseCategory[]).map((cat) => {
          const meta = EXPENSE_META[cat];
          const amt = byCat[cat];
          if (amt === 0) return null;
          const active = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "rounded-xl border bg-card p-3 text-left transition-all",
                active
                  ? "border-current shadow-[0_0_0_1px_currentColor]"
                  : "border-border/70 hover:border-foreground/15",
              )}
              style={active ? { color: meta.color } : {}}
            >
              <div className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {meta.emoji} {meta.label}
              </div>
              <div className="mt-1 font-display text-base font-bold tabular-nums text-foreground">
                {formatUSD(amt)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Expense list */}
      <div className="mt-6 overflow-hidden rounded-lg border border-border/70 bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <span className="text-foreground">{filtered.length}</span>{" "}
            {filter === "all" ? "entries" : EXPENSE_META[filter].label.toLowerCase() + " entries"}
          </span>
          <span className="font-display text-sm font-bold tabular-nums text-foreground">
            Total {formatUSD(total)}
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Receipt className="mx-auto h-5 w-5 text-muted-foreground/60" />
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              No entries yet
            </p>
            <p className="mt-1 text-sm text-foreground/70">
              Tap "Add expense" to log your first trip cost.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((e) => {
              const meta = EXPENSE_META[e.category];
              return (
                <li
                  key={e.id}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/30"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
                    style={{
                      background: `color-mix(in oklab, ${meta.color} 12%, transparent)`,
                      color: meta.color,
                    }}
                  >
                    {meta.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold tracking-tight text-foreground">
                        {meta.label}
                      </span>
                      {e.location && (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {e.location}
                        </span>
                      )}
                    </div>
                    {e.notes && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{e.notes}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-display text-base font-bold tabular-nums text-foreground">
                      {formatUSD(e.amount_usd)}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      <Calendar className="mr-0.5 inline h-2.5 w-2.5" />
                      {new Date(e.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      deleteExpense(e.id);
                      toast.success("Deleted");
                    }}
                    className="ml-2 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete entry"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ExpenseDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function SummaryTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-card p-5 pt-[18px]",
        accent ? "border-secondary/30" : "border-border/70",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-[3px]",
          accent
            ? "bg-foreground"
            : "bg-border",
        )}
      />
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-2 font-display text-3xl font-bold leading-none tracking-[-0.035em] tabular-nums",
          accent && "text-secondary",
        )}
      >
        {value}
      </div>
      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {sub}
      </div>
    </div>
  );
}

function topCategoryLabel(byCat: Record<ExpenseCategory, number>): string {
  let max = 0;
  let top: ExpenseCategory = "fuel";
  for (const [cat, amt] of Object.entries(byCat) as [ExpenseCategory, number][]) {
    if (amt > max) {
      max = amt;
      top = cat;
    }
  }
  return max > 0 ? `${EXPENSE_META[top].emoji} ${EXPENSE_META[top].label}` : "—";
}

function topCategoryAmount(byCat: Record<ExpenseCategory, number>): string {
  let max = 0;
  for (const v of Object.values(byCat)) if (v > max) max = v;
  return max > 0 ? formatUSD(max) : "no entries yet";
}

function ExpenseDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
}) {
  const { user } = useAuth();
  const [category, setCategory] = useState<ExpenseCategory>("fuel");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter an amount");
      return;
    }
    setSubmitting(true);
    try {
      saveExpense({
        ownerId: user?.id ?? "anon",
        category,
        amount_usd: Number(amount),
        date,
        location: location || undefined,
        notes: notes || undefined,
      });
      toast.success("Expense added");
      setAmount("");
      setLocation("");
      setNotes("");
      onOpenChange(false);
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
            <span className="section-kicker">New expense</span>
            <DialogTitle className="mt-2 font-display text-2xl font-bold tracking-[-0.035em]">
              Log a trip cost
            </DialogTitle>
          </DialogHeader>
          <div className="mt-5 space-y-4">
            <div>
              <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Category
              </Label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {(Object.keys(EXPENSE_META) as ExpenseCategory[]).map((c) => {
                  const meta = EXPENSE_META[c];
                  const active = category === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl border p-2.5 transition-all",
                        active
                          ? "border-secondary/50 bg-secondary/[0.06] shadow-[0_0_0_1px_color-mix(in_oklab,var(--secondary)_30%,transparent)]"
                          : "border-border bg-card hover:border-foreground/15",
                      )}
                    >
                      <span className="text-base">{meta.emoji}</span>
                      <span className="font-display text-[10px] font-bold tracking-tight">
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Amount (USD)
                </Label>
                <Input
                  type="number"
                  step={0.5}
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Date
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Location (optional)
              </Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Total Eastlea, Beit toll, etc."
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Notes (optional)
              </Label>
              <Textarea
                rows={2}
                maxLength={150}
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
                disabled={submitting}
                className="flex-1 bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/90"
              >
                Add expense
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
