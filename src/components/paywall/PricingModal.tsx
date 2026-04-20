import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  { tier: "free", name: "Free", monthly: 0, features: ["5 loads/day", "Browse only", "No broker contacts"] },
  { tier: "basic", name: "Basic", monthly: 19, highlight: true, features: ["50 loads/day", "All broker contacts", "WhatsApp alerts", "Rate analytics", "Post 10 loads/mo"] },
  { tier: "pro", name: "Pro", monthly: 49, features: ["Unlimited loads", "WhatsApp AI agent", "Priority listing", "Rate forecasting", "Post 50 loads/mo"] },
  { tier: "fleet", name: "Fleet", monthly: 99, features: ["Everything in Pro", "25 driver seats", "Bulk posting", "API access", "Dedicated support"] },
];

export function PricingModal({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const [annual, setAnnual] = useState(false);
  const { user } = useAuth();
  const [ecocashOpen, setEcocashOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PlanTier>("basic");
  const [ref, setRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitEcoCash = async () => {
    if (!user) { toast.error("Sign in to record payment"); return; }
    if (!ref.trim()) { toast.error("Enter your EcoCash reference"); return; }
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
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl font-black uppercase tracking-tight">Choose your plan</DialogTitle>
          <DialogDescription>14-day money back. Cancel anytime. Pay with USD card or EcoCash.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-3 text-sm">
          <span className={cn(!annual && "text-foreground", annual && "text-muted-foreground")}>Monthly</span>
          <Switch checked={annual} onCheckedChange={setAnnual} />
          <span className={cn(annual && "text-foreground", !annual && "text-muted-foreground")}>Annual <span className="ml-1 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">Save 20%</span></span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => {
            const price = annual ? Math.round(p.monthly * 12 * 0.8) : p.monthly;
            const suffix = p.monthly === 0 ? "" : annual ? "/yr" : "/mo";
            return (
              <div key={p.tier} className={cn(
                "relative flex flex-col rounded-lg border p-4",
                p.highlight ? "border-primary bg-gradient-to-b from-primary/15 to-card" : "border-border bg-background/40"
              )}>
                {p.highlight && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary-foreground">Most popular</span>
                )}
                <h4 className="font-display text-xl font-black uppercase tracking-tight">{p.name}</h4>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-black">${price}</span>
                  <span className="text-xs text-muted-foreground">{suffix}</span>
                </div>
                <ul className="mt-3 flex-1 space-y-1.5 text-xs">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-1.5"><Check className="h-3.5 w-3.5 shrink-0 text-primary" /><span>{f}</span></li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  disabled={p.tier === "free"}
                  onClick={() => { setSelectedTier(p.tier); setEcocashOpen(true); }}
                  className={cn("mt-4 w-full", p.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-foreground hover:bg-secondary/80")}
                >
                  {p.tier === "free" ? "Current" : `Choose ${p.name}`}
                </Button>
              </div>
            );
          })}
        </div>

        <button onClick={() => setEcocashOpen(!ecocashOpen)} className="text-center text-sm font-medium text-primary hover:underline">
          {ecocashOpen ? "Hide" : "Show"} EcoCash / InnBucks instructions
        </button>

        {ecocashOpen && (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm">
            <p className="font-mono text-xs text-muted-foreground">EcoCash USSD</p>
            <p className="mt-1 font-mono text-base text-foreground">*151*4*ZimFreight*{selectedTier.toUpperCase()}#</p>
            <p className="mt-2 text-xs text-muted-foreground">Send the amount above to ZimFreight, then enter the EcoCash reference below. We activate within 1 hour.</p>
            <div className="mt-3 space-y-2">
              <Label>EcoCash reference</Label>
              <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="EC-12345678" />
              <Button onClick={submitEcoCash} disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify payment
              </Button>
            </div>
          </div>
        )}

        <p className="text-center text-[11px] text-muted-foreground">
          🔒 Secure payment · 14-day money back · Cancel anytime · No setup fee
        </p>
      </DialogContent>
    </Dialog>
  );
}