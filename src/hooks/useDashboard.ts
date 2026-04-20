import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import type { BorderStatus, Load, RouteRate } from "@/types";

export interface CarrierStats {
  loads_booked: number;
  est_revenue: number;
  km_driven: number;
  avg_rate_per_km: number;
}
export interface BrokerStats {
  active_loads: number;
  bids_received: number;
  loads_filled: number;
  fill_rate: number;
  avg_hours_to_fill: number;
}
export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}
export interface SavedRoute {
  id: string;
  origin: string;
  destination: string;
}
export interface BookingRow {
  id: string;
  load_id: string;
  carrier_id: string;
  status: string;
  rate_usd: number | null;
  distance_km: number | null;
  created_at: string;
  delivered_at: string | null;
  paid_at: string | null;
  loads?: Load;
}

export function useCarrierStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CarrierStats | null>(null);
  useEffect(() => {
    if (!user) return;
    db.rpc("carrier_dashboard_stats", { _user_id: user.id }).then(({ data }: { data: CarrierStats[] | null }) => {
      setStats((data && data[0]) || { loads_booked: 0, est_revenue: 0, km_driven: 0, avg_rate_per_km: 0 });
    });
  }, [user]);
  return stats;
}

export function useBrokerStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<BrokerStats | null>(null);
  useEffect(() => {
    if (!user) return;
    db.rpc("broker_dashboard_stats", { _user_id: user.id }).then(({ data }: { data: BrokerStats[] | null }) => {
      setStats((data && data[0]) || { active_loads: 0, bids_received: 0, loads_filled: 0, fill_rate: 0, avg_hours_to_fill: 0 });
    });
  }, [user]);
  return stats;
}

export function useNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationRow[]>([]);

  const refresh = async () => {
    if (!user) return;
    const { data } = await db.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    setItems((data ?? []) as NotificationRow[]);
  };

  useEffect(() => {
    if (!user) return;
    refresh();
    const channel = supabase
      .channel("notifications-feed")
      .on("postgres_changes" as never, { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await db.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
    refresh();
  };

  const markRead = async (id: string) => {
    await db.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    refresh();
  };

  const unread = items.filter((n) => !n.read_at).length;
  return { items, unread, markAllRead, markRead, refresh };
}

export function useBorderStatus() {
  const [borders, setBorders] = useState<BorderStatus[]>([]);
  useEffect(() => {
    db.from("border_status").select("*").order("border_name").then(({ data }: { data: BorderStatus[] | null }) => setBorders((data ?? []) as BorderStatus[]));
  }, []);
  return borders;
}

export function useRouteRates(limit = 8) {
  const [rates, setRates] = useState<RouteRate[]>([]);
  useEffect(() => {
    db.from("route_rates").select("*").order("weekly_loads", { ascending: false }).limit(limit)
      .then(({ data }: { data: RouteRate[] | null }) => setRates((data ?? []) as RouteRate[]));
  }, [limit]);
  return rates;
}

export function useSavedRoutes() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  useEffect(() => {
    if (!user) return;
    db.from("saved_routes").select("id,origin,destination").eq("user_id", user.id)
      .then(({ data }: { data: SavedRoute[] | null }) => setRoutes((data ?? []) as SavedRoute[]));
  }, [user]);
  return routes;
}

export function useCarrierBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const refresh = async () => {
    if (!user) return;
    const { data } = await db.from("bookings")
      .select("*, loads(*)")
      .eq("carrier_id", user.id)
      .order("created_at", { ascending: false });
    setBookings((data ?? []) as BookingRow[]);
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);
  return { bookings, refresh };
}

export function useSavedLoads() {
  const { user } = useAuth();
  const [items, setItems] = useState<Load[]>([]);
  const refresh = async () => {
    if (!user) return;
    const { data } = await db.from("saved_loads").select("loads(*)").eq("user_id", user.id);
    setItems(((data ?? []) as { loads: Load }[]).map((r) => r.loads).filter(Boolean));
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);
  return { items, refresh };
}

export function useBrokerLoads() {
  const { user } = useAuth();
  const [loads, setLoads] = useState<(Load & { bid_count: number; view_count: number })[]>([]);
  const refresh = async () => {
    if (!user) return;
    const { data: ls } = await db.from("loads").select("*").eq("poster_id", user.id).order("created_at", { ascending: false });
    const list = (ls ?? []) as Load[];
    if (list.length === 0) { setLoads([]); return; }
    const ids = list.map((l) => l.id);
    const [{ data: bids }, { data: views }] = await Promise.all([
      db.from("bookings").select("load_id").in("load_id", ids),
      db.from("load_views").select("load_id").in("load_id", ids),
    ]);
    const bidMap = new Map<string, number>();
    const viewMap = new Map<string, number>();
    ((bids ?? []) as { load_id: string }[]).forEach((b) => bidMap.set(b.load_id, (bidMap.get(b.load_id) ?? 0) + 1));
    ((views ?? []) as { load_id: string }[]).forEach((v) => viewMap.set(v.load_id, (viewMap.get(v.load_id) ?? 0) + 1));
    setLoads(list.map((l) => ({ ...l, bid_count: bidMap.get(l.id) ?? 0, view_count: viewMap.get(l.id) ?? 0 })));
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);
  return { loads, refresh };
}

export function useIncomingBids() {
  const { user } = useAuth();
  const [bids, setBids] = useState<(BookingRow & { carrier_profile?: { full_name: string; rating: number; phone_whatsapp: string | null } })[]>([]);
  const refresh = async () => {
    if (!user) return;
    // Loads I posted
    const { data: ls } = await db.from("loads").select("id").eq("poster_id", user.id);
    const loadIds = ((ls ?? []) as { id: string }[]).map((l) => l.id);
    if (loadIds.length === 0) { setBids([]); return; }
    const { data: bs } = await db.from("bookings")
      .select("*, loads(*)")
      .in("load_id", loadIds)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    const list = (bs ?? []) as BookingRow[];
    if (list.length === 0) { setBids([]); return; }
    const carrierIds = [...new Set(list.map((b) => b.carrier_id))];
    const { data: profs } = await db.from("profiles").select("user_id,full_name,rating,phone_whatsapp").in("user_id", carrierIds);
    const profMap = new Map<string, { full_name: string; rating: number; phone_whatsapp: string | null }>();
    ((profs ?? []) as { user_id: string; full_name: string; rating: number; phone_whatsapp: string | null }[]).forEach((p) => profMap.set(p.user_id, p));
    setBids(list.map((b) => ({ ...b, carrier_profile: profMap.get(b.carrier_id) })));
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);
  return { bids, refresh };
}

export function profileCompletion(profile: {
  full_name?: string | null; company_name?: string | null; phone_whatsapp?: string | null;
  city?: string | null; verified?: boolean; zimra_registered?: boolean;
} | null): { pct: number; missing: { key: string; label: string }[] } {
  if (!profile) return { pct: 0, missing: [] };
  const checks = [
    { key: "full_name", label: "Add your full name", ok: !!profile.full_name },
    { key: "company_name", label: "Add company / fleet name", ok: !!profile.company_name },
    { key: "phone_whatsapp", label: "Verify WhatsApp number", ok: !!profile.phone_whatsapp },
    { key: "city", label: "Add your home city", ok: !!profile.city },
    { key: "zimra_registered", label: "Confirm ZIMRA registration", ok: !!profile.zimra_registered },
    { key: "verified", label: "Get account verified", ok: !!profile.verified },
  ];
  const done = checks.filter((c) => c.ok).length;
  return { pct: Math.round((done / checks.length) * 100), missing: checks.filter((c) => !c.ok) };
}