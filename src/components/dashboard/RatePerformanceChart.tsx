import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { BookingRow } from "@/hooks/useDashboard";

/** Build last-30-days carrier vs market series from real bookings, with the market line from a flat avg. */
export function RatePerformanceChart({
  bookings,
  marketAvg,
}: {
  bookings: BookingRow[];
  marketAvg: number;
}) {
  const days: { day: string; you?: number; market: number }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayBookings = bookings.filter(
      (b) => b.created_at?.startsWith(key) && b.rate_usd && b.distance_km,
    );
    const totalUsd = dayBookings.reduce((s, b) => s + Number(b.rate_usd), 0);
    const totalKm = dayBookings.reduce((s, b) => s + Number(b.distance_km ?? 0), 0);
    const you = totalKm > 0 ? Number((totalUsd / totalKm).toFixed(2)) : undefined;
    days.push({
      day: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      you,
      market: marketAvg,
    });
  }

  return (
    <div className="h-72">
      <ResponsiveContainer>
        <AreaChart data={days} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="rate-perf-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--secondary)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
            interval={4}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
            domain={["auto", "auto"]}
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
            cursor={{
              stroke: "var(--secondary)",
              strokeOpacity: 0.4,
              strokeWidth: 1,
              strokeDasharray: "3 3",
            }}
          />
          <Legend
            wrapperStyle={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
            iconType="plainline"
          />
          <Area
            type="monotone"
            dataKey="you"
            name="Your $/km"
            stroke="var(--secondary)"
            strokeWidth={2.5}
            fill="url(#rate-perf-fill)"
            dot={{ r: 3, fill: "var(--secondary)", stroke: "var(--card)", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="market"
            name="Market avg"
            stroke="var(--info)"
            strokeWidth={2}
            strokeDasharray="4 4"
            fill="none"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
