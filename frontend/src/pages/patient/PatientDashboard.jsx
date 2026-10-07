import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import "./PatientDashboard.css";

const API_BASE_URL = "http://localhost:5001/api";

function PatientDashboard() {
  const { token, user } = useAuth();
  const { unreadCount } = useNotifications();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/patients/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load patient dashboard."
          );
        }

        setDashboard(data);
      } catch (error) {
        console.error("Patient dashboard error:", error);
        setError(
          error.message || "Unable to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  if (loading) {
    return (
      <div className="patient-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your healthcare dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-dashboard-error">
        <div className="error-icon">!</div>

        <h2>Unable to load dashboard</h2>

        <p>{error}</p>

        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  /*
   * The backend may return different dashboard fields
   * depending on the current implementation.
   *
   * We safely read them so the UI doesn't break when
   * some modules don't have data yet.
   */

  const patient =
    dashboard?.patient ||
    dashboard?.data?.patient ||
    null;

  const appointments =
    dashboard?.appointments ||
    dashboard?.data?.appointments ||
    [];

  const queue =
    dashboard?.queue ||
    dashboard?.data?.queue ||
    null;

  const medicalRecord =
    dashboard?.medicalRecord ||
    dashboard?.data?.medicalRecord ||
    null;

  const patientName =
    patient?.name ||
    patient?.fullName ||
    user?.name ||
    "Patient";

  const patientId =
    patient?.patientId ||
    "Profile pending";

  return (
    <div className="patient-dashboard">

      {/* =========================
          PAGE HEADER
      ========================== */}

      <section className="patient-welcome">

        <div>
          <span className="dashboard-eyebrow">
            PATIENT PORTAL
          </span>

          <h1>
            Good to see you, {patientName.split(" ")[0]}.
          </h1>

          <p>
            Manage your healthcare journey from one
            connected place.
          </p>
        </div>

        <div className="patient-id-card">

          <span>Patient ID</span>

          <strong>{patientId}</strong>

        </div>

      </section>


      {/* =========================
          PROFILE COMPLETION
      ========================== */}

      {!patient && (
        <section className="profile-completion-card">

          <div className="completion-icon">
            !
          </div>

          <div className="completion-content">

            <span className="completion-label">
              ACTION REQUIRED
            </span>

            <h3>Complete your patient profile</h3>

            <p>
              Add your personal and emergency information
              so MeroAsha can provide a complete healthcare
              experience.
            </p>

          </div>

          <Link
            to="/patient/profile"
            className="btn btn-primary"
          >
            Complete profile
          </Link>

        </section>
      )}


      {/* =========================
          QUICK STATS
      ========================== */}

      <section className="patient-stat-grid">

        <div className="patient-stat-card">

          <div className="patient-stat-top">
            <span>Appointments</span>

            <div className="stat-icon appointment-icon">
              A
            </div>
          </div>

          <strong>{appointments.length}</strong>

          <span className="stat-description">
            Upcoming or recent
          </span>

        </div>


        <div className="patient-stat-card">

          <div className="patient-stat-top">
            <span>Queue status</span>

            <div className="stat-icon queue-icon">
              Q
            </div>
          </div>

          <strong>
            {queue?.tokenNumber || queue?.token || "—"}
          </strong>

          <span className="stat-description">
            Current queue token
          </span>

        </div>


        <div className="patient-stat-card">

          <div className="patient-stat-top">
            <span>Medical record</span>

            <div className="stat-icon record-icon">
              M
            </div>
          </div>

          <strong>
            {medicalRecord ? "Active" : "Pending"}
          </strong>

          <span className="stat-description">
            Personal health record
          </span>

        </div>


        <div className="patient-stat-card">

          <div className="patient-stat-top">
            <span>Notifications</span>

            <div className="stat-icon notification-icon">
              N
            </div>
          </div>

          <strong>{unreadCount}</strong>

          <span className="stat-description">
            Unread updates
          </span>

        </div>

      </section>


      {/* =========================
          MAIN GRID
      ========================== */}

      <div className="patient-main-grid">

        {/* =========================
            UPCOMING APPOINTMENTS
        ========================== */}

        <section className="dashboard-card appointments-card">

          <div className="dashboard-card-header">

            <div>
              <span className="card-eyebrow">
                CARE SCHEDULE
              </span>

              <h2>Appointments</h2>
            </div>

            <Link
              to="/patient/appointments"
              className="card-link"
            >
              View all
            </Link>

          </div>


          {appointments.length === 0 ? (
            <div className="dashboard-empty">

              <div className="empty-icon">
                A
              </div>

              <h3>No appointments yet</h3>

              <p>
                Your upcoming appointments will appear here.
              </p>

              <Link
                to="/patient/appointments"
                className="btn btn-secondary"
              >
                Book appointment
              </Link>

            </div>
          ) : (
            <div className="appointment-list">

              {appointments
                .slice(0, 3)
                .map((appointment, index) => (
                  <div
                    className="appointment-row"
                    key={
                      appointment._id ||
                      appointment.appointmentId ||
                      index
                    }
                  >

                    <div className="appointment-date">

                      <strong>
                        {appointment.appointmentDate
                          ? new Date(
                              appointment.appointmentDate
                            ).getDate()
                          : "—"}
                      </strong>

                      <span>
                        {appointment.appointmentDate
                          ? new Date(
                              appointment.appointmentDate
                            ).toLocaleString("en", {
                              month: "short",
                            })
                          : ""}
                      </span>

                    </div>

                    <div className="appointment-info">

                      <strong>
                        {appointment.doctorName ||
                          appointment.doctor?.name ||
                          "Doctor appointment"}
                      </strong>

                      <span>
                        {appointment.timeSlot ||
                          "Time not specified"}
                      </span>

                    </div>

                    <span
                      className={`status-badge status-${String(
                        appointment.status || "BOOKED"
                      ).toLowerCase()}`}
                    >
                      {appointment.status || "BOOKED"}
                    </span>

                  </div>
                ))}

            </div>
          )}

        </section>


        {/* =========================
            QUEUE
        ========================== */}

        <section className="dashboard-card queue-dashboard-card">

          <div className="dashboard-card-header">

            <div>
              <span className="card-eyebrow">
                TODAY'S VISIT
              </span>

              <h2>Queue status</h2>
            </div>

            <Link
              to="/patient/queue"
              className="card-link"
            >
              Details
            </Link>

          </div>


          {queue ? (
            <div className="queue-status-content">

              <span className="queue-label">
                YOUR TOKEN
              </span>

              <strong className="queue-token">
                {queue.tokenNumber || queue.token || "—"}
              </strong>

              <span className="queue-status">
                {queue.status || "WAITING"}
              </span>

              <div className="queue-progress">

                <div className="queue-progress-bar">
                  <span></span>
                </div>

                <div className="queue-progress-info">
                  <span>Waiting</span>
                  <span>In consultation</span>
                </div>

              </div>

            </div>
          ) : (
            <div className="queue-empty">

              <div className="empty-icon">
                Q
              </div>

              <h3>No active queue</h3>

              <p>
                You don't currently have a queue token.
              </p>

            </div>
          )}

        </section>


        {/* =========================
            HEALTHCARE SERVICES
        ========================== */}

        <section className="dashboard-card services-dashboard-card">

          <div className="dashboard-card-header">

            <div>
              <span className="card-eyebrow">
                HEALTHCARE SERVICES
              </span>

              <h2>Your care</h2>
            </div>

          </div>


          <div className="patient-service-grid">

            <Link
              to="/patient/medical-record"
              className="patient-service-item"
            >
              <span className="service-item-icon">
                MR
              </span>

              <span>
                <strong>Medical records</strong>
                <small>Health history and information</small>
              </span>

              <span className="service-arrow">→</span>
            </Link>


            <Link
              to="/patient/lab-reports"
              className="patient-service-item"
            >
              <span className="service-item-icon">
                LB
              </span>

              <span>
                <strong>Laboratory</strong>
                <small>Reports and test results</small>
              </span>

              <span className="service-arrow">→</span>
            </Link>


            <Link
              to="/patient/prescriptions"
              className="patient-service-item"
            >
              <span className="service-item-icon">
                RX
              </span>

              <span>
                <strong>Prescriptions</strong>
                <small>Medicines and prescriptions</small>
              </span>

              <span className="service-arrow">→</span>
            </Link>


            <Link
              to="/patient/blood"
              className="patient-service-item"
            >
              <span className="service-item-icon">
                BB
              </span>

              <span>
                <strong>Blood bank</strong>
                <small>Blood requests and availability</small>
              </span>

              <span className="service-arrow">→</span>
            </Link>


            <Link
              to="/patient/emergency"
              className="patient-service-item"
            >
              <span className="service-item-icon emergency-service">
                EM
              </span>

              <span>
                <strong>Emergency</strong>
                <small>Ambulance and emergency care</small>
              </span>

              <span className="service-arrow">→</span>
            </Link>


            <Link
              to="/patient/pregnancy"
              className="patient-service-item"
            >
              <span className="service-item-icon">
                PC
              </span>

              <span>
                <strong>Pregnancy care</strong>
                <small>Antenatal care and visits</small>
              </span>

              <span className="service-arrow">→</span>
            </Link>

          </div>

        </section>


        {/* =========================
            MEDICAL RECORD SUMMARY
        ========================== */}

        <section className="dashboard-card record-summary-card">

          <div className="dashboard-card-header">

            <div>
              <span className="card-eyebrow">
                HEALTH PROFILE
              </span>

              <h2>Medical information</h2>
            </div>

            <Link
              to="/patient/medical-record"
              className="card-link"
            >
              Open record
            </Link>

          </div>


          {medicalRecord ? (
            <div className="record-summary-grid">

              <div>
                <span>Blood group</span>
                <strong>
                  {medicalRecord.bloodGroup || "Not recorded"}
                </strong>
              </div>

              <div>
                <span>Allergies</span>
                <strong>
                  {medicalRecord.allergies?.length
                    ? medicalRecord.allergies.join(", ")
                    : "None recorded"}
                </strong>
              </div>

              <div>
                <span>Chronic conditions</span>
                <strong>
                  {medicalRecord.chronicConditions?.length
                    ? medicalRecord.chronicConditions.join(
                        ", "
                      )
                    : "None recorded"}
                </strong>
              </div>

              <div>
                <span>Current medications</span>
                <strong>
                  {medicalRecord.currentMedications?.length
                    ? medicalRecord.currentMedications.join(
                        ", "
                      )
                    : "None recorded"}
                </strong>
              </div>

            </div>
          ) : (
            <div className="record-not-created">

              <p>
                Your medical record has not been created yet.
              </p>

              <Link
                to="/patient/medical-record"
                className="card-link"
              >
                View medical record
              </Link>

            </div>
          )}

        </section>

      </div>

    </div>
  );
}

export default PatientDashboard;