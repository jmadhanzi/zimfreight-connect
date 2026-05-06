import { useEffect, useMemo, useState } from "react";
import {
  Shield,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  ArrowRight,
  Check,
  Loader2,
  Info,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import {
  createEscrowBooking,
  getEscrowForLoad,
  transitionEscrow,
  calculateFee,
  ESCROW_STATUS_META,
  type EscrowBooking,
  type EscrowStatus,
} from "@/lib/escrow";
import { formatUSD, cn } from "@/lib/utils";
import { formatDual } from "@/lib/fx";
import type { Load } from "@/types";
import { toast } from "sonner";

export function EscrowBookButton({
  load,
  brokerName,
  brokerId,
}: {
  load: Load;
  brokerName: string;
  brokerId: string;
}) {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [escrow, setEscrow] = useState<EscrowBooking | null>(null);

  useEffect(() => {
    const refresh = () => setEscrow(getEscrowForLoad(load.id));
    refresh();
    window.addEventListener("zf:escrow-changed", refresh);
    return () => window.removeEventListener("zf:escrow-changed", refresh);
  }, [load.id]);

  if (escrow) {
    const meta = ESCROW_STATUS_META[escrow.status];
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-all hover:opacity-80"
        style={{ background: meta.tint, borderColor: `${meta.color}33`, color: meta.color }}
      >
        <Shield className="h-3 w-3" strokeWidth={2.4} />
        Escrow · {meta.label}
        <EscrowStatusDialog
          open={open}
          onOpenChange={setOpen}
          escrow={escrow}
          load={load}
          isBroker={user?.id === brokerId}
        />
      </button>
    );
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="rounded-full bg-secondary font-bold text-secondary-foreground btn-amber-glow hover:bg-secondary/90"
      >
        <Shield className="mr-1.5 h-3.5 w-3.5" />
        Book through ZimFreight
      </Button>
      <CreateEscrowDialog
        open={open}
        onOpenChange={setOpen}
        load={load}
        brokerName={brokerName}
        brokerId={brokerId}
        carrierId={user?.id ?? "anon"}
        carrierName={profile?.full_name ?? "Driver"}
      />
    </>
  );
}

// ─── Create dialog ──────────────────────────────────────────────────────

function CreateEscrowDialog({
  open,
  onOpenChange,
  load,
  brokerName,
  brokerId,
  carrierId,
  carrierName,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  load: Load;
  brokerName: string;
  brokerId: string;
  carrierId: string;
  carrierName: string;
}) {
  const amount = Number(load.rate_usd);
  const { fee, payout } = useMemo(() => calculateFee(amount), [amount]);
  const dual = formatDual(amount);
  const [step, setStep] = useState<"review" | "fund">("review");
  const [method, setMethod] = useState<"ecocash" | "card" | "bank_transfer">("ecocash");
  const [ref, setRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setStep("review");
      setRef("");
    }
  }, [open]);

  const submit = () => {
    if (!ref.trim()) {
      toast.error("Enter your payment reference");
      return;
    }
    setSubmitting(true);
    try {
      const booking = createEscrowBooking({
        loadId: load.id,
        brokerId,
        brokerName,
        carrierId,
        carrierName,
        amount_usd: amount,
        funding_method: method,
        funding_ref: ref.trim(),
      });
      // Auto-transition to funded for demo (in prod, webhook does this)
      transitionEscrow(booking.id, "funded");
      toast.success("Funds held in escrow — carrier can now pick up");
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
          className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-secondary via-primary to-secondary"
        />
        <div className="p-6">
          <DialogHeader>
            <span className="section-kicker">
              <ShieldCheck className="h-3 w-3" /> Escrow
            </span>
            <DialogTitle className="mt-2 font-display text-2xl font-black tracking-[-0.035em]">
              {step === "review" ? "Review booking" : "Fund the booking"}
            </DialogTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {step === "review"
                ? "ZimFreight holds funds until delivery is confirmed. Both sides protected."
                : "Pay into the ZimFreight holding account. We hold it until POD is signed off."}
            </p>
          </DialogHeader>

          {step === "review" ? (
            <div className="mt-5 space-y-4">
              {/* Route summary */}
              <div className="rounded-xl border border-border bg-[var(--bg-secondary)] p-4">
                <div className="font-display text-base font-extrabold tracking-[-0.02em]">
                  {load.origin} → {load.destination}
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {load.load_type ?? "General"} · {load.weight_tonnes ?? "—"}t
                </div>
              </div>

              {/* Money breakdown */}
              <div className="rounded-2xl border border-border/70 bg-card p-4">
                <BreakdownRow label="Load rate" value={formatUSD(amount)} />
                <BreakdownRow label="Platform fee (2.5%)" value={`-${formatUSD(fee)}`} muted />
                <div className="my-2 border-t border-border" />
                <BreakdownRow
                  label="Carrier payout"
                  value={formatUSD(payout)}
                  accent="success"
                  bold
                />
                <div className="mt-3 rounded-lg bg-secondary/[0.08] p-2.5">
                  <div className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-secondary">
                    In ZWL
                  </div>
                  <div className="mt-0.5 font-mono-num text-sm font-bold tabular-nums text-foreground">
                    {dual.zwl}
                  </div>
                </div>
              </div>

              {/* What's covered */}
              <div className="rounded-xl border border-border/70 bg-card p-4">
                <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  How escrow works
                </h4>
                <ul className="mt-2.5 space-y-2 text-xs text-foreground/85">
                  <Step n={1}>You fund the booking via EcoCash, card, or bank transfer.</Step>
                  <Step n={2}>ZimFreight holds the funds. Carrier picks up the load.</Step>
                  <Step n={3}>Driver uploads POD on delivery. You confirm or dispute.</Step>
                  <Step n={4}>Funds release to carrier (minus 2.5% platform fee).</Step>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep("fund")}
                  className="flex-1 rounded-full bg-secondary font-bold text-secondary-foreground btn-amber-glow hover:bg-secondary/90"
                >
                  Continue <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {/* Payment method */}
              <div>
                <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Payment method
                </Label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <MethodTile
                    icon={<Smartphone className="h-4 w-4" />}
                    label="EcoCash"
                    active={method === "ecocash"}
                    onClick={() => setMethod("ecocash")}
                  />
                  <MethodTile
                    icon={<CreditCard className="h-4 w-4" />}
                    label="Card"
                    active={method === "card"}
                    onClick={() => setMethod("card")}
                  />
                  <MethodTile
                    icon={<Building2 className="h-4 w-4" />}
                    label="Bank"
                    active={method === "bank_transfer"}
                    onClick={() => setMethod("bank_transfer")}
                  />
                </div>
              </div>

              {/* Method-specific instructions */}
              {method === "ecocash" && (
                <div className="rounded-xl border border-secondary/30 bg-secondary/[0.06] p-4">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    EcoCash USSD
                  </div>
                  <div className="mt-1 font-mono text-base font-bold text-foreground">
                    *151*4*ZimFreight*ESC{load.id.slice(-4).toUpperCase()}#
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Send <span className="font-bold text-foreground">{formatUSD(amount)}</span> (
                    {dual.zwl}) to ZimFreight, then enter the reference below.
                  </p>
                </div>
              )}
              {method === "card" && (
                <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground">
                    <Lock className="h-3.5 w-3.5" />
                    <span className="font-display font-bold tracking-tight">Card payment</span>
                  </div>
                  <p className="mt-2">
                    Card processing via Stripe. Charge of{" "}
                    <span className="font-bold text-foreground">{formatUSD(amount)}</span>; funds
                    held by Stripe until release.
                  </p>
                </div>
              )}
              {method === "bank_transfer" && (
                <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="font-display font-bold tracking-tight">Bank transfer</span>
                  </div>
                  <p className="mt-2">
                    FCB Bank · ZimFreight Holdings · Acc{" "}
                    <span className="font-mono font-bold text-foreground">001 234 567 8901</span>
                  </p>
                  <p className="mt-1">
                    Reference:{" "}
                    <span className="font-mono font-bold text-foreground">
                      ESC{load.id.slice(-4).toUpperCase()}
                    </span>
                  </p>
                </div>
              )}

              {/* Reference input */}
              <div>
                <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {method === "ecocash"
                    ? "EcoCash reference"
                    : method === "card"
                      ? "Card last 4"
                      : "Transfer reference"}
                </Label>
                <Input
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  placeholder={
                    method === "ecocash" ? "EC-12345678" : method === "card" ? "1234" : "FNB-456789"
                  }
                  className="mt-1.5"
                />
              </div>

              {/* Final summary */}
              <div className="rounded-xl bg-[var(--bg-secondary)] p-3">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Total
                  </span>
                  <span className="font-display text-2xl font-black tracking-[-0.03em] tabular-nums text-foreground">
                    {formatUSD(amount)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => setStep("review")}
                >
                  Back
                </Button>
                <Button
                  onClick={submit}
                  disabled={submitting}
                  className="flex-1 rounded-full bg-secondary font-bold text-secondary-foreground btn-amber-glow hover:bg-secondary/90"
                >
                  {submitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                  Lock funds
                </Button>
              </div>
              <p className="flex items-center justify-center gap-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                <Lock className="h-2.5 w-2.5" /> Held by ZimFreight · 14-day dispute window ·
                ZWL/USD locked at booking
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Status dialog (existing escrow) ────────────────────────────────────

function EscrowStatusDialog({
  open,
  onOpenChange,
  escrow,
  load,
  isBroker,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  escrow: EscrowBooking;
  load: Load;
  isBroker: boolean;
}) {
  const meta = ESCROW_STATUS_META[escrow.status];
  const [busy, setBusy] = useState(false);

  const release = () => {
    setBusy(true);
    transitionEscrow(escrow.id, "released");
    toast.success(`${formatUSD(escrow.carrier_payout_usd)} released to carrier`);
    setBusy(false);
    onOpenChange(false);
  };

  const dispute = () => {
    setBusy(true);
    transitionEscrow(escrow.id, "disputed", { dispute_reason: "Broker filed dispute on POD" });
    toast.success("Dispute filed — ZimFreight team will review within 24h");
    setBusy(false);
    onOpenChange(false);
  };

  const stages: { id: EscrowStatus; label: string }[] = [
    { id: "funded", label: "Funded" },
    { id: "in_transit", label: "In transit" },
    { id: "delivered", label: "Delivered" },
    { id: "released", label: "Released" },
  ];
  const currentIdx = stages.findIndex((s) => s.id === escrow.status);
  const dual = formatDual(escrow.amount_usd);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-border/70 bg-card p-0 sm:max-w-md">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 z-10 h-[3px]"
          style={{ background: meta.color }}
        />
        <div className="p-6">
          <DialogHeader>
            <span className="section-kicker">
              <Shield className="h-3 w-3" /> Escrow
            </span>
            <DialogTitle className="mt-2 font-display text-2xl font-black tracking-[-0.035em]">
              {load.origin} → {load.destination}
            </DialogTitle>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Booking #{escrow.id.slice(-6)} · {dual.usd} · {dual.zwl}
            </p>
          </DialogHeader>

          {/* Status pill */}
          <div
            className="mt-5 flex items-center gap-2 rounded-xl px-3.5 py-2.5"
            style={{ background: meta.tint, border: `1px solid ${meta.color}33` }}
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-md"
              style={{ background: meta.color, color: "#fff" }}
            >
              {escrow.status === "released" || escrow.status === "delivered" ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              ) : escrow.status === "disputed" ? (
                <AlertCircle className="h-3.5 w-3.5" />
              ) : (
                <Shield className="h-3.5 w-3.5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div
                className="font-display text-sm font-extrabold tracking-tight"
                style={{ color: meta.color }}
              >
                {meta.label}
              </div>
              <div className="text-[11px] text-foreground/75">{meta.description}</div>
            </div>
          </div>

          {/* Pipeline */}
          {escrow.status !== "disputed" &&
            escrow.status !== "refunded" &&
            escrow.status !== "cancelled" && (
              <div className="mt-5 rounded-xl border border-border bg-[var(--bg-secondary)] p-4">
                <div className="flex items-center justify-between">
                  {stages.map((s, i) => (
                    <div key={s.id} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-bold transition-all",
                            i <= currentIdx
                              ? "bg-[color:var(--success)] text-white"
                              : "border border-border bg-card text-muted-foreground",
                          )}
                        >
                          {i < currentIdx ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                        </span>
                        <span
                          className={cn(
                            "mt-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.14em]",
                            i <= currentIdx ? "text-foreground" : "text-muted-foreground/70",
                          )}
                        >
                          {s.label}
                        </span>
                      </div>
                      {i < stages.length - 1 && (
                        <div
                          className="mx-2 h-0.5 flex-1"
                          style={{
                            background: i < currentIdx ? "var(--success)" : "var(--border)",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Money */}
          <div className="mt-4 rounded-xl border border-border/70 bg-card p-4">
            <BreakdownRow label="Booking total" value={formatUSD(escrow.amount_usd)} />
            <BreakdownRow
              label="Platform fee"
              value={`-${formatUSD(escrow.platform_fee_usd)}`}
              muted
            />
            <div className="my-2 border-t border-border" />
            <BreakdownRow
              label="Carrier payout"
              value={formatUSD(escrow.carrier_payout_usd)}
              bold
              accent="success"
            />
          </div>

          {/* Actions for broker on delivered */}
          {isBroker && escrow.status === "delivered" && (
            <div className="mt-5 space-y-2 rounded-xl border border-secondary/30 bg-secondary/[0.06] p-4">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <p className="text-xs text-foreground/85">
                  Driver uploaded a POD. Review and release funds, or dispute if there's an issue.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={dispute}
                  className="flex-1 rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
                >
                  Dispute
                </Button>
                <Button
                  onClick={release}
                  disabled={busy}
                  className="flex-1 rounded-full bg-[color:var(--success)] font-bold text-white hover:bg-[color-mix(in_oklab,var(--success)_85%,black)]"
                >
                  {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Release {formatUSD(escrow.carrier_payout_usd)}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-5">
            <Button
              variant="outline"
              className="w-full rounded-full"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
          <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            <Lock className="mr-0.5 inline h-2 w-2" /> 14-day dispute window after delivery
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────

function BreakdownRow({
  label,
  value,
  muted,
  accent,
  bold,
}: {
  label: string;
  value: string;
  muted?: boolean;
  accent?: "success";
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span
        className={cn(
          "text-muted-foreground",
          bold && "font-display font-bold tracking-tight text-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-mono-num tabular-nums",
          muted && "text-muted-foreground",
          bold && "font-display text-base font-extrabold",
          accent === "success" && "text-[color:var(--success)]",
          !accent && !muted && !bold && "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/15 font-mono text-[10px] font-bold text-secondary">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}

function MethodTile({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 transition-all",
        active
          ? "border-secondary bg-secondary/[0.08] text-secondary"
          : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground",
      )}
    >
      {icon}
      <span className="font-display text-xs font-extrabold tracking-tight">{label}</span>
    </button>
  );
}
