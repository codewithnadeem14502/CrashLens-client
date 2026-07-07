import { FiInbox, FiLogOut, FiShield, FiUsers } from "react-icons/fi";
import { GoProjectRoadmap } from "react-icons/go";
import { useAuth } from "../auth/useAuth";
import { useCallback, useMemo } from "react";
import { Roles } from "../auth/authEnums";

export function WorkspaceLayout({ children, onSignOut }) {
  const { session } = useAuth();

  const userRole = useMemo(
    () => session?.membership?.role || Roles.VIEWER,
    [session],
  );
  return (
    <main className="workspace-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand-row">
            <span className="brand-mark small">
              <FiShield />
            </span>
            <span>CrashLens</span>
          </div>
          {userRole !== Roles.VIEWER && (
            <nav className="nav-list" aria-label="Workspace navigation">
              <a className="nav-item active" href="/workspace/members">
                <FiUsers />
                Members
              </a>
            </nav>
          )}
          <nav className="nav-list" aria-label="Workspace navigation">
            <a className="nav-item active" href="/workspace/projects">
              <GoProjectRoadmap />
              Projects
            </a>
          </nav>
          <nav className="nav-list" aria-label="Workspace navigation">
            <a className="nav-item active" href="/workspace/issues">
              <FiInbox />
              Issues
            </a>
          </nav>
          {/* <nav className="nav-list" aria-label="Workspace navigation">
            <a className="nav-item active" href="/workspace/issues">
              <FiMessageSquare />
              Chat
            </a>
          </nav> */}
        </div>
        <button className="ghost-button" type="button" onClick={onSignOut}>
          <FiLogOut />
          Sign out
        </button>
      </aside>

      <section className="workspace-main">{children}</section>
    </main>
  );
}
