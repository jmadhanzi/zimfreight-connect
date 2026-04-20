import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
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
    .map((e) => ({ route: e.route, count: e.count, rate: e.sumKm > 0 ? Number((e.sumUsd / e.sumKm).toFixed(2)) : 0 }));

  if (data.length === 0) {
    return <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">No completed routes yet.</div>;
  }

  return (
    <div className="h-56">
      <ResponsiveContainer>
        <BarChart layout="vertical" data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis type="number" stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="route" stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} width={70} />
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }} formatter={(v) => [String(v), "Loads"]} />
          <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}