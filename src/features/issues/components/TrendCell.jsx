export function TrendCell({ value }) {
  const trend = Number(value ?? 0);
  const bars = [1, 2, 3, 4, 5, 6];
  const activeBars = Math.max(1, Math.min(Math.ceil(trend / 16), bars.length));

  return (
    <span className="trend-cell" aria-label={`${trend} trend score`}>
      {bars.map((bar) => (
        <span
          className={bar <= activeBars ? "active" : ""}
          key={bar}
          style={{ "--bar-height": `${8 + bar * 3}px` }}
        />
      ))}
    </span>
  );
}
