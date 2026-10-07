import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

function ProtectedLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const role = user?.role;

  const patientLinks = [
    {
      label: "Dashboard",
      path: "/patient/dashboard",
      icon: "▦",
    },
    {
      label: "Appointments",
      path: "/patient/appointments",
      icon: "▣",
    },
    {
      label: "Queue",
      path: "/patient/queue",
      icon: "≡",
    },
    {
      label: "Medical Records",
      path: "/patient/medical-record",
      icon: "▤",
    },
    {
      label: "Laboratory",
      path: "/patient/lab-reports",
      icon: "⌁",
    },
    {
      label: "Prescriptions",
      path: "/patient/prescriptions",
      icon: "□",
    },
    {
      label: "Blood Bank",
      path: "/patient/blood",
      icon: "◇",
    },
    {
      label: "Emergency",
      path: "/patient/emergency",
      icon: "!",
    },
    {
      label: "Pregnancy Care",
      path: "/patient/pregnancy",
      icon: "♡",
    },
  ];

  const doctorLinks = [
    {
      label: "Dashboard",
      path: "/doctor/dashboard",
      icon: "▦",
    },
    {
      label: "Appointments",
      path: "/doctor/appointments",
      icon: "▣",
    },
    {
      label: "Patient Queue",
      path: "/doctor/queue",
      icon: "≡",
    },
    {
      label: "Consultations",
      path: "/doctor/consultations",
      icon: "▤",
    },
    {
      label: "Patient Records",
      path: "/doctor/patients",
      icon: "♙",
    },
    {
      label: "Prescriptions",
      path: "/doctor/prescriptions",
      icon: "□",
    },
  ];

  const adminLinks = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "▦",
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: "♙",
    },
    {
      label: "Doctors",
      path: "/admin/doctors",
      icon: "♙",
    },
    {
      label: "Departments",
      path: "/admin/departments",
      icon: "▤",
    },
    {
      label: "Reports",
      path: "/admin/reports",
      icon: "▥",
    },
    {
      label: "Audit Logs",
      path: "/admin/audit-logs",
      icon: "≡",
    },
  ];

  let navigation = [];

  if (role === "PATIENT") {
    navigation = patientLinks;
  } else if (role === "DOCTOR") {
    navigation = doctorLinks;
  } else if (role === "ADMIN") {
    navigation = adminLinks;
  }

  return (
    <div className="app-shell">

      {/* Sidebar */}
      <aside className="app-sidebar">

        <div className="sidebar-brand">
          <div className="brand-mark">
            M
          </div>

          <div>
            <div className="brand-name">
              MeroAsha
            </div>

            <div className="brand-subtitle">
              Healthcare System
            </div>
          </div>
        </div>


        <div className="sidebar-section-title">
          MAIN MENU
        </div>

        <nav className="sidebar-navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="sidebar-icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>


        <div className="sidebar-bottom">

          <NavLink
            to="/notifications"
            className="sidebar-link"
          >
            <span className="sidebar-icon">
              ♢
            </span>

            <span>
              Notifications
            </span>

            {unreadCount > 0 && (
              <span className="notification-count">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </NavLink>

          <button
            className="sidebar-logout"
            onClick={logout}
          >
            <span className="sidebar-icon">
              ↪
            </span>

            Logout
          </button>

        </div>

      </aside>


      {/* Main Application */}
      <div className="app-main">

        {/* Header */}
        <header className="app-header">

          <div className="header-left">
            <div className="header-title">
              MeroAsha
            </div>

            <div className="header-divider">
              /
            </div>

            <div className="header-section">
              {role === "PATIENT"
                ? "Patient Portal"
                : role === "DOCTOR"
                ? "Doctor Portal"
                : role === "ADMIN"
                ? "Administration"
                : "Hospital Portal"}
            </div>
          </div>


          <div className="header-right">

            <NavLink
              to="/notifications"
              className="header-notification"
              title="Notifications"
            >
              ♢

              {unreadCount > 0 && (
                <span className="header-notification-badge">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </NavLink>


            <div className="header-user">

              <div className="header-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="header-user-info">

                <div className="header-user-name">
                  {user?.name || "User"}
                </div>

                <div className="header-user-role">
                  {role || "USER"}
                </div>

              </div>

            </div>

          </div>

        </header>


        {/* Page Content */}
        <main className="app-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default ProtectedLayout;