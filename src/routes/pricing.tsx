import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, X, Flame, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ZimFreight" },
      { name: "description", content: "Simple USD pricing for Zimbabwean carriers and brokers. EcoCash, InnBucks, and Visa accepted." },
      { property: "og:title", content: "Pricing — ZimFreight" },
      { property: "og:description", content: "Plans for carriers, brokers and fleets. Pay with EcoCash, InnBucks or Visa." },
    ],
  }),
  component: PricingPage,
});

const PLANS = [
  { tier: "free", name: "Free", monthly: 0, sub: "Try the board", features: ["5 loads visible per day", "Browse only", "1 post per month"], cta: "Start free", highlight: false },
  { tier: "basic", name: "Basic", monthly: 19, sub: "For solo carriers", features: ["50 loads per day", "All broker contacts", "Post 10 loads/mo", "WhatsApp alerts", "Rate analytics", "ZIMRA checklist"], cta: "Start Basic", highlight: true },
  { tier: "pro", name: "Pro", monthly: 49, sub: "For active brokers", features: ["Unlimited loads", "WhatsApp AI agent", "Priority listing", "Rate forecasting", "Post 50 loads/mo"], cta: "Start Pro", highlight: false },
  { tier: "fleet", name: "Fleet", monthly: 99, sub: "For fleet operators", features: ["Everything in Pro", "25 driver seats", "Bulk posting", "API access", "Dedicated support"], cta: "Talk to us", highlight: false },
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
  { q: "Can I pay with EcoCash?", a: "Yes. Choose your plan, then dial *151*4*ZimFreight*[plan]# and enter the reference code in your account. We activate within 1 hour. InnBucks, ZIPIT and bank transfers also work." },
  { q: "Is there a contract?", a: "No — every plan is month-to-month. Cancel anytime from your dashboard." },
  { q: "Does it work offline?", a: "Yes. The app caches recent loads, route rates, and border status so rural drivers can keep working when signal drops." },
  { q: "What is the WhatsApp AI agent?", a: "Our Pro AI dispatcher (Claude-powered) finds loads, checks border wait times, drafts quotes, and replies to brokers — all inside WhatsApp. You stay in control." },
  { q: "Can I switch plans?", a: "Anytime. Upgrades take effect immediately and are prorated. Downgrades apply at the next billing cycle." },
  { q: "Is my data secure?", a: "Yes. Data is stored in African data centers with encryption in transit and at rest. We never share broker contacts with third parties." },
];

function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-primary">Pricing</span>
        <h1 className="mt-2 font-display text-5xl font-black uppercase tracking-tight md:text-6xl">
          Simple pricing for <span className="text-primary">Zimbabwe's trucking industry</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Pay monthly with USD card, EcoCash, InnBucks, or bank transfer. Cancel anytime.
        </p>
      </div>

      {/* Annual toggle */}
      <div className="mt-8 flex items-center justify-center gap-3 text-sm">
        <span className={cn(!annual && "text-foreground", annual && "text-muted-foreground")}>Monthly</span>
        <Switch checked={annual} onCheckedChange={setAnnual} />
        <span className={cn(annual && "text-foreground", !annual && "text-muted-foreground")}>
          Annual <span className="ml-1 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">Save 20%</span>
        </span>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => {
          const price = annual ? Math.round(p.monthly * 12 * 0.8) : p.monthly;
          const suffix = p.monthly === 0 ? "" : annual ? "/yr" : "/mo";
          return (
            <div key={p.tier} className={cn(
              "relative flex flex-col overflow-hidden rounded-lg border p-6 transition-colors",
              p.highlight
                ? "border-primary/60 bg-card shadow-[0_0_0_1px_var(--primary)]"
                : "border-border bg-card hover:border-border/80"
            )}>
              {p.highlight && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
                />
              )}
              {p.highlight && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent"
                />
              )}
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-primary px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground">Most popular</span>
              )}
              <div className="relative">
                <span className={cn(
                  "font-mono text-[10px] uppercase tracking-widest",
                  p.highlight ? "text-primary" : "text-muted-foreground"
                )}>
                  {p.tier === "free" ? "Tier 00" : p.tier === "basic" ? "Tier 01" : p.tier === "pro" ? "Tier 02" : "Tier 03"}
                </span>
                <h3 className="mt-1 font-display text-2xl font-black uppercase tracking-tight">{p.name}</h3>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{p.sub}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className={cn("font-display text-5xl font-black", p.highlight ? "text-primary" : "text-foreground")}>${price}</span>
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{suffix || "/free"}</span>
                </div>
              </div>
              <ul className="relative mt-6 flex-1 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className={cn("relative mt-6 font-mono text-xs uppercase tracking-widest", p.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-foreground hover:bg-secondary/80")}>
                <Link to="/board" search={{ q: "", origin: "all", destination: "all", loadType: "all", equipment: "all", pickup: "", minRate: 0, maxDistance: 2000, border: false, zimra: false, urgent: false, minWeight: 0, maxWeight: 40, payment: "all", sort: "newest", load: undefined }}>{p.cta}</Link>
              </Button>
              {p.highlight && (
                <div className="relative mt-3 flex items-center justify-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-primary">
                  <Flame className="h-3.5 w-3.5" />
                  47 carriers signed up in the last 24 hours
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        💳 Pay with EcoCash · InnBucks · Visa · Bank Transfer · ZIPIT
      </p>

      {/* Comparison */}
      <div className="mt-20">
        <span className="font-mono text-xs uppercase tracking-widest text-primary">Comparison</span>
        <h2 className="mt-1 font-display text-3xl font-black uppercase tracking-tight">Compare plans</h2>
        <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-20 bg-[color:var(--bg-secondary)] font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left">Feature</th>
                  {PLANS.map((p) => (
                    <th key={p.tier} className={cn("px-3 py-2 text-left", p.highlight && "text-primary")}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-border/60 transition-colors hover:bg-background/40">
                    <td className="px-3 py-3 text-foreground">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className={cn("px-3 py-3", PLANS[i]?.highlight && "bg-primary/[0.04]")}>
                        {typeof v === "boolean"
                          ? v ? <Check className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-muted-foreground/40" />
                          : <span className="font-mono-num font-bold text-foreground">{v}</span>}
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
      <div className="mt-20 max-w-3xl">
        <h2 className="font-display text-3xl font-black uppercase tracking-tight">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-6">
          {FAQS.map((f) => (
            <AccordionItem key={f.q} value={f.q} className="border-border">
              <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Final CTA */}
      <div className="relative mt-20 overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-b from-primary/15 via-primary/5 to-card p-10 text-center">
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="relative">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="mt-3 font-display text-3xl font-black uppercase tracking-tight md:text-4xl">Try free for 14 days — no credit card</h2>
          <p className="mt-2 text-sm text-muted-foreground">Join 2,400+ Zimbabwean carriers and brokers already on ZimFreight.</p>
          <Button asChild size="lg" className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/board" search={{ q: "", origin: "all", destination: "all", loadType: "all", equipment: "all", pickup: "", minRate: 0, maxDistance: 2000, border: false, zimra: false, urgent: false, minWeight: 0, maxWeight: 40, payment: "all", sort: "newest", load: undefined }}>Get started free →</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}