import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Loader2,
  Lock,
  Truck,
  DollarSign,
  Star,
  TrendingUp,
  Route as RouteIcon,
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
import { SavedCarriersWidget } from "@/components/dashboard/SavedCarriersWidget";
import { RecurringLoadsWidget } from "@/components/dashboard/RecurringLoadsWidget";
import { LocationShareWidget } from "@/components/dashboard/LocationShareWidget";
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
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
        <h1 className="mt-4 font-display text-xl font-bold tracking-tight">
          Sign in to view your dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your personalized freight command center awaits.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  const role = profile?.role ?? "carrier";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <Greeting profile={profile} subscription={subscription} />

      <div className="mt-5">
        <QuickActions />
      </div>

      <div className="mt-5">
        <TickerSection />
      </div>

      <div className="mt-8 space-y-10">
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
        ? `vs $${market} · Above ↑`
        : `vs $${market} · Below ↓`
      : `Market avg $${market}`;

  return (
    <section className="space-y-6">
      <div>
        <div className="section-kicker">Carrier overview</div>
        <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight">
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
          label="Avg rate/km"
          value={stats?.avg_rate_per_km ? `$${stats.avg_rate_per_km.toFixed(2)}` : "—"}
          sub={rateLabel}
          icon={TrendingUp}
          accent="blue"
          trend={
            stats?.avg_rate_per_km
              ? {
                  value: rateLabel,
                  direction: stats.avg_rate_per_km >= market ? "up" : "down",
                }
              : undefined
          }
        />
        <StatsCard
          label="Completed"
          value={String(completed.length)}
          sub="deliveries"
          icon={CheckCircle2}
          accent="green"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CarrierBookings bookings={bookings} onRefresh={refresh} />
        <SavedLoadsGrid items={saved} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RecurringLoadsWidget />
        <LocationShareWidget />
      </div>
    </section>
  );
}

function BrokerSections() {
  const stats = useBrokerStats();
  const { loads, refresh } = useBrokerLoads();
  const { bids } = useIncomingBids();
  const pending = loads.filter((l) => l.status === "available").length;

  return (
    <section className="space-y-6">
      <div>
        <div className="section-kicker">Broker overview</div>
        <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight">
          Your activity — last 30 days
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <StatsCard
          label="Active loads"
          value={String(stats?.active_loads ?? 0)}
          sub="on the board"
          icon={Layers}
          accent="blue"
        />
        <StatsCard
          label="Total bids"
          value={String(stats?.total_bids ?? 0)}
          sub="received"
          icon={MessageSquare}
          accent="gold"
        />
        <StatsCard
          label="Avg fill time"
          value={stats?.avg_fill_hours ? `${stats.avg_fill_hours}h` : "—"}
          sub="hours to fill"
          icon={Clock}
          accent="neutral"
        />
        <StatsCard
          label="Pending"
          value={String(pending)}
          sub="awaiting carrier"
          icon={RouteIcon}
          accent="red"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BrokerLoadsTable loads={loads} onRefresh={refresh} />
        <IncomingBids bids={bids} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SavedCarriersWidget />
        <RecurringLoadsWidget />
      </div>
    </section>
  );
}

function SharedSections() {
  const { routes } = useSavedRoutes();
  const { statuses } = useBorderStatus();

  return (
    <section className="space-y-6">
      <div>
        <div className="section-kicker">Market intelligence</div>
        <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight">
          Rates, routes & border status
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RatePerformanceChart />
        <TopRoutesChart />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RouteIntelligence routes={routes} />
        <BorderStatusGrid statuses={statuses} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RoutePopularityChart />
        <ZwlChart />
      </div>
    </section>
  );
}
