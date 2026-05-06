import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, X, Flame, Lock, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ZimFreight" },
      {
        name: "description",
        content:
          "Simple USD pricing for Zimbabwean carriers and brokers. EcoCash, InnBucks, and Visa accepted.",
      },
      { property: "og:title", content: "Pricing — ZimFreight" },
      {
        property: "og:description",
        content: "Plans for carriers, brokers and fleets. Pay with EcoCash, InnBucks or Visa.",
      },
    ],
  }),
  component: PricingPage,
});

const BOARD_SEARCH = {
  q: "",
  origin: "all",
  destination: "all",
  loadType: "all",
  equipment: "all",
  pickup: "",
  minRate: 0,
  maxDistance: 2000,
  border: false,
  zimra: false,
  urgent: false,
  minWeight: 0,
  maxWeight: 40,
  payment: "all",
  sort: "newest" as const,
  load: undefined as string | undefined,
};

const PLANS = [
  {
    tier: "free",
    name: "Free",
    monthly: 0,
    sub: "Try the board",
    features: ["5 loads visible per day", "Browse only", "1 post per month"],
    cta: "Start free",
    highlight: false,
  },
  {
    tier: "basic",
    name: "Basic",
    monthly: 19,
    sub: "For solo carriers",
    features: [
      "50 loads per day",
      "All broker contacts",
      "Post 10 loads/mo",
      "WhatsApp alerts",
      "Rate analytics",
      "ZIMRA checklist",
    ],
    cta: "Start Basic",
    highlight: true,
  },
  {
    tier: "pro",
    name: "Pro",
    monthly: 49,
    sub: "For active brokers",
    features: [
      "Unlimited loads",
      "WhatsApp AI agent",
      "Priority listing",
      "Rate forecasting",
      "Post 50 loads/mo",
    ],
    cta: "Start Pro",
    highlight: false,
  },
  {
    tier: "fleet",
    name: "Fleet",
    monthly: 99,
    sub: "For fleet operators",
    features: [
      "Everything in Pro",
      "25 driver seats",
      "Bulk posting",
      "API access",
      "Dedicated support",
    ],
    cta: "Talk to us",
    highlight: false,
  },
];

const COMPARE_ROWS: Array<{ label: string; values: (string | boolean)[] }> = [
  { label: "Loads visible / day", values: ["5", "50", "Unlimited", "Unlimited"] },
  { label: "Broker contacts unlocked", values: [false, true, true, true] },
  { label: "Post loads / month", values: ["1", "10", "50", "Unlimited"] },
  { label: "WhatsApp load alerts", values: [false, true, true, true] },
  { label: "Rate analytics", values: [false, true, true, true] },
  { label: "WhatsApp AI agent", values: [false, false, true, true] },
  { label: "Priority listing", values: [false, false, true, true] },
  { label: "Driver seats", values: ["1", "1", "5", "25"] },
  { label: "API access", values: [false, false, false, true] },
];

const FAQS = [
  {
    q: "Can I pay with EcoCash?",
    a: "Yes. Choose your plan, then dial *151*4*ZimFreight*[plan]# and enter the reference code in your account. We activate within 1 hour. InnBucks, ZIPIT and bank transfers also work.",
  },
  {
    q: "Is there a contract?",
    a: "No — every plan is month-to-month. Cancel anytime from your dashboard.",
  },
  {
    q: "Does it work offline?",
    a: "Yes. The app caches recent loads, route rates, and border status so rural drivers can keep working when signal drops.",
  },
  {
    q: "What is the WhatsApp AI agent?",
    a: "Our Pro AI dispatcher (Claude-powered) finds loads, checks border wait times, drafts quotes, and replies to brokers — all inside WhatsApp. You stay in control.",
  },
  {
    q: "Can I switch plans?",
    a: "Anytime. Upgrades take effect immediately and are prorated. Downgrades apply at the next billing cycle.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Data is stored in African data centers with encryption in transit and at rest. We never share broker contacts with third parties.",
  },
];

const PAYMENT_METHODS = [
  { name: "EcoCash", icon: "📱" },
  { name: "InnBucks", icon: "📲" },
  { name: "Visa / Mastercard", icon: "💳" },
  { name: "Bank Transfer", icon: "🏦" },
  { name: "ZIPIT", icon: "⚡" },
];

function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center">
        <span className="section-kicker mx-auto justify-center">Pricing</span>
        <h1 className="mt-4 font-display text-5xl font-black tracking-[-0.045em] md:text-6xl lg:text-7xl">
          Simple pricing for{" "}
          <span className="relative inline-block">
            <span className="text-secondary">Zimbabwe&rsquo;s truckers</span>
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-2 h-2 rounded-full bg-secondary/30 blur-md md:-bottom-3 md:h-3"
            />
          </span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Pay monthly with USD card, EcoCash, InnBucks, or bank transfer. Cancel anytime.
        </p>
      </div>

      {/* Annual toggle */}
      <div className="mt-10 flex items-center justify-center gap-3 text-sm">
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

      {/* Plan cards */}
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p, i) => {
          const price = annual ? Math.round(p.monthly * 12 * 0.8) : p.monthly;
          const suffix = p.monthly === 0 ? "" : annual ? "/yr" : "/mo";
          return (
            <div
              key={p.tier}
              className={cn(
                "hover-lift group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-7 transition-all",
                p.highlight
                  ? "border-secondary/40 shadow-[0_0_0_1px_color-mix(in_oklab,var(--secondary)_30%,transparent),0_20px_60px_-20px_color-mix(in_oklab,var(--secondary)_50%,transparent)] md:scale-[1.02]"
                  : "border-border/70 hover:border-foreground/15",
              )}
            >
              {/* Top accent strip — only on highlight */}
              {p.highlight && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-secondary via-primary to-secondary"
                />
              )}
              {/* "Most popular" ribbon */}
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-secondary px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-secondary-foreground shadow-[0_4px_12px_-2px_color-mix(in_oklab,var(--secondary)_60%,transparent)]">
                  <Sparkles className="h-3 w-3" />
                  Most popular
                </span>
              )}
              {/* Subtle bg wash for highlight */}
              {p.highlight && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/[0.06] via-transparent to-transparent"
                />
              )}

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "font-mono text-[10px] font-semibold uppercase tracking-[0.2em]",
                      p.highlight ? "text-secondary" : "text-muted-foreground",
                    )}
                  >
                    {`Tier 0${i}`}
                  </span>
                  <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/60">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-3xl font-black tracking-[-0.035em]">
                  {p.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.sub}</p>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-bold text-muted-foreground">$</span>
                  <span
                    className={cn(
                      "font-display text-6xl font-black leading-none tracking-[-0.04em]",
                      p.highlight ? "text-secondary" : "text-foreground",
                    )}
                  >
                    {price}
                  </span>
                  <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {suffix || "free"}
                  </span>
                </div>
                {annual && p.monthly > 0 && (
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                    ≈ ${Math.round((p.monthly * 12 * 0.8) / 12)}/mo billed yearly
                  </p>
                )}
              </div>

              <ul className="relative mt-7 flex-1 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                        p.highlight
                          ? "bg-secondary/20 text-secondary"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="text-foreground/85">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  "relative mt-7 rounded-full font-bold tracking-wide",
                  p.highlight
                    ? "bg-secondary text-secondary-foreground btn-amber-glow hover:bg-secondary/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                <Link to="/board" search={BOARD_SEARCH}>
                  {p.cta}
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>

              {p.highlight && (
                <div className="relative mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-secondary/25 bg-secondary/8 px-2 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">
                  <Flame className="h-3 w-3" />
                  47 carriers signed up in the last 24 hours
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment methods */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs">
        <span className="font-mono uppercase tracking-[0.18em] text-muted-foreground">
          Pay with
        </span>
        {PAYMENT_METHODS.map((p) => (
          <span
            key={p.name}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-foreground/80"
          >
            <span aria-hidden>{p.icon}</span>
            {p.name}
          </span>
        ))}
      </div>

      {/* Comparison */}
      <div className="mt-24">
        <span className="section-kicker">Comparison</span>
        <h2 className="mt-3 font-display text-3xl font-black tracking-[-0.035em] md:text-4xl">
          Compare plans
        </h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_1px_0_color-mix(in_oklab,var(--foreground)_5%,transparent)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[color:var(--bg-secondary)]">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Feature
                  </th>
                  {PLANS.map((p) => (
                    <th
                      key={p.tier}
                      className={cn(
                        "px-4 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em]",
                        p.highlight ? "text-secondary" : "text-muted-foreground",
                      )}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 text-foreground">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td
                        key={i}
                        className={cn("px-4 py-3", PLANS[i]?.highlight && "bg-secondary/[0.04]")}
                      >
                        {typeof v === "boolean" ? (
                          v ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--success)_15%,transparent)] text-[color:var(--success)]">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/30" />
                          )
                        ) : (
                          <span className="font-mono-num font-bold text-foreground">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-24 max-w-3xl">
        <span className="section-kicker">Questions</span>
        <h2 className="mt-3 font-display text-3xl font-black tracking-[-0.035em] md:text-4xl">
          Frequently asked
        </h2>
        <Accordion type="single" collapsible className="mt-8">
          {FAQS.map((f) => (
            <AccordionItem key={f.q} value={f.q} className="border-border">
              <AccordionTrigger className="text-left font-display text-base font-bold tracking-[-0.015em] hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Final CTA */}
      <div className="relative mt-24 overflow-hidden rounded-3xl border border-secondary/25 bg-gradient-to-br from-primary/[0.04] via-card to-secondary/[0.06] p-10 text-center md:p-16">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-secondary to-transparent"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-secondary/20 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="mt-6 font-display text-4xl font-black tracking-[-0.04em] md:text-5xl">
            Try free for 14 days{" "}
            <span className="block md:inline text-muted-foreground">— no credit card</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Join <span className="font-bold text-foreground">2,400+</span> Zimbabwean carriers and
            brokers already on ZimFreight.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 rounded-full bg-secondary px-10 py-6 text-base font-extrabold text-secondary-foreground btn-amber-glow hover:bg-secondary/90"
          >
            <Link to="/board" search={BOARD_SEARCH}>
              Get started free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
