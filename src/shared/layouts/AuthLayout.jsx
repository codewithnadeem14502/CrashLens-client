import { Link } from "react-router-dom";
import { FiActivity, FiCheck, FiShield, FiZap } from "react-icons/fi";

export function AuthLayout({ children }) {
  return (
    <main className="auth-shell">
      <div className="auth-ambient auth-ambient-one" aria-hidden="true" />
      <div className="auth-ambient auth-ambient-two" aria-hidden="true" />

      <section className="auth-brand">
        <Link className="auth-logo" to="/" aria-label="CrashLens home">
          <span className="brand-mark"><FiShield /></span>
          <span>CrashLens</span>
        </Link>
        <div className="auth-brand-copy">
          <p className="eyebrow"><FiActivity /> One signal. Total context.</p>
          <h1>Turn production noise into <span>clear action.</span></h1>
        </div>
        <p className="brand-copy">
          Monitor errors, traces, logs, and uptime from one focused workspace built for teams that ship often.
        </p>
        <div className="auth-proof" aria-label="CrashLens benefits">
          <span><FiCheck /> Set up in minutes</span>
          <span><FiZap /> Built for fast triage</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-form-glow" aria-hidden="true" />
        {children}
      </section>
    </main>
  );
}
