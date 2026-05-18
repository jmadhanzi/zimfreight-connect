import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import {
  ArrowRight,
  Lock,
  MapPin,
  Check,
  ShieldCheck,
  Truck as TruckIcon,
  BarChart3,
  MessageCircle,
  Stamp,
  WifiOff,
  BadgeCheck,
} from "lucide-react";
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
      {
        name: "description",
        content:
          "Zimbabwe's smartest load board. 800+ daily loads, real-time rates, WhatsApp AI dispatch. From Harare to Beitbridge and beyond.",
      },
      { property: "og:title", content: "ZimFreight — Zimbabwe's #1 Truck Load Board" },
      {
        property: "og:description",
        content:
          "800+ daily loads. WhatsApp AI dispatch. EcoCash & USD payments. Built for Zimbabwean truckers.",
      },
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
      { threshold: 0.15 },
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, []);
  return ref;
}

function CountUp({
  to,
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
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
          const dur = 1400;
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
  return (
    <span ref={ref}>
      {prefix}
      {n.toLocaleString(undefined, {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
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
            <span className="font-mono-num text-sm font-bold text-primary">
              ${l.r.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {l.t}
          </div>
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
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 4],
    [1, 5],
    [3, 0],
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
        fill="var(--bg-secondary)"
        stroke="var(--primary)"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      {routes.map(([a, b], i) => (
        <line
          key={i}
          x1={cities[a].x}
          y1={cities[a].y}
          x2={cities[b].x}
          y2={cities[b].y}
          stroke="url(#route)"
          strokeWidth="2"
          strokeDasharray="5 5"
        />
      ))}
      {cities.map((c) => (
        <g key={c.name}>
          <circle cx={c.x} cy={c.y} r="14" fill="var(--primary)" fillOpacity="0.15" />
          <circle cx={c.x} cy={c.y} r="5" fill="var(--primary)" />
          <text
            x={c.x + 12}
            y={c.y + 4}
            fill="var(--foreground)"
            fontSize="13"
            fontFamily="Barlow Condensed"
            fontWeight="700"
          >
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
        {/* Warm copper-sunrise atmospheric glow — not generic blue */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] mix-blend-screen"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 75% 25%, oklch(0.68 0.135 52 / 0.30), transparent 50%), radial-gradient(ellipse at 20% 85%, oklch(0.50 0.185 148 / 0.12), transparent 55%)",
          }}
        />
        {/* Warm earth overlay — deeper warmth, not cold navy */}
        <div
          className="absolute inset-0 z-10"
          style={{ background: "linear-gradient(105deg, oklch(0.10 0.025 38 / 0.95) 0%, oklch(0.12 0.028 40 / 0.82) 45%, oklch(0.12 0.025 40 / 0.35) 100%)" }}
        />
        <div
          className="absolute inset-0 z-10"
          style={{ background: "linear-gradient(to top, oklch(0.10 0.025 38 / 0.75) 0%, transparent 40%, oklch(0.10 0.025 38 / 0.45) 100%)" }}
        />

        <div className="relative z-20 mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-16 md:grid-cols-12 md:px-6 md:pb-32 md:pt-24">
          <div className="md:col-span-7 lg:col-span-7">
            <div className="hero-badge">
              <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-white/85">
                Zimbabwe&rsquo;s #1 Digital Logistics Hub
              </span>
            </div>

            <h1 className="mt-7 font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.045em] text-white md:text-7xl lg:text-[88px]">
              Zimbabwe&rsquo;s #1
              <br />
              <span
                className="relative inline-block"
                style={{
                  background: "linear-gradient(135deg, oklch(0.88 0.012 68) 0%, oklch(0.76 0.158 72) 50%, oklch(0.68 0.135 52) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Load Board
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-2 left-0 right-0 h-2 rounded-full blur-md md:-bottom-3 md:h-3"
                  style={{ background: "linear-gradient(90deg, transparent, oklch(0.72 0.155 68 / 0.55), transparent)" }}
                />
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/75 md:text-xl">
              Connecting verified carriers with premium cargo across the SADC region. Move more,
              earn more, and scale your fleet with real-time intelligence.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full px-10 py-6 text-base font-extrabold text-secondary-foreground btn-amber-glow"
                style={{ background: "linear-gradient(145deg, var(--secondary), color-mix(in oklab, var(--secondary) 78%, var(--primary)))" }}
              >
                <Link
                  to="/board"
                  search={{
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
                    sort: "newest",
                    load: undefined,
                  }}
                >
                  Find Loads <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/20 bg-white/5 px-10 py-6 text-base font-extrabold text-white backdrop-blur transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
              >
                <Link to="/post">Post Load</Link>
              </Button>
            </div>

            {/* Inline stat duo */}
            <div className="mt-12 grid max-w-md grid-cols-2 gap-8">
              <div
                className="pl-4"
                style={{ borderLeft: "1.5px solid oklch(1 0 0 / 0.18)" }}
              >
                <div
                  className="font-display text-4xl font-extrabold tracking-[-0.04em] text-white md:text-5xl"
                  style={{ fontVariationSettings: '"wdth" 82' }}
                >
                  <CountUp to={2400} />+
                </div>
                <div className="mt-1.5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.24em] text-white/40">
                  Active Carriers
                </div>
              </div>
              <div
                className="pl-4"
                style={{ borderLeft: "1.5px solid oklch(0.72 0.155 68 / 0.45)" }}
              >
                <div
                  className="font-display text-4xl font-extrabold tracking-[-0.04em] md:text-5xl"
                  style={{
                    fontVariationSettings: '"wdth" 82',
                    background: "linear-gradient(135deg, oklch(0.88 0.012 68), oklch(0.76 0.158 72))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  $<CountUp to={2.4} decimals={1} />M+
                </div>
                <div className="mt-1.5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.24em] text-white/40">
                  Monthly Payouts
                </div>
              </div>
            </div>
          </div>

          {/* Right rail — live load board glass card */}
          <div className="relative md:col-span-5 lg:col-span-5">
            <div
              className="relative z-10 overflow-hidden rounded-2xl backdrop-blur"
              style={{
                background: "oklch(0.998 0.003 75 / 0.97)",
                boxShadow: "0 32px 80px -20px oklch(0.10 0.025 38 / 0.55), 0 0 0 1px oklch(1 0 0 / 0.12)",
              }}
            >
              {/* top gradient strip — copper-to-gold */}
              <span
                aria-hidden
                className="block h-[3px] w-full"
                style={{ background: "linear-gradient(90deg, var(--primary), var(--secondary), var(--primary))" }}
              />
              <div className="p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="dot-live" />
                      <h3 className="font-display text-xl font-extrabold tracking-tight text-foreground">
                        Live Load Board
                      </h3>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Real-time opportunities updating every 30 seconds
                    </p>
                  </div>
                  <Link
                    to="/board"
                    search={{
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
                      sort: "newest",
                      load: undefined,
                    }}
                    className="text-xs font-bold text-secondary hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="mt-5 space-y-2.5">
                  {FLOAT_LOADS.slice(0, 3).map((l, i) => (
                    <div
                      key={i}
                      className="relative overflow-hidden rounded-xl p-4 transition-colors"
                      style={{
                        background: i === 0
                          ? "color-mix(in oklab, var(--primary) 6%, var(--bg-secondary))"
                          : "var(--bg-secondary)",
                        border: i === 0
                          ? "1px solid color-mix(in oklab, var(--primary) 18%, transparent)"
                          : "1px solid transparent",
                      }}
                    >
                      {i === 0 && (
                        <span
                          className="absolute left-0 top-0 h-full w-[3px] rounded-l-xl"
                          style={{ background: "linear-gradient(180deg, var(--secondary), var(--primary))" }}
                        />
                      )}
                      <div className="flex items-center justify-between">
                        <div className="ml-2">
                          <div className="flex items-center gap-1.5 font-display text-sm font-bold text-foreground">
                            {l.o} <ArrowRight className="h-3 w-3 text-secondary" /> {l.d}
                          </div>
                          <div className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {i === 0 ? "Urgent · in 2h" : l.t}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-lg font-extrabold tracking-tight text-foreground">
                            ${l.r.toLocaleString()}
                          </div>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            ~{Math.round(l.r / 2.8)} km
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  asChild
                  className="mt-5 w-full rounded-full py-5 font-bold text-primary-foreground btn-primary-glow"
                  style={{ background: "linear-gradient(145deg, var(--primary), color-mix(in oklab, var(--primary) 72%, black))" }}
                >
                  <Link
                    to="/board"
                    search={{
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
                      sort: "newest",
                      load: undefined,
                    }}
                  >
                    Place Bid <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            {/* Warm copper glow behind card */}
            <div
              className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl"
              style={{ background: "radial-gradient(ellipse at 50% 50%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)" }}
            />
          </div>
        </div>
      </section>

      {/* ============ SOCIAL PROOF TICKER ============ */}
      <section
        className="overflow-hidden border-y py-5"
        style={{
          borderColor: "var(--color-border)",
          background: "linear-gradient(90deg, var(--color-bg-secondary) 0%, var(--color-card) 50%, var(--color-bg-secondary) 100%)",
        }}
      >
        <div className="flex w-max animate-marquee gap-16 whitespace-nowrap">
          {[...QUOTES, ...QUOTES].map((q, i) => (
            <div key={i} className="flex items-center gap-5 text-[0.875rem]">
              <span
                className="h-1 w-1 rounded-full flex-shrink-0"
                style={{ background: "var(--secondary)" }}
              />
              <span className="text-foreground/80 italic">&ldquo;{q.text}&rdquo;</span>
              <span className="text-muted-foreground text-[0.8125rem]">&mdash; {q.who}</span>
              <span
                className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.18em]"
                style={{ color: "var(--primary)" }}
              >
                {q.co}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURES GRID ============ */}
      <section className="border-b border-border py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="reveal max-w-3xl">
            <span className="section-kicker">Features</span>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
              Everything Zimbabwe&rsquo;s truckers{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, var(--secondary), var(--primary))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                actually
              </span>{" "}
              need
            </h2>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              const accentClass = ACCENT_TO_CLASSES[f.accent];
              return (
                <div
                  key={f.title}
                  className="reveal hover-lift group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-7 transition-colors hover:border-primary/20"
                  style={{
                    transitionDelay: `${i * 60}ms`,
                    boxShadow: "inset 0 1px 0 0 oklch(1 0 0 / 0.55)",
                  }}
                >
                  {/* corner accent — diagonal stripe */}
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60 ${accentClass.glow}`}
                  />
                  <div
                    className={`relative flex h-12 w-12 items-center justify-center rounded-xl ${accentClass.bg} ${accentClass.text}`}
                  >
                    <Icon className="h-5.5 w-5.5" strokeWidth={2.2} />
                    <span
                      aria-hidden
                      className={`absolute -inset-px rounded-xl border ${accentClass.ring}`}
                    />
                  </div>
                  <h3 className="mt-6 font-display text-xl font-extrabold tracking-tight md:text-2xl">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  {/* tiny corner mark — adds editorial feel */}
                  <span className="absolute right-5 top-5 font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/50">
                    0{i + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <section className="border-b border-border bg-card py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="reveal flex flex-col items-center gap-2 text-center">
            <span className="section-kicker">Trusted across SADC</span>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
              Trusted by{" "}
              <span className="text-secondary">
                <CountUp to={2400} suffix="+" />
              </span>{" "}
              carriers &amp; partners
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
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-success" /> ZIMRA-registered brokers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-success" /> EcoCash &amp; USD payouts
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-success" /> 99.2% on-time delivery
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-success" /> SADC cross-border ready
            </span>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="border-b border-border bg-[var(--bg-secondary)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="reveal mx-auto max-w-2xl text-center">
            <span className="section-kicker">How it works</span>
            <h2 className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
              Up and running in 3 minutes
            </h2>
          </div>
          <div className="relative mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className="reveal relative overflow-hidden rounded-xl border border-border bg-card p-8"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span className="pointer-events-none absolute -right-4 -top-8 font-display text-[120px] font-black leading-none text-primary opacity-[0.08]">
                  {i + 1}
                </span>
                <div className="relative">
                  <span className="section-kicker">Step {i + 1}</span>
                  <h3 className="mt-2 font-display text-2xl font-black uppercase tracking-tight">
                    {s.title}
                  </h3>
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
              <span className="section-kicker">
                <span className="dot-live -ml-1" />
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
                    <td className="px-4 py-3 font-mono-num font-bold text-primary">
                      ${l.r.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="select-none font-mono text-sm text-foreground blur-sm">
                        +263 77 234 5678
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-card via-card/70 to-transparent">
              <div className="rounded-xl border border-primary/30 bg-card/95 px-6 py-5 text-center shadow-2xl">
                <Lock className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 font-display text-lg font-bold uppercase tracking-tight">
                  Sign up free to unlock
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  847 live loads · broker WhatsApp · rate analytics
                </p>
                <Button
                  asChild
                  size="lg"
                  className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold uppercase"
                >
                  <Link
                    to="/board"
                    search={{
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
                      sort: "newest",
                      load: undefined,
                    }}
                  >
                    View 847 Live Loads <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
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
            <span className="section-kicker">Pricing</span>
            <h2 className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
              Start free. Upgrade when you're ready.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PLANS.map((p, i) => (
              <div
                key={p.name}
                className="reveal relative rounded-2xl p-7 transition-all duration-200 hover:scale-[1.02]"
                style={{
                  transitionDelay: `${i * 80}ms`,
                  background: p.featured
                    ? "linear-gradient(158deg, oklch(0.30 0.078 42) 0%, oklch(0.24 0.060 38) 100%)"
                    : "var(--color-card)",
                  border: p.featured
                    ? "1.5px solid color-mix(in oklab, var(--secondary) 35%, transparent)"
                    : "1px solid var(--color-border)",
                  boxShadow: p.featured
                    ? "0 0 0 1px color-mix(in oklab, var(--secondary) 15%, transparent), 0 8px 32px -8px color-mix(in oklab, var(--primary) 30%, transparent), inset 0 1px 0 oklch(1 0 0 / 0.08)"
                    : "inset 0 1px 0 oklch(1 0 0 / 0.55)",
                }}
              >
                {p.featured && (
                  <span
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.18em]"
                    style={{
                      background: "linear-gradient(135deg, var(--secondary), color-mix(in oklab, var(--secondary) 75%, var(--primary)))",
                      color: "var(--secondary-foreground)",
                      boxShadow: "0 4px 12px -2px color-mix(in oklab, var(--secondary) 45%, transparent)",
                    }}
                  >
                    Most Popular
                  </span>
                )}
                <div
                  className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.22em]"
                  style={{ color: p.featured ? "color-mix(in oklab, var(--secondary) 80%, white)" : "var(--color-muted-foreground)" }}
                >
                  {p.name}
                </div>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span
                    className="font-display text-5xl font-black tracking-[-0.04em]"
                    style={{
                      fontVariationSettings: '"wdth" 82',
                      color: p.featured ? "oklch(0.92 0.012 68)" : "var(--color-foreground)",
                    }}
                  >
                    ${p.price}
                  </span>
                  <span
                    className="text-[0.875rem]"
                    style={{ color: p.featured ? "oklch(0.92 0.012 68 / 0.55)" : "var(--color-muted-foreground)" }}
                  >
                    /month
                  </span>
                </div>
                {/* Divider */}
                <div
                  className="my-5 h-px"
                  style={{ background: p.featured ? "oklch(1 0 0 / 0.10)" : "var(--color-border)" }}
                />
                <ul className="space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[0.875rem]">
                      <span
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: p.featured
                            ? "color-mix(in oklab, var(--success) 22%, transparent)"
                            : "color-mix(in oklab, var(--success) 14%, transparent)",
                        }}
                      >
                        <Check
                          className="h-2.5 w-2.5"
                          style={{ color: "var(--success)" }}
                          strokeWidth={3}
                        />
                      </span>
                      <span style={{ color: p.featured ? "oklch(0.92 0.012 68 / 0.80)" : "var(--color-muted-foreground)" }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/pricing">
                See all plans <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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
            <span className="section-kicker">Coverage</span>
            <h2 className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
              Covering every route in Zimbabwe
            </h2>
            <p className="mt-4 text-muted-foreground">
              From Vic Falls to Beitbridge, Mutare to Bulawayo. Every major freight corridor, every
              border crossing. One platform.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Harare",
                "Bulawayo",
                "Mutare",
                "Beitbridge",
                "Chirundu",
                "Vic Falls",
                "Plumtree",
              ].map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs"
                >
                  <MapPin className="h-3 w-3 text-primary" /> {c}
                </span>
              ))}
            </div>
            <Button
              asChild
              size="lg"
              className="mt-7 bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold uppercase"
            >
              <Link
                to="/board"
                search={{
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
                  sort: "newest",
                  load: undefined,
                }}
              >
                Start Finding Loads <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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
        <div
          className="reveal mx-auto max-w-5xl overflow-hidden rounded-3xl p-10 text-center md:p-16 subtle-grain"
          style={{
            background: "linear-gradient(158deg, oklch(0.16 0.035 42) 0%, oklch(0.20 0.040 45) 40%, oklch(0.18 0.032 48) 100%)",
            boxShadow: "0 0 0 1px oklch(1 0 0 / 0.06), 0 32px 80px -20px oklch(0.10 0.025 38 / 0.50)",
          }}
        >
          {/* Warm copper glow top-right */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, oklch(0.68 0.135 52 / 0.20), transparent 70%)" }}
          />
          {/* Gold glow bottom-left */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, oklch(0.72 0.155 68 / 0.15), transparent 70%)" }}
          />
          <h2
            className="relative font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.035em] text-white md:text-5xl"
            style={{ fontVariationSettings: '"wdth" 86' }}
          >
            Ready to modernize <br /> your logistics?
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-base text-white/65 md:text-lg">
            Join the network of professional truckers and shippers streamlining Zimbabwe's supply
            chain.
          </p>
          <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 py-6 font-extrabold text-secondary-foreground btn-amber-glow"
              style={{ background: "linear-gradient(145deg, var(--secondary), color-mix(in oklab, var(--secondary) 78%, var(--primary)))" }}
            >
              <Link
                to="/board"
                search={{
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
                  sort: "newest",
                  load: undefined,
                }}
              >
                Create Carrier Account
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/20 bg-transparent px-8 py-6 font-extrabold text-white hover:bg-white/10 hover:text-white"
            >
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
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
}

/* ───────────── data ───────────── */

/** Accent color tokens for feature cards. Each set defines BG / text / ring / glow. */
const ACCENT_TO_CLASSES: Record<string, { bg: string; text: string; ring: string; glow: string }> =
  {
    primary: {
      bg: "bg-primary/10",
      text: "text-primary",
      ring: "border-primary/15",
      glow: "bg-primary/40",
    },
    secondary: {
      bg: "bg-secondary/15",
      text: "text-secondary",
      ring: "border-secondary/20",
      glow: "bg-secondary/40",
    },
    success: {
      bg: "bg-[color-mix(in_oklab,var(--success)_12%,transparent)]",
      text: "text-[color:var(--success)]",
      ring: "border-[color-mix(in_oklab,var(--success)_25%,transparent)]",
      glow: "bg-[color-mix(in_oklab,var(--success)_40%,transparent)]",
    },
    info: {
      bg: "bg-[color-mix(in_oklab,var(--info)_12%,transparent)]",
      text: "text-[color:var(--info)]",
      ring: "border-[color-mix(in_oklab,var(--info)_25%,transparent)]",
      glow: "bg-[color-mix(in_oklab,var(--info)_40%,transparent)]",
    },
  };

const QUOTES = [
  {
    text: "Finally a load board that works with EcoCash 🙌",
    who: "Tatenda M., Harare",
    co: "MOYO LOGISTICS",
  },
  {
    text: "Found 3 loads in my first hour. WhatsApp AI is 🔥",
    who: "Chamu K., Bulawayo",
    co: "KHUMALO TRANSPORT",
  },
  {
    text: "Beit Bridge tips alone saved me 2 hours at the border",
    who: "Simba D., Masvingo",
    co: "DUBE HAULAGE",
  },
  {
    text: "Best rates I've seen on the Harare–Joburg run",
    who: "Rumbi C., Harare",
    co: "CHIDZIVA FREIGHT",
  },
];

const FEATURES = [
  {
    icon: TruckIcon,
    accent: "primary",
    title: "800+ Daily Loads",
    desc: "Harare, Bulawayo, Mutare and all major corridors. Updated in real-time.",
  },
  {
    icon: BarChart3,
    accent: "secondary",
    title: "Rate Intelligence",
    desc: "Know the market rate per km before you negotiate. Never leave money on the table.",
  },
  {
    icon: MessageCircle,
    accent: "success",
    title: "WhatsApp AI Dispatch",
    desc: "Our AI agent finds loads, checks border status, and quotes rates — all inside WhatsApp.",
  },
  {
    icon: Stamp,
    accent: "primary",
    title: "ZIMRA Ready",
    desc: "Cross-border docs checklist, Beit Bridge wait times, and customs guidance built in.",
  },
  {
    icon: WifiOff,
    accent: "info",
    title: "Works Offline",
    desc: "Rural Zimbabwe has patchy signal. ZimFreight caches loads and works without internet.",
  },
  {
    icon: BadgeCheck,
    accent: "secondary",
    title: "Verified Brokers",
    desc: "Every broker is credit-checked. See days-to-payment and real ratings before you book.",
  },
] as const;

const STEPS = [
  {
    title: "Create your free account",
    desc: "Sign up with your phone number. No paperwork, no waiting.",
  },
  {
    title: "Find or post loads",
    desc: "Search by route, load type, equipment. Contact brokers directly on WhatsApp.",
  },
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
