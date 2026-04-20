import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LoadCard } from "@/components/loads/LoadCard";
import { Button } from "@/components/ui/button";
import { Truck, DollarSign, Activity, MapPin, Lock } from "lucide-react";
import type { Load, RouteRate } from "@/types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ZimFreight" },
      { name: "description", content: "Your loads, bookings and route insights." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, profile, subscription, loading } = useAuth();
  const [myLoads, setMyLoads] = useState<Load[]>([]);
  const [rates, setRates] = useState<RouteRate[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("loads").select("*").eq("poster_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setMyLoads((data ?? []) as Load[]));
    supabase.from("route_rates").select("*").order("weekly_loads", { ascending: false }).limit(8)
      .then(({ data }) => setRates((data ?? []) as RouteRate[]));
  }, [user]);

  if (loading) return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-muted-foreground">Loading…</div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary"><Lock className="h-5 w-5" /></div>
        <h1 className="mt-4 font-display text-3xl font-black uppercase tracking-tight">Sign in to view dashboard</h1>
        <Button asChild className="mt-6 bg-primary text-primary-foreground"><Link to="/">Back to home</Link></Button>
      </div>
    );
  }

  const totalRate = myLoads.reduce((s, l) => s + Number(l.rate_usd || 0), 0);
  const active = myLoads.filter(l => l.status === "available").length;

  const chartData = rates.map(r => ({
    route: `${r.origin.slice(0,3).toUpperCase()}→${r.destination.slice(0,3).toUpperCase()}`,
    rate: Number(r.avg_rate_per_km),
    loads: r.weekly_loads,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            {profile?.role?.toUpperCase() || "USER"} · Plan: {subscription?.plan?.toUpperCase() || "FREE"}
          </span>
          <h1 className="mt-1 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            Welcome, {profile?.full_name?.split(" ")[0] ?? "driver"}
          </h1>
        </div>
        <Button asChild className="bg-primary text-primary-foreground"><Link to="/post">Post a load</Link></Button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <StatsCard label="My loads" value={String(myLoads.length)} sub={`${active} active`} icon={Truck} accent="gold" />
        <StatsCard label="Posted value" value={`$${totalRate.toLocaleString()}`} sub="Total USD" icon={DollarSign} accent="green" />
        <StatsCard label="Plan" value={subscription?.plan?.toUpperCase() ?? "FREE"} sub={subscription?.status ?? "active"} icon={Activity} accent="blue" />
        <StatsCard label="Rating" value={profile ? Number(profile.rating).toFixed(1) : "—"} sub={`${profile?.total_loads ?? 0} loads done`} icon={MapPin} accent="red" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">Top corridor rates ($/km)</h2>
          <p className="text-xs text-muted-foreground">Average rates across the busiest Zimbabwe routes this week.</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="route" stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }} />
                <Bar dataKey="rate" fill="var(--primary)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">Weekly loads</h2>
          <ul className="mt-3 divide-y divide-border">
            {rates.map(r => (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <span>{r.origin} → {r.destination}</span>
                <span className="font-mono-num text-primary">{r.weekly_loads}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-2xl font-black uppercase tracking-tight">My posted loads</h2>
        {myLoads.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
            You haven't posted any loads yet. <Link to="/post" className="text-primary hover:underline">Post your first load →</Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {myLoads.map(l => <LoadCard key={l.id} load={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}
