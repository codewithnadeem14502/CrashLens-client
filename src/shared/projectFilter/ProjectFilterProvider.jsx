import { useCallback, useEffect, useMemo, useState } from "react";
import { listProjects } from "../../features/projects/api/projectService";
import { useAuth } from "../auth/useAuth";
import { useToast } from "../components/useToast";
import { getApiError } from "../api/errors";
import { loadProjectFilter, saveProjectFilter } from "./projectFilterStorage";
import { ProjectFilterContext } from "./projectFilterContext";

export function ProjectFilterProvider({ children }) {
  const { isAuthenticated, session } = useAuth();
  const { notify } = useToast();
  const organizationId = session?.organizationId;

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectIdState] = useState(() =>
    loadProjectFilter(organizationId),
  );

  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) {
      setProjects([]);
      return;
    }

    setIsLoading(true);

    try {
      const projectData = await listProjects();
      setProjects(Array.isArray(projectData) ? projectData : []);
    } catch (error) {
      notify({ title: "Could not load projects", description: getApiError(error), tone: "danger" });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, notify]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, [fetchProjects]);

  // Covers both sign-out (organizationId becomes undefined) and sign-in (a
  // fresh session, possibly a different org) - there's no in-session org
  // switch anywhere in this app, so a session replace is the only way
  // organizationId ever changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedProjectIdState(loadProjectFilter(organizationId));
  }, [organizationId]);

  const setSelectedProjectId = useCallback(
    (projectId) => {
      setSelectedProjectIdState(projectId);
      saveProjectFilter(organizationId, projectId);
    },
    [organizationId],
  );

  const value = useMemo(
    () => ({ projects, isLoading, selectedProjectId, setSelectedProjectId }),
    [projects, isLoading, selectedProjectId, setSelectedProjectId],
  );

  return <ProjectFilterContext.Provider value={value}>{children}</ProjectFilterContext.Provider>;
}
