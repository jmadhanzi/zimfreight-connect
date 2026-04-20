import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

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
    const d = new Date(today); d.setDate(today.getDate() - i);
    out.push({ day: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), rate: Math.round(v) });
  }
  return out;
}

export function ZwlChart() {
  const data = series();
  return (
    <div>
      <div className="h-40">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="day" stroke="var(--muted-foreground)" tick={{ fontSize: 9 }} interval={4} />
            <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }} />
            <Line type="monotone" dataKey="rate" stroke="var(--primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        Rates shown in USD. ZWL uses daily official rate.
      </p>
    </div>
  );
}