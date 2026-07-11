import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/auth/useAuth";
import { useToast } from "../../shared/components/useToast";
import { getApiError } from "../../shared/api/errors";
import {
  listIssues,
  updateIssueStatus,
} from "../../features/issues/api/issuesService";
import { WorkspaceLayout } from "../../shared/layouts/WorkspaceLayout";
import IssueList from "../../features/issues/components/IssueList";
import { IssueSearchBar } from "../../features/issues/components/IssueSearchBar";
import { IssuesFilters } from "../../features/issues/components/IssuesFilters";
import { hasPermission } from "../../shared/auth/permissions";
import { Permissions } from "../../shared/auth/authEnums";

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
  const [issuePagination, setIssuePagination] = useState({
    page: 1,
    limit: ISSUE_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [issuePage, setIssuePage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [appliedFilters, setAppliedFilters] = useState(defaultIssueFilters);
  const [isLoading, setIsLoading] = useState(true);

  // Debounce free-text search before it drives a re-fetch, so we don't hit
  // the API on every keystroke. Also resets pagination in the same tick -
  // a new search term can change which page is "page 1" for the matching
  // set, so the user shouldn't land on a now-nonexistent page.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setIssuePage(1);
    }, 350);

    return () => clearTimeout(handle);
  }, [searchQuery]);

  const canViewIssue = useMemo(
    () => hasPermission(session, Permissions.ISSUE_VIEW),
    [session],
  );

  const canUpdateIssue = useMemo(
    () => hasPermission(session, Permissions.ISSUE_UPDATE),
    [session],
  );

  // Guards against overlapping requests resolving out of order (e.g. type
  // "abc" [fires a request], then "abcd" before the first one resolves -
  // without this, if the "abc" response happens to arrive after the
  // "abcd" one, it would silently overwrite the newer, correct results).
  // Only the response for the most recently *fired* request is ever
  // applied, regardless of resolution order.
  const latestRequestIdRef = useRef(0);

  const fetchIssues = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    const requestId = (latestRequestIdRef.current += 1);
    setIsLoading(true);

    try {
      const { sortBy, order } = mapSortToQuery(appliedFilters.sort);
      const issueData = await listIssues({
        page: issuePage,
        limit: ISSUE_PAGE_LIMIT,
        status:
          appliedFilters.status === "all" ? undefined : appliedFilters.status,
        severity:
          appliedFilters.severity === "all"
            ? undefined
            : appliedFilters.severity,
        search: debouncedSearch || undefined,
        sortBy,
        order,
      });

      if (requestId !== latestRequestIdRef.current) {
        return;
      }

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
      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      notify({
        title: "Could not load issues",
        description: getApiError(error),
        tone: "danger",
      });
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    issuePage,
    organizationId,
    notify,
    appliedFilters.status,
    appliedFilters.severity,
    appliedFilters.sort,
    debouncedSearch,
  ]);

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

  // status/severity/search filters and lastSeen/occurrenceCount sorting are
  // now all applied server-side (see fetchIssues) - the API returns exactly
  // the matching page, so no client-side re-filtering is needed here.
  // "title" sort has no backend equivalent field, so that one mode is
  // applied client-side, over the already-server-filtered page only.
  const visibleIssues = useMemo(() => {
    if (appliedFilters.sort === "title-asc" || appliedFilters.sort === "title-desc") {
      return [...issues].sort((left, right) =>
        compareIssues(left, right, appliedFilters.sort),
      );
    }

    return issues;
  }, [issues, appliedFilters.sort]);

  const applyFilters = (nextFilters) => {
    setIssuePage(1);
    setAppliedFilters(nextFilters);
  };

  const resetFilters = () => {
    setIssuePage(1);
    setAppliedFilters(defaultIssueFilters);
  };

  const clearFilterField = (field) => {
    setIssuePage(1);
    setAppliedFilters((current) => ({ ...current, [field]: "all" }));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIssues();
  }, [fetchIssues]);

  // Only hides the toolbar for the true "nothing has ever come in yet"
  // case (no search/filter ever applied, zero results) - once the user has
  // typed a search or picked a filter, the toolbar stays up even if that
  // narrows the result set to zero, so they can still adjust/reset it.
  const isPristineAndEmpty =
    !isLoading &&
    !debouncedSearch &&
    appliedFilters.status === "all" &&
    appliedFilters.severity === "all" &&
    issuePagination.total === 0;

  return (
    <WorkspaceLayout onSignOut={signOut}>
      <main className="issues-page">
        <header className="issues-header">
          <div>
            <p className="eyebrow">Issues</p>
            <h1>Error monitoring</h1>
            <p className="muted">
              Review grouped errors, spot noisy regressions, and update status.
            </p>
          </div>
        </header>

        {!isPristineAndEmpty ? (
          <div className="issues-toolbar">
            <IssueSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              activeStatus={appliedFilters.status}
              activeSeverity={appliedFilters.severity}
              resultCount={issuePagination.total}
              onClearStatus={() => clearFilterField("status")}
              onClearSeverity={() => clearFilterField("severity")}
            />
            <IssuesFilters
              filters={appliedFilters}
              onApplyFilters={applyFilters}
              onResetFilters={resetFilters}
              statusOptions={statusFilterOptions}
              severityOptions={severityFilterOptions}
              sortOptions={sortOptions}
            />
          </div>
        ) : null}

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
      </main>
    </WorkspaceLayout>
  );
};

export default Issues;

const defaultIssueFilters = Object.freeze({
  status: "all",
  severity: "all",
  sort: "newest",
});

// Maps the UI's combined sort mode to issue-service's actual sortBy/order
// query params (GET /api/issues - Joi-validated to
// lastSeen|firstSeen|occurrenceCount|createdAt|severity). "title" isn't a
// real backend field (it's derived client-side from title ?? message), so
// those two modes intentionally return no sortBy/order - the server falls
// back to its default (lastSeen desc) and the title ordering is applied
// client-side afterward, over just the returned page (see visibleIssues).
function mapSortToQuery(sortMode) {
  switch (sortMode) {
    case "oldest":
      return { sortBy: "lastSeen", order: "asc" };
    case "occurrences-desc":
      return { sortBy: "occurrenceCount", order: "desc" };
    case "occurrences-asc":
      return { sortBy: "occurrenceCount", order: "asc" };
    case "title-asc":
    case "title-desc":
      return {};
    case "newest":
    default:
      return { sortBy: "lastSeen", order: "desc" };
  }
}

// Only title-asc/title-desc ever reach this (see visibleIssues) - every
// other sort mode is now handled server-side via mapSortToQuery.
function compareIssues(left, right, sortMode) {
  return sortMode === "title-desc"
    ? getIssueTitle(right).localeCompare(getIssueTitle(left))
    : getIssueTitle(left).localeCompare(getIssueTitle(right));
}

function getIssueTitle(issue) {
  return issue.title ?? issue.message ?? "";
}
