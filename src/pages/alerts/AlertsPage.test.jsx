import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AlertsPage from "./AlertsPage";
import { createAlertRule, deleteAlertRule, listAlertRules } from "../../features/alerts/api/alertService";

const mockNavigate = vi.fn();
const mockSession = { organizationId: "org-1", role: "admin", permissions: ["*"] };
const mockSignOut = vi.fn();
const mockNotify = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../features/alerts/api/alertService", () => ({
  listAlertRules: vi.fn(),
  createAlertRule: vi.fn(),
  deleteAlertRule: vi.fn(),
}));

vi.mock("../../features/dashboards/api/dashboardService", () => ({
  executeQuery: vi.fn().mockResolvedValue({ value: 0 }),
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

const mockUseProjectFilter = vi.fn(() => ({
  projects: [],
  selectedProjectId: "all",
  setSelectedProjectId: vi.fn(),
  isLoading: false,
}));

vi.mock("../../shared/projectFilter/useProjectFilter", () => ({
  useProjectFilter: () => mockUseProjectFilter(),
}));

const sampleRule = {
  id: "rule-1",
  name: "High error rate",
  status: "active",
  state: "ok",
  lastValue: 3,
  query: { dataset: "transactions", aggregate: "error_rate", filters: {}, timeWindowMinutes: 15 },
};

const renderAlertsPage = () =>
  render(
    <MemoryRouter>
      <AlertsPage />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockClear();
  listAlertRules.mockResolvedValue({
    rules: [sampleRule],
    pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
  });
});

describe("AlertsPage", () => {
  it("loads and lists alert rules", async () => {
    renderAlertsPage();

    await waitFor(() => expect(listAlertRules).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("High error rate")).toBeInTheDocument();
    expect(screen.getByText("1 alert rules")).toBeInTheDocument();
  });

  it("clicking a rule row navigates to its detail route", async () => {
    renderAlertsPage();
    const row = await screen.findByText("High error rate");

    await userEvent.click(row);

    expect(mockNavigate).toHaveBeenCalledWith("/workspace/alerts/rule-1");
  });

  it("deleting a rule calls deleteAlertRule and refreshes the list", async () => {
    deleteAlertRule.mockResolvedValue({ success: true });

    renderAlertsPage();
    await screen.findByText("High error rate");

    await userEvent.click(screen.getByRole("button", { name: /delete high error rate/i }));
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(deleteAlertRule).toHaveBeenCalledWith("rule-1"));
    expect(listAlertRules).toHaveBeenCalledTimes(2);
  });

  it("creating a rule with no resolveThreshold keeps the submit button disabled", async () => {
    renderAlertsPage();
    await screen.findByText("High error rate");

    await userEvent.click(screen.getByRole("button", { name: /new alert rule/i }));
    await userEvent.type(await screen.findByPlaceholderText(/high error rate on checkout/i), "New rule");

    expect(screen.getByRole("button", { name: /save rule/i })).toBeDisabled();
    expect(createAlertRule).not.toHaveBeenCalled();
  });

  it("sends the globally-selected project as a projectId query param", async () => {
    mockUseProjectFilter.mockReturnValue({
      projects: [],
      selectedProjectId: "project-1",
      setSelectedProjectId: vi.fn(),
      isLoading: false,
    });

    renderAlertsPage();

    await waitFor(() =>
      expect(listAlertRules).toHaveBeenCalledWith(expect.objectContaining({ projectId: "project-1" })),
    );
  });

  it("filters the visible list client-side by rule name search", async () => {
    listAlertRules.mockResolvedValue({
      rules: [sampleRule, { ...sampleRule, id: "rule-2", name: "Slow checkout endpoint" }],
      pagination: { page: 1, limit: 100, total: 2, totalPages: 1 },
    });

    renderAlertsPage();
    await screen.findByText("High error rate");
    await screen.findByText("Slow checkout endpoint");

    await userEvent.type(screen.getByPlaceholderText("Search by rule name"), "checkout");

    expect(screen.getByText("Slow checkout endpoint")).toBeInTheDocument();
    expect(screen.queryByText("High error rate")).not.toBeInTheDocument();
  });
});
