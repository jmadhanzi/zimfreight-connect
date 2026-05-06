/**
 * Trust layer — shared utilities for the rating, verification, and saved-carrier
 * features. Uses localStorage as the persistence shim so the UI is fully
 * functional without backend tables; swap to Supabase calls when those
 * tables exist (`ratings`, `verifications`, `preferred_carriers`).
 */

const RATINGS_KEY = "zf:ratings";
const PREFERRED_KEY = "zf:preferred_carriers";

export interface Rating {
  id: string;
  /** The user being rated (carrier or broker). */
  subjectId: string;
  /** The user who submitted the rating. */
  raterId: string;
  /** The booking this rating is tied to. */
  bookingId?: string;
  /** 1-5 stars. */
  stars: number;
  /** One-line note ("paid quickly", "load was as described", etc.). */
  note?: string;
  /** Specific dimensions for granular display. */
  paidOnTime?: boolean;
  asDescribed?: boolean;
  createdAt: string;
}

export interface AggregateRating {
  count: number;
  avg: number;
  paidOnTimePct?: number;
  asDescribedPct?: number;
  /** Days-to-pay average (broker only). */
  avgDaysToPay?: number;
}

/** Read all ratings from localStorage. */
export function getRatings(): Rating[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RATINGS_KEY);
    return raw ? (JSON.parse(raw) as Rating[]) : [];
  } catch {
    return [];
  }
}

/** Persist a new rating. Emits a `zf:ratings-changed` event. */
export function saveRating(rating: Omit<Rating, "id" | "createdAt">): Rating {
  const full: Rating = {
    ...rating,
    id: `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      const current = getRatings();
      localStorage.setItem(RATINGS_KEY, JSON.stringify([...current, full].slice(-500)));
      window.dispatchEvent(new CustomEvent("zf:ratings-changed"));
    } catch {
      /* localStorage unavailable */
    }
  }
  return full;
}

/** Compute aggregate stats for a subject. */
export function aggregateRatings(subjectId: string, all: Rating[] = getRatings()): AggregateRating {
  const mine = all.filter((r) => r.subjectId === subjectId);
  if (mine.length === 0) return { count: 0, avg: 0 };
  const avg = mine.reduce((s, r) => s + r.stars, 0) / mine.length;
  const paidOn = mine.filter((r) => r.paidOnTime !== undefined);
  const asDesc = mine.filter((r) => r.asDescribed !== undefined);
  return {
    count: mine.length,
    avg: Number(avg.toFixed(1)),
    paidOnTimePct:
      paidOn.length > 0
        ? Math.round((paidOn.filter((r) => r.paidOnTime).length / paidOn.length) * 100)
        : undefined,
    asDescribedPct:
      asDesc.length > 0
        ? Math.round((asDesc.filter((r) => r.asDescribed).length / asDesc.length) * 100)
        : undefined,
  };
}

/** Verified threshold: 5+ completed jobs with avg ≥ 4.0 stars. */
export function isVerified(agg: AggregateRating): boolean {
  return agg.count >= 5 && agg.avg >= 4.0;
}

// ─── Saved carrier network ──────────────────────────────────────────────

export interface PreferredCarrier {
  /** ZimFreight user_id of the carrier. */
  carrierId: string;
  /** Display name (snapshot). */
  name: string;
  /** WhatsApp number snapshot. */
  whatsapp?: string;
  /** Notes the broker added. */
  notes?: string;
  /** When they were added. */
  addedAt: string;
}

export function getPreferredCarriers(): PreferredCarrier[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PREFERRED_KEY);
    return raw ? (JSON.parse(raw) as PreferredCarrier[]) : [];
  } catch {
    return [];
  }
}

export function addPreferredCarrier(c: Omit<PreferredCarrier, "addedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const current = getPreferredCarriers();
    if (current.some((x) => x.carrierId === c.carrierId)) return;
    const next = [...current, { ...c, addedAt: new Date().toISOString() }];
    localStorage.setItem(PREFERRED_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("zf:preferred-changed"));
  } catch {
    /* localStorage unavailable */
  }
}

export function removePreferredCarrier(carrierId: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getPreferredCarriers();
    const next = current.filter((x) => x.carrierId !== carrierId);
    localStorage.setItem(PREFERRED_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("zf:preferred-changed"));
  } catch {
    /* localStorage unavailable */
  }
}

export function isPreferredCarrier(carrierId: string): boolean {
  return getPreferredCarriers().some((x) => x.carrierId === carrierId);
}
