import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LandingPage } from "./LandingPage";

const mockUseAuth = vi.fn();

vi.mock("../../shared/auth/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

function renderLanding() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <LandingPage />
    </MemoryRouter>,
  );
}

describe("LandingPage", () => {
  it("renders for a logged-out visitor with a sign-in CTA to /auth", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });

    renderLanding();

    expect(
      screen.getByRole("heading", { level: 1, name: /fix it/i }),
    ).toBeInTheDocument();
    const getStartedLinks = screen.getAllByRole("link", { name: /get started/i });
    expect(getStartedLinks[0]).toHaveAttribute("href", "/auth");
    expect(screen.getAllByRole("link", { name: /sign in/i }).length).toBeGreaterThan(0);
  });

  it("renders for an authenticated visitor with a dashboard CTA, no sign-in link", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });

    renderLanding();

    const dashboardLinks = screen.getAllByRole("link", { name: /open dashboard/i });
    expect(dashboardLinks[0]).toHaveAttribute("href", "/workspace/projects");
    expect(screen.queryByRole("link", { name: /^sign in$/i })).not.toBeInTheDocument();
  });

  it("showcases all three capability groups", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });

    renderLanding();

    expect(screen.getByText(/error monitoring & issue tracking/i)).toBeInTheDocument();
    expect(screen.getByText(/performance monitoring & tracing/i)).toBeInTheDocument();
    expect(screen.getByText(/ai-assisted issue resolution/i)).toBeInTheDocument();
  });
});
