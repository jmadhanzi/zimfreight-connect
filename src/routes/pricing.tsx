import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ZimFreight" },
      { name: "description", content: "Simple USD pricing for Zimbabwean carriers and brokers. Free to browse." },
      { property: "og:title", content: "Pricing — ZimFreight" },
      { property: "og:description", content: "Plans for carriers, brokers and fleets. EcoCash, InnBucks and USD cards accepted." },
    ],
  }),
  component: PricingPage,
});

const plans = [
  { tier: "Free", price: 0, sub: "Browse the board", features: ["Browse all loads", "View route averages", "Post 1 load / month"], cta: "Sign up free", highlight: false },
  { tier: "Basic", price: 15, sub: "For solo carriers", features: ["Unlock contact details", "Post unlimited loads", "WhatsApp notifications", "Border wait alerts"], cta: "Start Basic", highlight: false },
  { tier: "Pro", price: 49, sub: "For active brokers", features: ["Everything in Basic", "AI load matching", "Priority load placement", "Rate analytics dashboard", "WhatsApp AI agent"], cta: "Start Pro", highlight: true },
  { tier: "Fleet", price: 149, sub: "For fleet operators", features: ["Everything in Pro", "Up to 25 driver seats", "Bulk load posting", "API access", "Dedicated support"], cta: "Talk to us", highlight: false },
];

function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-primary">Pricing</span>
        <h1 className="mt-2 font-display text-5xl font-black uppercase tracking-tight md:text-6xl">
          Simple <span className="text-primary">USD pricing</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Pay monthly with a USD card, EcoCash or InnBucks. Cancel anytime — no setup fees, no commitments.
        </p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => (
          <div
            key={p.tier}
            className={cn(
              "relative flex flex-col rounded-2xl border p-6",
              p.highlight ? "border-primary bg-gradient-to-b from-primary/15 to-card shadow-[0_0_0_1px_var(--primary)]" : "border-border bg-card"
            )}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                Most popular
              </span>
            )}
            <h3 className="font-display text-2xl font-black uppercase tracking-tight">{p.tier}</h3>
            <p className="text-sm text-muted-foreground">{p.sub}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-display text-5xl font-black text-foreground">${p.price}</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
            <ul className="mt-6 flex-1 space-y-2 text-sm">
              {p.features.map(f => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button asChild className={cn("mt-6", p.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-foreground hover:bg-secondary/80")}>
              <Link to="/board">{p.cta}</Link>
            </Button>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Stripe (USD cards) · EcoCash · InnBucks · ZimSwitch coming soon. Prices in USD.
      </p>
    </div>
  );
}
