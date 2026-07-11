import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MonitorsPage from "./MonitorsPage";
import { listMonitors, createMonitor, deleteMonitor } from "../../features/monitors/api/monitorService";
import { listUptimeMonitors, deleteUptimeMonitor } from "../../features/monitors/api/uptimeService";
import { listProjects } from "../../features/projects/api/projectService";

const mockNavigate = vi.fn();
// Stable references across renders, matching how the real hooks behave
// (useAuth/useToast read from Context, which doesn't hand back a fresh
// object/function identity on every render) - a mock that fabricates a new
// object or vi.fn() on every call is a stricter, *unrealistic* input that
// can make an otherwise-correct component's useCallback/useEffect
// dependency chain look unstable and re-render in a loop purely as a test
// artifact, not a real bug. Defining these once at module scope avoids that.
const mockSession = { organizationId: "org-1", role: "admin", permissions: ["*"] };
const mockSignOut = vi.fn();
const mockNotify = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../features/monitors/api/monitorService", () => ({
  listMonitors: vi.fn(),
  createMonitor: vi.fn(),
  deleteMonitor: vi.fn(),
}));

vi.mock("../../features/monitors/api/uptimeService", () => ({
  listUptimeMonitors: vi.fn(),
  createUptimeMonitor: vi.fn(),
  deleteUptimeMonitor: vi.fn(),
}));

vi.mock("../../features/projects/api/projectService", () => ({
  listProjects: vi.fn(),
}));

vi.mock("../../shared/auth/useAuth", () => ({
  useAuth: () => ({ session: mockSession, signOut: mockSignOut }),
}));

vi.mock("../../shared/components/useToast", () => ({
  useToast: () => ({ notify: mockNotify }),
}));

vi.mock("../../shared/layouts/WorkspaceLayout", () => ({
  WorkspaceLayout: ({ children }) => <div>{children}</div>,
}));

const renderMonitorsPage = () =>
  render(
    <MemoryRouter>
      <MonitorsPage />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockClear();
  listProjects.mockResolvedValue([{ id: "project-1", name: "Demo Project" }]);
  listMonitors.mockResolvedValue({
    monitors: [
      {
        id: "monitor-1",
        name: "Nightly backup",
        status: "active",
        scheduleType: "interval",
        intervalSeconds: 3600,
        lastCheckInStatus: "ok",
        environment: "production",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
  });
  listUptimeMonitors.mockResolvedValue({
    uptimeMonitors: [
      {
        id: "uptime-1",
        name: "API health",
        status: "active",
        url: "https://example.com/health",
        lastStatus: "up",
        environment: "production",
        createdAt: "2026-01-02T00:00:00.000Z",
      },
    ],
    pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
  });
});

describe("MonitorsPage", () => {
  it("loads and merges both cron and uptime monitors into one list", async () => {
    renderMonitorsPage();

    await waitFor(() => expect(listMonitors).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(listUptimeMonitors).toHaveBeenCalledTimes(1));

    expect(await screen.findByText("Nightly backup")).toBeInTheDocument();
    expect(await screen.findByText("API health")).toBeInTheDocument();
    expect(screen.getByText("2 monitors")).toBeInTheDocument();
  });

  it("clicking a cron monitor row navigates to its type-specific detail route", async () => {
    renderMonitorsPage();
    const row = await screen.findByText("Nightly backup");

    await userEvent.click(row);

    expect(mockNavigate).toHaveBeenCalledWith("/workspace/monitors/cron/monitor-1");
  });

  it("clicking an uptime monitor row navigates to its type-specific detail route", async () => {
    renderMonitorsPage();
    const row = await screen.findByText("API health");

    await userEvent.click(row);

    expect(mockNavigate).toHaveBeenCalledWith("/workspace/monitors/uptime/uptime-1");
  });

  it("creating a cron monitor calls createMonitor with the selected project and shows the one-time check token", async () => {
    createMonitor.mockResolvedValue({
      success: true,
      message: "Monitor created successfully",
      data: { checkToken: "secret-check-token-abc123" },
    });

    renderMonitorsPage();
    await screen.findByText("Nightly backup");

    await userEvent.click(screen.getByRole("button", { name: /cron monitor/i }));
    await userEvent.type(await screen.findByPlaceholderText("Nightly backup"), "New cron job");
    await userEvent.click(screen.getByRole("button", { name: /create cron monitor/i }));

    await waitFor(() =>
      expect(createMonitor).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: "project-1", name: "New cron job" }),
      ),
    );

    expect(await screen.findByDisplayValue("secret-check-token-abc123")).toBeInTheDocument();
  });

  it("deleting a monitor routes cron deletions to deleteMonitor, not deleteUptimeMonitor", async () => {
    deleteMonitor.mockResolvedValue({ success: true, message: "Monitor deleted successfully" });

    renderMonitorsPage();
    await screen.findByText("Nightly backup");

    await userEvent.click(screen.getByRole("button", { name: /delete nightly backup/i }));
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(deleteMonitor).toHaveBeenCalledWith("monitor-1"));
    expect(deleteUptimeMonitor).not.toHaveBeenCalled();
  });

  it("deleting an uptime monitor routes to deleteUptimeMonitor, not deleteMonitor", async () => {
    deleteUptimeMonitor.mockResolvedValue({ success: true, message: "Uptime monitor deleted successfully" });

    renderMonitorsPage();
    await screen.findByText("API health");

    await userEvent.click(screen.getByRole("button", { name: /delete api health/i }));
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(deleteUptimeMonitor).toHaveBeenCalledWith("uptime-1"));
    expect(deleteMonitor).not.toHaveBeenCalled();
  });
});
