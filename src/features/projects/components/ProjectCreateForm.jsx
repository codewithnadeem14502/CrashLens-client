import { useEffect, useState } from "react";
import * as Label from "@radix-ui/react-label";
import { FiEdit2, FiPlus, FiRefreshCw, FiX } from "react-icons/fi";
import { FormField } from "../../../shared/ui/FormField";
import {
  projectEnvironmentOptions,
  projectPlatformOptions,
} from "../../../shared/utils/constants";
import { RoleSelect } from "../../../shared/ui/RoleSelect";
import { getProject } from "../api/projectService";
import { getApiError } from "../../../shared/api/errors";

const initialProject = {
  name: "",
  environment: projectEnvironmentOptions[0].value,
  settings: {
    platform: projectPlatformOptions[0].value,
    releaseTracking: false,
    sampleRate: 1,
    allowedDomains: [],
  },
};

const ProjectCreateForm = ({
  canManageProjects,
  canUpdateProjects,
  isSubmitting,
  isUpdate = false,
  projectId,
  onCreate,
  onUpdate,
  onCancelUpdate,
  notify,
}) => {
  const [form, setForm] = useState(initialProject);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const canSubmit = isUpdate ? canUpdateProjects : canManageProjects;

  useEffect(() => {
    if (!isUpdate || !projectId) {
      return;
    }

    let isActive = true;

    async function loadProject() {
      setIsLoadingProject(true);

      try {
        const project = await getProject(projectId);

        if (!isActive) return;

        setForm(toProjectForm(project));
      } catch (error) {
        notify?.({
          title: "Could not load project",
          description: getApiError(error),
          tone: "danger",
        });
      } finally {
        if (isActive) {
          setIsLoadingProject(false);
        }
      }
    }

    loadProject();

    return () => {
      isActive = false;
    };
  }, [isUpdate, notify, projectId]);

  // Update top-level fields
  const update = (field) => (event) =>
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));

  // Update nested settings
  const updateSetting = (field) => (event) =>
    setForm((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [field]:
          event.target.type === "checkbox"
            ? event.target.checked
            : event.target.type === "number"
              ? Number(event.target.value)
              : event.target.value,
      },
    }));

  async function handleSubmit(event) {
    event.preventDefault();

    if (isUpdate) {
      await onUpdate(projectId, form);
      return;
    }

    await onCreate(form);
    setForm(initialProject);
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <FormField
        label="Project Name"
        value={form.name}
        onChange={update("name")}
        placeholder="My Project"
        required
        disabled={!canSubmit || isLoadingProject}
      />

      <div className="field">
        <Label.Root className="label">Environment</Label.Root>
        <RoleSelect
          value={form.environment}
          options={projectEnvironmentOptions}
          disabled={!canSubmit || isLoadingProject}
          onValueChange={(environment) =>
            setForm((current) => ({ ...current, environment }))
          }
        />
      </div>
      <div className="field">
        <Label.Root className="label">Platform</Label.Root>
        <RoleSelect
          value={form.settings.platform}
          options={projectPlatformOptions}
          disabled={!canSubmit || isLoadingProject}
          onValueChange={(platform) =>
            updateSetting("platform")({ target: { value: platform } })
          }
        />
      </div>

      <FormField
        label="Sample Rate"
        type="number"
        value={form.settings.sampleRate}
        onChange={updateSetting("sampleRate")}
        min="0"
        max="1"
        step="0.1"
        disabled={!canSubmit || isLoadingProject}
      />

      <div className="field">
        <Label.Root className="label">Release Tracking</Label.Root>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.settings.releaseTracking}
            onChange={updateSetting("releaseTracking")}
            disabled={!canSubmit || isLoadingProject}
          />
          Enable Release Tracking
        </label>
      </div>

      <FormField
        label="Allowed Domains"
        value={form.settings.allowedDomains.join(", ")}
        onChange={(e) =>
          setForm((current) => ({
            ...current,
            settings: {
              ...current.settings,
              allowedDomains: e.target.value
                .split(",")
                .map((domain) => domain.trim())
                .filter(Boolean),
            },
          }))
        }
        placeholder="example.com, api.example.com"
        disabled={!canSubmit || isLoadingProject}
      />

      <div className="form-actions">
        {isUpdate ? (
          <button className="secondary-button" type="button" onClick={onCancelUpdate}>
            <FiX />
            Cancel
          </button>
        ) : null}
        <button
          className="primary-button"
          type="submit"
          disabled={!canSubmit || isSubmitting || isLoadingProject}
        >
          {isSubmitting || isLoadingProject ? (
            <FiRefreshCw className="spin" />
          ) : isUpdate ? (
            <FiEdit2 />
          ) : (
            <FiPlus />
          )}
          {isUpdate ? "Update Project" : "Create Project"}
        </button>
      </div>
    </form>
  );
};

function toProjectForm(project) {
  return {
    name: project?.name ?? "",
    environment: project?.environment ?? initialProject.environment,
    settings: {
      ...initialProject.settings,
      ...(project?.settings ?? {}),
      allowedDomains: Array.isArray(project?.settings?.allowedDomains)
        ? project.settings.allowedDomains
        : [],
    },
  };
}

export default ProjectCreateForm;
