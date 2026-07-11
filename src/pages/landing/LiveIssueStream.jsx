// Purely decorative mock of the Issues list, used in the landing hero to
// demonstrate the product visually instead of only describing it in text.
// Rows loop via CSS animation (see .landing-stream-row / @keyframes
// landing-stream-in in app.css); prefers-reduced-motion turns the loop off
// and shows a static resting state (also handled in app.css).
const MOCK_ROWS = [
  { severity: "critical", title: "TypeError: Cannot read properties of undefined", time: "12s ago" },
  { severity: "high", title: "PaymentGatewayTimeout in checkout-service", time: "48s ago" },
  { severity: "medium", title: "Slow endpoint: GET /api/v1/reports (p95 2.4s)", time: "2m ago" },
  { severity: "low", title: "UptimeDown: status.crashlens.dev", time: "4m ago" },
];

export function LiveIssueStream() {
  return (
    <div className="landing-stream" aria-hidden="true">
      <div className="landing-stream-header">
        <span className="landing-stream-dot" />
        Live issue stream
      </div>
      {MOCK_ROWS.map((row) => (
        <div className="landing-stream-row" key={row.title}>
          <span className={`severity-dot ${row.severity}`} />
          <strong>{row.title}</strong>
          <span>{row.time}</span>
        </div>
      ))}
    </div>
  );
}
