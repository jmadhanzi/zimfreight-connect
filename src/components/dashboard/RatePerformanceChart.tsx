import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import type { BookingRow } from "@/hooks/useDashboard";

/** Build last-30-days carrier vs market series from real bookings, with the market line from a flat avg. */
export function RatePerformanceChart({ bookings, marketAvg }: { bookings: BookingRow[]; marketAvg: number }) {
  const days: { day: string; you?: number; market: number }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayBookings = bookings.filter((b) => b.created_at?.startsWith(key) && b.rate_usd && b.distance_km);
    const totalUsd = dayBookings.reduce((s, b) => s + Number(b.rate_usd), 0);
    const totalKm = dayBookings.reduce((s, b) => s + Number(b.distance_km ?? 0), 0);
    const you = totalKm > 0 ? Number((totalUsd / totalKm).toFixed(2)) : undefined;
    days.push({ day: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), you, market: marketAvg });
  }

  return (
    <div className="h-72">
      <ResponsiveContainer>
        <LineChart data={days} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="day" stroke="var(--muted-foreground)" tick={{ fontSize: 10 }} interval={4} />
          <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="you" name="Your $/km" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
          <Line type="monotone" dataKey="market" name="Market avg" stroke="var(--info, hsl(210 90% 60%))" strokeWidth={2} strokeDasharray="4 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}