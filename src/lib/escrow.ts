/**
 * Escrow / booked payments — the core trust feature.
 * The broker pays into ZimFreight at booking time; we hold the funds
 * and release them to the carrier on delivery confirmation (POD signed off
 * by broker). localStorage shim now; in production this is a Stripe
 * Connect / Paystack split-payment integration with the funds in our
 * holding account.
 */

const ESCROW_KEY = "zf:escrow_bookings";

export type EscrowStatus =
  | "draft" // booking placed, payment not yet authorized
  | "funded" // broker has paid into escrow
  | "in_transit" // carrier has picked up
  | "delivered" // POD uploaded, awaiting broker confirm
  | "released" // broker confirmed, carrier paid
  | "disputed" // broker filed a dispute, ZimFreight reviews
  | "refunded" // dispute resolved in broker's favor
  | "cancelled"; // pre-funding cancellation

export interface EscrowBooking {
  id: string;
  loadId: string;
  brokerId: string;
  brokerName?: string;
  carrierId: string;
  carrierName?: string;
  /** Total amount agreed in USD. */
  amount_usd: number;
  /** Platform fee taken from the broker (typically 2-3%). */
  platform_fee_usd: number;
  /** Carrier's payout = amount - platform_fee. */
  carrier_payout_usd: number;
  status: EscrowStatus;
  /** Broker's preferred funding method. */
  funding_method: "ecocash" | "card" | "bank_transfer";
  /** Reference (EcoCash ref, Stripe payment_intent, etc). */
  funding_ref?: string;
  /** Optional dispute reason. */
  dispute_reason?: string;
  created_at: string;
  funded_at?: string;
  delivered_at?: string;
  released_at?: string;
}

const PLATFORM_FEE_PCT = 0.025; // 2.5%

export function getEscrowBookings(): EscrowBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ESCROW_KEY);
    return raw ? (JSON.parse(raw) as EscrowBooking[]) : [];
  } catch {
    return [];
  }
}

export function getEscrowForLoad(loadId: string): EscrowBooking | null {
  return getEscrowBookings().find((b) => b.loadId === loadId) ?? null;
}

export function calculateFee(amount: number) {
  const fee = Math.round(amount * PLATFORM_FEE_PCT * 100) / 100;
  return { fee, payout: amount - fee };
}

export function createEscrowBooking(
  b: Omit<
    EscrowBooking,
    "id" | "created_at" | "status" | "platform_fee_usd" | "carrier_payout_usd"
  >,
): EscrowBooking {
  const { fee, payout } = calculateFee(b.amount_usd);
  const full: EscrowBooking = {
    ...b,
    status: "draft",
    platform_fee_usd: fee,
    carrier_payout_usd: payout,
    id: `esc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    created_at: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      const all = getEscrowBookings();
      localStorage.setItem(ESCROW_KEY, JSON.stringify([...all, full].slice(-200)));
      window.dispatchEvent(new CustomEvent("zf:escrow-changed"));
    } catch {
      /* localStorage unavailable */
    }
  }
  return full;
}

export function transitionEscrow(
  id: string,
  status: EscrowStatus,
  extras?: Partial<EscrowBooking>,
): EscrowBooking | null {
  if (typeof window === "undefined") return null;
  try {
    const all = getEscrowBookings();
    const idx = all.findIndex((b) => b.id === id);
    if (idx < 0) return null;
    const stamps: Partial<EscrowBooking> = {};
    if (status === "funded") stamps.funded_at = new Date().toISOString();
    if (status === "delivered") stamps.delivered_at = new Date().toISOString();
    if (status === "released") stamps.released_at = new Date().toISOString();
    const updated = { ...all[idx], status, ...stamps, ...extras };
    all[idx] = updated;
    localStorage.setItem(ESCROW_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent("zf:escrow-changed"));
    return updated;
  } catch {
    return null;
  }
}

export const ESCROW_STATUS_META: Record<
  EscrowStatus,
  { label: string; color: string; tint: string; description: string }
> = {
  draft: {
    label: "Awaiting payment",
    color: "var(--muted-foreground)",
    tint: "color-mix(in oklab, var(--foreground) 8%, transparent)",
    description: "Booking created. Broker to fund.",
  },
  funded: {
    label: "Funded",
    color: "var(--info)",
    tint: "color-mix(in oklab, var(--info) 12%, transparent)",
    description: "Funds held by ZimFreight. Carrier can pick up.",
  },
  in_transit: {
    label: "In transit",
    color: "var(--secondary)",
    tint: "color-mix(in oklab, var(--secondary) 15%, transparent)",
    description: "Carrier picked up. Funds still held.",
  },
  delivered: {
    label: "Delivered",
    color: "var(--success)",
    tint: "color-mix(in oklab, var(--success) 14%, transparent)",
    description: "POD uploaded. Broker to confirm.",
  },
  released: {
    label: "Released",
    color: "var(--success)",
    tint: "color-mix(in oklab, var(--success) 14%, transparent)",
    description: "Funds paid out to carrier.",
  },
  disputed: {
    label: "Disputed",
    color: "var(--destructive)",
    tint: "color-mix(in oklab, var(--destructive) 14%, transparent)",
    description: "Under review by ZimFreight team.",
  },
  refunded: {
    label: "Refunded",
    color: "var(--muted-foreground)",
    tint: "color-mix(in oklab, var(--foreground) 8%, transparent)",
    description: "Dispute resolved. Funds returned to broker.",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--muted-foreground)",
    tint: "color-mix(in oklab, var(--foreground) 8%, transparent)",
    description: "Cancelled before funding.",
  },
};
