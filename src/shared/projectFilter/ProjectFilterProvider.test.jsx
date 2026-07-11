import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectFilterProvider } from "./ProjectFilterProvider";
import { useProjectFilter } from "./useProjectFilter";
import { listProjects } from "../../features/projects/api/projectService";

const mockNotify = vi.fn();
let mockAuth = { isAuthenticated: true, session: { organizationId: "org-1" } };

vi.mock("../../features/projects/api/projectService", () => ({
  listProjects: vi.fn(),
}));

vi.mock("../auth/useAuth", () => ({
  useAuth: () => mockAuth,
}));

vi.mock("../components/useToast", () => ({
  useToast: () => ({ notify: mockNotify }),
}));

const wrapper = ({ children }) => <ProjectFilterProvider>{children}</ProjectFilterProvider>;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockAuth = { isAuthenticated: true, session: { organizationId: "org-1" } };
  listProjects.mockResolvedValue([{ id: "project-1", name: "Demo Project" }]);
});

describe("ProjectFilterProvider", () => {
  it("throws when useProjectFilter is used outside the provider", () => {
    expect(() => renderHook(() => useProjectFilter())).toThrow(
      "useProjectFilter must be used inside ProjectFilterProvider",
    );
  });

  it("loads the project list once and defaults to All projects", async () => {
    const { result } = renderHook(() => useProjectFilter(), { wrapper });

    await waitFor(() => expect(result.current.projects).toEqual([{ id: "project-1", name: "Demo Project" }]));
    expect(result.current.selectedProjectId).toBe("all");
    expect(listProjects).toHaveBeenCalledTimes(1);
  });

  it("persists the selected project to localStorage, namespaced by organization", async () => {
    const { result } = renderHook(() => useProjectFilter(), { wrapper });
    await waitFor(() => expect(result.current.projects).toHaveLength(1));

    act(() => {
      result.current.setSelectedProjectId("project-1");
    });

    expect(result.current.selectedProjectId).toBe("project-1");
    expect(localStorage.getItem("crashlens.selectedProjectId.org-1")).toBe("project-1");
  });

  it("restores a previously-selected project from localStorage on mount", async () => {
    localStorage.setItem("crashlens.selectedProjectId.org-1", "project-1");

    const { result } = renderHook(() => useProjectFilter(), { wrapper });

    await waitFor(() => expect(result.current.selectedProjectId).toBe("project-1"));
  });

  it("does not fetch projects when unauthenticated", async () => {
    mockAuth = { isAuthenticated: false, session: null };

    renderHook(() => useProjectFilter(), { wrapper });

    await waitFor(() => expect(listProjects).not.toHaveBeenCalled());
  });
});
