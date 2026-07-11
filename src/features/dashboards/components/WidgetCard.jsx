import { useCallback, useEffect, useRef, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { executeQuery } from "../api/dashboardService";
import { getApiError } from "../../../shared/api/errors";

// Each widget fetches its own value independently (driven by each card's
// own effect) rather than the dashboard page batching them server-side -
// keeps the query executor a single reusable primitive (widget rendering,
// widget-builder preview, and alert rule preview all call the exact same
// endpoint) instead of a second bespoke "render a whole dashboard" endpoint.
export function WidgetCard({ widget, canManage, onDelete }) {
  const [state, setState] = useState({ status: "loading", value: null, error: null });
  // A per-invocation token, not a boolean flag - `widget.query` gets a new
  // object identity every time the dashboard is re-fetched (e.g. after
  // adding/deleting any widget), even for widgets whose query didn't
  // change, which re-runs this effect for every card. A boolean flag reset
  // to `false` at the start of each run would un-cancel an older,
  // still-in-flight request instead of actually discarding it, letting a
  // stale response win a race against a newer one for the same query.
  const latestRequestId = useRef(0);

  const loadValue = useCallback(async () => {
    const requestId = (latestRequestId.current += 1);
    setState({ status: "loading", value: null, error: null });

    try {
      const result = await executeQuery(widget.query);
      if (latestRequestId.current === requestId) {
        setState({ status: "ready", value: result.value, error: null });
      }
    } catch (error) {
      if (latestRequestId.current === requestId) {
        setState({ status: "error", value: null, error: getApiError(error) });
      }
    }
  }, [widget.query]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadValue();
  }, [loadValue]);

  return (
    <article className="performance-metric widget-card">
      <div>
        {state.status === "loading" ? <strong>...</strong> : null}
        {state.status === "ready" ? <strong>{formatValue(state.value)}</strong> : null}
        {state.status === "error" ? <strong className="widget-error">Error</strong> : null}
        <p>{widget.title}</p>
      </div>
      {canManage ? (
        <button
          className="icon-button"
          type="button"
          aria-label={`Delete widget ${widget.title}`}
          onClick={() => onDelete(widget.widgetId)}
        >
          <FiTrash2 />
        </button>
      ) : null}
      {state.status === "error" ? <p className="form-error">{state.error}</p> : null}
    </article>
  );
}

function formatValue(value) {
  if (value == null || Number.isNaN(value)) {
    return "-";
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
