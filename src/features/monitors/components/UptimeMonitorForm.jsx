import { useState } from "react";
import * as Label from "@radix-ui/react-label";
import { FiPlus, FiRefreshCw, FiX } from "react-icons/fi";
import { FormField } from "../../../shared/ui/FormField";
import { RoleSelect } from "../../../shared/ui/RoleSelect";
import { projectEnvironmentOptions } from "../../../shared/utils/constants";

const methodOptions = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "HEAD", label: "HEAD" },
];

const initialForm = {
  projectId: "",
  name: "",
  url: "",
  method: "GET",
  intervalSeconds: 60,
  timeoutMs: 10000,
  expectedStatusMin: 200,
  expectedStatusMax: 299,
  consecutiveFailureThreshold: 3,
  environment: projectEnvironmentOptions[0].value,
};

export function UptimeMonitorForm({ projects, isSubmitting, canManage, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialForm);
  // Derived, not synced via an effect - see the identical comment in
  // CronMonitorForm.jsx.
  const selectedProjectId = form.projectId || projects[0]?.id || projects[0]?._id || "";

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const updateNumber = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: Number(event.target.value) }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({ ...form, projectId: selectedProjectId });
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
        placeholder="API health"
        required
        disabled={!canManage || isSubmitting}
      />

      <FormField
        label="URL"
        type="url"
        value={form.url}
        onChange={update("url")}
        placeholder="https://api.example.com/health"
        required
        disabled={!canManage || isSubmitting}
      />

      <div className="field">
        <Label.Root className="label">Method</Label.Root>
        <RoleSelect
          value={form.method}
          options={methodOptions}
          disabled={!canManage || isSubmitting}
          onValueChange={(method) => setForm((current) => ({ ...current, method }))}
        />
      </div>

      <FormField
        label="Check interval (seconds)"
        type="number"
        min="30"
        value={form.intervalSeconds}
        onChange={updateNumber("intervalSeconds")}
        disabled={!canManage || isSubmitting}
      />

      <FormField
        label="Timeout (ms)"
        type="number"
        min="1000"
        max="30000"
        value={form.timeoutMs}
        onChange={updateNumber("timeoutMs")}
        disabled={!canManage || isSubmitting}
      />

      <div className="field-row">
        <FormField
          label="Expected status (min)"
          type="number"
          min="100"
          max="599"
          value={form.expectedStatusMin}
          onChange={updateNumber("expectedStatusMin")}
          disabled={!canManage || isSubmitting}
        />
        <FormField
          label="Expected status (max)"
          type="number"
          min="100"
          max="599"
          value={form.expectedStatusMax}
          onChange={updateNumber("expectedStatusMax")}
          disabled={!canManage || isSubmitting}
        />
      </div>

      <FormField
        label="Consecutive failures before alert"
        type="number"
        min="1"
        value={form.consecutiveFailureThreshold}
        onChange={updateNumber("consecutiveFailureThreshold")}
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
          Create uptime monitor
        </button>
      </div>
    </form>
  );
}
