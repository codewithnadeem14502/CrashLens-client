import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/auth/useAuth";
import { useToast } from "../../shared/components/useToast";
import { getApiError } from "../../shared/api/errors";
import {
  listIssues,
  updateIssueStatus,
} from "../../features/issues/api/issuesService";
import { WorkspaceLayout } from "../../shared/layouts/WorkspaceLayout";
import { UserBadge } from "../../features/members/components/UserBadge";
import IssueList from "../../features/issues/components/IssueList";
import { hasPermission } from "../../shared/auth/permissions";
import { Permissions } from "../../shared/auth/authEnums";
import { FiFilter, FiRefreshCw } from "react-icons/fi";
import * as Popover from "@radix-ui/react-popover";
import * as Separator from "@radix-ui/react-separator";
import SearchBar from "../../shared/components/SearchBar";
import { RoleSelect } from "../../shared/ui/RoleSelect";

const ISSUE_PAGE_LIMIT = 5;

const statusFilterOptions = [
  { value: "all", label: "All statuses" },
  { value: "unresolved", label: "Unresolved" },
  { value: "resolved", label: "Resolved" },
  { value: "ignored", label: "Ignored" },
];

const severityFilterOptions = [
  { value: "all", label: "All severity" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title-asc", label: "A to Z" },
  { value: "title-desc", label: "Z to A" },
  { value: "occurrences-desc", label: "Most occurrences" },
  { value: "occurrences-asc", label: "Fewest occurrences" },
];

const Issues = () => {
  const { session, signOut } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const organizationId = session.organizationId;

  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [issuePagination, setIssuePagination] = useState({
    page: 1,
    limit: ISSUE_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [issuePage, setIssuePage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(defaultIssueFilters);
  const [draftFilters, setDraftFilters] = useState(defaultIssueFilters);
  const [isLoading, setIsLoading] = useState(true);
  const canViewIssue = useMemo(
    () => hasPermission(session, Permissions.ISSUE_VIEW),
    [session],
  );

  const canUpdateIssue = useMemo(
    () => hasPermission(session, Permissions.ISSUE_UPDATE),
    [session],
  );

  const fetchIssues = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const issueData = await listIssues({
        page: issuePage,
        limit: ISSUE_PAGE_LIMIT,
      });
      const nextIssues = Array.isArray(issueData.issues)
        ? issueData.issues
        : [];
      setIssues(nextIssues);
      setIssuePagination(
        issueData.pagination ?? {
          page: issuePage,
          limit: ISSUE_PAGE_LIMIT,
          total: nextIssues.length,
          totalPages: 1,
        },
      );
    } catch (error) {
      notify({
        title: "Could not load issues",
        description: getApiError(error),
        tone: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [issuePage, organizationId, notify]);

  const handleUpdateIssueStatus = async (issueId, status) => {
    try {
      await updateIssueStatus(issueId, status);
      notify({
        title: "Issue status updated",
        description: `Issue marked as ${status}.`,
        tone: "success",
      });
      await fetchIssues();
    } catch (error) {
      notify({
        title: "Could not update issue status",
        description: getApiError(error),
        tone: "danger",
      });
    }
  };

  const handleIssueEvents = (issue) => {
    const issueId = issue.id ?? issue._id;
    if (issueId) {
      navigate(`/workspace/issues/issue-detail/${issueId}`);
    }
  };

  const filterIssues = useCallback((issues, query) => {
    const search = query.trim().toLowerCase();

    return issues.filter((issue) => {
      return (
        issue.title?.toLowerCase().includes(search) ||
        issue.message?.toLowerCase().includes(search) ||
        issue.errorName?.toLowerCase().includes(search) ||
        issue.culprit?.toLowerCase().includes(search) ||
        issue.status?.toLowerCase().includes(search) ||
        issue.severity?.toLowerCase().includes(search)
      );
    });
  }, []);

  const visibleIssues = useMemo(() => {
    return [...filteredIssues]
      .filter(
        (issue) =>
          appliedFilters.status === "all" ||
          issue.status === appliedFilters.status,
      )
      .filter(
        (issue) =>
          appliedFilters.severity === "all" ||
          issue.severity === appliedFilters.severity,
      )
      .sort((left, right) => compareIssues(left, right, appliedFilters.sort));
  }, [appliedFilters, filteredIssues]);

  const hasActiveFilters = useMemo(
    () =>
      appliedFilters.status !== defaultIssueFilters.status ||
      appliedFilters.severity !== defaultIssueFilters.severity ||
      appliedFilters.sort !== defaultIssueFilters.sort,
    [appliedFilters],
  );

  const updateDraftFilter = (field) => (value) => {
    setDraftFilters((current) => ({ ...current, [field]: value }));
  };

  const applyFilters = () => {
    setIssuePage(1);
    setAppliedFilters(draftFilters);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setIssuePage(1);
    setDraftFilters(defaultIssueFilters);
    setAppliedFilters(defaultIssueFilters);
    setIsFilterOpen(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIssues();
  }, [fetchIssues]);
  return (
    <WorkspaceLayout onSignOut={signOut}>
      <header className="workspace-header">
        <div>
          <h1>Issues</h1>
          <p className="muted">Review grouped errors and update issue status</p>
        </div>

        <UserBadge session={session} />
      </header>
      <div className="single-panel-grid">
        <section className="panel member-list-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Directory</p>
              <h2>{issuePagination.total} Issues</h2>
            </div>

            <div className="panel-actions">
              <Popover.Root open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <Popover.Trigger asChild>
                  <button
                    className={`icon-button ${hasActiveFilters ? "active" : ""}`}
                    type="button"
                    aria-label="Open issue filters"
                  >
                    <FiFilter />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    className="filter-popover"
                    align="end"
                    sideOffset={8}
                  >
                    <div className="filter-popover-header">
                      <strong>Filters</strong>
                      {hasActiveFilters ? <span>Applied</span> : null}
                    </div>
                    <div className="filter-popover-fields">
                      <div className="field">
                        <label className="label">Status</label>
                        <RoleSelect
                          value={draftFilters.status}
                          options={statusFilterOptions}
                          onValueChange={updateDraftFilter("status")}
                        />
                      </div>
                      <div className="field">
                        <label className="label">Severity</label>
                        <RoleSelect
                          value={draftFilters.severity}
                          options={severityFilterOptions}
                          onValueChange={updateDraftFilter("severity")}
                        />
                      </div>
                      <div className="field">
                        <label className="label">Sort</label>
                        <RoleSelect
                          value={draftFilters.sort}
                          options={sortOptions}
                          onValueChange={updateDraftFilter("sort")}
                        />
                      </div>
                    </div>
                    <div className="filter-popover-actions">
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={resetFilters}
                      >
                        Reset
                      </button>
                      <button
                        className="primary-button"
                        type="button"
                        onClick={applyFilters}
                      >
                        Apply
                      </button>
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>

              <button
                className="icon-button"
                type="button"
                onClick={fetchIssues}
                aria-label="Refresh Issue"
              >
                <FiRefreshCw />
              </button>
            </div>
          </div>

          <SearchBar
            data={issues}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterFn={filterIssues}
            onFilteredData={setFilteredIssues}
            placeholder="Search issues..."
          />

          <Separator.Root className="separator" />
          {!isLoading && visibleIssues.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              {searchQuery || hasActiveFilters
                ? "No issues match your filters."
                : "No issues available yet."}
            </div>
          )}
          {isLoading || visibleIssues.length > 0 ? (
            <IssueList
              issues={visibleIssues}
              isLoading={isLoading}
              canManageIssue={canUpdateIssue}
              canReadIssue={canViewIssue}
              onUpdateIssueStatus={handleUpdateIssueStatus}
              onViewIssueEvents={handleIssueEvents}
              pagination={issuePagination}
              onPageChange={setIssuePage}
            />
          ) : null}
        </section>
      </div>
    </WorkspaceLayout>
  );
};

export default Issues;

const defaultIssueFilters = Object.freeze({
  status: "all",
  severity: "all",
  sort: "newest",
});

function compareIssues(left, right, sortMode) {
  if (sortMode === "title-asc") {
    return getIssueTitle(left).localeCompare(getIssueTitle(right));
  }

  if (sortMode === "title-desc") {
    return getIssueTitle(right).localeCompare(getIssueTitle(left));
  }

  if (sortMode === "occurrences-desc") {
    return getOccurrenceCount(right) - getOccurrenceCount(left);
  }

  if (sortMode === "occurrences-asc") {
    return getOccurrenceCount(left) - getOccurrenceCount(right);
  }

  if (sortMode === "oldest") {
    return getIssueTime(left) - getIssueTime(right);
  }

  return getIssueTime(right) - getIssueTime(left);
}

function getIssueTitle(issue) {
  return issue.title ?? issue.message ?? "";
}

function getIssueTime(issue) {
  return new Date(
    issue.lastSeen ?? issue.updatedAt ?? issue.createdAt ?? 0,
  ).getTime();
}

function getOccurrenceCount(issue) {
  return Number(issue.occurrenceCount ?? 0);
}
