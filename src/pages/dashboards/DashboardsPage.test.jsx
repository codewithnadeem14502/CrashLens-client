import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardsPage from "./DashboardsPage";
import { createDashboard, deleteDashboard, listDashboards } from "../../features/dashboards/api/dashboardService";

const mockNavigate = vi.fn();
// Stable module-level references, not fresh objects/vi.fn() per call - see
// MonitorsPage.test.jsx's comment for why this matters (an unstable mock
// can make an otherwise-correct component's effect dependency chain look
// like an infinite-render bug when it's just a test-mock artifact).
const mockSession = { organizationId: "org-1", role: "admin", permissions: ["*"] };
const mockSignOut = vi.fn();
const mockNotify = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../features/dashboards/api/dashboardService", () => ({
  listDashboards: vi.fn(),
  createDashboard: vi.fn(),
  deleteDashboard: vi.fn(),
  executeQuery: vi.fn(),
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

const renderDashboardsPage = () =>
  render(
    <MemoryRouter>
      <DashboardsPage />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockClear();
  listDashboards.mockResolvedValue({
    dashboards: [{ id: "dash-1", name: "Production overview", widgets: [{ widgetId: "w1" }] }],
    pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
  });
});

describe("DashboardsPage", () => {
  it("loads and lists dashboards", async () => {
    renderDashboardsPage();

    await waitFor(() => expect(listDashboards).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Production overview")).toBeInTheDocument();
    expect(screen.getByText("1 dashboards")).toBeInTheDocument();
  });

  it("creating a dashboard navigates straight to its detail page", async () => {
    createDashboard.mockResolvedValue({ success: true, data: { dashboard: { id: "dash-2", name: "New one" } } });

    renderDashboardsPage();
    await screen.findByText("Production overview");

    await userEvent.type(screen.getByPlaceholderText("Production overview"), "New one");
    await userEvent.click(screen.getByRole("button", { name: /create dashboard/i }));

    await waitFor(() => expect(createDashboard).toHaveBeenCalledWith({ name: "New one", widgets: [] }));
    expect(mockNavigate).toHaveBeenCalledWith("/workspace/dashboards/dash-2");
  });

  it("deleting a dashboard calls deleteDashboard and refreshes the list", async () => {
    deleteDashboard.mockResolvedValue({ success: true });

    renderDashboardsPage();
    await screen.findByText("Production overview");

    await userEvent.click(screen.getByRole("button", { name: /delete production overview/i }));
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(deleteDashboard).toHaveBeenCalledWith("dash-1"));
    expect(listDashboards).toHaveBeenCalledTimes(2);
  });
});
