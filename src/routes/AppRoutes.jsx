import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "../pages/auth/AuthPage";
import { MembersPage } from "../pages/members/MembersPage";
import { useAuth } from "../shared/auth/useAuth";
import Projects from "../pages/projects/ProjectsPage";
import Issues from "../pages/issues/IssuesPage";
import { IssueDetailPage } from "../pages/issues/IssueDetailPage";
import PerformancePage from "../pages/performance/PerformancePage";

export function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const homePath = isAuthenticated ? "/workspace/projects" : "/auth";
  return (
    <Routes>
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
        path="/workspace/members"
        element={
          isAuthenticated ? <MembersPage /> : <Navigate to="/auth" replace />
        }
      />
      <Route
        path="/workspace/projects"
        element={
          isAuthenticated ? <Projects /> : <Navigate to="/auth" replace />
        }
      />
      <Route
        path="/workspace/issues"
        element={isAuthenticated ? <Issues /> : <Navigate to="/auth" replace />}
      />
      <Route
        path="/workspace/issues/issue-detail/:issueId"
        element={
          isAuthenticated ? (
            <IssueDetailPage />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/workspace/performance"
        element={
          isAuthenticated ? <PerformancePage /> : <Navigate to="/auth" replace />
        }
      />
      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  );
}
