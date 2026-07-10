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
  const [appliedFilters, setAppliedFilters] = useState(defaultIssueFilters);
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

  const visibleIssues = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return [...issues]
      .filter((issue) => {
        if (!search) return true;

        return (
          issue.title?.toLowerCase().includes(search) ||
          issue.message?.toLowerCase().includes(search) ||
          issue.errorName?.toLowerCase().includes(search) ||
          issue.culprit?.toLowerCase().includes(search) ||
          issue.status?.toLowerCase().includes(search) ||
          issue.severity?.toLowerCase().includes(search)
        );
      })
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
  }, [appliedFilters, issues, searchQuery]);

  const applyFilters = (nextFilters) => {
    setIssuePage(1);
    setAppliedFilters(nextFilters);
  };

  const resetFilters = () => {
    setIssuePage(1);
    setAppliedFilters(defaultIssueFilters);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIssues();
  }, [fetchIssues]);
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

        <div className="issues-toolbar">
          <IssueSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            activeStatus={appliedFilters.status}
            activeSeverity={appliedFilters.severity}
            resultCount={visibleIssues.length}
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
