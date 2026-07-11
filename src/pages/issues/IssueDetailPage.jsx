import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { getOrganization } from "../../features/auth/api/authService";
import {
  getIssue,
  getIssueEvents,
} from "../../features/issues/api/issuesService";
import { IssueDetailPanel } from "../../features/issues/components/IssueDetailPanel";
import { getProject } from "../../features/projects/api/projectService";
import { getApiError } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { useToast } from "../../shared/components/useToast";
import { WorkspaceLayout } from "../../shared/layouts/WorkspaceLayout";

export function IssueDetailPage() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { notify } = useToast();
  const [issue, setIssue] = useState(null);
  const [events, setEvents] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [project, setProject] = useState(null);
  const [eventPagination, setEventPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEventsLoading, setIsEventsLoading] = useState(false);

  const fetchIssueDetail = useCallback(async () => {
    if (!issueId) return;

    setIsLoading(true);

    try {
      const [nextIssue, nextEvents] = await Promise.all([
        getIssue(issueId),
        getIssueEvents(issueId, { page: 1, limit: 5 }),
      ]);
      const normalizedEvents = Array.isArray(nextEvents.events)
        ? nextEvents.events
        : [];
      const latestEvent = normalizedEvents[0] ?? {};
      const organizationId =
        nextIssue?.organizationId ?? latestEvent.organizationId;
      const projectId = nextIssue?.projectId ?? latestEvent.projectId;
      const [organizationResult, projectResult] = await Promise.allSettled([
        organizationId
          ? getOrganization(organizationId)
          : Promise.resolve(null),
        projectId ? getProject(projectId) : Promise.resolve(null),
      ]);

      setIssue(nextIssue);
      setEvents(normalizedEvents);
      setEventPagination(nextEvents.pagination);
      setOrganization(
        organizationResult.status === "fulfilled"
          ? organizationResult.value
          : null,
      );
      setProject(
        projectResult.status === "fulfilled" ? projectResult.value : null,
      );
    } catch (error) {
      notify({
        title: "Could not load issue detail",
        description: getApiError(error),
        tone: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [issueId, notify]);

  const loadMoreEvents = useCallback(async () => {
    const currentPage = eventPagination?.page ?? 1;
    const totalPages = eventPagination?.totalPages ?? 1;

    if (!issueId || isEventsLoading || currentPage >= totalPages) return;

    const nextPage = currentPage + 1;
    setIsEventsLoading(true);

    try {
      const nextEvents = await getIssueEvents(issueId, {
        page: nextPage,
        limit: eventPagination?.limit ?? 5,
      });

      setEvents((currentEvents) => [
        ...currentEvents,
        ...(Array.isArray(nextEvents.events) ? nextEvents.events : []),
      ]);
      setEventPagination(nextEvents.pagination);
    } catch (error) {
      notify({
        title: "Could not load events",
        description: getApiError(error),
        tone: "danger",
      });
    } finally {
      setIsEventsLoading(false);
    }
  }, [eventPagination, isEventsLoading, issueId, notify]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIssueDetail();
  }, [fetchIssueDetail]);

  return (
    <WorkspaceLayout onSignOut={signOut}>
      <header className="workspace-header">
        <div>
          <button
            className="text-button"
            type="button"
            onClick={() => navigate("/workspace/issues")}
          >
            <FiArrowLeft />
            Back to issues
          </button>
          <p className="eyebrow">Issue detail</p>
          <h1>Issue detail</h1>
          <p className="muted">
            Inspect occurrence history and grouped error metadata.
          </p>
        </div>
      </header>

      {isLoading && !issue ? (
        <div className="empty-state">Loading issue detail...</div>
      ) : (
        <IssueDetailPanel
          issue={issue}
          events={events}
          organization={organization}
          project={project}
          isLoading={isLoading}
          isEventsLoading={isEventsLoading}
          eventPagination={eventPagination}
          hasMoreEvents={Boolean(
            eventPagination &&
            (eventPagination.page ?? 1) < (eventPagination.totalPages ?? 1),
          )}
          onLoadMoreEvents={loadMoreEvents}
        />
      )}
    </WorkspaceLayout>
  );
}
