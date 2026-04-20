import { type ReactNode, useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { PLAN_LEVEL, type PlanTier } from "@/types";
import { PricingModal } from "./PricingModal";
import { cn } from "@/lib/utils";

interface PaywallGateProps {
  plan: PlanTier;
  feature: string;
  benefits?: string[];
  children: ReactNode;
  /** When true, blurs children behind a centered upgrade overlay. */
  blur?: boolean;
  className?: string;
}

export function PaywallGate({ plan, feature, benefits, children, blur = true, className }: PaywallGateProps) {
  const { subscription } = useAuth();
  const [open, setOpen] = useState(false);
  const currentPlan: PlanTier = (subscription?.plan as PlanTier) ?? "free";
  const allowed = PLAN_LEVEL[currentPlan] >= PLAN_LEVEL[plan];

  if (allowed) return <>{children}</>;

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const defaultBenefits = [
    `Unlock ${feature.toLowerCase()}`,
    "All broker contacts + WhatsApp buttons",
    "Cancel anytime, 14-day money-back",
  ];

  return (
    <>
      <div className={cn("relative overflow-hidden rounded-md", className)}>
        {blur ? <div aria-hidden className="pointer-events-none select-none blur-sm grayscale">{children}</div> : null}
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-5 text-center shadow-xl">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-display text-xl font-black uppercase tracking-tight">Unlock with {planLabel}</h3>
            <p className="mt-1 text-xs text-muted-foreground">From $19/mo · cancel anytime</p>
            <ul className="mt-3 space-y-1 text-left text-xs text-muted-foreground">
              {(benefits ?? defaultBenefits).map((b) => (
                <li key={b} className="flex gap-2"><span className="text-primary">✓</span><span>{b}</span></li>
              ))}
            </ul>
            <Button onClick={() => setOpen(true)} className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Upgrade now →
            </Button>
            <button onClick={() => setOpen(true)} className="mt-2 text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
              See all plans
            </button>
          </div>
        </div>
      </div>
      <PricingModal open={open} onOpenChange={setOpen} />
    </>
  );
}