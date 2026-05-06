/**
 * Recurring load templates — the broker creates a standing route that
 * auto-creates a load every week on a chosen weekday.
 * localStorage-backed shim; swap to a `recurring_loads` table when ready.
 */

const REC_KEY = "zf:recurring_loads";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface RecurringLoad {
  id: string;
  ownerId: string;
  origin: string;
  destination: string;
  load_type: string;
  weight_tonnes: number;
  rate_usd: number;
  payment_terms: string;
  weekday: Weekday;
  /** YYYY-MM-DD from when this template should keep firing. */
  active_from: string;
  /** Optional end date. */
  active_until?: string;
  notes?: string;
  /** Toggle without deleting. */
  paused: boolean;
  created_at: string;
}

export const WEEKDAYS: { id: Weekday; label: string }[] = [
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
  { id: "sat", label: "Saturday" },
  { id: "sun", label: "Sunday" },
];

export function getRecurring(): RecurringLoad[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REC_KEY);
    return raw ? (JSON.parse(raw) as RecurringLoad[]) : [];
  } catch {
    return [];
  }
}

export function saveRecurring(
  r: Omit<RecurringLoad, "id" | "created_at" | "paused"> & { paused?: boolean },
): RecurringLoad {
  const full: RecurringLoad = {
    ...r,
    paused: r.paused ?? false,
    id: `rec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    created_at: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      const current = getRecurring();
      localStorage.setItem(REC_KEY, JSON.stringify([full, ...current].slice(0, 50)));
      window.dispatchEvent(new CustomEvent("zf:recurring-changed"));
    } catch {
      /* localStorage unavailable */
    }
  }
  return full;
}

export function togglePause(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getRecurring();
    const next = current.map((r) => (r.id === id ? { ...r, paused: !r.paused } : r));
    localStorage.setItem(REC_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("zf:recurring-changed"));
  } catch {
    /* localStorage unavailable */
  }
}

export function deleteRecurring(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const next = getRecurring().filter((r) => r.id !== id);
    localStorage.setItem(REC_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("zf:recurring-changed"));
  } catch {
    /* localStorage unavailable */
  }
}

export function nextOccurrence(weekday: Weekday): Date {
  const idx = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(weekday);
  const today = new Date();
  const todayIdx = today.getDay();
  let daysAhead = idx - todayIdx;
  if (daysAhead <= 0) daysAhead += 7;
  return new Date(today.getTime() + daysAhead * 86400_000);
}
