import { FEATURES } from "../content/features";

export function FeatureOverview() {
  return (
    <section className="panel engineering-panel">
      <div className="panel-heading">
        <h2>Key features</h2>
      </div>

      <div className="engineering-feature-grid">
        {FEATURES.map((feature) => (
          <article key={feature.name} className="engineering-feature-card">
            <h3>{feature.name}</h3>
            <p className="muted">{feature.description}</p>
            <code className="engineering-owner">{feature.owner}</code>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeatureOverview;
