import { Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "../pages/landing/LandingPage";
import { AuthPage } from "../pages/auth/AuthPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { MembersPage } from "../pages/members/MembersPage";
import { useAuth } from "../shared/auth/useAuth";
import Projects from "../pages/projects/ProjectsPage";
import Issues from "../pages/issues/IssuesPage";
import { IssueDetailPage } from "../pages/issues/IssueDetailPage";
import PerformancePage from "../pages/performance/PerformancePage";
import { LogsPage } from "../pages/logs/LogsPage";
import { MonitorsPage } from "../pages/monitors/MonitorsPage";
import MonitorDetailPage from "../pages/monitors/MonitorDetailPage";
import DashboardsPage from "../pages/dashboards/DashboardsPage";
import DashboardDetailPage from "../pages/dashboards/DashboardDetailPage";
import AlertsPage from "../pages/alerts/AlertsPage";
import AlertRuleDetailPage from "../pages/alerts/AlertRuleDetailPage";
import { EngineeringPage } from "../pages/engineering/EngineeringPage";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const homePath = isAuthenticated ? "/workspace/projects" : "/auth";
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/auth"
        element={
          isAuthenticated ? (
            <Navigate to="/workspace/projects" replace />
          ) : (
            <AuthPage />
          )
        }
      />
      <Route
        path="/auth/forgot-password"
        element={
          isAuthenticated ? (
            <Navigate to="/workspace/projects" replace />
          ) : (
            <ForgotPasswordPage />
          )
        }
      />
      <Route
        path="/workspace/members"
        element={
          <ProtectedRoute>
            <MembersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/issues"
        element={
          <ProtectedRoute>
            <Issues />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/issues/issue-detail/:issueId"
        element={
          <ProtectedRoute>
            <IssueDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/performance"
        element={
          <ProtectedRoute>
            <PerformancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/logs"
        element={
          <ProtectedRoute>
            <LogsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/monitors"
        element={
          <ProtectedRoute>
            <MonitorsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/monitors/:type/:monitorId"
        element={
          <ProtectedRoute>
            <MonitorDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/dashboards"
        element={
          <ProtectedRoute>
            <DashboardsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/dashboards/:dashboardId"
        element={
          <ProtectedRoute>
            <DashboardDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/alerts"
        element={
          <ProtectedRoute>
            <AlertsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/alerts/:ruleId"
        element={
          <ProtectedRoute>
            <AlertRuleDetailPage />
          </ProtectedRoute>
        }
      />
      {/* Public reference page - deliberately not wrapped in ProtectedRoute,
          see EngineeringPage.jsx's own header comment. */}
      <Route path="/workspace/engineering" element={<EngineeringPage />} />
      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  );
}
