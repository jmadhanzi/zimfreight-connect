import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/** Deterministic 30-day ZWL/USD series anchored around 3,850. */
function series() {
  const out: { day: string; rate: number }[] = [];
  let h = 12345;
  const today = new Date();
  let v = 3850;
  for (let i = 29; i >= 0; i--) {
    h = (h * 1664525 + 1013904223) | 0;
    const drift = ((h >>> 16) % 100) / 100 - 0.4;
    v = Math.max(3500, Math.min(4100, v + drift * 25));
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push({
      day: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      rate: Math.round(v),
    });
  }
  return out;
}

export function ZwlChart() {
  const data = series();
  return (
    <div>
      <div className="h-40">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="zwl-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }}
              interval={4}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
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
                boxShadow:
                  "0 8px 24px -8px color-mix(in oklab, var(--foreground) 18%, transparent)",
              }}
              cursor={{
                stroke: "var(--primary)",
                strokeOpacity: 0.4,
                strokeWidth: 1,
                strokeDasharray: "3 3",
              }}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#zwl-fill)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Indicative trend only. Connect RBZ API for live rates.
      </p>
    </div>
  );
}
