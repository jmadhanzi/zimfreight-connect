import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/db";
import { toast } from "sonner";
import type { PlanTier } from "@/types";

interface Plan {
  tier: PlanTier;
  name: string;
  monthly: number;
  features: string[];
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    tier: "free",
    name: "Free",
    monthly: 0,
    features: ["5 loads/day", "Browse only", "No broker contacts"],
  },
  {
    tier: "basic",
    name: "Basic",
    monthly: 19,
    highlight: true,
    features: [
      "50 loads/day",
      "All broker contacts",
      "WhatsApp alerts",
      "Rate analytics",
      "Post 10 loads/mo",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    monthly: 49,
    features: [
      "Unlimited loads",
      "WhatsApp AI agent",
      "Priority listing",
      "Rate forecasting",
      "Post 50 loads/mo",
    ],
  },
  {
    tier: "fleet",
    name: "Fleet",
    monthly: 99,
    features: [
      "Everything in Pro",
      "25 driver seats",
      "Bulk posting",
      "API access",
      "Dedicated support",
    ],
  },
];

export function PricingModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
}) {
  const [annual, setAnnual] = useState(false);
  const { user } = useAuth();
  const [ecocashOpen, setEcocashOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PlanTier>("basic");
  const [ref, setRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitEcoCash = async () => {
    if (!user) {
      toast.error("Sign in to record payment");
      return;
    }
    if (!ref.trim()) {
      toast.error("Enter your EcoCash reference");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await db.from("subscriptions").insert({
        user_id: user.id,
        plan: selectedTier,
        status: "pending",
        ecocash_ref: ref.trim(),
      });
      if (error) throw error;
      toast.success("Payment recorded — we'll activate within 1 hour");
      setRef("");
      setEcocashOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden border-border/70 bg-card p-0 sm:max-w-3xl">
        <span
          aria-hidden
          className="sticky top-0 z-10 block h-[3px] w-full"
          style={{ background: "linear-gradient(90deg, var(--primary), var(--secondary), var(--primary))" }}
        />
        <div className="p-6 md:p-8">
          <DialogHeader className="text-center">
            <span className="section-kicker mx-auto justify-center">Pricing</span>
            <DialogTitle className="mt-2 font-display text-3xl font-black tracking-[-0.04em] md:text-4xl">
              Choose your plan
            </DialogTitle>
            <DialogDescription>
              14-day money back. Cancel anytime. Pay with USD card or EcoCash.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 flex items-center justify-center gap-3 text-sm">
            <span
              className={cn(
                "font-semibold transition-colors",
                !annual ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Monthly
            </span>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <span
              className={cn(
                "flex items-center gap-2 font-semibold transition-colors",
                annual ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Annual
              <span className="rounded-full bg-secondary/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-secondary">
                Save 20%
              </span>
            </span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => {
              const price = annual ? Math.round(p.monthly * 12 * 0.8) : p.monthly;
              const suffix = p.monthly === 0 ? "" : annual ? "/yr" : "/mo";
              return (
                <div
                  key={p.tier}
                  className="relative flex flex-col overflow-hidden rounded-2xl p-5 transition-all"
                  style={{
                    background: p.highlight
                      ? "linear-gradient(158deg, oklch(0.28 0.072 42) 0%, oklch(0.22 0.055 38) 100%)"
                      : "var(--color-card)",
                    border: p.highlight
                      ? "1.5px solid color-mix(in oklab, var(--secondary) 38%, transparent)"
                      : "1px solid var(--color-border)",
                    boxShadow: p.highlight
                      ? "0 0 0 1px color-mix(in oklab, var(--secondary) 14%, transparent), 0 8px 28px -8px color-mix(in oklab, var(--primary) 28%, transparent), inset 0 1px 0 oklch(1 0 0 / 0.07)"
                      : "inset 0 1px 0 0 oklch(1 0 0 / 0.55)",
                  }}
                >
                  {p.highlight && (
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-[3px]"
                      style={{ background: "linear-gradient(90deg, var(--primary), var(--secondary), var(--primary))" }}
                    />
                  )}
                  {p.highlight && (
                    <span
                      className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 rounded-full px-3 py-1 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.18em]"
                      style={{
                        background: "linear-gradient(135deg, var(--secondary), color-mix(in oklab, var(--secondary) 78%, var(--primary)))",
                        color: "var(--secondary-foreground)",
                        boxShadow: "0 4px 12px -2px color-mix(in oklab, var(--secondary) 50%, transparent)",
                      }}
                    >
                      ★ Most popular
                    </span>
                  )}
                  <h4
                    className="font-display text-2xl font-extrabold tracking-[-0.025em]"
                    style={{ color: p.highlight ? "oklch(0.92 0.012 68)" : "var(--color-foreground)" }}
                  >
                    {p.name}
                  </h4>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span
                      className="font-mono text-base font-bold"
                      style={{ color: p.highlight ? "oklch(0.72 0.155 68 / 0.65)" : "var(--color-muted-foreground)" }}
                    >
                      $
                    </span>
                    <span
                      className="font-display text-4xl font-black leading-none tracking-[-0.04em]"
                      style={{
                        fontVariationSettings: '"wdth" 82',
                        color: p.highlight ? "oklch(0.88 0.012 68)" : "var(--color-foreground)",
                      }}
                    >
                      {price}
                    </span>
                    <span
                      className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em]"
                      style={{ color: p.highlight ? "oklch(0.88 0.012 68 / 0.50)" : "var(--color-muted-foreground)" }}
                    >
                      {suffix}
                    </span>
                  </div>
                  {/* Divider */}
                  <div
                    className="my-3.5 h-px"
                    style={{ background: p.highlight ? "oklch(1 0 0 / 0.09)" : "var(--color-border)" }}
                  />
                  <ul className="flex-1 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[0.8125rem]">
                        <span
                          className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full"
                          style={{
                            background: p.highlight
                              ? "color-mix(in oklab, var(--success) 20%, transparent)"
                              : "color-mix(in oklab, var(--success) 13%, transparent)",
                            color: "var(--success)",
                          }}
                        >
                          <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                        </span>
                        <span style={{ color: p.highlight ? "oklch(0.90 0.012 68 / 0.80)" : "var(--color-foreground)" }}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    disabled={p.tier === "free"}
                    onClick={() => {
                      setSelectedTier(p.tier);
                      setEcocashOpen(true);
                    }}
                    className={cn(
                      "mt-5 w-full rounded-full font-bold",
                      p.highlight ? "btn-amber-glow" : "btn-primary-glow",
                    )}
                    style={{
                      background: p.highlight
                        ? "linear-gradient(145deg, var(--secondary), color-mix(in oklab, var(--secondary) 78%, var(--primary)))"
                        : "linear-gradient(145deg, var(--primary), color-mix(in oklab, var(--primary) 72%, black))",
                      color: p.highlight ? "var(--secondary-foreground)" : "var(--primary-foreground)",
                    }}
                  >
                    {p.tier === "free" ? "Current" : `Choose ${p.name}`}
                  </Button>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setEcocashOpen(!ecocashOpen)}
            className="mt-6 block w-full text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-secondary transition-colors hover:text-secondary/80"
          >
            {ecocashOpen ? "Hide" : "Show"} EcoCash / InnBucks instructions
          </button>

          {ecocashOpen && (
            <div
              className="mt-4 overflow-hidden rounded-2xl p-5 text-sm"
              style={{
                border: "1px solid color-mix(in oklab, var(--success) 24%, transparent)",
                background: "linear-gradient(135deg, color-mix(in oklab, var(--success) 5%, var(--color-card)), var(--color-card))",
              }}
            >
              <span className="section-kicker">Pay via mobile</span>
              <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                EcoCash USSD
              </p>
              <p className="mt-1 font-mono text-base font-semibold text-foreground">
                *151*4*ZimFreight*
                <span className="text-secondary">{selectedTier.toUpperCase()}</span>#
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Send the amount above to ZimFreight, then enter the EcoCash reference below. We
                activate within 1 hour.
              </p>
              <div className="mt-4 space-y-2">
                <Label>EcoCash reference</Label>
                <Input
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  placeholder="EC-12345678"
                />
                <Button
                  onClick={submitEcoCash}
                  disabled={submitting}
                  className="w-full rounded-full font-bold text-secondary-foreground btn-amber-glow"
                  style={{ background: "linear-gradient(145deg, var(--secondary), color-mix(in oklab, var(--secondary) 78%, var(--primary)))" }}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify payment
                </Button>
              </div>
            </div>
          )}

          <p className="mt-6 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            🔒 Secure payment &middot; 14-day money back &middot; Cancel anytime &middot; No setup
            fee
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
