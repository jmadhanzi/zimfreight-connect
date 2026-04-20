export function Sparkline({ values, positive = true, width = 80, height = 24 }: { values: number[]; positive?: boolean; width?: number; height?: number }) {
  if (values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values.map((v, i) => `${(i * stepX).toFixed(1)},${(height - ((v - min) / range) * height).toFixed(1)}`).join(" ");
  const stroke = positive ? "var(--success, hsl(142 70% 45%))" : "var(--destructive, hsl(0 80% 60%))";
  return (
    <svg width={width} height={height} className="inline-block align-middle">
      <polyline fill="none" stroke={stroke} strokeWidth={1.5} points={points} />
    </svg>
  );
}