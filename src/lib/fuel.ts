/**
 * Fuel reports — community-sourced fuel availability map.
 * Stored in localStorage; swap to a `fuel_reports` table when backend's ready.
 * Reports decay after 6 hours.
 */

const FUEL_KEY = "zf:fuel_reports";
const DECAY_MS = 6 * 60 * 60 * 1000; // 6 hours

export type FuelStatus = "available" | "queue_short" | "queue_long" | "dry";
export type FuelType = "diesel" | "petrol" | "both";

export interface FuelReport {
  id: string;
  station_name: string;
  city: string;
  /** Last reported status. */
  status: FuelStatus;
  fuel_type: FuelType;
  /** Per-litre price in USD. */
  price_usd?: number;
  /** Wait time in minutes if known. */
  wait_minutes?: number;
  /** Reporter user_id. */
  reporter_id: string;
  reporter_name?: string;
  notes?: string;
  reported_at: string;
}

export const FUEL_STATUS_META: Record<FuelStatus, { label: string; color: string; tint: string }> =
  {
    available: {
      label: "Available",
      color: "var(--success)",
      tint: "color-mix(in oklab, var(--success) 15%, transparent)",
    },
    queue_short: {
      label: "Queue ~30min",
      color: "var(--zim-yellow)",
      tint: "color-mix(in oklab, var(--zim-yellow) 20%, transparent)",
    },
    queue_long: {
      label: "Queue 2h+",
      color: "#dc4727",
      tint: "color-mix(in oklab, var(--destructive) 12%, transparent)",
    },
    dry: {
      label: "Dry",
      color: "#dc4727",
      tint: "color-mix(in oklab, var(--destructive) 18%, transparent)",
    },
  };

export const STATIONS = [
  { name: "Total Eastlea", city: "Harare" },
  { name: "Puma Westgate", city: "Harare" },
  { name: "Engen Borrowdale", city: "Harare" },
  { name: "Zuva Avondale", city: "Harare" },
  { name: "Total Bulawayo CBD", city: "Bulawayo" },
  { name: "Engen Hillside", city: "Bulawayo" },
  { name: "Puma Mutare", city: "Mutare" },
  { name: "Total Beitbridge", city: "Beitbridge" },
  { name: "Zuva Chirundu", city: "Chirundu" },
  { name: "Total Masvingo", city: "Masvingo" },
  { name: "Engen Gweru", city: "Gweru" },
  { name: "Puma Kwekwe", city: "Kwekwe" },
];

export function getFuelReports(): FuelReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FUEL_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as FuelReport[];
    const cutoff = Date.now() - DECAY_MS;
    return all.filter((r) => new Date(r.reported_at).getTime() > cutoff);
  } catch {
    return [];
  }
}

/** Get the most recent report per station. */
export function getLatestByStation(): Map<string, FuelReport> {
  const reports = getFuelReports();
  const map = new Map<string, FuelReport>();
  for (const r of reports) {
    const key = `${r.station_name}|${r.city}`;
    const existing = map.get(key);
    if (!existing || new Date(r.reported_at).getTime() > new Date(existing.reported_at).getTime()) {
      map.set(key, r);
    }
  }
  return map;
}

export function saveFuelReport(r: Omit<FuelReport, "id" | "reported_at">): FuelReport {
  const full: FuelReport = {
    ...r,
    id: `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    reported_at: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      const current = getFuelReports();
      localStorage.setItem(FUEL_KEY, JSON.stringify([full, ...current].slice(0, 200)));
      window.dispatchEvent(new CustomEvent("zf:fuel-changed"));
    } catch {
      /* localStorage unavailable */
    }
  }
  return full;
}

export function seedFuelIfEmpty(): void {
  if (typeof window === "undefined") return;
  if (getFuelReports().length > 0) return;
  const now = Date.now();
  const seed: FuelReport[] = [
    {
      id: "f_seed_1",
      station_name: "Total Eastlea",
      city: "Harare",
      status: "available",
      fuel_type: "diesel",
      price_usd: 1.62,
      reporter_id: "u_demo",
      reporter_name: "Tendai M.",
      notes: "No queue, both pumps working",
      reported_at: new Date(now - 25 * 60_000).toISOString(),
    },
    {
      id: "f_seed_2",
      station_name: "Puma Westgate",
      city: "Harare",
      status: "queue_short",
      fuel_type: "diesel",
      price_usd: 1.65,
      wait_minutes: 25,
      reporter_id: "u_demo2",
      reporter_name: "Khumalo T.",
      notes: "About 8 trucks ahead",
      reported_at: new Date(now - 45 * 60_000).toISOString(),
    },
    {
      id: "f_seed_3",
      station_name: "Total Beitbridge",
      city: "Beitbridge",
      status: "queue_long",
      fuel_type: "diesel",
      price_usd: 1.7,
      wait_minutes: 130,
      reporter_id: "u_demo3",
      reporter_name: "Chamu S.",
      notes: "Heavy queue, expect 2h+",
      reported_at: new Date(now - 70 * 60_000).toISOString(),
    },
    {
      id: "f_seed_4",
      station_name: "Engen Hillside",
      city: "Bulawayo",
      status: "dry",
      fuel_type: "diesel",
      reporter_id: "u_demo4",
      reporter_name: "Rumbi L.",
      notes: "Out since this morning",
      reported_at: new Date(now - 110 * 60_000).toISOString(),
    },
    {
      id: "f_seed_5",
      station_name: "Total Bulawayo CBD",
      city: "Bulawayo",
      status: "available",
      fuel_type: "both",
      price_usd: 1.6,
      reporter_id: "u_demo5",
      reporter_name: "Munya N.",
      reported_at: new Date(now - 95 * 60_000).toISOString(),
    },
    {
      id: "f_seed_6",
      station_name: "Zuva Chirundu",
      city: "Chirundu",
      status: "available",
      fuel_type: "diesel",
      price_usd: 1.75,
      reporter_id: "u_demo6",
      reporter_name: "Simba P.",
      notes: "USD only, cards working",
      reported_at: new Date(now - 145 * 60_000).toISOString(),
    },
    {
      id: "f_seed_7",
      station_name: "Puma Mutare",
      city: "Mutare",
      status: "queue_short",
      fuel_type: "diesel",
      price_usd: 1.65,
      wait_minutes: 20,
      reporter_id: "u_demo7",
      reporter_name: "Tichaona K.",
      reported_at: new Date(now - 30 * 60_000).toISOString(),
    },
  ];
  try {
    localStorage.setItem(FUEL_KEY, JSON.stringify(seed));
  } catch {
    /* localStorage unavailable */
  }
}
