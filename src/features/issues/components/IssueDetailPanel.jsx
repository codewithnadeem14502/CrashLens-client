import { useEffect, useRef } from "react";
import {
  FiActivity,
  FiClock,
  FiCode,
  FiGitCommit,
  FiGlobe,
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
  const request = detail.request ?? latestEvent.request ?? {};
  const runtime = detail.runtime ?? latestEvent.runtime ?? {};
  const topFrame = detail.topFrame ?? latestEvent.topFrame ?? {};
  const stackTrace =
    detail.stackTrace ?? detail.stack ?? latestEvent.stackTrace ?? latestEvent.stack;
  const stackFrames = parseStackFrames(stackTrace);
  const eventId = latestEvent.sourceEventId ?? latestEvent.id ?? latestEvent._id;
  const title = issue.title ?? issue.message ?? detail.message ?? "Untitled issue";
  const message =
    detail.normalizedMessage ??
    detail.message ??
    issue.message ??
    "No message returned for this issue.";
  const errorName = issue.errorName ?? detail.errorName ?? "Error";
  const severity = issue.severity ?? detail.severity ?? "medium";
  const environment = detail.environment ?? detail.lastEnvironment ?? "No environment";
  const release = detail.release ?? detail.lastRelease ?? "No release";
  const occurredAt = detail.occurredAt ?? issue.lastSeen ?? issue.updatedAt;

  return (
    <div className="issue-detail-surface sentry-issue-detail">
      <section className="issue-hero">
        <div className="issue-hero-copy">
          <div className="issue-hero-kicker">
            <span className={`severity-dot ${severity}`} />
            <span>{errorName}</span>
          </div>
          <h2 className="issue-detail-title">{title}</h2>
          <p className="issue-detail-message">{message}</p>
          <div className="issue-detail-tags">
            <span className={`severity-pill ${severity}`}>{severity}</span>
            <span className="status-pill">{issue.status ?? "unresolved"}</span>
            <span>{environment}</span>
            <span>{release}</span>
          </div>
        </div>
        <div className="issue-hero-stat">
          <span>Events</span>
          <strong>{issue.occurrenceCount ?? eventPagination?.total ?? events.length}</strong>
        </div>
      </section>

      <div className="issue-detail-layout">
        <div className="issue-detail-main">
          <section className="issue-block">
            <div className="issue-section-heading">
              <h3>Exception</h3>
              <span>{formatDate(occurredAt)}</span>
            </div>
            <div className="exception-summary">
              <div>
                <span className="exception-type">{errorName}</span>
                <strong>{message}</strong>
              </div>
              <span className="exception-source">{formatFrameSource(topFrame)}</span>
            </div>
          </section>

          <section className="issue-block">
            <div className="issue-section-heading">
              <h3>Stack trace</h3>
              <span>{stackFrames.length ? `${stackFrames.length} frames` : "Unavailable"}</span>
            </div>
            {stackFrames.length ? (
              <div className="stack-frame-list">
                {stackFrames.map((frame, index) => (
                  <div
                    className={`stack-frame-row ${index === 0 ? "active" : ""}`}
                    key={`${frame.raw}-${index}`}
                  >
                    <span className="stack-frame-index">#{index + 1}</span>
                    <div>
                      <strong>{frame.functionName}</strong>
                      <span>{frame.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : stackTrace ? (
              <pre className="stack-trace">{stackTrace}</pre>
            ) : (
              <div className="empty-state compact">No stack trace returned for this issue.</div>
            )}
          </section>

          <section className="issue-block">
            <div className="issue-section-heading">
              <h3>Top frame</h3>
            </div>
            <div className="issue-frame-grid compact">
              <DetailItem
                icon={FiActivity}
                label="Function"
                value={topFrame.function ?? "No function"}
              />
              <DetailItem icon={FiLayers} label="File" value={topFrame.file ?? "No file"} />
              <DetailItem
                icon={FiNavigation}
                label="Line / Column"
                value={formatLineColumn(topFrame)}
              />
            </div>
          </section>

          <section className="issue-block">
            <div className="issue-section-heading">
              <h3>Occurrence history</h3>
              {eventPagination ? <span>{eventPagination.total} events</span> : null}
            </div>
            {isLoading && events.length === 0 ? (
              <div className="empty-state compact">Loading events...</div>
            ) : events.length ? (
              <div className="issue-event-list scrollable" ref={scrollRootRef}>
                {events.map((event) => (
                  <article
                    className="issue-event-row"
                    key={event.id ?? event._id ?? event.sourceEventId}
                  >
                    <div className="event-row-header">
                      <strong>{event.errorName ?? "Issue event"}</strong>
                      <span>{formatDate(event.occurredAt ?? event.createdAt)}</span>
                    </div>
                    <p>
                      {event.normalizedMessage ??
                        event.message ??
                        "No additional event detail."}
                    </p>
                    <div className="event-row-meta">
                      <span>
                        {event.request?.method ?? "No method"} {event.request?.url ?? ""}
                      </span>
                      <span>{event.environment ?? "No environment"}</span>
                      <span>{event.release ?? "No release"}</span>
                    </div>
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

        <aside className="issue-context-rail">
          <section className="issue-context-section">
            <h3>Issue</h3>
            <ContextRow icon={FiActivity} label="Error" value={errorName} />
            <ContextRow
              icon={FiGitCommit}
              label="Occurrences"
              value={issue.occurrenceCount ?? eventPagination?.total ?? events.length}
            />
            <ContextRow icon={FiClock} label="Occurred" value={formatDate(occurredAt)} />
            <ContextRow icon={FiCode} label="Event" value={eventId ?? "No event id"} />
          </section>

          <section className="issue-context-section">
            <h3>Context</h3>
            <ContextRow
              icon={FiLayers}
              label="Project"
              value={project?.name ?? detail.projectId ?? "No project"}
            />
            <ContextRow
              icon={FiNavigation}
              label="Org"
              value={organization?.name ?? detail.organizationId ?? "No organization"}
            />
            <ContextRow icon={FiMonitor} label="Runtime" value={formatRuntime(runtime)} />
            <ContextRow icon={FiServer} label="Server" value={formatServer(server)} />
          </section>

          <section className="issue-context-section">
            <h3>Request</h3>
            <ContextRow icon={FiGlobe} label="Method" value={request.method ?? "No method"} />
            <ContextRow icon={FiNavigation} label="URL" value={request.url ?? "No URL"} />
            <ContextRow icon={FiServer} label="IP" value={request.ip ?? "No IP"} />
            <ContextRow
              icon={FiMonitor}
              label="Agent"
              value={request.headers?.["user-agent"] ?? "No user agent"}
            />
          </section>

          <section className="issue-context-section">
            <h3>Culprit</h3>
            <p className="context-mono">{detail.culprit ?? "No culprit"}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function formatServer(server) {
  if (!server?.name && !server?.hostname) return "No server";
  return [server.name, server.hostname].filter(Boolean).join(" / ");
}

function formatRuntime(runtime) {
  if (!runtime?.name && !runtime?.version) return "No runtime";
  return [runtime.name, runtime.version].filter(Boolean).join(" ");
}

function formatLineColumn(topFrame) {
  const line = topFrame.line ?? "unknown";
  const column = topFrame.column ?? "unknown";
  return `${line}:${column}`;
}

function formatFrameSource(frame) {
  if (!frame?.file) return "No source frame";
  return `${frame.file}${frame.line ? `:${frame.line}` : ""}`;
}

function parseStackFrames(stackTrace) {
  if (!stackTrace) return [];

  return stackTrace
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("at "))
    .map((line) => {
      const raw = line.replace(/^at\s+/, "");
      const match = raw.match(/^(.*?)\s+\((.*)\)$/);

      if (match) {
        return {
          raw,
          functionName: match[1] || "<anonymous>",
          location: match[2] || "Unknown location",
        };
      }

      return {
        raw,
        functionName: raw.split(" ")[0] || "<anonymous>",
        location: raw,
      };
    });
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

function ContextRow({ icon: Icon, label, value }) {
  return (
    <div className="context-row">
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
