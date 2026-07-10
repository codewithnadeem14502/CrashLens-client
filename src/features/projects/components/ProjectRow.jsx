import { useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  FiCopy,
  FiEye,
  FiEyeOff,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiCalendar,
  FiGlobe,
  FiActivity,
  FiLayers,
  FiRotateCw,
} from "react-icons/fi";
import { getDSN } from "../api/projectService";
import { getApiError } from "../../../shared/api/errors";
import { useToast } from "../../../shared/components/useToast";

const ProjectRow = ({
  project,
  onProjectUpdate,
  onDeleteProject,
  onRegenerateDSN,
  canUpdate,
  canDelete,
}) => {
  const [showDSN, setShowDSN] = useState(false);
  const [copied, setCopied] = useState(false);
  const [DSN, setDSN] = useState("");
  const { notify } = useToast();
  const maskedDSN = "•".repeat(50);
  const projectId = project.id ?? project._id;
  const settings = project.settings ?? {};

  const copyDSN = async () => {
    if (!DSN) {
      notify({
        title: "No DSN available",
        description: "Please reveal the DSN before copying.",
        tone: "warning",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(DSN);

      setCopied(true);

      notify({
        title: "Copied",
        description: "DSN copied to clipboard.",
        tone: "success",
      });

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);

      notify({
        title: "Copy failed",
        description: "Unable to copy the DSN to your clipboard.",
        tone: "danger",
      });
    }
  };

  const handleGetDSN = async (projectId) => {
    if (showDSN) {
      setShowDSN(false);
      return;
    }

    try {
      const dsn = await getDSN(projectId);
      setDSN(dsn);
      setShowDSN(true);
    } catch (error) {
      notify({
        title: "Could not get DSN",
        description: getApiError(error),
        tone: "danger",
      });
    }
  };

  const handleRegenerateDSN = async () => {
    const response = await onRegenerateDSN(projectId);
    const nextDSN = response?.data?.dsn ?? response?.dsn;

    if (nextDSN) {
      setDSN(nextDSN);
      setShowDSN(true);
      return;
    }

    setDSN("");
    setShowDSN(false);
  };

  return (
    <div className="project-detail-content">
      <div className="project-detail-grid">
        <ProjectDetailItem icon={FiLayers} label="Slug" value={project.slug} />
        <ProjectDetailItem
          icon={FiGlobe}
          label="Environment"
          value={project.environment}
        />
        <ProjectDetailItem
          icon={FiActivity}
          label="Platform"
          value={settings.platform}
        />
        <ProjectDetailItem icon={FiActivity} label="Status" value={project.status} />
        <ProjectDetailItem
          icon={FiActivity}
          label="Sample rate"
          value={settings.sampleRate}
        />
        <ProjectDetailItem
          icon={FiActivity}
          label="Release tracking"
          value={settings.releaseTracking ? "Enabled" : "Disabled"}
        />
        <ProjectDetailItem
          icon={FiGlobe}
          label="Allowed domains"
          value={(settings.allowedDomains ?? []).join(", ") || "-"}
        />
        <ProjectDetailItem
          icon={FiCalendar}
          label="Created"
          value={formatProjectDateTime(project.createdAt)}
        />
      </div>

      <div className="project-dsn-panel">
        <div className="project-dsn-header">
          <h3>Project DSN</h3>

          <div className="project-dsn-actions">

            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => handleGetDSN(projectId)}
                    className="icon-button"
                    type="button"
                    aria-label={showDSN ? "Hide DSN" : "Show DSN"}
                  >
                    {showDSN ? <FiEyeOff /> : <FiEye />}
                  </button>
                </Tooltip.Trigger>

                <Tooltip.Portal>
                  <Tooltip.Content
                    sideOffset={5}
                    className="rounded bg-black px-2 py-1 text-xs text-white"
                  >
                    {showDSN ? "Hide DSN" : "Show DSN"}
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>

            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={copyDSN}
                    disabled={!showDSN}
                    className="icon-button"
                    type="button"
                    aria-label="Copy DSN"
                  >
                    {copied ? (
                      <FiCheck />
                    ) : (
                      <FiCopy />
                    )}
                  </button>
                </Tooltip.Trigger>

                <Tooltip.Portal>
                  <Tooltip.Content
                    sideOffset={5}
                    className="rounded bg-black px-2 py-1 text-xs text-white"
                  >
                    {copied ? "Copied!" : "Copy DSN"}
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>

            <ConfirmProjectAction
              title="Are you sure you want to regenerate?"
              description="Old DSN will no longer work."
              actionLabel="Regenerate"
              onConfirm={handleRegenerateDSN}
            >
              <button
                className="icon-button"
                type="button"
                aria-label="Regenerate DSN"
              >
                <FiRotateCw />
              </button>
            </ConfirmProjectAction>
          </div>
        </div>

        <input
          readOnly
          value={showDSN ? DSN : maskedDSN}
          className="project-dsn-input"
        />
      </div>

      {(canUpdate || canDelete) && (
        <div className="project-detail-actions">
          {canUpdate && (
            <button
              onClick={() => onProjectUpdate(projectId)}
              className="secondary-button"
              type="button"
            >
              <FiEdit2 />
              Edit
            </button>
          )}

          {canDelete && (
            <ConfirmProjectAction
              title="Are you sure?"
              description={`This will archive ${project.name}.`}
              actionLabel="Delete"
              onConfirm={() => onDeleteProject(projectId)}
            >
              <button className="danger-button" type="button">
                <FiTrash2 />
                Delete
              </button>
            </ConfirmProjectAction>
          )}
        </div>
      )}
    </div>
  );
};

function ProjectDetailItem({ icon: Icon, label, value }) {
  return (
    <div className="project-detail-item">
      <span>
        <Icon />
        {label}
      </span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

function formatProjectDateTime(value) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function ConfirmProjectAction({
  title,
  description,
  actionLabel,
  onConfirm,
  children,
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="dialog-overlay" />
        <AlertDialog.Content className="dialog-content">
          <AlertDialog.Title className="dialog-title">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="dialog-description">
            {description}
          </AlertDialog.Description>
          <div className="dialog-actions">
            <AlertDialog.Cancel asChild>
              <button className="secondary-button" type="button">
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className="danger-button"
                type="button"
                onClick={onConfirm}
              >
                {actionLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export default ProjectRow;
