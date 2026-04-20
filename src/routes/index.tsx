import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, ArrowRight, MapPin, Clock, ShieldCheck, TrendingUp, Zap, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZimFreight — Zimbabwe's Premier Truck Load Board" },
      { name: "description", content: "Find and post freight loads across Zimbabwe and SADC in real time. Built for Zimbabwean carriers, brokers and shippers." },
      { property: "og:title", content: "ZimFreight — Truck Load Board" },
      { property: "og:description", content: "Real-time freight loads across Zimbabwe and SADC." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-[var(--bg-secondary)] to-background">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-2 md:px-6 md:py-28">
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Live · Beta · Made in Zimbabwe
            </span>
            <h1 className="mt-5 font-display text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-7xl">
              Zimbabwe's<br/><span className="text-primary">truck load board</span><br/>built for the road.
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground md:text-lg">
              Find loads. Move freight. Get paid. Real-time freight matching for carriers,
              brokers and shippers across Zimbabwe and SADC.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/board">Browse loads <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/post">Post a load</Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { v: "1,200+", l: "Active loads" },
                { v: "850+", l: "Verified carriers" },
                { v: "16", l: "Cities covered" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-2xl font-black text-primary md:text-3xl">{s.v}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Mock board card */}
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-[color:var(--info)]/15 blur-2xl" />
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border bg-[var(--bg-secondary)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="font-display text-sm font-bold uppercase tracking-wider">Live Load Board</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">UPDATED · LIVE</span>
              </div>
              <div className="divide-y divide-border">
                {[
                  { o: "Harare", d: "Beitbridge", r: 1850, km: 580, t: "Containers", urgent: true },
                  { o: "Bulawayo", d: "Plumtree", r: 420, km: 100, t: "General Cargo" },
                  { o: "Mutare", d: "Harare", r: 680, km: 263, t: "Tobacco" },
                  { o: "Harare", d: "Chirundu", r: 1100, km: 360, t: "Fuel/Tanker" },
                ].map((l, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-background/40">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-base font-bold">{l.o}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-primary" />
                        <span className="font-display text-base font-bold">{l.d}</span>
                        {l.urgent && <span className="rounded bg-destructive px-1.5 py-0.5 text-[9px] font-bold uppercase text-destructive-foreground">Urgent</span>}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">{l.t} · {l.km} km</div>
                    </div>
                    <div className="font-mono-num text-lg font-bold text-primary">${l.r.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-widest text-primary">Why ZimFreight</span>
            <h2 className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
              Built for Zimbabwean freight, not adapted for it.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { icon: MapPin, title: "Routes that matter", desc: "Harare, Bulawayo, Beitbridge, Chirundu, Plumtree — every major Zim corridor." },
              { icon: Clock, title: "Real-time updates", desc: "Loads appear instantly. Border wait times and route rates updated daily." },
              { icon: ShieldCheck, title: "ZIMRA-aware", desc: "Flag border crossings, ZIMRA requirements and commodity values up front." },
              { icon: TrendingUp, title: "Transparent rates", desc: "See average $/km on every corridor before you negotiate." },
              { icon: Zap, title: "Pay & get paid in USD", desc: "Lock in stable USD pricing. EcoCash and InnBucks supported for local fees." },
              { icon: Globe2, title: "SADC ready", desc: "Cross-border loads to South Africa, Zambia, Botswana and Mozambique." },
            ].map((f) => (
              <div key={f.title} className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold uppercase tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/10 p-10 md:p-14">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <h3 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
                  Move your first load this week.
                </h3>
                <p className="mt-2 max-w-md text-muted-foreground">Free to browse. Sign up in 30 seconds. No credit card required.</p>
              </div>
              <div className="flex gap-3">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/board">Open the board</Link>
                </Button>
                <Button asChild size="lg" variant="outline"><Link to="/pricing">See pricing</Link></Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
