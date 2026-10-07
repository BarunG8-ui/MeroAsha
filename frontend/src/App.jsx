import { BrowserRouter, Routes, Route } from "react-router-dom";

// ============================================================
// LAYOUTS
// ============================================================

import PublicLayout from "./layouts/PublicLayout";
import ProtectedLayout from "./layouts/ProtectedLayout";

// ============================================================
// AUTHENTICATION
// ============================================================

import ProtectedRoute from "./components/ProtectedRoute";

// ============================================================
// PUBLIC PAGES
// ============================================================

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// ============================================================
// GENERAL PROTECTED PAGE
// ============================================================

import Dashboard from "./pages/Dashboard";

// ============================================================
// PATIENT PAGES
// ============================================================

import PatientDashboard from "./pages/patient/PatientDashboard";
import Appointments from "./pages/patient/Appointments";
import Queue from "./pages/patient/Queue";
import PatientProfile from "./pages/patient/PatientProfile";
import MedicalRecord from "./pages/patient/MedicalRecord";

// ============================================================
// LABORATORY PAGES
// ============================================================

import LabReports from "./pages/lab/LabReports";

// ============================================================
// DOCTOR PAGES
// ============================================================

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import Consultation from "./pages/doctor/Consultation";

// ============================================================
// ADMIN PAGES
// ============================================================

import UserManagement from "./pages/admin/UserManagement";

// ============================================================
// STAFF MEDICAL RECORD MANAGEMENT
// ============================================================
//
// Doctor + Admin can:
// - View patient medical records
// - Edit patient medical records
//
// Patient page remains separate and VIEW ONLY.
//

import MedicalRecordManagement from "./pages/staff/MedicalRecordManagement";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ====================================================
            PUBLIC ROUTES
        ==================================================== */}

        <Route element={<PublicLayout />}>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

        </Route>


        {/* ====================================================
            GENERAL PROTECTED ROUTES
        ==================================================== */}

        <Route element={<ProtectedRoute />}>

          <Route element={<ProtectedLayout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

          </Route>

        </Route>


        {/* ====================================================
            PATIENT ROUTES
        ==================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["PATIENT"]}
            />
          }
        >

          <Route element={<ProtectedLayout />}>

            {/* -----------------------------------------------
                Patient Dashboard
            ----------------------------------------------- */}

            <Route
              path="/patient/dashboard"
              element={<PatientDashboard />}
            />


            {/* -----------------------------------------------
                Appointments
            ----------------------------------------------- */}

            <Route
              path="/patient/appointments"
              element={<Appointments />}
            />


            {/* -----------------------------------------------
                Live Queue
            ----------------------------------------------- */}

            <Route
              path="/patient/queue"
              element={<Queue />}
            />


            {/* -----------------------------------------------
                Patient Profile
            ----------------------------------------------- */}

            <Route
              path="/patient/profile"
              element={<PatientProfile />}
            />


            {/* -----------------------------------------------
                Medical Record

                PATIENT:
                VIEW ONLY

                No editing route is available here.
            ----------------------------------------------- */}

            <Route
              path="/patient/medical-record"
              element={<MedicalRecord />}
            />


            {/* -----------------------------------------------
                Laboratory Reports
            ----------------------------------------------- */}

            <Route
              path="/patient/lab-reports"
              element={<LabReports />}
            />

          </Route>

        </Route>


        {/* ====================================================
            DOCTOR ROUTES
        ==================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["DOCTOR"]}
            />
          }
        >

          <Route element={<ProtectedLayout />}>

            {/* -----------------------------------------------
                Doctor Dashboard
            ----------------------------------------------- */}

            <Route
              path="/doctor/dashboard"
              element={<DoctorDashboard />}
            />


            {/* -----------------------------------------------
                Doctor Consultation
            ----------------------------------------------- */}

            <Route
              path="/doctor/consultation/:appointmentId"
              element={<Consultation />}
            />


            {/* -----------------------------------------------
                Doctor Medical Record Management
            -----------------------------------------------

                Doctor can:
                - Select patient
                - View medical record
                - Edit medical record
                - Save medical record

                Example:
                /doctor/patient/ PATIENT_ID /medical-record
            ----------------------------------------------- */}

            <Route
              path="/doctor/patient/:patientId/medical-record"
              element={<MedicalRecordManagement />}
            />

          </Route>

        </Route>


        {/* ====================================================
            ADMIN ROUTES
        ==================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN"]}
            />
          }
        >

          <Route element={<ProtectedLayout />}>

            {/* -----------------------------------------------
                User Management
            ----------------------------------------------- */}

            <Route
              path="/admin/users"
              element={<UserManagement />}
            />


            {/* -----------------------------------------------
                Admin Medical Record Management
            -----------------------------------------------

                Admin can:
                - Select patient
                - View medical record
                - Edit medical record
                - Save medical record

                Example:
                /admin/patient/PATIENT_ID/medical-record
            ----------------------------------------------- */}

            <Route
              path="/admin/patient/:patientId/medical-record"
              element={<MedicalRecordManagement />}
            />

          </Route>

        </Route>


        {/* ====================================================
            404 PAGE
        ==================================================== */}

        <Route
          path="*"
          element={

            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: "#f5f7fb",
                color: "#172033",
              }}
            >

              <h1
                style={{
                  margin: 0,
                  fontSize: "64px",
                  fontWeight: 800,
                }}
              >
                404
              </h1>

              <p
                style={{
                  marginTop: "10px",
                  color: "#64748b",
                }}
              >
                Page not found.
              </p>

            </div>

          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;