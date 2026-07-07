import { useEffect, useRef } from "react";
import {
  FiActivity,
  FiClock,
  FiGitCommit,
  FiLayers,
  FiMonitor,
  FiNavigation,
  FiServer,
} from "react-icons/fi";

export function IssueDetailPanel({
  issue,
  events,
  organization,
  project,
  isLoading,
  isEventsLoading,
  eventPagination,
  hasMoreEvents,
  onLoadMoreEvents,
}) {
  const scrollRootRef = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const scrollRoot = scrollRootRef.current;
    const loadMoreMarker = loadMoreRef.current;

    if (!scrollRoot || !loadMoreMarker || !hasMoreEvents) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isEventsLoading) {
          onLoadMoreEvents?.();
        }
      },
      {
        root: scrollRoot,
        rootMargin: "120px",
      },
    );

    observer.observe(loadMoreMarker);

    return () => observer.disconnect();
  }, [hasMoreEvents, isEventsLoading, onLoadMoreEvents]);

  if (!issue) return null;
  const latestEvent = events[0] ?? {};
  const detail = { ...latestEvent, ...issue };
  const server = detail.server ?? latestEvent.server ?? {};
  const topFrame = detail.topFrame ?? latestEvent.topFrame ?? {};
  const stackTrace = detail.stackTrace ?? detail.stack ?? latestEvent.stackTrace ?? latestEvent.stack;

  return (
    <div className="issue-detail-surface">
      <div className="issue-detail-header">
        <div>
          <p className="eyebrow">Issue details</p>
          <h2 className="issue-detail-title">
            {issue.title ?? issue.message ?? "Untitled issue"}
          </h2>
        </div>
      </div>

      <div className="issue-detail-grid">
        <DetailItem icon={FiActivity} label="Error" value={issue.errorName ?? "Error"} />
        <DetailItem icon={FiLayers} label="Project" value={project?.name ?? detail.projectId ?? "No project"} />
        <DetailItem icon={FiNavigation} label="Organization" value={organization?.name ?? detail.organizationId ?? "No organization"} />
        <DetailItem icon={FiGitCommit} label="Occurrences" value={issue.occurrenceCount ?? 0} />
        <DetailItem icon={FiClock} label="Last seen" value={formatDate(issue.lastSeen ?? issue.updatedAt)} />
        <DetailItem icon={FiMonitor} label="Environment" value={detail.lastEnvironment ?? detail.environment ?? "No environment"} />
        <DetailItem icon={FiGitCommit} label="Release" value={detail.lastRelease ?? detail.release ?? "No release"} />
        <DetailItem icon={FiServer} label="Server" value={formatServer(server)} />
      </div>

      <section className="issue-detail-section">
        <h3>Summary</h3>
        <div className="issue-detail-summary">
          <span className={`severity-pill ${issue.severity ?? "medium"}`}>
            {issue.severity ?? "medium"}
          </span>
          <span className="status-pill">{issue.status ?? "unresolved"}</span>
          <span>{issue.lastEnvironment ?? issue.environment ?? "No environment"}</span>
          <span>{issue.lastRelease ?? issue.release ?? "No release"}</span>
        </div>
      </section>

      <section className="issue-detail-section">
        <h3>Culprit and top frame</h3>
        <div className="issue-frame-grid">
          <DetailItem icon={FiLayers} label="Culprit" value={detail.culprit ?? "No culprit"} />
          <DetailItem icon={FiActivity} label="Function" value={topFrame.function ?? "No function"} />
          <DetailItem icon={FiLayers} label="File" value={topFrame.file ?? "No file"} />
          <DetailItem icon={FiNavigation} label="Line / Column" value={formatLineColumn(topFrame)} />
        </div>
      </section>

      <section className="issue-detail-section">
        <h3>Stack trace</h3>
        {stackTrace ? (
          <pre className="stack-trace">{stackTrace}</pre>
        ) : (
          <div className="empty-state compact">No stack trace returned for this issue.</div>
        )}
      </section>

      <section className="issue-detail-section">
        <div className="issue-section-heading">
          <h3>Occurrence history</h3>
          {eventPagination ? (
            <span>
              {eventPagination.total} events
            </span>
          ) : null}
        </div>
        {isLoading && events.length === 0 ? (
          <div className="empty-state compact">Loading events...</div>
        ) : events.length ? (
          <div className="issue-event-list scrollable" ref={scrollRootRef}>
            {events.map((event) => (
              <article className="issue-event-row" key={event.id ?? event._id ?? event.sourceEventId}>
                <strong>{event.message ?? event.errorName ?? "Issue event"}</strong>
                <span>{formatDate(event.occurredAt ?? event.createdAt)}</span>
                <p>{event.normalizedMessage ?? event.culprit ?? "No additional event detail."}</p>
              </article>
            ))}
            <div className="load-more-sentinel" ref={loadMoreRef}>
              {isEventsLoading
                ? "Loading more events..."
                : hasMoreEvents
                  ? "Scroll for more events"
                  : "All events loaded"}
            </div>
          </div>
        ) : (
          <div className="empty-state compact">No events returned for this issue.</div>
        )}
      </section>
    </div>
  );
}

function formatServer(server) {
  if (!server?.name && !server?.hostname) return "No server";
  return [server.name, server.hostname].filter(Boolean).join(" / ");
}

function formatLineColumn(topFrame) {
  const line = topFrame.line ?? "unknown";
  const column = topFrame.column ?? "unknown";
  return `${line}:${column}`;
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="issue-detail-item">
      <span>
        <Icon />
        {label}
      </span>
      <strong>{value}</strong>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "No date";
  return new Date(value).toLocaleString();
}
