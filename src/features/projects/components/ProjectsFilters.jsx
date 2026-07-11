import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { FiFilter } from "react-icons/fi";
import { RoleSelect } from "../../../shared/ui/RoleSelect";

export function ProjectsFilters({
  filters,
  onApplyFilters,
  onResetFilters,
  environmentOptions,
  statusOptions,
  platformOptions,
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

  const hasActiveFilters =
    filters.environment !== "all" ||
    filters.status !== "all" ||
    filters.platform !== "all";

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
          className={
            hasActiveFilters ? "icon-button has-active-filters" : "icon-button"
          }
          type="button"
          aria-label="Open project filters"
          title={hasActiveFilters ? "Filters applied" : "Open filters"}
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
            <span>Projects</span>
          </div>
          <div className="filter-popover-fields">
            <div className="issue-filter-field">
              <span>Environment</span>
              <RoleSelect
                value={draftFilters.environment}
                options={environmentOptions}
                onValueChange={updateDraftFilter("environment")}
              />
            </div>
            <div className="issue-filter-field">
              <span>Status</span>
              <RoleSelect
                value={draftFilters.status}
                options={statusOptions}
                onValueChange={updateDraftFilter("status")}
              />
            </div>
            <div className="issue-filter-field">
              <span>Platform</span>
              <RoleSelect
                value={draftFilters.platform}
                options={platformOptions}
                onValueChange={updateDraftFilter("platform")}
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
