import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { FiFilter } from "react-icons/fi";
import { RoleSelect } from "../../../shared/ui/RoleSelect";

export function IssuesFilters({
  filters,
  onApplyFilters,
  onResetFilters,
  statusOptions,
  severityOptions,
  sortOptions,
}) {
  const [draftFilters, setDraftFilters] = useState(filters);

  const updateDraftFilter = (field) => (value) => {
    setDraftFilters((current) => ({ ...current, [field]: value }));
  };

  const applyFilters = () => {
    onApplyFilters(draftFilters);
  };

  const resetFilters = () => {
    setDraftFilters(filters);
    onResetFilters();
  };

  return (
    <Popover.Root
      onOpenChange={(isOpen) => {
        if (isOpen) {
          setDraftFilters(filters);
        }
      }}
    >
      <Popover.Trigger asChild>
        <button
          className="icon-button"
          type="button"
          aria-label="Open issue filters"
        >
          <FiFilter />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="filter-popover"
          side="bottom"
          align="end"
          sideOffset={10}
        >
          <div className="filter-popover-header">
            <strong>Filters</strong>
            <span>Issues</span>
          </div>
          <div className="filter-popover-fields">
            <div className="issue-filter-field">
              <span>Status</span>
              <RoleSelect
                value={draftFilters.status}
                options={statusOptions}
                onValueChange={updateDraftFilter("status")}
              />
            </div>
            <div className="issue-filter-field">
              <span>Severity</span>
              <RoleSelect
                value={draftFilters.severity}
                options={severityOptions}
                onValueChange={updateDraftFilter("severity")}
              />
            </div>
            <div className="issue-filter-field sort-field">
              <span>Sort</span>
              <RoleSelect
                value={draftFilters.sort}
                options={sortOptions}
                onValueChange={updateDraftFilter("sort")}
              />
            </div>
          </div>
          <div className="filter-popover-actions">
            <Popover.Close asChild>
              <button
                className="secondary-button"
                type="button"
                onClick={resetFilters}
              >
                Reset
              </button>
            </Popover.Close>
            <Popover.Close asChild>
              <button
                className="primary-button"
                type="button"
                onClick={applyFilters}
              >
                Apply
              </button>
            </Popover.Close>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
