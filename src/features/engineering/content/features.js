// Verified against crasLens-backend + crashLens-client source - only
// features with a confirmed implementation are listed here.

export const FEATURES = [
  {
    name: "Error Monitoring",
    owner: "event-service, worker-service, issue-service",
    description:
      "Your app's SDK reports exceptions as they happen. CrashLens fingerprints each one and groups repeat occurrences into a single Issue instead of showing every crash separately, then tracks how often and when it recurs.",
  },
  {
    name: "Performance Monitoring",
    owner: "event-service, issue-service",
    description:
      "Captures request transactions (route, duration, status code) so you can see which endpoints are slow or erroring, with per-endpoint p95 latency and error rate.",
  },
  {
    name: "Logs",
    owner: "event-service, issue-service",
    description:
      "Send batches of structured log lines from your app. They're searchable in the dashboard and can be linked back to a specific request trace.",
  },
  {
    name: "Cron & Uptime Monitoring",
    owner: "monitor-service",
    description:
      "Scheduled jobs check in on a cron expression; if one goes missing or times out, it's flagged. Uptime monitors periodically probe a URL and flag it down after repeated failures.",
  },
  {
    name: "Issue Triage",
    owner: "issue-service",
    description:
      "Every grouped issue can be marked resolved or ignored, and you can see its full occurrence history - every time it happened, not just the first.",
  },
  {
    name: "Dashboards",
    owner: "alert-service",
    description:
      "Build a custom dashboard from widgets, each backed by a live query over your issues, logs, performance, or monitor data.",
  },
  {
    name: "Alerts",
    owner: "alert-service",
    description:
      "Define a rule against the same query engine dashboards use; it's evaluated on a schedule and fires when your threshold is crossed.",
  },
  {
    name: "Projects & DSN Management",
    owner: "project-service",
    description:
      "Each project gets a DSN - a connection string your app's SDK uses to authenticate. No user login is required on the sending side; the DSN is the credential, and it can be regenerated any time.",
  },
  {
    name: "Authentication & Teams",
    owner: "auth-service",
    description:
      "Sign up, invite teammates, and control what they can do with three roles - Admin, Developer, Viewer. Sessions are short-lived JWTs backed by rotating refresh tokens.",
  },
];
