import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Issues from "./IssuesPage";
import { listIssues } from "../../features/issues/api/issuesService";

// Regression tests for the Module 3 P0 fix: filter/search state used to
// only ever re-filter the single already-fetched page of 5 issues in
// memory (via a useMemo chain) - status/severity/search were never sent to
// the API as query params, so a match on another page was simply invisible
// until the user paged to it. These assert the real fix: applying a filter
// or typing a search term must trigger listIssues() with the corresponding
// query param, i.e. a real server-side re-fetch.

vi.mock("../../features/issues/api/issuesService", () => ({
  listIssues: vi.fn(),
  updateIssueStatus: vi.fn(),
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

vi.mock("../../features/issues/components/IssueList", () => ({
  default: ({ issues }) => (
    <ul data-testid="issue-list">
      {issues.map((issue) => (
        <li key={issue.id}>{issue.title}</li>
      ))}
    </ul>
  ),
}));

vi.mock("../../features/issues/components/IssueSearchBar", () => ({
  IssueSearchBar: ({ value, onChange }) => (
    <div>
      <input
        aria-label="search issues"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  ),
}));

vi.mock("../../features/issues/components/IssuesFilters", () => ({
  IssuesFilters: ({ onApplyFilters }) => (
    <>
      <button
        type="button"
        onClick={() =>
          onApplyFilters({
            status: "resolved",
            severity: "all",
            sort: "newest",
          })
        }
      >
        Apply resolved filter
      </button>
      <button
        type="button"
        onClick={() =>
          onApplyFilters({
            status: "ignored",
            severity: "all",
            sort: "newest",
          })
        }
      >
        Apply ignored filter
      </button>
    </>
  ),
}));

const renderIssuesPage = () =>
  render(
    <MemoryRouter>
      <Issues />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  listIssues.mockResolvedValue({
    issues: [{ id: "1", title: "TypeError: cannot read property foo" }],
    pagination: { page: 1, limit: 5, total: 1, totalPages: 1 },
  });
});

describe("IssuesPage filtering", () => {
  it("applying a status filter re-fetches from the API with status as a query param, not just a client-side re-filter", async () => {
    renderIssuesPage();

    await waitFor(() =>
      expect(listIssues).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 5, status: undefined }),
      ),
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Apply resolved filter" }),
    );

    await waitFor(() =>
      expect(listIssues).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: "resolved" }),
      ),
    );
  });

  it("typing a search term (after debounce) re-fetches from the API with search as a query param", async () => {
    renderIssuesPage();

    await waitFor(() => expect(listIssues).toHaveBeenCalledTimes(1));

    await userEvent.type(
      screen.getByLabelText("search issues"),
      "TypeError",
    );

    await waitFor(
      () =>
        expect(listIssues).toHaveBeenLastCalledWith(
          expect.objectContaining({ search: "TypeError" }),
        ),
      { timeout: 2000 },
    );
  });

  it("does not let a stale, slow response overwrite the results of a newer request", async () => {
    // Tracks every listIssues() call as a manually-resolvable deferred
    // promise, without assuming a fixed number of calls per user action -
    // React's effect semantics can fire an effect more than once for a
    // single logical action (e.g. React re-running effects), and this test
    // should hold regardless of exactly how many redundant calls that
    // produces. What must always be true: whichever request was fired
    // *last* wins, no matter its resolution order relative to earlier ones.
    const deferred = [];
    listIssues.mockImplementation(() => {
      let resolve;
      const promise = new Promise((res) => {
        resolve = res;
      });
      deferred.push({ promise, resolve });
      return promise;
    });

    renderIssuesPage();
    await waitFor(() => expect(deferred.length).toBeGreaterThanOrEqual(1));

    // Settle every request fired by the initial mount so the page reaches
    // a stable resting state before the actual race scenario begins.
    const mountRequests = deferred.slice();
    mountRequests.forEach(({ resolve }) =>
      resolve({
        issues: [{ id: "0", title: "Initial issue" }],
        pagination: { page: 1, limit: 5, total: 1, totalPages: 1 },
      }),
    );
    await waitFor(() =>
      expect(screen.getByText("Initial issue")).toBeInTheDocument(),
    );

    const countBeforeClicks = deferred.length;

    // Fire the "resolved" filter, then - before anything settles - fire
    // the "ignored" filter. Whatever requests these two clicks produce,
    // the *last* one fired must be the one that ends up on screen.
    await userEvent.click(
      screen.getByRole("button", { name: "Apply resolved filter" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Apply ignored filter" }),
    );
    await waitFor(() =>
      expect(deferred.length).toBeGreaterThan(countBeforeClicks),
    );

    const fromClicks = deferred.slice(countBeforeClicks);
    const last = fromClicks[fromClicks.length - 1];
    const earlier = fromClicks.slice(0, -1);

    // Resolve the *last-fired* request first, simulating it winning the
    // race even though it wasn't the first to settle.
    last.resolve({
      issues: [{ id: "2", title: "Ignored-filter issue" }],
      pagination: { page: 1, limit: 5, total: 1, totalPages: 1 },
    });
    await waitFor(() =>
      expect(screen.getByText("Ignored-filter issue")).toBeInTheDocument(),
    );

    // Now resolve every earlier (stale) request - none of them should be
    // able to override the result above. Wrapped in act() since the
    // component's guard means this resolution should cause no state
    // update at all, but React still expects any effect-driven promise
    // settlement touched from a test to go through act().
    await act(async () => {
      earlier.forEach(({ resolve }) =>
        resolve({
          issues: [{ id: "1", title: "Resolved-filter issue" }],
          pagination: { page: 1, limit: 5, total: 1, totalPages: 1 },
        }),
      );
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(screen.getByText("Ignored-filter issue")).toBeInTheDocument();
    expect(
      screen.queryByText("Resolved-filter issue"),
    ).not.toBeInTheDocument();
  });

  it("sends the globally-selected project as a projectId query param", async () => {
    mockUseProjectFilter.mockReturnValue({
      projects: [],
      selectedProjectId: "project-1",
      setSelectedProjectId: vi.fn(),
      isLoading: false,
    });

    renderIssuesPage();

    await waitFor(() =>
      expect(listIssues).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: "project-1" }),
      ),
    );
  });
});
