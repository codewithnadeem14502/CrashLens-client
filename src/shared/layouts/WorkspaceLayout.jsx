import { FiActivity, FiInbox, FiLogOut, FiShield, FiUsers } from "react-icons/fi";
import { GoProjectRoadmap } from "react-icons/go";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useMemo } from "react";
import { Roles } from "../auth/authEnums";
import { getInitials } from "../utils/strings";

export function WorkspaceLayout({ children, onSignOut }) {
  const { session } = useAuth();

  const userRole = useMemo(
    () => session?.membership?.role || Roles.VIEWER,
    [session],
  );
  const profileName = session?.user?.name || session?.user?.email || "User";
  const profileRole =
    session?.membership?.role || session?.role || Roles.VIEWER;

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
          <nav className="nav-list" aria-label="Workspace navigation">
            {userRole !== Roles.VIEWER && (
              <NavLink
                aria-label="Members"
                className={getNavClassName}
                title="Members"
                to="/workspace/members"
              >
                <FiUsers />
              </NavLink>
            )}
            <NavLink
              aria-label="Projects"
              className={getNavClassName}
              title="Projects"
              to="/workspace/projects"
            >
              <GoProjectRoadmap />
            </NavLink>
            <NavLink
              aria-label="Issues"
              className={getNavClassName}
              end={false}
              title="Issues"
              to="/workspace/issues"
            >
              <FiInbox />
            </NavLink>
            <NavLink
              aria-label="Performance"
              className={getNavClassName}
              title="Performance"
              to="/workspace/performance"
            >
              <FiActivity />
            </NavLink>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div
            aria-label={`${profileName}, ${formatRole(profileRole)}`}
            className="sidebar-profile"
            tabIndex={0}
          >
            <span className="sidebar-profile-avatar" aria-hidden="true">
              {getInitials(profileName)}
            </span>
            <div className="sidebar-profile-copy">
              <strong>{profileName}</strong>
              <span>{formatRole(profileRole)}</span>
            </div>
          </div>
          <button
            aria-label="Sign out"
            className="ghost-button sidebar-signout"
            title="Sign out"
            type="button"
            onClick={onSignOut}
          >
            <FiLogOut />
          </button>
        </div>
      </aside>

      <section className="workspace-main">{children}</section>
    </main>
  );
}

function getNavClassName({ isActive }) {
  return `nav-item ${isActive ? "active" : ""}`;
}

function formatRole(role) {
  return String(role || Roles.VIEWER)
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
