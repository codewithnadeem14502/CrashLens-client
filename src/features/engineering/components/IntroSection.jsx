export function IntroSection() {
  return (
    <section className="panel engineering-panel">
      <p className="muted">
        CrashLens is an error-monitoring and observability platform. Install the{" "}
        <code>crashlens</code> SDK in your app, and it reports exceptions,
        performance data, and logs back here - grouped into issues instead of a
        flood of individual crash reports.
      </p>
      <p className="muted">
        An event's path: your app's SDK → API Gateway → Event Service (accepts it)
        → RabbitMQ → Worker Service (dedupe + fingerprint) → Issue Service (groups
        it into an issue) → this dashboard.
      </p>
    </section>
  );
}

export default IntroSection;
