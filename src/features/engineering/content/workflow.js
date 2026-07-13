// Node/edge data for the HLD diagram. `kind` on an edge is "sync" (HTTP
// request/response) or "async" (RabbitMQ publish/consume) - drives the
// legend and the connector styling in WorkflowDiagram.jsx.

export const MAIN_FLOW = [
  {
    id: "sdk",
    title: "App + crashlens SDK",
    detail: "Third-party Node.js app; captureException/captureMessage or the Express error handler.",
  },
  {
    id: "gateway",
    title: "API Gateway :3000",
    detail: "Rewrites /v1/* to /api/*; verifies JWTs (except ingestion & auth-bootstrap routes) and rate-limits every route.",
  },
  {
    id: "event",
    title: "Event Service :3003",
    detail: "Validates the DSN against a local cache, accepts the event, then publishes it - no synchronous work beyond that.",
  },
  {
    id: "broker",
    title: "RabbitMQ - crashlens.events",
    detail: "Topic exchange. event.ingested routes to worker-service.",
  },
  {
    id: "worker",
    title: "Worker Service :3004",
    detail: "Dedupes, fingerprints, and classifies the event, then publishes an occurrence.",
  },
  {
    id: "issue",
    title: "Issue Service :3005",
    detail: "Groups the occurrence into an Issue by fingerprint, persists to MongoDB.",
  },
  {
    id: "client",
    title: "crashLens-client",
    detail: "Queries /v1/issues/* (via the gateway) to render the dashboard.",
  },
];

export const MAIN_EDGES = [
  { from: "sdk", to: "gateway", kind: "sync", label: "POST /v1/events (DSN auth)" },
  { from: "gateway", to: "event", kind: "sync", label: "proxy -> /api/events" },
  { from: "event", to: "broker", kind: "async", label: "publish event.ingested" },
  { from: "broker", to: "worker", kind: "async", label: "consume" },
  { from: "worker", to: "issue", kind: "async", label: "publish issue.occurrence.detected" },
  { from: "issue", to: "client", kind: "sync", label: "GET /v1/issues/* (via gateway)" },
];

export const SUPPORTING_FLOWS = [
  {
    id: "auth",
    title: "Authentication & authorization",
    steps: [
      "Client calls POST /v1/auth/login (or /organizations to register) - gateway-exempt from JWT, since this is how a token is obtained.",
      "auth-service verifies credentials, issues a signed access + refresh JWT (sub, organizationId, membershipId, role, permissions).",
      "Every subsequent request carries the JWT; api-gateway verifies it, then the owning service verifies it again independently.",
    ],
  },
  {
    id: "project-dsn",
    title: "Project & DSN validation",
    steps: [
      "project-service owns Project + DSN; create/regenerate publishes a project.* lifecycle event.",
      "event-service's async consumer syncs its local DsnCache - never a synchronous call back to project-service.",
      "Ingestion validates the DSN against that local cache and hard-rejects on a miss (401).",
    ],
  },
  {
    id: "monitor-uptime",
    title: "Cron & uptime monitoring (bypasses the error pipeline)",
    steps: [
      "monitor-service's cron-sweep and uptime-prober jobs run on a timer, independent of ingestion.",
      "A missed check-in, timeout, or downed probe publishes issue.occurrence.detected directly - skipping worker-service entirely.",
      "issue-service's existing fingerprint-upsert logic absorbs it onto the same Issue timeline as application errors.",
    ],
  },
  {
    id: "alerts-dashboards",
    title: "Dashboards & alerts (no RabbitMQ)",
    steps: [
      "alert-service mints a short-lived (60s), read-only system JWT for itself.",
      "It calls issue-service and monitor-service's existing HTTP APIs directly - synchronous reads, on a periodic sweep.",
      "Widget rendering, the query-builder preview, and alert-rule evaluation all reuse the same generic query executor.",
    ],
  },
  {
    id: "reliability",
    title: "Retry & dead-letter handling",
    steps: [
      "Consumers (worker-service, issue-service) requeue via a TTL+DLX pattern, tracking attempts in an x-retry-count header, up to 3 tries.",
      "Publishers (project-service, monitor-service) retry with backoff and fall back to a DLQ on exhaustion.",
      "Gap: event-service's own publisher has no retry/DLQ wrapper yet - a transient publish failure there is currently unguarded.",
    ],
  },
];
