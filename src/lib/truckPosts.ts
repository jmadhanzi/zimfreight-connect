/**
 * Truck posts — "I have a truck heading X→Y" — the inverse of a load post.
 * Stored in localStorage for now; swap to a `truck_posts` Supabase table later.
 */

const TRUCK_POSTS_KEY = "zf:truck_posts";

export interface TruckPost {
  id: string;
  carrierId: string;
  carrierName: string;
  carrierWhatsapp?: string;
  origin: string;
  destination: string;
  available_date: string; // YYYY-MM-DD
  flexible_dates: boolean;
  equipment: string; // "Flatbed 30T", etc.
  weight_capacity_t: number;
  rate_usd_per_km?: number | null;
  notes?: string;
  is_cross_border: boolean;
  is_zimra_ready: boolean;
  created_at: string;
  status: "available" | "matched" | "expired";
}

export function getTruckPosts(): TruckPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TRUCK_POSTS_KEY);
    return raw ? (JSON.parse(raw) as TruckPost[]) : [];
  } catch {
    return [];
  }
}

export function saveTruckPost(post: Omit<TruckPost, "id" | "created_at" | "status">): TruckPost {
  const full: TruckPost = {
    ...post,
    id: `tp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    created_at: new Date().toISOString(),
    status: "available",
  };
  if (typeof window !== "undefined") {
    try {
      const current = getTruckPosts();
      localStorage.setItem(TRUCK_POSTS_KEY, JSON.stringify([full, ...current].slice(0, 200)));
      window.dispatchEvent(new CustomEvent("zf:truck-posts-changed"));
    } catch {
      /* localStorage unavailable */
    }
  }
  return full;
}

export function removeTruckPost(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getTruckPosts();
    localStorage.setItem(TRUCK_POSTS_KEY, JSON.stringify(current.filter((p) => p.id !== id)));
    window.dispatchEvent(new CustomEvent("zf:truck-posts-changed"));
  } catch {
    /* localStorage unavailable */
  }
}

/** Seed with realistic Zimbabwe samples on first read so the UI isn't empty. */
export function seedTruckPostsIfEmpty(): void {
  if (typeof window === "undefined") return;
  if (getTruckPosts().length > 0) return;
  const seed: TruckPost[] = [
    {
      id: "tp_seed_001",
      carrierId: "u_carrier_demo_1",
      carrierName: "Tatenda Moyo",
      carrierWhatsapp: "+263 77 123 4567",
      origin: "Beitbridge",
      destination: "Harare",
      available_date: new Date(Date.now() + 86400_000).toISOString().slice(0, 10),
      flexible_dates: true,
      equipment: "Flatbed 30T",
      weight_capacity_t: 30,
      rate_usd_per_km: 0.85,
      notes: "Returning empty from Beit. ZIMRA registered.",
      is_cross_border: false,
      is_zimra_ready: true,
      created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
      status: "available",
    },
    {
      id: "tp_seed_002",
      carrierId: "u_carrier_demo_2",
      carrierName: "Khumalo Transport (Pvt) Ltd",
      carrierWhatsapp: "+263 71 555 0188",
      origin: "Harare",
      destination: "Bulawayo",
      available_date: new Date(Date.now() + 2 * 86400_000).toISOString().slice(0, 10),
      flexible_dates: false,
      equipment: "Rigid 10T",
      weight_capacity_t: 10,
      rate_usd_per_km: 1.1,
      notes: "Fleet of 3 trucks available — bulk welcome.",
      is_cross_border: false,
      is_zimra_ready: true,
      created_at: new Date(Date.now() - 5 * 3600_000).toISOString(),
      status: "available",
    },
    {
      id: "tp_seed_003",
      carrierId: "u_carrier_demo_3",
      carrierName: "Simba Chamu",
      carrierWhatsapp: "+263 78 222 9911",
      origin: "Harare",
      destination: "Johannesburg",
      available_date: new Date(Date.now() + 3 * 86400_000).toISOString().slice(0, 10),
      flexible_dates: true,
      equipment: "Refrigerated",
      weight_capacity_t: 24,
      rate_usd_per_km: 1.55,
      notes: "Reefer with temp logging. ZIMRA + SARS docs ready.",
      is_cross_border: true,
      is_zimra_ready: true,
      created_at: new Date(Date.now() - 7 * 3600_000).toISOString(),
      status: "available",
    },
    {
      id: "tp_seed_004",
      carrierId: "u_carrier_demo_4",
      carrierName: "Rumbi Logistics",
      origin: "Mutare",
      destination: "Harare",
      available_date: new Date(Date.now() + 86400_000).toISOString().slice(0, 10),
      flexible_dates: false,
      equipment: "Tanker (Fuel)",
      weight_capacity_t: 38,
      rate_usd_per_km: 1.2,
      notes: "Diesel tanker — empty return, Mutare→Hre.",
      is_cross_border: false,
      is_zimra_ready: false,
      created_at: new Date(Date.now() - 11 * 3600_000).toISOString(),
      status: "available",
    },
  ];
  try {
    localStorage.setItem(TRUCK_POSTS_KEY, JSON.stringify(seed));
  } catch {
    /* localStorage unavailable */
  }
}
