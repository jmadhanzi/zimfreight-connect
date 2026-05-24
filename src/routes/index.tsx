import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Truck as TruckIcon,
  BarChart3,
  MessageCircle,
  Stamp,
  WifiOff,
  BadgeCheck,
  MapPin,
  Zap,
  ChevronRight,
} from "lucide-react";
import { StickyLandingCta } from "@/components/conversion/StickyLandingCta";
import heroBg from "@/assets/hero-zim-highway.jpg";
import logoMoyo from "@/assets/partners/moyo.svg?url";
import logoKhumalo from "@/assets/partners/khumalo.svg?url";
import logoSable from "@/assets/partners/sable.svg?url";
import logoZambezi from "@/assets/partners/zambezi.svg?url";
import logoKopje from "@/assets/partners/kopje.svg?url";
import logoLimpopo from "@/assets/partners/limpopo.svg?url";

const BOARD_SEARCH = {
  q: "",
  origin: "all" as const,
  destination: "all" as const,
  loadType: "all" as const,
  equipment: "all" as const,
  pickup: "",
  minRate: 0,
  maxDistance: 2000,
  border: false,
  zimra: false,
  urgent: false,
  minWeight: 0,
  maxWeight: 40,
  payment: "all" as const,
  sort: "newest" as const,
  load: undefined as string | undefined,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZimFreight — Find Freight. Fill Your Truck. Get Paid." },
      {
        name: "description",
        content:
          "Zimbabwe's smartest load board. 800+ daily loads, real-time rates, WhatsApp AI dispatch. From Harare to Beitbridge and beyond.",
      },
    ],
  }),
  component: LandingPage,
});

function useCountUp(to: number, decimals = 0) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const start = performance.now();
          const dur = 1200;
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / dur);
            setN(to * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return { ref, value: n.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) };
}

const FEATURES = [
  {
    icon: TruckIcon,
    title: "800+ Daily Loads",
    desc: "Harare, Bulawayo, Mutare and all major corridors. Updated in real-time.",
    tag: "Load Board",
  },
  {
    icon: BarChart3,
    title: "Rate Intelligence",
    desc: "Know the market rate per km before you negotiate. Never leave money on the table.",
    tag: "Analytics",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp AI Dispatch",
    desc: "Our AI agent finds loads, checks border status, and quotes rates — all inside WhatsApp.",
    tag: "AI",
  },
  {
    icon: Stamp,
    title: "ZIMRA Ready",
    desc: "Cross-border docs checklist, Beit Bridge wait times, and customs guidance built in.",
    tag: "Compliance",
  },
  {
    icon: WifiOff,
    title: "Works Offline",
    desc: "Rural Zimbabwe has patchy signal. ZimFreight caches loads and works without internet.",
    tag: "Offline",
  },
  {
    icon: BadgeCheck,
    title: "Verified Brokers",
    desc: "Every broker is credit-checked. See days-to-payment and real ratings before you book.",
    tag: "Trust",
  },
] as const;

const STEPS = [
  {
    step: "01",
    title: "Create your free account",
    desc: "Sign up with your phone number. No paperwork, no waiting.",
  },
  {
    step: "02",
    title: "Find or post loads",
    desc: "Search by route, load type, equipment. Contact brokers directly on WhatsApp.",
  },
  {
    step: "03",
    title: "Get paid, repeat",
    desc: "Track payments, build your rating, grow your business.",
  },
];

const PREVIEW_LOADS = [
  { o: "Harare", d: "Beitbridge", km: 580, t: "Containers · 28t", r: 2100 },
  { o: "Bulawayo", d: "Plumtree", km: 100, t: "General · 15t", r: 420 },
  { o: "Mutare", d: "Harare", km: 263, t: "Tobacco · 22t", r: 680 },
  { o: "Harare", d: "Chirundu", km: 360, t: "Fuel · Tanker", r: 1450 },
  { o: "Bulawayo", d: "Vic Falls", km: 440, t: "Cement · 30t", r: 1180 },
];

const PLANS = [
  {
    name: "Free",
    price: 0,
    featured: false,
    features: ["Read-only access", "5 loads/day", "Basic search"],
  },
  {
    name: "Basic",
    price: 19,
    featured: true,
    features: ["Broker contacts", "Post loads", "WhatsApp alerts", "Rate analytics"],
  },
  {
    name: "Pro",
    price: 49,
    featured: false,
    features: ["Unlimited everything", "WhatsApp AI Agent", "Priority listing", "Rate forecasting"],
  },
];

const TESTIMONIALS = [
  {
    text: "Finally a load board that works with EcoCash. Found 3 loads in my first hour.",
    who: "Tatenda M.",
    role: "Carrier · Harare",
    company: "Moyo Logistics",
  },
  {
    text: "WhatsApp AI is a game changer. Beit Bridge tips alone saved me 2 hours at the border.",
    who: "Simba D.",
    role: "Carrier · Masvingo",
    company: "Dube Haulage",
  },
  {
    text: "Best rates I've seen on the Harare–Joburg run. The rate intelligence tool is incredible.",
    who: "Rumbi C.",
    role: "Broker · Harare",
    company: "Chidziva Freight",
  },
];

const PARTNER_LOGOS = [
  { src: logoMoyo, alt: "Moyo Logistics" },
  { src: logoKhumalo, alt: "Khumalo Transport" },
  { src: logoSable, alt: "Sable Freight" },
  { src: logoZambezi, alt: "Zambezi Haulage" },
  { src: logoKopje, alt: "Kopje Carriers" },
  { src: logoLimpopo, alt: "Limpopo Logistics" },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <StickyLandingCta />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Background image */}
        <img
          src={heroBg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-foreground/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/40 to-transparent" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:px-6 md:py-28">
          {/* Left column */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-3 py-1 text-xs font-medium text-background/80 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)]" />
              Zimbabwe's #1 Digital Logistics Hub
            </div>

            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-background md:text-6xl lg:text-7xl">
              Find Freight.
              <br />
              Fill Your Truck.
              <br />
              <span className="text-background/60">Get Paid.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-background/70 md:text-lg">
              Connecting verified carriers with premium cargo across Zimbabwe and the SADC region.
              Real-time loads, transparent rates, and AI-powered dispatch.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
                <Link to="/board" search={BOARD_SEARCH}>
                  Browse Loads
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background hover:border-background/40"
              >
                <Link to="/post">Post a Load</Link>
              </Button>
            </div>

            {/* Stats row */}
            <div className="mt-10 flex gap-8 border-t border-background/15 pt-8">
              {[
                { value: "2,400+", label: "Active Carriers" },
                { value: "800+", label: "Daily Loads" },
                { value: "98%", label: "On-time Payment" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-display text-2xl font-bold text-background">{s.value}</div>
                  <div className="mt-0.5 text-xs text-background/50">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — live loads preview */}
          <div className="hidden md:block">
            <div className="rounded-xl border border-background/15 bg-background/10 p-4 backdrop-blur-md">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[color:var(--success)]" />
                  <span className="text-xs font-medium text-background/70">Live Load Board</span>
                </div>
                <span className="text-xs text-background/40">Updated just now</span>
              </div>
              <div className="space-y-2">
                {PREVIEW_LOADS.map((l, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-background/10 bg-background/10 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-background/15">
                        <TruckIcon className="h-3.5 w-3.5 text-background/70" strokeWidth={2} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-background">
                          {l.o} → {l.d}
                        </div>
                        <div className="text-[10px] text-background/50">{l.t}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-background">${l.r}</div>
                      <div className="text-[10px] text-background/50">{l.km} km</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild size="sm" className="mt-3 w-full bg-background/20 text-background hover:bg-background/30 border-0">
                <Link to="/board" search={BOARD_SEARCH}>
                  View all loads
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ─────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-muted/30 py-4">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <span className="text-xs font-medium text-muted-foreground">Trusted by</span>
            {PARTNER_LOGOS.map((logo) => (
              <img
                key={logo.alt}
                src={logo.src}
                alt={logo.alt}
                className="h-5 opacity-40 grayscale transition-opacity hover:opacity-70"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="max-w-2xl">
            <div className="section-kicker">Features</div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Everything Zimbabwe's truckers actually need
            </h2>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              Built from the ground up for the realities of freight in Zimbabwe — offline-first, EcoCash-ready, and WhatsApp-native.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group relative rounded-lg border border-border bg-card p-6 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground">
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="border-b border-border py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="section-kicker">How it works</div>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Up and running in minutes
              </h2>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                No complicated setup. No paperwork. Just sign up, find loads, and start earning.
              </p>

              <div className="mt-8 space-y-6">
                {STEPS.map((s, i) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-bold text-muted-foreground">
                      {s.step}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{s.title}</div>
                      <div className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button asChild>
                  <Link to="/board" search={BOARD_SEARCH}>
                    Get started free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Live load table preview */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[color:var(--success)]" />
                  <span className="text-sm font-medium">Available Loads</span>
                </div>
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
              <div className="divide-y divide-border">
                {PREVIEW_LOADS.map((l, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{l.o} → {l.d}</div>
                        <div className="text-xs text-muted-foreground">{l.t}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">${l.r}</div>
                      <div className="text-xs text-muted-foreground">{l.km} km</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border px-4 py-3">
                <Link
                  to="/board"
                  search={BOARD_SEARCH}
                  className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all 800+ loads
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-muted/20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="section-kicker text-center">Testimonials</div>
          <h2 className="mt-3 text-center font-display text-3xl font-bold tracking-tight md:text-4xl">
            Trusted by Zimbabwe's best carriers
          </h2>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.who} className="rounded-lg border border-border bg-card p-6">
                <p className="text-sm leading-relaxed text-foreground">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    {t.who[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.who}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────────────────── */}
      <section className="border-b border-border py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center">
            <div className="section-kicker">Pricing</div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Start free. Upgrade when you're ready.
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              No credit card required. Cancel anytime.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-lg border p-6 ${
                  p.featured
                    ? "border-foreground bg-foreground text-background shadow-lg"
                    : "border-border bg-card"
                }`}
              >
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className={`text-xs font-semibold uppercase tracking-wider ${p.featured ? "text-background/60" : "text-muted-foreground"}`}>
                  {p.name}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className={`font-display text-4xl font-bold tracking-tight ${p.featured ? "text-background" : "text-foreground"}`}>
                    ${p.price}
                  </span>
                  <span className={`text-sm ${p.featured ? "text-background/50" : "text-muted-foreground"}`}>/month</span>
                </div>
                <div className={`my-4 h-px ${p.featured ? "bg-background/15" : "bg-border"}`} />
                <ul className="space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className={`h-4 w-4 shrink-0 ${p.featured ? "text-background/70" : "text-[color:var(--success)]"}`} strokeWidth={2.5} />
                      <span className={p.featured ? "text-background/80" : "text-muted-foreground"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`mt-6 w-full ${p.featured ? "bg-background text-foreground hover:bg-background/90" : ""}`}
                  variant={p.featured ? "default" : "outline"}
                >
                  <Link to="/pricing">
                    {p.price === 0 ? "Get started free" : "Start " + p.name}
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Pay with EcoCash · InnBucks · Visa · Bank Transfer
          </p>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Zap className="h-3 w-3" />
            Free to get started
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Ready to move more freight?
          </h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            Join 2,400+ carriers and brokers already using ZimFreight to find loads, track rates, and grow their business.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link to="/board" search={BOARD_SEARCH}>
                Browse loads now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/post">Register as Shipper</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
