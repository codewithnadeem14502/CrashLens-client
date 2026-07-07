import { FiShield } from "react-icons/fi";

export function AuthLayout({ children }) {
  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <div className="brand-mark">
          <FiShield />
        </div>
        <p className="eyebrow">CrashLens</p>
        <h1>Operational clarity for every crash, issue, and team member.</h1>
        <p className="brand-copy">
          Start an organization, sign in through the API gateway, and manage RBAC members from a clean control surface.
        </p>
      </section>

      <section className="auth-panel">{children}</section>
    </main>
  );
}
