import { useState } from "react";
import * as Label from "@radix-ui/react-label";
import { FiPlus, FiRefreshCw, FiX } from "react-icons/fi";
import { FormField } from "../../../shared/ui/FormField";
import { RoleSelect } from "../../../shared/ui/RoleSelect";
import { projectEnvironmentOptions } from "../../../shared/utils/constants";

const scheduleTypeOptions = [
  { value: "interval", label: "Interval" },
  { value: "crontab", label: "Crontab expression" },
];

const initialForm = {
  projectId: "",
  name: "",
  scheduleType: "interval",
  crontab: "0 * * * *",
  intervalSeconds: 3600,
  timezone: "UTC",
  checkinMarginSeconds: 300,
  maxRuntimeSeconds: 3600,
  environment: projectEnvironmentOptions[0].value,
};

export function CronMonitorForm({ projects, isSubmitting, canManage, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialForm);
  // Derived, not synced via an effect: `projects` often arrives async after
  // this form has already mounted with an empty projects list, so the
  // effective selection falls back to the first project until the user
  // explicitly picks one - no setState-in-effect needed.
  const selectedProjectId = form.projectId || projects[0]?.id || projects[0]?._id || "";

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const updateNumber = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: Number(event.target.value) }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      projectId: selectedProjectId,
      name: form.name,
      scheduleType: form.scheduleType,
      timezone: form.timezone,
      checkinMarginSeconds: form.checkinMarginSeconds,
      maxRuntimeSeconds: form.maxRuntimeSeconds,
      environment: form.environment,
      ...(form.scheduleType === "crontab"
        ? { crontab: form.crontab }
        : { intervalSeconds: form.intervalSeconds }),
    };

    await onSubmit(payload);
  };

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <div className="field">
        <Label.Root className="label">Project</Label.Root>
        <RoleSelect
          value={selectedProjectId}
          options={projects.map((project) => ({
            value: project.id ?? project._id,
            label: project.name,
          }))}
          disabled={!canManage || isSubmitting}
          onValueChange={(projectId) => setForm((current) => ({ ...current, projectId }))}
        />
      </div>

      <FormField
        label="Monitor name"
        value={form.name}
        onChange={update("name")}
        placeholder="Nightly backup"
        required
        disabled={!canManage || isSubmitting}
      />

      <div className="field">
        <Label.Root className="label">Schedule type</Label.Root>
        <RoleSelect
          value={form.scheduleType}
          options={scheduleTypeOptions}
          disabled={!canManage || isSubmitting}
          onValueChange={(scheduleType) => setForm((current) => ({ ...current, scheduleType }))}
        />
      </div>

      {form.scheduleType === "crontab" ? (
        <FormField
          label="Crontab expression"
          value={form.crontab}
          onChange={update("crontab")}
          placeholder="0 * * * *"
          required
          disabled={!canManage || isSubmitting}
        />
      ) : (
        <FormField
          label="Interval (seconds)"
          type="number"
          min="60"
          value={form.intervalSeconds}
          onChange={updateNumber("intervalSeconds")}
          required
          disabled={!canManage || isSubmitting}
        />
      )}

      <FormField
        label="Timezone"
        value={form.timezone}
        onChange={update("timezone")}
        placeholder="UTC"
        disabled={!canManage || isSubmitting}
      />

      <FormField
        label="Check-in grace period (seconds)"
        type="number"
        min="0"
        value={form.checkinMarginSeconds}
        onChange={updateNumber("checkinMarginSeconds")}
        disabled={!canManage || isSubmitting}
      />

      <FormField
        label="Max runtime (seconds)"
        type="number"
        min="0"
        value={form.maxRuntimeSeconds}
        onChange={updateNumber("maxRuntimeSeconds")}
        disabled={!canManage || isSubmitting}
      />

      <div className="field">
        <Label.Root className="label">Environment</Label.Root>
        <RoleSelect
          value={form.environment}
          options={projectEnvironmentOptions}
          disabled={!canManage || isSubmitting}
          onValueChange={(environment) => setForm((current) => ({ ...current, environment }))}
        />
      </div>

      <div className="form-actions project-dialog-footer">
        <button className="secondary-button" type="button" onClick={onCancel}>
          <FiX />
          Cancel
        </button>
        <button
          className="primary-button"
          type="submit"
          disabled={!canManage || isSubmitting || !selectedProjectId}
        >
          {isSubmitting ? <FiRefreshCw className="spin" /> : <FiPlus />}
          Create cron monitor
        </button>
      </div>
    </form>
  );
}
