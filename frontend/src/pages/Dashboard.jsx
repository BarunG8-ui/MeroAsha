import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // ============================================================
  // ROLE-BASED DASHBOARD REDIRECTION
  // ============================================================

  switch (user.role) {
    case "PATIENT":
      return <Navigate to="/patient/dashboard" replace />;

    case "DOCTOR":
      return <Navigate to="/doctor/dashboard" replace />;

    case "ADMIN":
      return <Navigate to="/admin/users" replace />;

    default:
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div>
            <h2>MeroAsha Dashboard</h2>

            <p>
              Welcome, <strong>{user.name}</strong>
            </p>

            <p>
              Role: <strong>{user.role}</strong>
            </p>

            <p>
              No dashboard has been configured for this role yet.
            </p>
          </div>
        </div>
      );
  }
}

export default Dashboard;