import { useState } from "react";
import {
  MessageCircle,
  Check,
  Sparkles,
  Bot,
  Stamp,
  BarChart3,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingModal } from "@/components/paywall/PricingModal";

const EXAMPLES = [
  "What's the going rate for Harare → Bulawayo flatbed today?",
  "Give me the full ZIMRA checklist for Beit Bridge southbound.",
  "Find me a load BYO → JNB before Friday under $4,500.",
  "Best time to cross Beit Bridge tomorrow with a 32T container?",
  "Forecast cross-border rates for the next two weeks.",
];

const CAPABILITIES = [
  {
    icon: BarChart3,
    label: "Live rate intelligence",
    desc: "Per-km market rates by corridor, refreshed daily.",
  },
  {
    icon: Stamp,
    label: "ZIMRA & border expert",
    desc: "Every form, every checklist, every wait time.",
  },
  {
    icon: Globe,
    label: "SADC route knowledge",
    desc: "Highway grades, fuel stops, toll gates, tolls.",
  },
  { icon: Bot, label: "Quote drafting", desc: "AI writes broker replies in your voice." },
];

export function UpgradeGate() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-4 py-16 text-center md:px-6 md:py-20">
      {/* AI Avatar — copper-earth palette, not WhatsApp green */}
      <div className="relative">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 animate-pulse rounded-full blur-3xl"
          style={{ background: "color-mix(in oklab, var(--primary) 28%, transparent)" }}
        />
        <div
          className="relative flex h-20 w-20 items-center justify-center rounded-2xl"
          style={{
            background: "linear-gradient(145deg, var(--primary) 0%, color-mix(in oklab, var(--primary) 70%, black) 100%)",
            boxShadow: "0 0 48px color-mix(in oklab, var(--primary) 40%, transparent), 0 2px 0 color-mix(in oklab, var(--primary) 55%, black), inset 0 1px 0 oklch(1 0 0 / 0.18)",
          }}
        >
          <MessageCircle className="h-9 w-9 text-primary-foreground" strokeWidth={2.2} />
          <span
            aria-hidden
            className="absolute inset-x-2 bottom-1.5 h-px rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, var(--secondary), transparent)" }}
          />
          <span
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-xl text-secondary-foreground"
            style={{
              background: "linear-gradient(145deg, var(--secondary), color-mix(in oklab, var(--secondary) 78%, var(--primary)))",
              boxShadow: "0 2px 8px -2px color-mix(in oklab, var(--secondary) 55%, transparent)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        </div>
      </div>

      <div
        className="mt-7 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
        style={{
          background: "color-mix(in oklab, var(--secondary) 14%, transparent)",
          border: "1px solid color-mix(in oklab, var(--secondary) 30%, transparent)",
          color: "color-mix(in oklab, var(--secondary) 75%, var(--foreground))",
        }}
      >
        <Sparkles className="h-3 w-3" />
        <span className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.22em]">
          Pro feature
        </span>
      </div>

      <h1
        className="mt-5 font-display text-5xl font-black tracking-[-0.045em] md:text-6xl"
        style={{ fontVariationSettings: '"wdth" 85' }}
      >
        ZimFreight{" "}
        <span
          style={{
            background: "linear-gradient(135deg, var(--secondary), var(--primary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          AI Dispatch
        </span>
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
        Your personal AI freight dispatcher, available 24/7 inside WhatsApp. Knows every Zimbabwe
        route, every ZIMRA form, every border quirk.
      </p>
      <p className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
        Powered by Claude Sonnet 4
      </p>

      {/* Capability grid */}
      <div className="mt-10 grid w-full grid-cols-2 gap-3 md:grid-cols-4">
        {CAPABILITIES.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="hover-lift rounded-2xl p-4 text-left transition-colors"
              style={{
                border: "1px solid var(--color-border)",
                background: "var(--color-card)",
                boxShadow: "inset 0 1px 0 0 oklch(1 0 0 / 0.55)",
              }}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{
                  background: "color-mix(in oklab, var(--primary) 10%, transparent)",
                  color: "var(--primary)",
                }}
              >
                <Icon className="h-4 w-4" strokeWidth={2.4} />
              </span>
              <div className="mt-3 font-display text-sm font-bold tracking-tight">{c.label}</div>
              <div className="mt-1 text-[0.6875rem] leading-relaxed text-muted-foreground">{c.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Example prompts in chat-style bubbles */}
      <div className="mt-10 w-full overflow-hidden rounded-2xl border border-border/70 bg-card text-left">
        <div className="border-b border-border bg-[var(--bg-secondary)] px-5 py-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Ask me anything like…
          </span>
        </div>
        <ul className="space-y-2.5 p-5">
          {EXAMPLES.map((q, i) => (
            <li key={q} className="flex items-start gap-3 text-[0.875rem]">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: "color-mix(in oklab, var(--success) 14%, transparent)",
                  color: "var(--success)",
                }}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="text-foreground/85">
                <span className="text-muted-foreground/60">{String(i + 1).padStart(2, "0")} ·</span>{" "}
                &ldquo;{q}&rdquo;
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="mt-10 h-14 rounded-full px-10 text-base font-extrabold tracking-wide text-secondary-foreground btn-amber-glow"
        style={{ background: "linear-gradient(145deg, var(--secondary), color-mix(in oklab, var(--secondary) 78%, var(--primary)))" }}
      >
        Upgrade to Pro &mdash; $49/month
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        14-day money back &middot; Cancel anytime &middot; Pay USD card or EcoCash
      </p>

      <PricingModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
