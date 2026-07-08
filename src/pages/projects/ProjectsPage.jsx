import { useCallback, useEffect, useMemo, useState } from "react";
import { WorkspaceLayout } from "../../shared/layouts/WorkspaceLayout";
import { useAuth } from "../../shared/auth/useAuth";
import { useToast } from "../../shared/components/useToast";
import { UserBadge } from "../../features/members/components/UserBadge";
import { FiRefreshCw, FiPlus, FiX } from "react-icons/fi";
import * as Separator from "@radix-ui/react-separator";
import * as Dialog from "@radix-ui/react-dialog";
import ProjectList from "../../features/projects/components/ProjectList";
import ProjectCreateForm from "../../features/projects/components/ProjectCreateForm";
import {
  createProject,
  deleteProject,
  listProjects,
  regenerateDSN,
  updateProject,
} from "../../features/projects/api/projectService";
import { Permissions, Roles } from "../../shared/auth/authEnums";
import { hasPermission } from "../../shared/auth/permissions";
import { getApiError } from "../../shared/api/errors";
import SearchBar from "../../shared/components/SearchBar";

const ProjectsPage = () => {
  const { session, signOut } = useAuth();
  const { notify } = useToast();

  const organizationId = session.organizationId;
  const userRole = useMemo(
    () => session?.membership?.role || Roles.VIEWER,
    [session],
  );

  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const canCreateProject = useMemo(
    () => hasPermission(session, Permissions.PROJECT_CREATE),
    [session],
  );

  const canUpdateProjects = useMemo(
    () => hasPermission(session, Permissions.PROJECT_UPDATE),
    [session],
  );

  const canDeleteProjects = useMemo(
    () => hasPermission(session, Permissions.PROJECT_DELETE),
    [session],
  );

  const fetchProjects = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const projectData = await listProjects();
      setProjects(projectData);
      setFilteredProjects(Array.isArray(projectData) ? projectData : []);
    } catch (error) {
      notify({
        title: "Could not load projects",
        description: getApiError(error),
        tone: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, notify]);

  const filterProjects = useCallback((projects, query) => {
    const search = query.trim().toLowerCase();

    return projects.filter((project) => {
      return (
        project.name?.toLowerCase().includes(search) ||
        project.slug?.toLowerCase().includes(search) ||
        project.dsn?.toLowerCase().includes(search)
      );
    });
  }, []);

  const openCreateForm = () => {
    setEditingProjectId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (projectId) => {
    setEditingProjectId(projectId);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProjectId(null);
  };

  const handleCreateProject = async (projectData) => {
    setIsSubmitting(true);

    try {
      const response = await createProject(projectData);
      await fetchProjects();
      setIsFormOpen(false);

      notify({
        title: "Project created",
        description: response.message,
        tone: response.success ? "success" : "warning",
      });
    } catch (error) {
      notify({
        title: "Could not create project",
        description: getApiError(error),
        tone: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectUpdate = async (projectId, updatedData) => {
    setIsSubmitting(true);

    try {
      const response = await updateProject(projectId, updatedData);
      await fetchProjects();
      closeForm();
      notify({
        title: "Project updated",
        description: response.message ?? "Project updated successfully.",
        tone: response.success ? "success" : "warning",
      });
    } catch (error) {
      notify({
        title: "Could not update project",
        description: getApiError(error),
        tone: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    setIsSubmitting(true);
    try {
      const response = await deleteProject(projectId);
      await fetchProjects();
      notify({
        title: "Project deleted",
        description: response.message,
        tone: response.success ? "success" : "warning",
      });
    } catch (error) {
      notify({
        title: "Could not delete project",
        description: getApiError(error),
        tone: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateDSN = async (projectId) => {
    setIsSubmitting(true);
    try {
      const response = await regenerateDSN(projectId);
      await fetchProjects();
      notify({
        title: "DSN regenerated",
        description:
          response.message ?? "Project DSN regenerated successfully.",
        tone: response.success ? "success" : "warning",
      });
      return response;
    } catch (error) {
      notify({
        title: "Could not regenerate DSN",
        description: getApiError(error),
        tone: "danger",
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, [fetchProjects]);

  return (
    <WorkspaceLayout onSignOut={signOut}>
      <header className="workspace-header">
        <div>
          <h1>Projects</h1>
          <p className="muted">Create and manage your projects</p>
        </div>

        <div className="header-actions">
          {canCreateProject && (
            <button
              className="primary-button"
              type="button"
              onClick={openCreateForm}
            >
              <FiPlus />
              Create Project
            </button>
          )}

          <UserBadge session={session} />
        </div>
      </header>

      <Dialog.Root
        open={isFormOpen}
        onOpenChange={(open) => (open ? setIsFormOpen(true) : closeForm())}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="project-dialog-overlay" />
          <Dialog.Content className="project-dialog-content">
            <div className="project-dialog-header">
              <div>
                <p className="eyebrow">
                  {editingProjectId ? "Update" : "Create"}
                </p>
                <Dialog.Title asChild>
                  <h2>{editingProjectId ? "Edit project" : "Add a project"}</h2>
                </Dialog.Title>
              </div>

              <Dialog.Close asChild>
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Close"
                >
                  <FiX />
                </button>
              </Dialog.Close>
            </div>

            <Separator.Root className="separator" />

            <div className="project-dialog-body">
              <ProjectCreateForm
                key={editingProjectId ?? "create-project"}
                canManageProjects={canCreateProject}
                canUpdateProjects={canUpdateProjects}
                isSubmitting={isSubmitting}
                isUpdate={Boolean(editingProjectId)}
                projectId={editingProjectId}
                onCreate={handleCreateProject}
                onUpdate={handleProjectUpdate}
                onCancelUpdate={closeForm}
                notify={notify}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="">
        <section className="panel member-list-panel full-width scrollbar-hide">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Directory</p>
              <h2>{filteredProjects.length} Projects</h2>
            </div>

            <button
              className="icon-button"
              type="button"
              onClick={fetchProjects}
              aria-label="Refresh projects"
            >
              <FiRefreshCw />
            </button>
          </div>

          <SearchBar
            data={projects}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterFn={filterProjects}
            onFilteredData={setFilteredProjects}
            placeholder="Search projects..."
          />

          <Separator.Root className="separator" />
          {filteredProjects.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              {searchQuery
                ? "No projects match your search."
                : "No projects available. Create a new project to get started."}
            </div>
          )}
          <ProjectList
            projects={filteredProjects}
            isLoading={isLoading}
            canUpdateProjects={canUpdateProjects}
            canDeleteProjects={canDeleteProjects}
            onProjectUpdate={openEditForm}
            onDeleteProject={handleDeleteProject}
            onRegenerateDSN={handleRegenerateDSN}
          />
        </section>
      </div>
    </WorkspaceLayout>
  );
};

export default ProjectsPage;
