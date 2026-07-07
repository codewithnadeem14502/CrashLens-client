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
import InfoCard from "./InfoCard";

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
    const response = await onRegenerateDSN(project.id);
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
    <div className="space-y-6 p-6">
      {/* Details */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard icon={FiLayers} label="Slug" value={project.slug} />

        <InfoCard
          icon={FiGlobe}
          label="Environment"
          value={project.environment}
        />

        <InfoCard
          icon={FiActivity}
          label="Platform"
          value={project.settings.platform}
        />

        <InfoCard icon={FiActivity} label="Status" value={project.status} />

        <InfoCard
          icon={FiActivity}
          label="Sample Rate"
          value={project.settings.sampleRate}
        />

        <InfoCard
          icon={FiActivity}
          label="Release Tracking"
          value={project.settings.releaseTracking ? "Enabled" : "Disabled"}
        />

        <InfoCard
          icon={FiGlobe}
          label="Allowed Domains"
          value={project.settings.allowedDomains.join(", ")}
        />

        <InfoCard
          icon={FiCalendar}
          label="Created"
          value={new Date(project.createdAt).toLocaleString()}
        />
      </div>

      {/* DSN */}

      <div className="rounded-lg border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Project DSN</h3>

          <div className="flex items-center gap-2">
            {/* Show / Hide */}

            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => handleGetDSN(project.id)}
                    className="rounded-lg border p-2 transition hover:bg-gray-100"
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

            {/* Copy */}

            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={copyDSN}
                    disabled={!showDSN}
                    className="rounded-lg border p-2 transition hover:bg-gray-100"
                  >
                    {copied ? (
                      <FiCheck className="text-green-600" />
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

            {/* Regenerate */}
            <ConfirmProjectAction
              title="Are you sure you want to regenerate?"
              description="Old DSN will no longer work."
              actionLabel="Regenerate"
              onConfirm={handleRegenerateDSN}
            >
              <button
                className="rounded-lg border p-2 transition hover:bg-gray-100"
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
          className="w-full rounded-lg border bg-gray-50 px-3 py-3 font-mono text-sm outline-none"
        />
      </div>

      {/* Actions */}

      {(canUpdate || canDelete) && (
        <div className="flex justify-end gap-3 border-t pt-5">
          {canUpdate && (
            <button
              onClick={() => onProjectUpdate(project.id)}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
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
              onConfirm={() => onDeleteProject(project.id)}
            >
              <button className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700">
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
