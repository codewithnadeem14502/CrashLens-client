import { Link } from "react-router-dom";
import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiBell,
  FiCheckCircle,
  FiFileText,
  FiRadio,
  FiShield,
  FiUploadCloud,
  FiZap,
} from "react-icons/fi";
import { useAuth } from "../../shared/auth/useAuth";
import { LiveIssueStream } from "./LiveIssueStream";
import { useScrollReveal } from "./useScrollReveal";

const STATS = [
  { value: "8", label: "Microservices, one product" },
  { value: "1", label: "Triage queue for every signal" },
  { value: "4", label: "Signal types unified" },
  { value: "<5 min", label: "From install to first event" },
];

const PIPELINE = [
  {
    icon: FiUploadCloud,
    title: "Instrument",
    description:
      "Drop the crashlens SDK into your app - one init call, no extra infrastructure to run.",
  },
  {
    icon: FiRadio,
    title: "Ingest & group",
    description:
      "Errors, traces, logs, and check-ins stream through the gateway and get grouped automatically.",
  },
  {
    icon: FiCheckCircle,
    title: "Triage & fix",
    description:
      "One prioritized issue queue with full context - triage once, ship the fix.",
  },
];

const FLOW = [
  {
    key: "catch",
    eyebrow: "Catch it",
    title: "Know the moment something breaks",
    description:
      "Every unhandled error and missed heartbeat lands in one triage queue, grouped and prioritized automatically - not scattered across log files and cron output.",
    features: [
      {
        icon: FiShield,
        title: "Error Monitoring & Issue Tracking",
        description:
          "The crashlens SDK captures exceptions with a full stack trace, request context, and environment, then groups repeat occurrences into a single Issue you triage once instead of a hundred times.",
      },
      {
        icon: FiRadio,
        title: "Cron & Uptime Monitoring",
        description:
          "Cron jobs check in on a schedule and uptime probes hit your endpoints on a timer - a missed check-in, a timeout, or a downed URL becomes an issue with the same triage flow as an error.",
      },
    ],
  },
  {
    key: "understand",
    eyebrow: "Understand it",
    title: "See the request, not just the exception",
    description:
      "Latency, throughput, and the surrounding log lines sit next to the error - so you're reading the whole story before you start debugging, not just a stack trace in isolation.",
    features: [
      {
        icon: FiActivity,
        title: "Performance Monitoring & Tracing",
        description:
          "Per-endpoint request volume, average/p95/p99 latency, and error rate over time - so a slow release shows up as a trend on a chart, not a string of angry support tickets.",
      },
      {
        icon: FiFileText,
        title: "Logs",
        description:
          "Batched log ingestion with level and search filtering, cross-linked to the trace that produced them - go from a slow request straight to the log lines around it.",
      },
      {
        icon: FiBarChart2,
        title: "Custom Dashboards & Alerts",
        description:
          "Build a dashboard from the same issue/performance/log/monitor data with a widget-and-query builder, and wire alert rules on top so the right threshold pages the right person.",
      },
    ],
  },
  {
    key: "fix",
    eyebrow: "Fix it",
    title: "Get to the fix faster, with a human still in the loop",
    description:
      "A read-only assistant reads the same stack trace and context you'd read yourself and proposes a fix to review - it never opens a pull request or touches your repository on its own.",
    features: [
      {
        icon: FiZap,
        title: "AI-Assisted Issue Resolution",
        description:
          "Suggested root cause and fix, generated from the issue's own stack trace and event context - a starting point for the engineer who owns the fix, not an autonomous commit.",
        upcoming: true,
      },
    ],
  },
];

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const revealRef = useScrollReveal();
  const ctaTo = isAuthenticated ? "/workspace/projects" : "/auth";
  const ctaLabel = isAuthenticated ? "Open dashboard" : "Get started";

  return (
    <div className="landing-page" ref={revealRef}>
      <header className="landing-nav">
        <div className="landing-nav-pill">
          <span className="landing-nav-brand">
            <span className="brand-mark small">
              <FiShield />
            </span>
            CrashLens
          </span>
          <div className="landing-nav-actions">
            {!isAuthenticated && (
              <Link className="text-button" to="/auth">
                Sign in
              </Link>
            )}
            <Link className="primary-button" to={ctaTo}>
              {ctaLabel}
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-aurora" aria-hidden="true" />
        <div className="landing-hero-grid" aria-hidden="true" />
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <span className="landing-eyebrow">
              <FiShield /> Operational clarity for every crash
            </span>
            <h1 className="landing-title">
              Catch it, understand it, <span>fix it</span> - all in one place
            </h1>
            <p className="landing-subtitle">
              CrashLens brings error monitoring, performance tracing, logs,
              uptime checks, and dashboards into a single triage surface -
              so your team spends less time hunting across tools and more
              time shipping the fix.
            </p>
            <div className="landing-cta-row">
              <Link className="primary-button" to={ctaTo}>
                {ctaLabel}
                <FiArrowRight />
              </Link>
              {!isAuthenticated && (
                <Link className="secondary-button" to="/auth">
                  Sign in
                </Link>
              )}
            </div>
            <div className="landing-trust-row" aria-label="Getting started benefits">
              <span><FiCheckCircle /> One SDK install</span>
              <span><FiCheckCircle /> No credit card</span>
            </div>
          </div>

          <div className="landing-preview-wrap">
            <div className="landing-preview-glow" aria-hidden="true" />
            <div className="landing-preview-card">
              <div className="landing-preview-topbar">
                <span><i /> Live production signals</span>
                <span className="landing-preview-status">Monitoring</span>
              </div>
              <LiveIssueStream />
              <div className="landing-preview-footer">
                <span>Errors</span>
                <strong>Grouped automatically</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-stats" aria-label="CrashLens at a glance">
        {STATS.map((stat, index) => (
          <div className="landing-stat landing-reveal" key={stat.label}>
            <span className="landing-stat-index">0{index + 1}</span>
            <div className="landing-stat-value"><strong>{stat.value}</strong></div>
            <span className="landing-stat-label">{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="landing-pipeline-section">
        <div className="landing-flow-section-header landing-reveal">
          <span className="landing-flow-eyebrow">How it works</span>
          <h2 className="landing-flow-title">
            From first error to shipped fix
          </h2>
          <p className="landing-flow-description">
            Three steps, no glue code between them.
          </p>
        </div>
        <div className="landing-pipeline">
          {PIPELINE.map((step, index) => (
            <div className="landing-pipeline-step landing-reveal" key={step.title}>
              <div className="landing-pipeline-card-top">
                <span className="landing-pipeline-icon"><step.icon /></span>
                <span className="landing-pipeline-number">0{index + 1}</span>
              </div>
              <div className="landing-pipeline-copy">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {index < PIPELINE.length - 1 && (
                <span className="landing-pipeline-connector" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </section>

      {FLOW.map((group, groupIndex) => (
        <section className={`landing-flow landing-flow-${group.key}`} key={group.key}>
          <div className="landing-flow-shell">
            <div className="landing-flow-section-header landing-reveal">
              <span className="landing-flow-number">0{groupIndex + 1}</span>
              <span className="landing-flow-eyebrow">{group.eyebrow}</span>
              <h2 className="landing-flow-title">{group.title}</h2>
              <p className="landing-flow-description">{group.description}</p>
            </div>
            <div className="landing-feature-grid">
              {group.features.map((feature) => (
                <article
                  className={`landing-feature-card landing-reveal${
                    feature.upcoming ? " is-upcoming" : ""
                  }`}
                  key={feature.title}
                >
                  <div className="landing-feature-card-header">
                    <span className="landing-feature-icon"><feature.icon /></span>
                    {feature.upcoming && (
                      <span className="landing-upcoming-badge">Upcoming</span>
                    )}
                  </div>
                  <div className="landing-feature-card-copy">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                  <span className="landing-feature-line" aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="landing-footer-cta landing-reveal">
        <h2 className="landing-flow-title">
          Bring your errors, traces, and logs into one place
        </h2>
        <p className="landing-flow-description">
          Create an organization and start ingesting events in minutes.
        </p>
        <Link className="primary-button" to={ctaTo}>
          {ctaLabel}
          <FiArrowRight />
        </Link>
      </section>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} CrashLens</span>
        <span className="landing-nav-brand">
          <FiBell />
          Built for teams that ship often
        </span>
      </footer>
    </div>
  );
}
