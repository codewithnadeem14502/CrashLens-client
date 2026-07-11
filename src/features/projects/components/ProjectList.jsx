import { Fragment, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  FiChevronDown,
  FiEdit2,
  FiFolder,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import ProjectRow from "./ProjectRow";
import { ConfirmProjectAction } from "./ConfirmProjectAction";
import { EmptyState } from "../../../shared/components/EmptyState";

const ProjectList = ({
  projects,
  isLoading,
  hasAnyProjects,
  canCreateProject,
  canUpdateProjects,
  canDeleteProjects,
  onCreateProject,
  onProjectUpdate,
  onDeleteProject,
  onRegenerateDSN,
}) => {
  const [expandedProjectId, setExpandedProjectId] = useState(null);

  const toggleProject = (projectId) => {
    setExpandedProjectId((current) => (current === projectId ? null : projectId));
  };

  if (isLoading) {
    return <div className="project-table-state">Loading projects...</div>;
  }

  if (!projects.length) {
    if (hasAnyProjects) {
      return (
        <EmptyState
          icon={FiSearch}
          title="No projects match your filters"
          description="Try adjusting or clearing your search and filters."
        />
      );
    }

    return (
      <EmptyState
        icon={FiFolder}
        title="No projects yet"
        description="Create your first project to start receiving errors, performance data, and logs."
        actions={
          canCreateProject
            ? [{ label: "Create Project", icon: <FiPlus />, onClick: onCreateProject }]
            : undefined
        }
      />
    );
  }

  return (
    <div className="project-table-wrap">
      <table className="project-table" aria-label="Projects">
        <thead>
          <tr>
            <th scope="col">Project</th>
            <th scope="col">Slug</th>
            <th scope="col">Environment</th>
            <th scope="col">Status</th>
            <th scope="col">Platform</th>
            <th scope="col">Created</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const projectId = project.id ?? project._id;
            const isExpanded = expandedProjectId === projectId;

            return (
              <Fragment key={projectId}>
                <tr
                  className={isExpanded ? "project-table-row active" : "project-table-row"}
                >
                  <td>
                    <button
                      className="project-expand-button"
                      type="button"
                      onClick={() => toggleProject(projectId)}
                      aria-expanded={isExpanded}
                      aria-label={`Toggle ${project.name} details`}
                    >
                      <FiChevronDown />
                      <span>{project.name}</span>
                    </button>
                  </td>
                  <td>
                    <span className="project-mono">{project.slug || "-"}</span>
                  </td>
                  <td>
                    <span className="status-pill">{project.environment || "-"}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${project.status || "inactive"}`}>
                      {project.status || "-"}
                    </span>
                  </td>
                  <td>{project.settings?.platform || "-"}</td>
                  <td>{formatProjectDate(project.createdAt)}</td>
                  <td>
                    <div className="project-row-actions">
                      {canUpdateProjects || canDeleteProjects ? (
                        <ProjectActionsMenu
                          project={project}
                          canUpdate={canUpdateProjects}
                          canDelete={canDeleteProjects}
                          onEdit={() => onProjectUpdate(projectId)}
                          onDelete={() => onDeleteProject(projectId)}
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
                {isExpanded ? (
                  <tr className="project-detail-row">
                    <td colSpan="7">
                      <ProjectRow
                        project={project}
                        onRegenerateDSN={onRegenerateDSN}
                      />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

function ProjectActionsMenu({ project, canUpdate, canDelete, onEdit, onDelete }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="icon-button"
            type="button"
            aria-label={`Actions for ${project.name}`}
          >
            <FiMoreVertical />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="action-menu-content"
            align="end"
            sideOffset={6}
          >
            {canUpdate ? (
              <DropdownMenu.Item className="action-menu-item" onSelect={onEdit}>
                <FiEdit2 />
                Edit
              </DropdownMenu.Item>
            ) : null}
            {canDelete ? (
              <DropdownMenu.Item
                className="action-menu-item danger"
                onSelect={() => setConfirmOpen(true)}
              >
                <FiTrash2 />
                Delete
              </DropdownMenu.Item>
            ) : null}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <ConfirmProjectAction
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Are you sure?"
        description={`This will archive ${project.name}.`}
        actionLabel="Delete"
        onConfirm={onDelete}
      />
    </>
  );
}

function formatProjectDate(value) {
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
  }).format(date);
}

export default ProjectList;
