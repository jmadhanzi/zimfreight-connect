/**
 * Operational data — POD uploads, location pings, ZIMRA documents,
 * road hazard alerts. localStorage-backed shims; swap to backend tables
 * (pod_uploads, location_pings, shipment_documents, road_alerts) later.
 */

const POD_KEY = "zf:pod_uploads";
const PING_KEY = "zf:location_pings";
const DOCS_KEY = "zf:shipment_docs";
const HAZARDS_KEY = "zf:road_hazards";

const HAZARD_DECAY_MS = 6 * 60 * 60 * 1000; // 6 hours

// ─── Proof of Delivery ──────────────────────────────────────────────────

export interface PodUpload {
  id: string;
  bookingId: string;
  /** Data URL (base64) — in production swap to Supabase Storage. */
  imageDataUrl: string;
  notes?: string;
  uploadedBy: string;
  uploadedByName?: string;
  uploaded_at: string;
}

export function getPodForBooking(bookingId: string): PodUpload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(POD_KEY);
    const all = raw ? (JSON.parse(raw) as PodUpload[]) : [];
    return all.find((p) => p.bookingId === bookingId) ?? null;
  } catch {
    return null;
  }
}

export function savePod(p: Omit<PodUpload, "id" | "uploaded_at">): PodUpload {
  const full: PodUpload = {
    ...p,
    id: `pod_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    uploaded_at: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(POD_KEY);
      const all = raw ? (JSON.parse(raw) as PodUpload[]) : [];
      // Replace any existing POD for this booking
      const next = all.filter((x) => x.bookingId !== p.bookingId).concat(full);
      localStorage.setItem(POD_KEY, JSON.stringify(next.slice(-100)));
      window.dispatchEvent(new CustomEvent("zf:pod-changed"));
    } catch {
      /* localStorage unavailable */
    }
  }
  return full;
}

// ─── Location Pings ─────────────────────────────────────────────────────

export interface LocationPing {
  id: string;
  driverId: string;
  driverName?: string;
  bookingId?: string;
  lat: number;
  lng: number;
  /** Reverse-geocoded label, optional. */
  label?: string;
  /** Speed in km/h, optional. */
  speed?: number;
  ping_at: string;
}

export function getLocationPings(driverId?: string): LocationPing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PING_KEY);
    const all = raw ? (JSON.parse(raw) as LocationPing[]) : [];
    return driverId ? all.filter((p) => p.driverId === driverId) : all;
  } catch {
    return [];
  }
}

export function getLatestPingByDriver(driverId: string): LocationPing | null {
  const pings = getLocationPings(driverId);
  if (pings.length === 0) return null;
  return pings.reduce((latest, p) =>
    new Date(p.ping_at).getTime() > new Date(latest.ping_at).getTime() ? p : latest,
  );
}

export function savePing(p: Omit<LocationPing, "id" | "ping_at">): LocationPing {
  const full: LocationPing = {
    ...p,
    id: `ping_${Date.now().toString(36)}`,
    ping_at: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(PING_KEY);
      const all = raw ? (JSON.parse(raw) as LocationPing[]) : [];
      // Keep last 200 globally
      localStorage.setItem(PING_KEY, JSON.stringify([...all, full].slice(-200)));
      window.dispatchEvent(new CustomEvent("zf:ping-changed"));
    } catch {
      /* localStorage unavailable */
    }
  }
  return full;
}

// ─── ZIMRA / Customs Documents ─────────────────────────────────────────

export type DocStatus = "missing" | "uploaded" | "verified";
export type DocKind =
  | "commercial_invoice"
  | "packing_list"
  | "bill_of_lading"
  | "zimra_form"
  | "transit_permit"
  | "carbon_tax"
  | "insurance_cert"
  | "other";

export interface ShipmentDoc {
  id: string;
  shipmentId: string;
  kind: DocKind;
  filename: string;
  /** Data URL (base64) — swap to Storage URL in prod. */
  fileData?: string;
  status: DocStatus;
  uploaded_by?: string;
  uploaded_at: string;
  notes?: string;
}

export const DOC_META: Record<DocKind, { label: string; required_cross_border: boolean }> = {
  commercial_invoice: { label: "Commercial invoice", required_cross_border: true },
  packing_list: { label: "Packing list", required_cross_border: true },
  bill_of_lading: { label: "Bill of lading", required_cross_border: true },
  zimra_form: { label: "ZIMRA form (Bill of Entry)", required_cross_border: true },
  transit_permit: { label: "Transit permit", required_cross_border: true },
  carbon_tax: { label: "Carbon tax receipt", required_cross_border: true },
  insurance_cert: { label: "Insurance cert", required_cross_border: false },
  other: { label: "Other", required_cross_border: false },
};

export const REQUIRED_CROSS_BORDER_DOCS: DocKind[] = (Object.keys(DOC_META) as DocKind[]).filter(
  (k) => DOC_META[k].required_cross_border,
);

export function getShipmentDocs(shipmentId: string): ShipmentDoc[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DOCS_KEY);
    const all = raw ? (JSON.parse(raw) as ShipmentDoc[]) : [];
    return all.filter((d) => d.shipmentId === shipmentId);
  } catch {
    return [];
  }
}

export function saveDoc(d: Omit<ShipmentDoc, "id" | "uploaded_at">): ShipmentDoc {
  const full: ShipmentDoc = {
    ...d,
    id: `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    uploaded_at: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(DOCS_KEY);
      const all = raw ? (JSON.parse(raw) as ShipmentDoc[]) : [];
      // Replace existing of same kind for same shipment
      const next = all
        .filter((x) => !(x.shipmentId === d.shipmentId && x.kind === d.kind))
        .concat(full);
      localStorage.setItem(DOCS_KEY, JSON.stringify(next.slice(-200)));
      window.dispatchEvent(new CustomEvent("zf:docs-changed"));
    } catch {
      /* localStorage unavailable */
    }
  }
  return full;
}

export function deleteDoc(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(DOCS_KEY);
    const all = raw ? (JSON.parse(raw) as ShipmentDoc[]) : [];
    localStorage.setItem(DOCS_KEY, JSON.stringify(all.filter((d) => d.id !== id)));
    window.dispatchEvent(new CustomEvent("zf:docs-changed"));
  } catch {
    /* localStorage unavailable */
  }
}

// ─── Road Hazards ───────────────────────────────────────────────────────

export type HazardKind = "checkpoint" | "pothole" | "accident" | "roadblock" | "weather";

export interface RoadHazard {
  id: string;
  reporterId: string;
  reporterName?: string;
  kind: HazardKind;
  lat: number;
  lng: number;
  /** Description ("Police checkpoint at Norton", etc). */
  label: string;
  notes?: string;
  reported_at: string;
}

export const HAZARD_META: Record<HazardKind, { label: string; emoji: string; color: string }> = {
  checkpoint: { label: "Checkpoint", emoji: "🚓", color: "#2e6fbf" },
  pothole: { label: "Pothole", emoji: "🕳️", color: "#f5b041" },
  accident: { label: "Accident", emoji: "⚠️", color: "#dc4727" },
  roadblock: { label: "Roadblock", emoji: "🚧", color: "#dc4727" },
  weather: { label: "Weather", emoji: "🌧️", color: "#2e6fbf" },
};

export function getRoadHazards(): RoadHazard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HAZARDS_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as RoadHazard[];
    const cutoff = Date.now() - HAZARD_DECAY_MS;
    return all.filter((h) => new Date(h.reported_at).getTime() > cutoff);
  } catch {
    return [];
  }
}

export function saveHazard(h: Omit<RoadHazard, "id" | "reported_at">): RoadHazard {
  const full: RoadHazard = {
    ...h,
    id: `haz_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    reported_at: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      const all = getRoadHazards();
      localStorage.setItem(HAZARDS_KEY, JSON.stringify([full, ...all].slice(0, 200)));
      window.dispatchEvent(new CustomEvent("zf:hazards-changed"));
    } catch {
      /* localStorage unavailable */
    }
  }
  return full;
}

export function seedHazardsIfEmpty(): void {
  if (typeof window === "undefined") return;
  if (getRoadHazards().length > 0) return;
  const seed: RoadHazard[] = [
    {
      id: "haz_seed_1",
      reporterId: "u_demo",
      reporterName: "Tendai M.",
      kind: "checkpoint",
      lat: -17.882,
      lng: 30.703,
      label: "Police checkpoint at Norton",
      reported_at: new Date(Date.now() - 25 * 60_000).toISOString(),
    },
    {
      id: "haz_seed_2",
      reporterId: "u_demo2",
      reporterName: "Khumalo T.",
      kind: "pothole",
      lat: -19.815,
      lng: 28.64,
      label: "Severe potholes — Bulawayo Rd northbound",
      notes: "Watch out, axle-breakers",
      reported_at: new Date(Date.now() - 90 * 60_000).toISOString(),
    },
    {
      id: "haz_seed_3",
      reporterId: "u_demo3",
      reporterName: "Simba P.",
      kind: "accident",
      lat: -22.215,
      lng: 30.0,
      label: "Truck rollover near Beit Bridge",
      notes: "Single lane in operation",
      reported_at: new Date(Date.now() - 45 * 60_000).toISOString(),
    },
  ];
  try {
    localStorage.setItem(HAZARDS_KEY, JSON.stringify(seed));
  } catch {
    /* localStorage unavailable */
  }
}
