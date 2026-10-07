import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
  const {
    user,
    isAuthenticated,
    loading
  } = useAuth();

  if (loading) {
    return <p>Loading MeroAsha...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user?.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;