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
  } catch {}
}

function getViewCount(): number {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]).length : 0;
  } catch { return 0; }
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
      <DialogContent className="border-primary/40 bg-card sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-display text-3xl font-black uppercase leading-tight tracking-tight">
            You've seen 5 of <span className="text-primary">today's 847 loads</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Upgrade to Basic to see all broker contacts, post loads, and unlock WhatsApp alerts — just $19/month.
          </p>
          <ul className="mx-auto mt-4 max-w-xs space-y-1.5 text-left text-sm">
            {["All 847 loads visible", "Broker WhatsApp + phone", "Post 10 loads/month", "Rate analytics + ZIMRA checklist"].map((f) => (
              <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{f}</li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-2">
            <Button onClick={() => { dismiss(); onUpgrade(); }} size="lg" className="bg-primary font-display text-base font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90">
              Upgrade to Basic — $19
            </Button>
            <button onClick={dismiss} className="text-xs text-muted-foreground hover:text-foreground">Maybe later</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}