import { useState } from "react";
import { MessageCircle, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingModal } from "@/components/paywall/PricingModal";

const EXAMPLES = [
  "What's the going rate for Harare → Bulawayo flatbed today?",
  "Give me the full ZIMRA checklist for Beit Bridge southbound.",
  "Find me a load BYO → JNB before Friday under $4,500.",
  "Best time to cross Beit Bridge tomorrow with a 32T container?",
  "Forecast cross-border rates for the next two weeks.",
];

export function UpgradeGate() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center md:px-6">
      <div className="relative">
        <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-[#FFD56B]/30 blur-3xl" />
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#06CF9C] text-[#0B141A] shadow-[0_0_60px_rgba(255,213,107,0.6)]">
          <MessageCircle className="h-9 w-9" strokeWidth={2.5} />
        </div>
      </div>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
        <Sparkles className="h-3.5 w-3.5" /> Pro feature
      </div>
      <h1 className="mt-4 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
        ZimFreight AI Dispatch
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
        Your personal AI freight dispatcher. Available 24/7. Knows every Zimbabwe route, every ZIMRA form, every border quirk. Powered by Claude Sonnet 4.
      </p>

      <div className="mt-8 grid w-full max-w-2xl gap-2 rounded-lg border border-border bg-card p-5 text-left">
        <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Ask me anything like…</div>
        <ul className="mt-1 space-y-2">
          {EXAMPLES.map((q) => (
            <li key={q} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-foreground/90">"{q}"</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="mt-8 h-12 bg-primary px-8 font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
      >
        Upgrade to Pro — $49/month →
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">14-day money back · Cancel anytime · Pay USD card or EcoCash</p>

      <PricingModal open={open} onOpenChange={setOpen} />
    </div>
  );
}