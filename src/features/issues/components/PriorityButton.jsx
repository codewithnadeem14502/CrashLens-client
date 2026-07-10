export function PriorityButton({ priority, severity }) {
  const value = priority ?? getPriorityFromSeverity(severity);

  return (
    <span className={`priority-pill ${value}`}>
      {value}
    </span>
  );
}

function getPriorityFromSeverity(severity) {
  if (severity === "critical" || severity === "high") return "high";
  if (severity === "low") return "low";
  return "medium";
}
