import { FiSearch, FiX } from "react-icons/fi";

export function IssueSearchBar({
  value,
  onChange,
  activeStatus,
  activeSeverity,
  onClearStatus,
  onClearSeverity,
}) {
  const chips = [
    activeStatus !== "all"
      ? { key: "status", label: `is:${activeStatus}`, onRemove: onClearStatus }
      : null,
    activeSeverity !== "all"
      ? {
          key: "severity",
          label: `severity:${activeSeverity}`,
          onRemove: onClearSeverity,
        }
      : null,
  ].filter(Boolean);

  return (
    <section className="issue-search-row" aria-label="Search issues">
      <div className="issue-search-box">
        <FiSearch />
        <div className="issue-query-chips">
          {chips.map((chip) => (
            <span className="query-chip" key={chip.key}>
              {chip.label}
              <button
                className="query-chip-remove"
                type="button"
                onClick={chip.onRemove}
                aria-label={`Remove ${chip.label} filter`}
              >
                <FiX />
              </button>
            </span>
          ))}
        </div>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by title, error"
          type="text"
        />
        {value ? (
          <button
            className="issue-search-clear"
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear issue search"
          >
            <FiX />
          </button>
        ) : null}
      </div>
    </section>
  );
}
