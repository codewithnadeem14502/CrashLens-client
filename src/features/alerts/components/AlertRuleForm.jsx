import { useState } from "react";
import * as Label from "@radix-ui/react-label";
import { FiPlus, FiX } from "react-icons/fi";
import { FormField } from "../../../shared/ui/FormField";
import { RoleSelect } from "../../../shared/ui/RoleSelect";
import { QueryBuilderFields } from "../../dashboards/components/QueryBuilderFields";
import { DEFAULT_QUERY } from "../../dashboards/components/queryDefaults";
import { QueryPreview } from "../../dashboards/components/QueryPreview";
import { NotificationActionsField } from "./NotificationActionsField";

const THRESHOLD_TYPE_OPTIONS = [
  { value: "static", label: "Static threshold" },
  { value: "percent_change", label: "Percent change vs. previous window" },
];

const DIRECTION_OPTIONS = [
  { value: "above", label: "Fires when value goes above threshold" },
  { value: "below", label: "Fires when value drops below threshold" },
];

const blankRule = () => ({
  name: "",
  query: { ...DEFAULT_QUERY, filters: {} },
  thresholdType: "static",
  direction: "above",
  warningThreshold: "",
  criticalThreshold: "",
  resolveThreshold: "",
  evaluationIntervalSeconds: 60,
  notificationActions: [],
});

export function AlertRuleForm({ initialRule, isSubmitting, onSubmit, onCancel }) {
  const [rule, setRule] = useState(initialRule || blankRule());

  const setField = (field, value) => setRule((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      ...rule,
      warningThreshold: rule.warningThreshold === "" ? null : Number(rule.warningThreshold),
      criticalThreshold: rule.criticalThreshold === "" ? null : Number(rule.criticalThreshold),
      resolveThreshold: Number(rule.resolveThreshold),
      evaluationIntervalSeconds: Number(rule.evaluationIntervalSeconds),
    });
  };

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <FormField
        label="Rule name"
        value={rule.name}
        onChange={(event) => setField("name", event.target.value)}
        placeholder="High error rate on checkout"
        required
        disabled={isSubmitting}
      />

      <QueryBuilderFields query={rule.query} onChange={(query) => setField("query", query)} disabled={isSubmitting} />

      <div className="field">
        <Label.Root className="label">Threshold type</Label.Root>
        <RoleSelect
          value={rule.thresholdType}
          options={THRESHOLD_TYPE_OPTIONS}
          disabled={isSubmitting}
          onValueChange={(value) => setField("thresholdType", value)}
        />
      </div>

      <div className="field">
        <Label.Root className="label">Direction</Label.Root>
        <RoleSelect
          value={rule.direction}
          options={DIRECTION_OPTIONS}
          disabled={isSubmitting}
          onValueChange={(value) => setField("direction", value)}
        />
      </div>

      <div className="field-row">
        <FormField
          label="Warning threshold"
          type="number"
          value={rule.warningThreshold}
          onChange={(event) => setField("warningThreshold", event.target.value)}
          placeholder="Optional"
          disabled={isSubmitting}
        />
        <FormField
          label="Critical threshold"
          type="number"
          value={rule.criticalThreshold}
          onChange={(event) => setField("criticalThreshold", event.target.value)}
          placeholder="Optional"
          disabled={isSubmitting}
        />
      </div>

      <FormField
        label="Resolve threshold (hysteresis boundary)"
        type="number"
        value={rule.resolveThreshold}
        onChange={(event) => setField("resolveThreshold", event.target.value)}
        required
        disabled={isSubmitting}
      />
      <p className="muted">
        Must sit on the safe side of your thresholds - e.g. for an &quot;above&quot; rule, the
        resolve threshold should be lower than the warning threshold so a value hovering right at
        the line doesn&apos;t re-fire every evaluation.
      </p>

      <FormField
        label="Evaluation interval (seconds)"
        type="number"
        min="30"
        max="3600"
        value={rule.evaluationIntervalSeconds}
        onChange={(event) => setField("evaluationIntervalSeconds", event.target.value)}
        disabled={isSubmitting}
      />

      <NotificationActionsField
        actions={rule.notificationActions}
        onChange={(notificationActions) => setField("notificationActions", notificationActions)}
        disabled={isSubmitting}
      />

      <QueryPreview query={rule.query} thresholdType={rule.thresholdType} />

      <div className="form-actions project-dialog-footer">
        <button className="secondary-button" type="button" onClick={onCancel}>
          <FiX />
          Cancel
        </button>
        <button className="primary-button" type="submit" disabled={isSubmitting || !rule.name || !rule.resolveThreshold}>
          <FiPlus />
          Save rule
        </button>
      </div>
    </form>
  );
}
