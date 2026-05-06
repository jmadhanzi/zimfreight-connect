/**
 * Driver expense log — track fuel, tolls, repairs, food, and misc trip costs.
 * localStorage persistence; swap to Supabase `expenses` later.
 */

const EXP_KEY = "zf:driver_expenses";

export type ExpenseCategory =
  | "fuel"
  | "toll"
  | "repair"
  | "food"
  | "lodging"
  | "border_fee"
  | "fines"
  | "other";

export interface Expense {
  id: string;
  ownerId: string;
  category: ExpenseCategory;
  amount_usd: number;
  date: string; // YYYY-MM-DD
  /** Optional booking/load reference. */
  bookingId?: string;
  /** Optional location. */
  location?: string;
  notes?: string;
  /** Distance covered if relevant (for fuel ratios). */
  km_logged?: number;
  created_at: string;
}

export const EXPENSE_META: Record<
  ExpenseCategory,
  { label: string; emoji: string; color: string }
> = {
  fuel: { label: "Fuel", emoji: "⛽", color: "var(--secondary)" },
  toll: { label: "Toll", emoji: "🛂", color: "var(--info)" },
  repair: { label: "Repair", emoji: "🔧", color: "var(--destructive)" },
  food: { label: "Food", emoji: "🍽", color: "var(--success)" },
  lodging: { label: "Lodging", emoji: "🏨", color: "var(--primary)" },
  border_fee: { label: "Border", emoji: "🛃", color: "var(--info)" },
  fines: { label: "Fines", emoji: "⚠️", color: "var(--destructive)" },
  other: { label: "Other", emoji: "•", color: "var(--muted-foreground)" },
};

export function getExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EXP_KEY);
    return raw ? (JSON.parse(raw) as Expense[]) : [];
  } catch {
    return [];
  }
}

export function saveExpense(e: Omit<Expense, "id" | "created_at">): Expense {
  const full: Expense = {
    ...e,
    id: `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    created_at: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      const current = getExpenses();
      localStorage.setItem(EXP_KEY, JSON.stringify([full, ...current].slice(0, 1000)));
      window.dispatchEvent(new CustomEvent("zf:expenses-changed"));
    } catch {
      /* localStorage unavailable */
    }
  }
  return full;
}

export function deleteExpense(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const next = getExpenses().filter((e) => e.id !== id);
    localStorage.setItem(EXP_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("zf:expenses-changed"));
  } catch {
    /* localStorage unavailable */
  }
}

export function expensesByCategory(expenses: Expense[]): Record<ExpenseCategory, number> {
  const out: Record<ExpenseCategory, number> = {
    fuel: 0,
    toll: 0,
    repair: 0,
    food: 0,
    lodging: 0,
    border_fee: 0,
    fines: 0,
    other: 0,
  };
  for (const e of expenses) out[e.category] += e.amount_usd;
  return out;
}

export function expensesByMonth(expenses: Expense[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const e of expenses) {
    const key = e.date.slice(0, 7);
    out.set(key, (out.get(key) ?? 0) + e.amount_usd);
  }
  return out;
}

export function seedExpensesIfEmpty(ownerId: string): void {
  if (typeof window === "undefined") return;
  if (getExpenses().length > 0) return;
  const today = new Date();
  const day = (offset: number) =>
    new Date(today.getTime() - offset * 86400_000).toISOString().slice(0, 10);
  const seed: Expense[] = [
    {
      id: "e_seed_1",
      ownerId,
      category: "fuel",
      amount_usd: 280,
      date: day(0),
      location: "Total Eastlea",
      km_logged: 0,
      notes: "Filled tank, Hre→Bul prep",
      created_at: new Date().toISOString(),
    },
    {
      id: "e_seed_2",
      ownerId,
      category: "toll",
      amount_usd: 12,
      date: day(0),
      location: "Norton tollgate",
      created_at: new Date().toISOString(),
    },
    {
      id: "e_seed_3",
      ownerId,
      category: "food",
      amount_usd: 8,
      date: day(0),
      location: "Kadoma stop",
      created_at: new Date().toISOString(),
    },
    {
      id: "e_seed_4",
      ownerId,
      category: "fuel",
      amount_usd: 195,
      date: day(2),
      location: "Engen Bulawayo",
      km_logged: 440,
      created_at: new Date().toISOString(),
    },
    {
      id: "e_seed_5",
      ownerId,
      category: "lodging",
      amount_usd: 35,
      date: day(2),
      location: "Bulawayo guest house",
      created_at: new Date().toISOString(),
    },
    {
      id: "e_seed_6",
      ownerId,
      category: "repair",
      amount_usd: 120,
      date: day(5),
      location: "Gweru workshop",
      notes: "Front brake pads",
      created_at: new Date().toISOString(),
    },
    {
      id: "e_seed_7",
      ownerId,
      category: "border_fee",
      amount_usd: 45,
      date: day(8),
      location: "Beitbridge",
      notes: "ZIMRA + carbon tax",
      created_at: new Date().toISOString(),
    },
    {
      id: "e_seed_8",
      ownerId,
      category: "fuel",
      amount_usd: 320,
      date: day(8),
      location: "Total Beitbridge",
      km_logged: 0,
      created_at: new Date().toISOString(),
    },
  ];
  try {
    localStorage.setItem(EXP_KEY, JSON.stringify(seed));
  } catch {
    /* localStorage unavailable */
  }
}
