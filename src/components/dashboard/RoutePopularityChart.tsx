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
          <defs>
            <linearGradient id="popularity-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="route"
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
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
          />
          <Bar dataKey="loads" fill="url(#popularity-fill)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
