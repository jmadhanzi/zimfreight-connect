/**
 * USD ↔ ZWL conversion. The official RBZ rate moves daily; we
 * surface a single rate constant here that can be hot-swapped or
 * read from a backend `fx_rates` table later.
 */

/** Last-known indicative ZWL/USD rate. Update via RBZ API or admin in production. */
export const ZWL_RATE = 3850;
export const ZWL_RATE_AS_OF = "2024-Q4 indicative";

export function usdToZwl(usd: number): number {
  return Math.round(usd * ZWL_RATE);
}

export function zwlToUsd(zwl: number): number {
  return Number((zwl / ZWL_RATE).toFixed(2));
}

export function formatZwl(zwl: number): string {
  return `ZWL ${zwl.toLocaleString()}`;
}

export function formatDual(usd: number): { usd: string; zwl: string } {
  return {
    usd: `$${usd.toLocaleString()}`,
    zwl: formatZwl(usdToZwl(usd)),
  };
}
