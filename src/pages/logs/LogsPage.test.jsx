import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LogsPage from "./LogsPage";
import { listLogs } from "../../features/logs/api/logsService";

// Module 7 (Logs): mirrors IssuesPage.test.jsx's regression coverage for
// the exact filter-to-query-param bug class Module 3 fixed for issues -
// written correctly from the start here rather than repeating that bug in
// a new feature (see LogsPage.jsx's fetchLogs).

vi.mock("../../features/logs/api/logsService", () => ({
  listLogs: vi.fn(),
}));

vi.mock("../../features/performance/api/performanceService", () => ({
  getTrace: vi.fn(),
}));

vi.mock("../../shared/auth/useAuth", () => ({
  useAuth: () => ({
    session: { organizationId: "org-1", role: "admin", permissions: ["*"] },
    signOut: vi.fn(),
  }),
}));

vi.mock("../../shared/components/useToast", () => ({
  useToast: () => ({ notify: vi.fn() }),
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

// LogsFilters uses Radix Select internally (not a native <select>), same as
// IssuesFilters - mocked with plain buttons, mirroring
// IssuesPage.test.jsx's approach, so these tests exercise the actual
// query-param wiring in LogsPage.jsx rather than Radix's popover internals.
vi.mock("../../features/logs/components/LogsFilters", () => ({
  LogsFilters: ({ onApplyFilters }) => (
    <>
      <button
        type="button"
        onClick={() => onApplyFilters({ level: "error", sort: "newest" })}
      >
        Apply error level filter
      </button>
      <button
        type="button"
        onClick={() => onApplyFilters({ level: "all", sort: "oldest" })}
      >
        Apply oldest sort
      </button>
    </>
  ),
}));

const renderLogsPage = () =>
  render(
    <MemoryRouter>
      <LogsPage />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  listLogs.mockResolvedValue({
    logs: [{ entryId: "1", message: "hello world", level: "info" }],
    pagination: { page: 1, limit: 25, total: 1, totalPages: 1 },
  });
});

describe("LogsPage filtering", () => {
  it("mounts with the default sort (order=desc) sent as a real query param", async () => {
    renderLogsPage();

    await waitFor(() =>
      expect(listLogs).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 25, level: undefined, order: "desc" }),
      ),
    );
  });

  it("applying a level filter re-fetches from the API with level as a query param", async () => {
    renderLogsPage();
    await waitFor(() => expect(listLogs).toHaveBeenCalledTimes(1));

    await userEvent.click(
      screen.getByRole("button", { name: "Apply error level filter" }),
    );

    await waitFor(() =>
      expect(listLogs).toHaveBeenLastCalledWith(
        expect.objectContaining({ level: "error" }),
      ),
    );
  });

  it("switching sort to oldest sends order=asc as a real query param, not a client-side reverse", async () => {
    renderLogsPage();
    await waitFor(() => expect(listLogs).toHaveBeenCalledTimes(1));

    await userEvent.click(
      screen.getByRole("button", { name: "Apply oldest sort" }),
    );

    await waitFor(() =>
      expect(listLogs).toHaveBeenLastCalledWith(
        expect.objectContaining({ order: "asc" }),
      ),
    );
  });

  it("typing a search term (after debounce) re-fetches from the API with search as a query param", async () => {
    renderLogsPage();
    await waitFor(() => expect(listLogs).toHaveBeenCalledTimes(1));

    await userEvent.type(
      screen.getByPlaceholderText("Search log messages"),
      "timeout",
    );

    await waitFor(
      () =>
        expect(listLogs).toHaveBeenLastCalledWith(
          expect.objectContaining({ search: "timeout" }),
        ),
      { timeout: 2000 },
    );
  });

  it("shows the server-reported total (not just the current page's length) as the result count", async () => {
    listLogs.mockResolvedValue({
      logs: [{ entryId: "1", message: "only this page", level: "info" }],
      pagination: { page: 1, limit: 25, total: 61, totalPages: 3 },
    });

    renderLogsPage();

    await waitFor(() =>
      expect(screen.getByText("61 shown")).toBeInTheDocument(),
    );
  });

  it("sends the globally-selected project as a projectId query param", async () => {
    mockUseProjectFilter.mockReturnValue({
      projects: [],
      selectedProjectId: "project-1",
      setSelectedProjectId: vi.fn(),
      isLoading: false,
    });

    renderLogsPage();

    await waitFor(() =>
      expect(listLogs).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: "project-1" }),
      ),
    );
  });
});
