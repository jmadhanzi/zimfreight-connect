import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { ArrowRight, Lock, MapPin, Check, ShieldCheck } from "lucide-react";
import { StickyLandingCta } from "@/components/conversion/StickyLandingCta";
import heroBg from "@/assets/hero-zim-highway.jpg";
import logoMoyo from "@/assets/partners/moyo.svg?url";
import logoKhumalo from "@/assets/partners/khumalo.svg?url";
import logoSable from "@/assets/partners/sable.svg?url";
import logoZambezi from "@/assets/partners/zambezi.svg?url";
import logoKopje from "@/assets/partners/kopje.svg?url";
import logoLimpopo from "@/assets/partners/limpopo.svg?url";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZimFreight — Find Freight. Fill Your Truck. Get Paid." },
      { name: "description", content: "Zimbabwe's smartest load board. 800+ daily loads, real-time rates, WhatsApp AI dispatch. From Harare to Beitbridge and beyond." },
      { property: "og:title", content: "ZimFreight — Zimbabwe's #1 Truck Load Board" },
      { property: "og:description", content: "800+ daily loads. WhatsApp AI dispatch. EcoCash & USD payments. Built for Zimbabwean truckers." },
    ],
  }),
  component: LandingPage,
});

/* ───────────── helpers ───────────── */

function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in-view")),
      { threshold: 0.15 }
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, []);
  return ref;
}

function CountUp({ to, suffix = "", prefix = "", decimals = 0 }: { to: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const start = performance.now(); const dur = 1400;
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          setN(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick); io.disconnect();
      });
    }, { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{prefix}{n.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}</span>;
}

/* ───────────── floating hero cards ───────────── */

const FLOAT_LOADS = [
  { o: "Harare", d: "Bulawayo", r: 1200, t: "just now" },
  { o: "Beitbridge", d: "Harare", r: 2100, t: "1 min ago" },
  { o: "Mutare", d: "Harare", r: 680, t: "3 min ago" },
  { o: "Harare", d: "Chirundu", r: 1450, t: "5 min ago" },
  { o: "Bulawayo", d: "Plumtree", r: 420, t: "7 min ago" },
];

function FloatingCards() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {FLOAT_LOADS.map((l, i) => (
        <div
          key={i}
          className="animate-float-up absolute right-4 w-[260px] rounded-lg border border-border bg-card/90 p-3 shadow-2xl backdrop-blur md:right-8"
          style={{ top: "100%", animationDelay: `${i * 1.6}s` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm font-bold">{l.o}</span>
              <ArrowRight className="h-3 w-3 text-primary" />
              <span className="font-display text-sm font-bold">{l.d}</span>
            </div>
            <span className="font-mono-num text-sm font-bold text-primary">${l.r.toLocaleString()}</span>
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{l.t}</div>
        </div>
      ))}
    </div>
  );
}

/* ───────────── Zimbabwe SVG map ───────────── */

function ZimMap() {
  // simplified outline + city dots
  const cities = [
    { name: "Harare", x: 320, y: 180 },
    { name: "Bulawayo", x: 200, y: 280 },
    { name: "Mutare", x: 430, y: 220 },
    { name: "Chirundu", x: 250, y: 80 },
    { name: "Beitbridge", x: 280, y: 410 },
    { name: "Vic Falls", x: 100, y: 180 },
  ];
  const routes: Array<[number, number]> = [
    [0, 1], [0, 2], [0, 3], [0, 4], [1, 4], [1, 5], [3, 0],
  ];
  return (
    <svg viewBox="0 0 540 460" className="h-full w-full">
      <defs>
        <linearGradient id="route" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
          <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path
        d="M70 140 L120 70 L260 50 L380 70 L470 130 L490 220 L460 320 L380 400 L280 430 L180 410 L100 360 L60 280 Z"
        fill="var(--bg-secondary)" stroke="var(--primary)" strokeOpacity="0.35" strokeWidth="1.5"
      />
      {routes.map(([a, b], i) => (
        <line key={i} x1={cities[a].x} y1={cities[a].y} x2={cities[b].x} y2={cities[b].y}
              stroke="url(#route)" strokeWidth="2" strokeDasharray="5 5" />
      ))}
      {cities.map((c) => (
        <g key={c.name}>
          <circle cx={c.x} cy={c.y} r="14" fill="var(--primary)" fillOpacity="0.15" />
          <circle cx={c.x} cy={c.y} r="5" fill="var(--primary)" />
          <text x={c.x + 12} y={c.y + 4} fill="var(--foreground)" fontSize="13" fontFamily="Barlow Condensed" fontWeight="700">
            {c.name.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ───────────── page ───────────── */

function LandingPage() {
  const wrapRef = useReveal();

  return (
    <div ref={wrapRef}>
      <AnnouncementBar />
      <StickyLandingCta />

      {/* ============ HERO — Kinetic Horizon ============ */}
      <section className="relative kinetic-gradient overflow-hidden">
        {/* Real Zimbabwean highway/savannah at sunset */}
        <img
          src={heroBg}
          alt=""
          aria-hidden
          width={1920}
          height={1080}
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-70"
        />
        {/* Warm amber atmospheric glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] mix-blend-screen"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 80% 30%, rgba(253,175,0,0.25), transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(110,160,255,0.15), transparent 60%)",
          }}
        />
        {/* Navy gradient overlay — darker on the left for headline legibility */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#000a1e] via-[#000a1e]/80 to-[#000a1e]/30" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#000a1e]/70 via-transparent to-[#000a1e]/40" />

        <div className="relative z-20 mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-16 md:grid-cols-12 md:px-6 md:pb-32 md:pt-24">
          <div className="md:col-span-7 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-secondary backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Zimbabwe's #1 Digital Logistics Hub</span>
            </div>

            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tighter text-white md:text-7xl lg:text-[80px]">
              Zimbabwe's #1 <br />
              <span className="text-secondary">Load Board</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 md:text-xl">
              Connecting verified carriers with premium cargo across the SADC region.
              Move more, earn more, and scale your fleet with real-time intelligence.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-full bg-secondary px-10 py-6 text-base font-extrabold text-secondary-foreground shadow-2xl shadow-secondary/30 hover:bg-secondary/90">
                <Link to="/board">Find Loads <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 bg-transparent px-10 py-6 text-base font-extrabold text-white hover:bg-white/10 hover:text-white">
                <Link to="/post">Post Load</Link>
              </Button>
            </div>

            {/* Inline stat duo */}
            <div className="mt-12 grid max-w-md grid-cols-2 gap-8">
              <div>
                <div className="font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                  <CountUp to={2400} />+
                </div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Active Carriers</div>
              </div>
              <div>
                <div className="font-display text-4xl font-extrabold tracking-tight text-secondary md:text-5xl">
                  $<CountUp to={2.4} decimals={1} />M+
                </div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Monthly Payouts</div>
              </div>
            </div>
          </div>

          {/* Right rail — live load board glass card */}
          <div className="relative md:col-span-5 lg:col-span-5">
            <div className="relative z-10 rounded-2xl bg-white/95 p-5 shadow-2xl backdrop-blur md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-extrabold tracking-tight text-foreground">Live Load Board</h3>
                  <p className="text-xs text-muted-foreground">Real-time opportunities updating every 30 seconds</p>
                </div>
                <Link to="/board" className="text-xs font-bold text-secondary hover:underline">View All</Link>
              </div>
              <div className="mt-5 space-y-3">
                {FLOAT_LOADS.slice(0, 3).map((l, i) => (
                  <div key={i} className="relative overflow-hidden rounded-xl bg-[var(--bg-secondary)] p-4">
                    {i === 0 && <span className="absolute left-0 top-0 h-full w-1 bg-secondary" />}
                    <div className="flex items-center justify-between">
                      <div className="ml-2">
                        <div className="flex items-center gap-1.5 font-display text-sm font-bold text-foreground">
                          {l.o} <ArrowRight className="h-3 w-3 text-secondary" /> {l.d}
                        </div>
                        <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          {i === 0 ? "Urgent · in 2h" : l.t}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-lg font-extrabold tracking-tight text-foreground">
                          ${l.r.toLocaleString()}
                        </div>
                        <div className="text-[10px] font-medium text-muted-foreground">distance · {Math.round(l.r / 2.8)} km</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-5 w-full rounded-full bg-primary py-5 font-bold text-primary-foreground hover:bg-primary/90">
                <Link to="/board">Place Bid <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            {/* glow */}
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-secondary/20 blur-3xl" />
          </div>
        </div>
      </section>

      {/* ============ SOCIAL PROOF TICKER ============ */}
      <section className="overflow-hidden border-y border-border bg-card py-6">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
          {[...QUOTES, ...QUOTES].map((q, i) => (
            <div key={i} className="flex items-center gap-4 text-sm">
              <span className="text-foreground">"{q.text}"</span>
              <span className="text-muted-foreground">— {q.who}</span>
              <span className="font-display text-base font-bold uppercase tracking-wide text-primary">{q.co}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURES GRID ============ */}
      <section className="border-b border-border py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="reveal max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-widest text-primary">Features</span>
            <h2 className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
              Everything Zimbabwe's truckers actually need
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="reveal group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_0_40px_-10px_var(--primary)]"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-2xl">
                  {f.emoji}
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold uppercase tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <section className="border-b border-border bg-card py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="reveal flex flex-col items-center gap-2 text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-primary">Trusted across SADC</span>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
              Trusted by <span className="text-secondary">2,400+</span> carriers &amp; partners
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              From owner-operators to national fleets and SADC freight forwarders.
            </p>
          </div>

          <div className="reveal mt-10 grid grid-cols-2 items-center gap-x-8 gap-y-8 sm:grid-cols-3 md:grid-cols-6">
            {[
              { name: "Moyo Logistics", src: logoMoyo },
              { name: "Khumalo Transport", src: logoKhumalo },
              { name: "Sable Freight", src: logoSable },
              { name: "Zambezi Cargo", src: logoZambezi },
              { name: "Kopje Haulage", src: logoKopje },
              { name: "Limpopo Lines", src: logoLimpopo },
            ].map((p) => (
              <div
                key={p.name}
                className="group flex h-16 items-center justify-center rounded-lg border border-border bg-background px-4 transition-all hover:border-primary/40 hover:shadow-[0_0_30px_-12px_var(--primary)]"
                title={p.name}
              >
                <img
                  src={p.src}
                  alt={p.name}
                  loading="lazy"
                  width={140}
                  height={36}
                  className="h-9 w-auto opacity-60 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                />
              </div>
            ))}
          </div>

          <div className="reveal mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> ZIMRA-registered brokers</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> EcoCash &amp; USD payouts</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> 99.2% on-time delivery</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> SADC cross-border ready</span>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="border-b border-border bg-[var(--bg-secondary)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="reveal mx-auto max-w-2xl text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-primary">How it works</span>
            <h2 className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
              Up and running in 3 minutes
            </h2>
          </div>
          <div className="relative mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="reveal relative overflow-hidden rounded-xl border border-border bg-card p-8" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="pointer-events-none absolute -right-4 -top-8 font-display text-[120px] font-black leading-none text-primary opacity-[0.08]">
                  {i + 1}
                </span>
                <div className="relative">
                  <span className="font-mono text-xs uppercase tracking-widest text-primary">Step {i + 1}</span>
                  <h3 className="mt-2 font-display text-2xl font-black uppercase tracking-tight">{s.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-primary md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LIVE LOAD PREVIEW (paywall teaser) ============ */}
      <section className="border-b border-border py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="reveal flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-primary">
                <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-success align-middle" />
                Live right now
              </span>
              <h2 className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
                Sign up to see broker contacts
              </h2>
            </div>
          </div>

          <div className="reveal relative mt-8 overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-[var(--bg-secondary)] font-display text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Route</th>
                  <th className="hidden px-4 py-3 md:table-cell">Load</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Broker</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PREVIEW_LOADS.map((l, i) => (
                  <tr key={i} className="transition-colors hover:bg-background/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-base font-bold">{l.o}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-primary" />
                        <span className="font-display text-base font-bold">{l.d}</span>
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">{l.km} km</div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{l.t}</td>
                    <td className="px-4 py-3 font-mono-num font-bold text-primary">${l.r.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="select-none font-mono text-sm text-foreground blur-sm">+263 77 234 5678</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-card via-card/70 to-transparent">
              <div className="rounded-xl border border-primary/30 bg-card/95 px-6 py-5 text-center shadow-2xl">
                <Lock className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 font-display text-lg font-bold uppercase tracking-tight">Sign up free to unlock</p>
                <p className="mt-1 text-xs text-muted-foreground">847 live loads · broker WhatsApp · rate analytics</p>
                <Button asChild size="lg" className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold uppercase">
                  <Link to="/board">View 847 Live Loads <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICING TEASER ============ */}
      <section className="border-b border-border bg-[var(--bg-secondary)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="reveal mx-auto max-w-2xl text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-primary">Pricing</span>
            <h2 className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
              Start free. Upgrade when you're ready.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PLANS.map((p, i) => (
              <div
                key={p.name}
                className={`reveal relative rounded-xl border bg-card p-7 transition-transform duration-200 hover:scale-[1.02] ${
                  p.featured ? "border-primary shadow-[0_0_50px_-15px_var(--primary)]" : "border-border"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
                    Most Popular
                  </span>
                )}
                <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{p.name}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-black text-foreground">${p.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <ul className="mt-5 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/pricing">See all plans <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">
              💳 Pay with EcoCash · InnBucks · Visa · Bank Transfer
            </p>
          </div>
        </div>
      </section>

      {/* ============ ZIM ROUTE MAP ============ */}
      <section className="relative overflow-hidden border-b border-border py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:grid-cols-2 md:px-6">
          <div className="reveal">
            <span className="font-mono text-xs uppercase tracking-widest text-primary">Coverage</span>
            <h2 className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
              Covering every route in Zimbabwe
            </h2>
            <p className="mt-4 text-muted-foreground">
              From Vic Falls to Beitbridge, Mutare to Bulawayo. Every major freight corridor,
              every border crossing. One platform.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Harare", "Bulawayo", "Mutare", "Beitbridge", "Chirundu", "Vic Falls", "Plumtree"].map((c) => (
                <span key={c} className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs">
                  <MapPin className="h-3 w-3 text-primary" /> {c}
                </span>
              ))}
            </div>
            <Button asChild size="lg" className="mt-7 bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold uppercase">
              <Link to="/board">Start Finding Loads <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="reveal">
            <div className="rounded-2xl border border-border bg-card p-4">
              <ZimMap />
            </div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA — Kinetic panel ============ */}
      <section className="bg-background px-4 py-16 md:px-6 md:py-24">
        <div className="reveal mx-auto max-w-5xl overflow-hidden rounded-3xl kinetic-gradient p-10 text-center md:p-16">
          <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tighter text-white md:text-5xl">
            Ready to modernize <br /> your logistics?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/70 md:text-lg">
            Join the network of professional truckers and shippers streamlining
            Zimbabwe's supply chain.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-secondary px-8 py-6 font-extrabold text-secondary-foreground shadow-xl shadow-secondary/20 hover:bg-secondary/90">
              <Link to="/board">Create Carrier Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 bg-transparent px-8 py-6 font-extrabold text-white hover:bg-white/10 hover:text-white">
              <Link to="/post">Register as Shipper</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ───────────── small bits ───────────── */

function Stat({ value, label, pulse }: { value: React.ReactNode; label: string; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {pulse && <span className="h-2 w-2 animate-pulse rounded-full bg-success" />}
      <div>
        <div className="font-display text-2xl font-black text-foreground md:text-3xl">{value}</div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

/* ───────────── data ───────────── */

const QUOTES = [
  { text: "Finally a load board that works with EcoCash 🙌", who: "Tatenda M., Harare", co: "MOYO LOGISTICS" },
  { text: "Found 3 loads in my first hour. WhatsApp AI is 🔥", who: "Chamu K., Bulawayo", co: "KHUMALO TRANSPORT" },
  { text: "Beit Bridge tips alone saved me 2 hours at the border", who: "Simba D., Masvingo", co: "DUBE HAULAGE" },
  { text: "Best rates I've seen on the Harare–Joburg run", who: "Rumbi C., Harare", co: "CHIDZIVA FREIGHT" },
];

const FEATURES = [
  { emoji: "🚛", title: "800+ Daily Loads", desc: "Harare, Bulawayo, Mutare and all major corridors. Updated in real-time." },
  { emoji: "💰", title: "Rate Intelligence", desc: "Know the market rate per km before you negotiate. Never leave money on the table." },
  { emoji: "📱", title: "WhatsApp AI Dispatch", desc: "Our AI agent finds loads, checks border status, and quotes rates — all inside WhatsApp." },
  { emoji: "🛃", title: "ZIMRA Ready", desc: "Cross-border docs checklist, Beit Bridge wait times, and customs guidance built in." },
  { emoji: "📶", title: "Works Offline", desc: "Rural Zimbabwe has patchy signal. ZimFreight caches loads and works without internet." },
  { emoji: "✅", title: "Verified Brokers", desc: "Every broker is credit-checked. See days-to-payment and real ratings before you book." },
];

const STEPS = [
  { title: "Create your free account", desc: "Sign up with your phone number. No paperwork, no waiting." },
  { title: "Find or post loads", desc: "Search by route, load type, equipment. Contact brokers directly on WhatsApp." },
  { title: "Get paid, repeat", desc: "Track payments, build your rating, grow your business." },
];

const PREVIEW_LOADS = [
  { o: "Harare", d: "Beitbridge", km: 580, t: "Containers · 28t", r: 2100 },
  { o: "Bulawayo", d: "Plumtree", km: 100, t: "General · 15t", r: 420 },
  { o: "Mutare", d: "Harare", km: 263, t: "Tobacco · 22t", r: 680 },
  { o: "Harare", d: "Chirundu", km: 360, t: "Fuel · Tanker", r: 1450 },
  { o: "Bulawayo", d: "Vic Falls", km: 440, t: "Cement · 30t", r: 1180 },
];


const PLANS = [
  { name: "Free", price: 0, featured: false, features: ["Read-only access", "5 loads/day", "Basic search"] },
  { name: "Basic", price: 19, featured: true, features: ["Broker contacts", "Post loads", "WhatsApp alerts", "Rate analytics"] },
  { name: "Pro", price: 49, featured: false, features: ["Unlimited everything", "WhatsApp AI Agent", "Priority listing", "Rate forecasting"] },
];