import {
  FiActivity,
  FiAlertOctagon,
  FiBell,
  FiBookOpen,
  FiFileText,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiRadio,
  FiShield,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { GoProjectRoadmap } from "react-icons/go";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useMemo, useState } from "react";
import { Roles } from "../auth/authEnums";
import { getInitials } from "../utils/strings";

export function WorkspaceLayout({ children, onSignOut }) {
  const { session } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const userRole = useMemo(
    () => session?.membership?.role || Roles.VIEWER,
    [session],
  );
  const profileName = session?.user?.name || session?.user?.email || "User";
  const profileRole =
    session?.membership?.role || session?.role || Roles.VIEWER;
  const profileOrganization = session?.organization?.name || "";

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <main className="workspace-shell">
      <header className="workspace-topbar">
        <button
          aria-expanded={drawerOpen}
          aria-label="Open navigation"
          className="ghost-button drawer-toggle"
          type="button"
          onClick={() => setDrawerOpen(true)}
        >
          <FiMenu />
        </button>
        <div className="brand-row">
          <span className="brand-mark small">
            <FiShield />
          </span>
          <span>CrashLens</span>
        </div>
      </header>
      {drawerOpen && (
        <div
          aria-hidden="true"
          className="drawer-overlay"
          onClick={closeDrawer}
        />
      )}
      <aside className={`sidebar ${drawerOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <div className="brand-row">
            <span className="brand-mark small">
              <FiShield />
            </span>
            <span>CrashLens</span>
            <button
              aria-label="Close navigation"
              className="ghost-button drawer-close"
              type="button"
              onClick={closeDrawer}
            >
              <FiX />
            </button>
          </div>
          <nav className="nav-list" aria-label="Workspace navigation">
            <div className="nav-section">
              <span className="nav-section-label">Workspace</span>
              <NavLink
                aria-label="Projects"
                className={getNavClassName}
                title="Projects"
                to="/workspace/projects"
                onClick={closeDrawer}
              >
                <GoProjectRoadmap />
                <span className="nav-item-label">Projects</span>
              </NavLink>
              {userRole !== Roles.VIEWER && (
                <NavLink
                  aria-label="Members"
                  className={getNavClassName}
                  title="Members"
                  to="/workspace/members"
                  onClick={closeDrawer}
                >
                  <FiUsers />
                  <span className="nav-item-label">Members</span>
                </NavLink>
              )}
            </div>

            <div className="nav-section">
              <span className="nav-section-label">Monitoring</span>
              <NavLink
                aria-label="Issues"
                className={getNavClassName}
                end={false}
                title="Issues"
                to="/workspace/issues"
                onClick={closeDrawer}
              >
                <FiAlertOctagon />
                <span className="nav-item-label">Issues</span>
              </NavLink>
              <NavLink
                aria-label="Performance"
                className={getNavClassName}
                title="Performance"
                to="/workspace/performance"
                onClick={closeDrawer}
              >
                <FiActivity />
                <span className="nav-item-label">Performance</span>
              </NavLink>
              <NavLink
                aria-label="Logs"
                className={getNavClassName}
                title="Logs"
                to="/workspace/logs"
                onClick={closeDrawer}
              >
                <FiFileText />
                <span className="nav-item-label">Logs</span>
              </NavLink>
              <NavLink
                aria-label="Monitors"
                className={getNavClassName}
                end={false}
                title="Monitors"
                to="/workspace/monitors"
                onClick={closeDrawer}
              >
                <FiRadio />
                <span className="nav-item-label">Monitors</span>
              </NavLink>
            </div>

            <div className="nav-section">
              <span className="nav-section-label">Insights</span>
              <NavLink
                aria-label="Dashboards"
                className={getNavClassName}
                end={false}
                title="Dashboards"
                to="/workspace/dashboards"
                onClick={closeDrawer}
              >
                <FiGrid />
                <span className="nav-item-label">Dashboards</span>
              </NavLink>
              <NavLink
                aria-label="Alerts"
                className={getNavClassName}
                end={false}
                title="Alerts"
                to="/workspace/alerts"
                onClick={closeDrawer}
              >
                <FiBell />
                <span className="nav-item-label">Alerts</span>
              </NavLink>
            </div>

            <div className="nav-section">
              <span className="nav-section-label">Reference</span>
              <NavLink
                aria-label="Engineering"
                className={getNavClassName}
                title="Engineering"
                to="/workspace/engineering"
                onClick={closeDrawer}
              >
                <FiBookOpen />
                <span className="nav-item-label">Engineering</span>
              </NavLink>
            </div>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div
            aria-label={
              profileOrganization
                ? `${profileName}, ${formatRole(profileRole)}, ${profileOrganization}`
                : `${profileName}, ${formatRole(profileRole)}`
            }
            className="sidebar-profile"
            tabIndex={0}
          >
            <span className="sidebar-profile-avatar" aria-hidden="true">
              {getInitials(profileName)}
            </span>
            <div className="sidebar-profile-copy">
              <strong>{profileName}</strong>
              <span>{formatRole(profileRole)}</span>
              {profileOrganization ? (
                <span className="sidebar-profile-org">{profileOrganization}</span>
              ) : null}
            </div>
          </div>
          <button
            aria-label="Sign out"
            className="ghost-button sidebar-signout"
            title="Sign out"
            type="button"
            onClick={() => {
              closeDrawer();
              onSignOut();
            }}
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
