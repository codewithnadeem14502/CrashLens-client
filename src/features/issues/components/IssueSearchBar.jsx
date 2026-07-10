import { FiSearch, FiX } from "react-icons/fi";

export function IssueSearchBar({
  value,
  onChange,
  activeStatus,
  activeSeverity,
  resultCount,
}) {
  const chips = [
    activeStatus !== "all" ? `is:${activeStatus}` : null,
    activeSeverity !== "all" ? `severity:${activeSeverity}` : null,
  ].filter(Boolean);

  return (
    <section className="issue-search-row" aria-label="Search issues">
      <div className="issue-search-box">
        <FiSearch />
        <div className="issue-query-chips">
          {chips.map((chip) => (
            <span className="query-chip" key={chip}>
              {chip}
            </span>
          ))}
        </div>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by title, error, culprit, status, or severity"
          type="search"
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
      <span className="issue-result-count">{resultCount} shown</span>
    </section>
  );
}
