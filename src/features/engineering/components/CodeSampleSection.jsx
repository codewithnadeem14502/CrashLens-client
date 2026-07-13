import { CODE_SAMPLES } from "../content/codeSample";

export function CodeSampleSection() {
  return (
    <section className="panel engineering-panel">
      <div className="panel-heading">
        <h2>Quick start</h2>
        <p className="muted">
          The real public API of the <code>crashlens</code> SDK - install it, point it
          at your project's DSN, and errors start showing up as issues.
        </p>
      </div>

      {CODE_SAMPLES.map((sample) => (
        <div key={sample.label} className="engineering-code-block">
          <span className="engineering-code-label">{sample.label}</span>
          <pre className="stack-trace">
            <code>{sample.code}</code>
          </pre>
        </div>
      ))}
    </section>
  );
}

export default CodeSampleSection;
