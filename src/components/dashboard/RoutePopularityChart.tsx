import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { RouteRate } from "@/types";

export function RoutePopularityChart({ rates }: { rates: RouteRate[] }) {
  const data = rates.slice(0, 8).map((r) => ({
    route: `${r.origin.slice(0, 3).toUpperCase()}→${r.destination.slice(0, 3).toUpperCase()}`,
    loads: r.weekly_loads,
  }));
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="route" stroke="var(--muted-foreground)" tick={{ fontSize: 10 }} />
          <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }} />
          <Bar dataKey="loads" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}