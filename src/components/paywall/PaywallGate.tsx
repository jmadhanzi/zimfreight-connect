import { type ReactNode, useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { type PlanTier } from "@/types";
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

export function PaywallGate({
  plan,
  feature,
  benefits,
  children,
  blur = true,
  className,
}: PaywallGateProps) {
  // Use hasPlan() from the store — it validates status === 'active' AND expires_at,
  // so pending/expired subscriptions are correctly treated as free tier.
  const hasPlan = useAuthStore((s) => s.hasPlan);
  const [open, setOpen] = useState(false);
  const allowed = hasPlan(plan);

  if (allowed) return <>{children}</>;

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const defaultBenefits = [
    `Unlock ${feature.toLowerCase()}`,
    "All broker contacts + WhatsApp buttons",
    "Cancel anytime, 14-day money-back",
  ];

  return (
    <>
      <div className={cn("relative overflow-hidden rounded-2xl", className)}>
        {blur ? (
          <div aria-hidden className="pointer-events-none select-none blur-sm grayscale">
            {children}
          </div>
        ) : null}
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-secondary/30 bg-card p-6 text-center shadow-[0_24px_60px_-15px_color-mix(in_oklab,var(--foreground)_30%,transparent)]">
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-secondary via-primary to-secondary"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-secondary/15 blur-2xl"
            />
            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
                <Lock className="h-5 w-5" strokeWidth={2.4} />
              </div>
              <span className="section-kicker mx-auto mt-4 justify-center">Locked</span>
              <h3 className="mt-2 font-display text-2xl font-black tracking-[-0.035em]">
                Unlock with <span className="text-secondary">{planLabel}</span>
              </h3>
              <p className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                From $19/mo &middot; cancel anytime
              </p>
              <ul className="mt-4 space-y-2 text-left text-xs">
                {(benefits ?? defaultBenefits).map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                      <span className="text-[8px] font-bold">✓</span>
                    </span>
                    <span className="text-foreground/85">{b}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => setOpen(true)}
                className="mt-5 w-full rounded-full bg-secondary font-bold text-secondary-foreground btn-amber-glow hover:bg-secondary/90"
              >
                Upgrade now <span className="ml-1.5">→</span>
              </Button>
              <button
                onClick={() => setOpen(true)}
                className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
              >
                See all plans
              </button>
            </div>
          </div>
        </div>
      </div>
      <PricingModal open={open} onOpenChange={setOpen} />
    </>
  );
}
