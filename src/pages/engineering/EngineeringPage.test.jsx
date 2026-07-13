import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import EngineeringPage from "./EngineeringPage";

// Public reference page - this test exists to guard the two things that
// matter for an unauthenticated route: it renders without a session, and it
// surfaces the real section headings rather than a blank/error shell.

vi.mock("../../shared/auth/useAuth", () => ({
  useAuth: () => ({
    session: null,
    signOut: vi.fn(),
  }),
}));

vi.mock("../../shared/layouts/WorkspaceLayout", () => ({
  WorkspaceLayout: ({ children }) => <div>{children}</div>,
}));

const renderEngineeringPage = () =>
  render(
    <MemoryRouter>
      <EngineeringPage />
    </MemoryRouter>,
  );

describe("EngineeringPage", () => {
  it("renders without an authenticated session", () => {
    renderEngineeringPage();

    expect(
      screen.getByRole("heading", { level: 1, name: "How CrashLens works" }),
    ).toBeInTheDocument();
  });

  it("renders every major section", () => {
    renderEngineeringPage();

    expect(
      screen.getByRole("heading", { name: "Key features" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "High-level workflow" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Packages" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Technology stack" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Quick start" }),
    ).toBeInTheDocument();
  });
});
