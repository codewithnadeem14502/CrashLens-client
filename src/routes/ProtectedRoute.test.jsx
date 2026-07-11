import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";

const mockUseAuth = vi.fn();

vi.mock("../shared/auth/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route path="/auth" element={<div>Auth page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Secret content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  it("renders the protected children when authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });

    renderProtected();

    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });

  it("redirects to /auth instead of rendering children when not authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });

    renderProtected();

    expect(screen.getByText("Auth page")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });
});
