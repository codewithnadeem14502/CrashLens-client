import { useState } from "react";
import { FiPlay, FiRefreshCw } from "react-icons/fi";
import { executeQuery } from "../api/dashboardService";
import { getApiError } from "../../../shared/api/errors";

// Shared by the widget builder and the alert rule builder - lets either
// one show a live value for the query being configured before saving it,
// using the exact same executor endpoint the dashboard grid / evaluation
// engine use at runtime.
export function QueryPreview({ query, thresholdType = "static" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runPreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await executeQuery(query, thresholdType);
      setResult(data);
    } catch (previewError) {
      setError(getApiError(previewError));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="callout">
      <div className="field-row">
        <button className="secondary-button" type="button" onClick={runPreview} disabled={isLoading}>
          {isLoading ? <FiRefreshCw className="spin" /> : <FiPlay />}
          Preview current value
        </button>
        {result ? (
          <strong>
            {thresholdType === "percent_change"
              ? `${formatNumber(result.percentChange)}% change (was ${formatNumber(result.previous?.value)}, now ${formatNumber(result.current?.value)})`
              : formatNumber(result.value)}
          </strong>
        ) : null}
      </div>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}

function formatNumber(value) {
  if (value == null || Number.isNaN(value)) {
    return "-";
  }

  return Number.isInteger(value) ? value : value.toFixed(2);
}
