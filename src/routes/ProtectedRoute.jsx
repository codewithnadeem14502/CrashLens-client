import { Navigate } from "react-router-dom";
import { useAuth } from "../shared/auth/useAuth";

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}
