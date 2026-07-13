import { PACKAGES } from "../content/packages";

export function PackagesSection() {
  return (
    <section className="panel engineering-panel">
      <div className="panel-heading">
        <h2>Packages</h2>
        <p className="muted">The real dependencies this product runs on.</p>
      </div>

      <div className="engineering-package-cloud">
        {PACKAGES.map((pkg) => (
          <a
            key={pkg.name}
            href={pkg.url}
            target="_blank"
            rel="noopener noreferrer"
            className="engineering-package-chip"
            title={pkg.note ?? pkg.name}
          >
            {pkg.name}
          </a>
        ))}
      </div>
    </section>
  );
}

export default PackagesSection;
