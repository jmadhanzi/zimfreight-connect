export function Sparkline({
  values,
  positive = true,
  width = 80,
  height = 24,
}: {
  values: number[];
  positive?: boolean;
  width?: number;
  height?: number;
}) {
  if (values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values
    .map(
      (v, i) => `${(i * stepX).toFixed(1)},${(height - ((v - min) / range) * height).toFixed(1)}`,
    )
    .join(" ");
  const stroke = positive ? "var(--success)" : "var(--destructive)";
  const fill = positive
    ? "color-mix(in oklab, var(--success) 18%, transparent)"
    : "color-mix(in oklab, var(--destructive) 18%, transparent)";
  // Build a closed area by adding bottom corners for fill
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  return (
    <svg width={width} height={height} className="inline-block align-middle">
      <polyline fill={fill} stroke="none" points={areaPoints} />
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}
