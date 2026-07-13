// Grouped from the real package.json manifests in crashLens-client and each
// crasLens-backend service - nothing listed here unless it's an actual
// dependency in use.

export const TECH_STACK_GROUPS = [
  {
    group: "Client",
    items: [
      { name: "React 19", where: "crashLens-client", why: "The dashboard's UI runtime." },
      { name: "Vite 8", where: "crashLens-client", why: "Dev server and production build." },
      { name: "React Router v7", where: "src/routes/AppRoutes.jsx", why: "Client-side routing, gated by ProtectedRoute." },
      { name: "Tailwind CSS v4 (CSS-first, @tailwindcss/vite)", where: "src/index.css", why: "Utility classes layered on top of the token-driven CSS in app.css." },
      { name: "Radix UI (24 packages)", where: "src/shared/, src/features/*/components", why: "Accessible primitives - select, dialog, toast, tooltip, tabs, popover, and more." },
      { name: "Recharts", where: "PerformancePage.jsx", why: "The only charting library in the client - performance graphs." },
      { name: "react-icons (Feather set)", where: "throughout src/", why: "The house icon set - no lucide, no separate icon component library." },
      { name: "axios", where: "shared/api/client.js", why: "The single HTTP client instance every feature calls through." },
    ],
  },
  {
    group: "Backend runtime & framework",
    items: [
      { name: "Node.js", where: "all 8 services", why: "Runtime for every backend service." },
      { name: "Express", where: "all 8 services", why: "HTTP framework - each service exports a pure app.js (no listen) separate from server.js." },
      { name: "express-http-proxy", where: "api-gateway, auth-service", why: "Rewrites and forwards /v1/* to each service's /api/* mount." },
    ],
  },
  {
    group: "Databases & data access",
    items: [
      { name: "MongoDB + Mongoose", where: "every service except api-gateway and worker-service's queue-only path", why: "One database per service - no shared schema, no cross-service joins." },
      { name: "ioredis", where: "api-gateway, auth-service, project-service, event-service, issue-service", why: "Rate-limit counters (via rate-limit-redis) at the gateway and auth/ingestion routes; project-service also uses it for a real cache-aside layer." },
    ],
  },
  {
    group: "Messaging & asynchronous processing",
    items: [
      { name: "RabbitMQ (amqplib)", where: "project-service, event-service, worker-service, issue-service, monitor-service", why: "Topic exchange crashlens.events carries every async event; alert-service is the only service that doesn't touch it." },
    ],
  },
  {
    group: "Authentication & security",
    items: [
      { name: "jsonwebtoken", where: "auth-service (issuance), every JWT-verifying service", why: "Signs and verifies access/refresh/system tokens." },
      { name: "helmet", where: "every service", why: "Standard HTTP security headers." },
      { name: "cors", where: "every service", why: "Cross-origin request handling for the client." },
      { name: "express-rate-limit + rate-limit-redis", where: "api-gateway (all proxied routes), auth-service, project-service, event-service, issue-service", why: "Redis-backed request throttling; the gateway applies it globally, including to unauthenticated ingestion." },
      { name: "rate-limiter-flexible", where: "auth-service, event-service, issue-service, project-service", why: "A second, service-local limiter alongside the gateway's." },
    ],
  },
  {
    group: "Validation",
    items: [
      { name: "Joi", where: "every backend service", why: "Request body and query-param validation - the fix for the Module 1 query-injection gap (typed filters instead of raw pass-through)." },
    ],
  },
  {
    group: "Logging & observability",
    items: [
      { name: "winston", where: "every service", why: "Structured request/error logging, with a redactSensitiveFields pass before anything is written." },
    ],
  },
  {
    group: "Testing & code quality",
    items: [
      { name: "node:test + supertest", where: "backend services (each exports app.js for supertest to drive directly)", why: "Route-level tests without binding a real port." },
      { name: "vitest + @testing-library/react + jsdom", where: "crashLens-client", why: "Component/page tests, configured inside vite.config.js." },
      { name: "ESLint 10 (flat config)", where: "crashLens-client", why: "react-hooks and react-refresh rules enforced; no prop-types rule installed." },
    ],
  },
  {
    group: "Infrastructure & local development",
    items: [
      { name: "dotenv", where: "every backend service", why: "Per-service .env, copied from each service's own .env.example." },
      { name: "nodemon", where: "npm run dev in every backend service", why: "Auto-reload during local development." },
      { name: "cron-parser", where: "monitor-service", why: "Evaluates cron expressions for scheduled check-in monitoring." },
      { name: "nodemailer", where: "alert-service", why: "Delivers alert notifications." },
    ],
  },
];
