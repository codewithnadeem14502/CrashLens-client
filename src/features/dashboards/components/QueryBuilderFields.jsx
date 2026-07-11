import * as Label from "@radix-ui/react-label";
import { FormField } from "../../../shared/ui/FormField";
import { RoleSelect } from "../../../shared/ui/RoleSelect";

// Mirrors alert-service's DATASET_AGGREGATES (utils/constants.js) - kept in
// sync manually since there's no shared package between the 3 repos yet
// (see root CLAUDE.md). If this drifts, the backend's own Joi validation
// is still the source of truth and will reject an invalid combination.
const DATASET_OPTIONS = [
  { value: "issues", label: "Issues" },
  { value: "transactions", label: "Performance transactions" },
  { value: "logs", label: "Logs" },
  { value: "monitors", label: "Cron monitors" },
  { value: "uptimeMonitors", label: "Uptime monitors" },
];

const AGGREGATE_LABELS = {
  count: "Count",
  avg_duration_ms: "Average duration (ms)",
  p95_duration_ms: "p95 duration (ms)",
  error_rate: "Error rate (%)",
};

const DATASET_AGGREGATES = {
  issues: ["count"],
  logs: ["count"],
  monitors: ["count"],
  uptimeMonitors: ["count"],
  transactions: ["count", "avg_duration_ms", "p95_duration_ms", "error_rate"],
};

// This is the ONE generic query form - the same fields build a dashboard
// widget's query and an alert rule's query, matching alert-service's "one
// generic, parameterized query executor" design rather than a bespoke form
// per resource.
export function QueryBuilderFields({ query, onChange, disabled }) {
  const aggregateOptions = (DATASET_AGGREGATES[query.dataset] || ["count"]).map((value) => ({
    value,
    label: AGGREGATE_LABELS[value],
  }));

  const setField = (field, value) => onChange({ ...query, [field]: value });

  const setFilter = (field) => (event) =>
    onChange({ ...query, filters: { ...query.filters, [field]: event.target.value } });

  const setDataset = (dataset) => {
    const allowed = DATASET_AGGREGATES[dataset] || ["count"];
    onChange({
      ...query,
      dataset,
      aggregate: allowed.includes(query.aggregate) ? query.aggregate : allowed[0],
    });
  };

  return (
    <div className="form-stack">
      <div className="field-row">
        <div className="field">
          <Label.Root className="label">Dataset</Label.Root>
          <RoleSelect value={query.dataset} options={DATASET_OPTIONS} disabled={disabled} onValueChange={setDataset} />
        </div>
        <div className="field">
          <Label.Root className="label">Aggregate</Label.Root>
          <RoleSelect
            value={query.aggregate}
            options={aggregateOptions}
            disabled={disabled}
            onValueChange={(value) => setField("aggregate", value)}
          />
        </div>
      </div>

      <FormField
        label="Time window (minutes)"
        type="number"
        min="1"
        max="43200"
        value={query.timeWindowMinutes}
        onChange={(event) => setField("timeWindowMinutes", Number(event.target.value))}
        disabled={disabled}
      />

      <FormField
        label="Project ID (optional - org-wide if blank)"
        value={query.filters.projectId || ""}
        onChange={setFilter("projectId")}
        placeholder="Leave blank for all projects"
        disabled={disabled}
      />

      <FormField
        label="Environment (optional)"
        value={query.filters.environment || ""}
        onChange={setFilter("environment")}
        placeholder="production"
        disabled={disabled}
      />

      {query.dataset === "issues" ? (
        <>
          <FormField
            label="Severity (optional)"
            value={query.filters.severity || ""}
            onChange={setFilter("severity")}
            placeholder="critical"
            disabled={disabled}
          />
          <FormField
            label="Status (optional)"
            value={query.filters.status || ""}
            onChange={setFilter("status")}
            placeholder="open"
            disabled={disabled}
          />
          <FormField
            label="Error name (optional)"
            value={query.filters.errorName || ""}
            onChange={setFilter("errorName")}
            disabled={disabled}
          />
        </>
      ) : null}

      {query.dataset === "logs" ? (
        <FormField
          label="Log level (optional)"
          value={query.filters.level || ""}
          onChange={setFilter("level")}
          placeholder="error"
          disabled={disabled}
        />
      ) : null}

      {query.dataset === "transactions" ? (
        <FormField
          label={'Endpoint ID (optional - e.g. "GET /checkout"; blank aggregates across all endpoints)'}
          value={query.filters.endpointId || ""}
          onChange={setFilter("endpointId")}
          disabled={disabled}
        />
      ) : null}
    </div>
  );
}
