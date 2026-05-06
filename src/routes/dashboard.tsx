import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Loader2,
  Lock,
  Truck,
  DollarSign,
  Route as RouteIcon,
  TrendingUp,
  Layers,
  MessageSquare,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Greeting } from "@/components/dashboard/Greeting";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RateTicker } from "@/components/dashboard/RateTicker";
import { RatePerformanceChart } from "@/components/dashboard/RatePerformanceChart";
import { TopRoutesChart } from "@/components/dashboard/TopRoutesChart";
import { CarrierBookings } from "@/components/dashboard/CarrierBookings";
import { SavedLoadsGrid } from "@/components/dashboard/SavedLoadsGrid";
import { BrokerLoadsTable } from "@/components/dashboard/BrokerLoadsTable";
import { IncomingBids } from "@/components/dashboard/IncomingBids";
import { RouteIntelligence } from "@/components/dashboard/RouteIntelligence";
import { BorderStatusGrid } from "@/components/dashboard/BorderStatusGrid";
import { RoutePopularityChart } from "@/components/dashboard/RoutePopularityChart";
import { ZwlChart } from "@/components/dashboard/ZwlChart";
import { ProfileCompletion } from "@/components/dashboard/ProfileCompletion";
import {
  useBorderStatus,
  useBrokerLoads,
  useBrokerStats,
  useCarrierBookings,
  useCarrierStats,
  useIncomingBids,
  useRouteRates,
  useSavedLoads,
  useSavedRoutes,
} from "@/hooks/useDashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ZimFreight" },
      {
        name: "description",
        content:
          "Your loads, bookings, rates and notifications — personalized for carriers and brokers.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, profile, subscription, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-black uppercase tracking-tight">
          Sign in to view your dashboard
        </h1>
        <Button asChild className="mt-6 bg-primary text-primary-foreground">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  const role = profile?.role ?? "carrier";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Greeting profile={profile} subscription={subscription} />
      <div className="mt-5">
        <QuickActions />
      </div>
      <div className="mt-4">
        <TickerSection />
      </div>

      <div className="mt-10 space-y-12">
        {role === "broker" || role === "owner" ? <BrokerSections /> : <CarrierSections />}
        <SharedSections />
        <ProfileCompletion profile={profile} />
      </div>
    </div>
  );
}

function TickerSection() {
  const rates = useRouteRates(8);
  return <RateTicker rates={rates} />;
}

function CarrierSections() {
  const stats = useCarrierStats();
  const { bookings, refresh } = useCarrierBookings();
  const { items: saved } = useSavedLoads();
  const completed = bookings.filter((b) => b.status === "delivered" || b.status === "paid");
  const market = 2.84;
  const rateLabel =
    stats && stats.avg_rate_per_km > 0
      ? stats.avg_rate_per_km >= market
        ? `vs $${market} · Above ▲`
        : `vs $${market} · Below ▼`
      : `Market avg $${market}`;

  return (
    <section className="space-y-8">
      <div>
        <span className="section-kicker">Carrier overview</span>
        <h2 className="mt-2 font-display text-2xl font-black tracking-[-0.035em]">
          Your activity — last 30 days
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <StatsCard
          label="Loads booked"
          value={String(stats?.loads_booked ?? 0)}
          sub="this month"
          icon={Truck}
          accent="gold"
        />
        <StatsCard
          label="Est. revenue"
          value={`$${Number(stats?.est_revenue ?? 0).toLocaleString()}`}
          sub="USD"
          icon={DollarSign}
          accent="gold"
        />
        <StatsCard
          label="Km driven"
          value={`${Number(stats?.km_driven ?? 0).toLocaleString()} km`}
          icon={RouteIcon}
          accent="blue"
        />
        <StatsCard
          label="Avg rate / km"
          value={`$${Number(stats?.avg_rate_per_km ?? 0).toFixed(2)}`}
          sub={rateLabel}
          icon={TrendingUp}
          accent="green"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card p-5 lg:col-span-2">
          <h3 className="font-display text-lg font-bold tracking-[-0.02em]">
            Your rate vs market avg — last 30 days
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Gold = your earned $/km · Blue dashed = market average
          </p>
          <div className="mt-3">
            <RatePerformanceChart bookings={completed} marketAvg={market} />
          </div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-5">
          <h3 className="font-display text-lg font-bold tracking-[-0.02em]">Top routes</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Your 5 most-run corridors</p>
          <div className="mt-3">
            <TopRoutesChart bookings={completed} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-bold tracking-[-0.025em]">Active bookings</h3>
        <div className="mt-3">
          <CarrierBookings bookings={bookings} onChange={refresh} />
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-bold tracking-[-0.025em]">Saved loads</h3>
        <div className="mt-3">
          <SavedLoadsGrid items={saved} />
        </div>
      </div>
    </section>
  );
}

function BrokerSections() {
  const stats = useBrokerStats();
  const { loads, refresh } = useBrokerLoads();
  const { bids, refresh: refreshBids } = useIncomingBids();

  return (
    <section className="space-y-8">
      <div>
        <span className="section-kicker">Broker overview</span>
        <h2 className="mt-2 font-display text-2xl font-black tracking-[-0.035em]">
          Your posted loads
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <StatsCard
          label="Active loads"
          value={String(stats?.active_loads ?? 0)}
          sub="live now"
          icon={Layers}
          accent="gold"
        />
        <StatsCard
          label="Bids received"
          value={String(stats?.bids_received ?? 0)}
          sub="this month"
          icon={MessageSquare}
          accent="blue"
        />
        <StatsCard
          label="Loads filled"
          value={`${stats?.loads_filled ?? 0}`}
          sub={`${stats?.fill_rate ?? 0}% fill rate`}
          icon={CheckCircle2}
          accent="green"
        />
        <StatsCard
          label="Avg time to fill"
          value={`${stats?.avg_hours_to_fill ?? 0}h`}
          sub="from posting"
          icon={Clock}
          accent="red"
        />
      </div>

      <div>
        <BrokerLoadsTable loads={loads} onChange={refresh} />
      </div>

      <div>
        <h3 className="font-display text-xl font-bold tracking-[-0.025em]">
          Incoming booking requests
        </h3>
        <div className="mt-3">
          <IncomingBids
            bids={bids}
            onChange={() => {
              refreshBids();
              refresh();
            }}
          />
        </div>
      </div>
    </section>
  );
}

function SharedSections() {
  const saved = useSavedRoutes();
  const rates = useRouteRates(20);
  const borders = useBorderStatus();

  return (
    <>
      <section id="rates">
        <span className="section-kicker">Rate intelligence</span>
        <h2 className="mt-2 font-display text-2xl font-black tracking-[-0.035em]">
          Market rates — your routes
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Live $/km from the load board, with 7-day movement and a 30-day trend sparkline.
        </p>
        <div className="mt-4">
          <RouteIntelligence saved={saved} allRates={rates} />
        </div>
      </section>

      <section>
        <span className="section-kicker">Border intelligence</span>
        <h2 className="mt-2 font-display text-2xl font-black tracking-[-0.035em]">
          Border crossing status
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Live wait times at Zimbabwe’s main crossings — updated every 30 minutes.
        </p>
        <div className="mt-4">
          <BorderStatusGrid borders={borders} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card p-5 lg:col-span-2">
          <h3 className="font-display text-lg font-bold tracking-[-0.02em]">
            Route popularity — this week
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Top 8 routes by load volume</p>
          <div className="mt-3">
            <RoutePopularityChart rates={rates} />
          </div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-5">
          <h3 className="font-display text-lg font-bold tracking-[-0.02em]">
            ZWL / USD — last 30 days
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Official RBZ interbank rate</p>
          <ZwlChart />
        </div>
      </section>
    </>
  );
}
