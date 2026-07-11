export function EmptyState({ icon: Icon, title, description, actions, children }) {
  return (
    <div className="empty-state-panel">
      {Icon ? (
        <span className="empty-state-icon" aria-hidden="true">
          <Icon />
        </span>
      ) : null}
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {actions?.length ? (
        <div className="empty-state-actions">
          {actions.map((action, index) => (
            <button
              key={action.label}
              className={index === 0 ? "primary-button" : "secondary-button"}
              type="button"
              onClick={action.onClick}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
      {children ? <div className="empty-state-custom-action">{children}</div> : null}
    </div>
  );
}
