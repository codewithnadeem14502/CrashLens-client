import { Fragment, useState } from "react";
import { FiChevronDown, FiEdit2 } from "react-icons/fi";
import ProjectRow from "./ProjectRow";

const ProjectList = ({
  projects,
  isLoading,
  canUpdateProjects,
  canDeleteProjects,
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
    return <div className="project-table-state">No projects found.</div>;
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
                      {canUpdateProjects ? (
                        <button
                          className="icon-button"
                          type="button"
                          onClick={() => onProjectUpdate(projectId)}
                          aria-label={`Edit ${project.name}`}
                        >
                          <FiEdit2 />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
                {isExpanded ? (
                  <tr className="project-detail-row">
                    <td colSpan="7">
                      <ProjectRow
                        project={project}
                        onProjectUpdate={onProjectUpdate}
                        onDeleteProject={onDeleteProject}
                        onRegenerateDSN={onRegenerateDSN}
                        canUpdate={canUpdateProjects}
                        canDelete={canDeleteProjects}
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
