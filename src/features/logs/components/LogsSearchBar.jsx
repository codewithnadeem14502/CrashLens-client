import { FiSearch, FiX } from "react-icons/fi";

export function LogsSearchBar({
  value,
  onChange,
  activeLevel,
  resultCount,
  onClearLevel,
}) {
  return (
    <section className="issue-search-row" aria-label="Search logs">
      <div className="issue-search-box">
        <FiSearch />
        <div className="issue-query-chips">
          {activeLevel !== "all" ? (
            <span className="query-chip">
              level:{activeLevel}
              <button
                className="query-chip-remove"
                type="button"
                onClick={onClearLevel}
                aria-label="Remove level filter"
              >
                <FiX />
              </button>
            </span>
          ) : null}
        </div>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search log messages"
          type="text"
        />
        {value ? (
          <button
            className="issue-search-clear"
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear log search"
          >
            <FiX />
          </button>
        ) : null}
      </div>
      <span className="issue-result-count">{resultCount} shown</span>
    </section>
  );
}
