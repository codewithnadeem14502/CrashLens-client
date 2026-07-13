import { TECH_STACK_GROUPS } from "../content/techStack";

export function TechStackSection() {
  return (
    <section className="panel engineering-panel">
      <div className="panel-heading">
        <h2>Technology stack</h2>
        <p className="muted">Why each piece of the stack was chosen.</p>
      </div>

      <div className="engineering-stack-grid">
        {TECH_STACK_GROUPS.map((group) => (
          <div key={group.group} className="engineering-stack-group">
            <h3>{group.group}</h3>
            <ul className="engineering-stack-list">
              {group.items.map((item) => (
                <li key={item.name}>
                  <strong>{item.name}</strong>
                  <span className="muted">{item.why}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TechStackSection;
