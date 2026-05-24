import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PLAN_LEVEL, type PlanTier } from "@/types";

const KEY = "zf_loads_viewed";
const DISMISS_KEY = "zf_softgate_dismissed_at";
const LIMIT = 5;
const COOLDOWN_MS = 1000 * 60 * 60 * 6; // 6 hours

/** Increment the viewed-loads counter. Call when a load detail is opened. */
export function recordLoadView(id: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    if (set.has(id)) return;
    set.add(id);
    localStorage.setItem(KEY, JSON.stringify([...set].slice(-50)));
    window.dispatchEvent(new CustomEvent("zf:load-view"));
  } catch {
    /* localStorage unavailable */
  }
}

function getViewCount(): number {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]).length : 0;
  } catch {
    return 0;
  }
}

export function SoftGateModal({ onUpgrade }: { onUpgrade: () => void }) {
  const { user, subscription } = useAuth();
  const plan = (subscription?.plan as PlanTier) ?? "free";
  const isFree = !user || PLAN_LEVEL[plan] < PLAN_LEVEL.basic;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isFree) return;
    const check = () => {
      const dismissed = Number(localStorage.getItem(DISMISS_KEY) ?? "0");
      if (Date.now() - dismissed < COOLDOWN_MS) return;
      if (getViewCount() >= LIMIT) setOpen(true);
    };
    check();
    window.addEventListener("zf:load-view", check);
    return () => window.removeEventListener("zf:load-view", check);
  }, [isFree]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden border-secondary/30 bg-card p-0 sm:max-w-md">
        {/* top accent strip */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-secondary via-primary to-secondary"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-secondary/20 blur-3xl"
        />

        <div className="relative p-7 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
            <Lock className="h-6 w-6" />
          </div>
          <span className="section-kicker mx-auto mt-5 justify-center">Daily limit</span>
          <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-[-0.04em]">
            You&rsquo;ve seen 5 of <span className="text-secondary">today&rsquo;s 847 loads</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Upgrade to Basic to see all broker contacts, post loads, and unlock WhatsApp alerts
            &mdash; just $19/month.
          </p>
          <ul className="mx-auto mt-5 max-w-xs space-y-2 text-left text-sm">
            {[
              "All 847 loads visible",
              "Broker WhatsApp + phone",
              "Post 10 loads/month",
              "Rate analytics + ZIMRA checklist",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                  <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                </span>
                <span className="text-foreground/85">{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-col gap-2">
            <Button
              onClick={() => {
                dismiss();
                onUpgrade();
              }}
              size="lg"
              className="bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/90"
            >
              Upgrade to Basic &mdash; $19
            </Button>
            <button
              onClick={dismiss}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Maybe later
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
