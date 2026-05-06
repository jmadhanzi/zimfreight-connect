import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import type { BookingRow } from "@/hooks/useDashboard";

export function TopRoutesChart({ bookings }: { bookings: BookingRow[] }) {
  const map = new Map<string, { route: string; count: number; sumUsd: number; sumKm: number }>();
  bookings.forEach((b) => {
    const o = b.loads?.origin?.slice(0, 3).toUpperCase();
    const d = b.loads?.destination?.slice(0, 3).toUpperCase();
    if (!o || !d) return;
    const key = `${o}→${d}`;
    const e = map.get(key) ?? { route: key, count: 0, sumUsd: 0, sumKm: 0 };
    e.count += 1;
    e.sumUsd += Number(b.rate_usd ?? 0);
    e.sumKm += Number(b.distance_km ?? 0);
    map.set(key, e);
  });
  const data = [...map.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((e) => ({
      route: e.route,
      count: e.count,
      rate: e.sumKm > 0 ? Number((e.sumUsd / e.sumKm).toFixed(2)) : 0,
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-4 text-center">
        <p className="text-xs text-muted-foreground">No completed routes yet.</p>
      </div>
    );
  }

  return (
    <div className="h-56">
      <ResponsiveContainer>
        <BarChart layout="vertical" data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="top-routes-fill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--secondary)" stopOpacity={0.7} />
              <stop offset="100%" stopColor="var(--secondary)" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" horizontal={false} />
          <XAxis
            type="number"
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="route"
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600 }}
            width={70}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--foreground)",
              fontSize: 12,
              boxShadow: "0 8px 24px -8px color-mix(in oklab, var(--foreground) 18%, transparent)",
            }}
            cursor={{ fill: "color-mix(in oklab, var(--foreground) 4%, transparent)" }}
            formatter={(v) => [String(v), "Loads"]}
          />
          <Bar dataKey="count" fill="url(#top-routes-fill)" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell key={i} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
