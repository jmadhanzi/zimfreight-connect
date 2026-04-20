import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/**
 * Returns 0–100 representing how far along the "transit" a load is,
 * based on hours since posted. Caps at 24h = 100%. Older posts look
 * further along the route.
 */
export function transitProgress(iso: string, windowHours = 6) {
  // Avoid SSR/CSR hydration mismatch — render an empty bar on the server,
  // then progress fills in on client mount.
  if (typeof window === "undefined") return 0;
  const hours = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (!Number.isFinite(hours) || hours <= 0) return 4; // tiny visible nub
  const pct = Math.min(100, (hours / windowHours) * 100);
  return Math.max(4, Math.round(pct));
}
