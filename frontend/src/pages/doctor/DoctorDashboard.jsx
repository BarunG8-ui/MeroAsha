import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./DoctorDashboard.css";

const API_BASE_URL = "http://localhost:5001/api";

const emptyForm = {
  symptoms: "",
  diagnosis: "",
  clinicalNotes: "",
  treatmentPlan: "",
  bloodPressure: "",
  temperature: "",
  heartRate: "",
  respiratoryRate: "",
  oxygenSaturation: "",
  weight: "",
  height: "",
};

function DoctorDashboard() {
  const { user, logout } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [consultation, setConsultation] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [consultationLoading, setConsultationLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token =
    localStorage.getItem("meroasha_token") ||
    localStorage.getItem("token");

  // ============================================================
  // FETCH DOCTOR APPOINTMENTS
  // ============================================================

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/appointments/doctor/my`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load doctor appointments"
        );
      }

      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("Appointment loading error:", err);
      setError(err.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchAppointments();
  }, []);

  // ============================================================
  // PATIENT NAME
  // ============================================================

  const getPatientName = (appointment) => {
    return (
      appointment?.patientId?.userId?.name ||
      appointment?.patientId?.name ||
      "Patient"
    );
  };

  // ============================================================
  // PATIENT ID
  // ============================================================

  const getPatientId = (appointment) => {
    return appointment?.patientId?.patientId || "N/A";
  };

  // ============================================================
  // DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // STATUS CLASS
  // ============================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "BOOKED":
        return "status-booked";

      case "CONFIRMED":
        return "status-confirmed";

      case "CHECKED_IN":
        return "status-checked-in";

      case "IN_CONSULTATION":
        return "status-consultation";

      case "COMPLETED":
        return "status-completed";

      case "CANCELLED":
        return "status-cancelled";

      case "NO_SHOW":
        return "status-no-show";

      default:
        return "";
    }
  };

  // ============================================================
  // STATS
  // ============================================================

  const stats = useMemo(() => {
    return {
      total: appointments.length,

      booked: appointments.filter(
        (item) =>
          item.status === "BOOKED" ||
          item.status === "CONFIRMED"
      ).length,

      checkedIn: appointments.filter(
        (item) => item.status === "CHECKED_IN"
      ).length,

      consultation: appointments.filter(
        (item) => item.status === "IN_CONSULTATION"
      ).length,

      completed: appointments.filter(
        (item) => item.status === "COMPLETED"
      ).length,
    };
  }, [appointments]);

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // LOAD EXISTING CONSULTATION
  // ============================================================

  const loadConsultation = async (appointmentId) => {
    try {
      setConsultationLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/consultations/by-appointment/${appointmentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 404) {
        setConsultation(null);
        setForm(emptyForm);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load consultation"
        );
      }

      const consultationData =
        data.consultation || data.data;

      setConsultation(consultationData);

      setForm({
        symptoms: consultationData?.symptoms || "",
        diagnosis: consultationData?.diagnosis || "",
        clinicalNotes:
          consultationData?.clinicalNotes || "",
        treatmentPlan:
          consultationData?.treatmentPlan || "",

        bloodPressure:
          consultationData?.vitals?.bloodPressure || "",

        temperature:
          consultationData?.vitals?.temperature || "",

        heartRate:
          consultationData?.vitals?.heartRate || "",

        respiratoryRate:
          consultationData?.vitals?.respiratoryRate || "",

        oxygenSaturation:
          consultationData?.vitals?.oxygenSaturation || "",

        weight:
          consultationData?.vitals?.weight || "",

        height:
          consultationData?.vitals?.height || "",
      });
    } catch (err) {
      console.error("Consultation loading error:", err);
      setError(
        err.message || "Failed to load consultation."
      );
    } finally {
      setConsultationLoading(false);
    }
  };

  // ============================================================
  // START CONSULTATION
  // ============================================================

  const startConsultation = async (appointment) => {
    try {
      setSelectedAppointment(appointment);
      setConsultation(null);
      setForm(emptyForm);

      setError("");
      setSuccess("");
      setConsultationLoading(true);

      // First check if consultation already exists
      const checkResponse = await fetch(
        `${API_BASE_URL}/consultations/by-appointment/${appointment._id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Existing consultation
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();

        const existing =
          checkData.consultation || checkData.data;

        setConsultation(existing);

        setForm({
          symptoms: existing?.symptoms || "",
          diagnosis: existing?.diagnosis || "",
          clinicalNotes:
            existing?.clinicalNotes || "",
          treatmentPlan:
            existing?.treatmentPlan || "",

          bloodPressure:
            existing?.vitals?.bloodPressure || "",

          temperature:
            existing?.vitals?.temperature || "",

          heartRate:
            existing?.vitals?.heartRate || "",

          respiratoryRate:
            existing?.vitals?.respiratoryRate || "",

          oxygenSaturation:
            existing?.vitals?.oxygenSaturation || "",

          weight:
            existing?.vitals?.weight || "",

          height:
            existing?.vitals?.height || "",
        });

        setSuccess("Existing consultation loaded.");
        return;
      }

      // No consultation exists.
      // Create a new consultation.
      if (checkResponse.status === 404) {
        const createResponse = await fetch(
          `${API_BASE_URL}/consultations`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              appointmentId: appointment._id,
            }),
          }
        );

        const createData = await createResponse.json();

        if (!createResponse.ok) {
          throw new Error(
            createData.message ||
              "Failed to start consultation"
          );
        }

        const created =
          createData.consultation ||
          createData.data;

        setConsultation(created);
        setForm(emptyForm);

        setSuccess(
          "Consultation started successfully."
        );

        await fetchAppointments();

        return;
      }

      const errorData = await checkResponse.json();

      throw new Error(
        errorData.message ||
          "Unable to open consultation."
      );
    } catch (err) {
      console.error("Start consultation error:", err);
      setError(
        err.message ||
          "Failed to start consultation."
      );
    } finally {
      setConsultationLoading(false);
    }
  };

  // ============================================================
  // SAVE / UPDATE CONSULTATION
  // ============================================================

  const saveConsultation = async () => {
    if (!selectedAppointment) {
      setError("Please select an appointment first.");
      return;
    }

    if (!consultation?._id) {
      setError(
        "Consultation has not been started yet."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/consultations/${consultation._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symptoms: form.symptoms,
            diagnosis: form.diagnosis,
            clinicalNotes: form.clinicalNotes,
            treatmentPlan: form.treatmentPlan,

            vitals: {
              bloodPressure: form.bloodPressure,
              temperature: form.temperature,
              heartRate: form.heartRate,
              respiratoryRate:
                form.respiratoryRate,
              oxygenSaturation:
                form.oxygenSaturation,
              weight: form.weight,
              height: form.height,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update consultation"
        );
      }

      const updated =
        data.consultation || data.data;

      if (updated) {
        setConsultation(updated);
      }

      setSuccess(
        "Consultation updated successfully."
      );

      await fetchAppointments();
    } catch (err) {
      console.error("Save consultation error:", err);
      setError(
        err.message ||
          "Failed to save consultation."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // COMPLETE CONSULTATION
  // ============================================================

  const completeConsultation = async () => {
    if (!consultation?._id) {
      setError(
        "Consultation has not been started."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to complete this consultation?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCompleting(true);
      setError("");
      setSuccess("");

      // Save latest data first
      const updateResponse = await fetch(
        `${API_BASE_URL}/consultations/${consultation._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symptoms: form.symptoms,
            diagnosis: form.diagnosis,
            clinicalNotes: form.clinicalNotes,
            treatmentPlan: form.treatmentPlan,

            vitals: {
              bloodPressure: form.bloodPressure,
              temperature: form.temperature,
              heartRate: form.heartRate,
              respiratoryRate:
                form.respiratoryRate,
              oxygenSaturation:
                form.oxygenSaturation,
              weight: form.weight,
              height: form.height,
            },
          }),
        }
      );

      const updateData =
        await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(
          updateData.message ||
            "Failed to save consultation"
        );
      }

      // Complete consultation
      const response = await fetch(
        `${API_BASE_URL}/consultations/${consultation._id}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to complete consultation"
        );
      }

      const completed =
        data.consultation || data.data;

      if (completed) {
        setConsultation(completed);
      }

      setSuccess(
        "Consultation completed successfully."
      );

      await fetchAppointments();
    } catch (err) {
      console.error(
        "Complete consultation error:",
        err
      );

      setError(
        err.message ||
          "Failed to complete consultation."
      );
    } finally {
      setCompleting(false);
    }
  };

  // ============================================================
  // CLOSE WORKSPACE
  // ============================================================

  const closeWorkspace = () => {
    setSelectedAppointment(null);
    setConsultation(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    if (typeof logout === "function") {
      logout();
    } else {
      localStorage.removeItem("meroasha_token");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="doctor-dashboard">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="doctor-header">

        <div className="doctor-brand">
          <div className="brand-icon">
            M
          </div>

          <div>
            <h1>MeroAsha</h1>
            <span>Doctor Portal</span>
          </div>
        </div>

        <div className="doctor-user">

          <div className="doctor-user-info">
            <strong>
              {user?.name || "Doctor"}
            </strong>

            <span>
              {user?.email || ""}
            </span>
          </div>

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="doctor-main">

        {/* PAGE HEADER */}

        <div className="doctor-page-header">

          <div>
            <h2>Doctor Dashboard</h2>

            <p>
              Manage your appointments and patient
              consultations.
            </p>
          </div>

          <button
            type="button"
            className="refresh-btn"
            onClick={fetchAppointments}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

        </div>


        {/* ====================================================
            ALERTS
        ==================================================== */}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}


        {/* ====================================================
            STATS
        ==================================================== */}

        <div className="doctor-stats">

          <div className="stat-card">
            <span>Total Appointments</span>
            <strong>{stats.total}</strong>
          </div>

          <div className="stat-card">
            <span>Upcoming</span>
            <strong>{stats.booked}</strong>
          </div>

          <div className="stat-card">
            <span>Checked In</span>
            <strong>{stats.checkedIn}</strong>
          </div>

          <div className="stat-card">
            <span>In Consultation</span>
            <strong>{stats.consultation}</strong>
          </div>

          <div className="stat-card">
            <span>Completed</span>
            <strong>{stats.completed}</strong>
          </div>

        </div>


        {/* ====================================================
            CONSULTATION WORKSPACE
        ==================================================== */}

        {selectedAppointment && (

          <section className="consultation-workspace">

            <div className="workspace-header">

              <div>
                <h2>
                  Consultation Workspace
                </h2>

                <p>
                  {getPatientName(
                    selectedAppointment
                  )}{" "}
                  •{" "}
                  {getPatientId(
                    selectedAppointment
                  )}
                </p>
              </div>

              <button
                type="button"
                className="close-workspace-btn"
                onClick={closeWorkspace}
              >
                Close
              </button>

            </div>


            {/* PATIENT INFORMATION */}

            <div className="patient-summary">

              <div>
                <span>Patient</span>

                <strong>
                  {getPatientName(
                    selectedAppointment
                  )}
                </strong>
              </div>

              <div>
                <span>Patient ID</span>

                <strong>
                  {getPatientId(
                    selectedAppointment
                  )}
                </strong>
              </div>

              <div>
                <span>Appointment</span>

                <strong>
                  {selectedAppointment.appointmentId ||
                    selectedAppointment._id}
                </strong>
              </div>

              <div>
                <span>Date</span>

                <strong>
                  {formatDate(
                    selectedAppointment.appointmentDate
                  )}
                </strong>
              </div>

              <div>
                <span>Time</span>

                <strong>
                  {selectedAppointment.timeSlot ||
                    "N/A"}
                </strong>
              </div>

            </div>


            {consultationLoading ? (

              <div className="workspace-loading">
                Loading consultation...
              </div>

            ) : (

              <>

                {/* ==================================================
                    VITALS
                ================================================== */}

                <div className="workspace-section">

                  <div className="workspace-section-title">
                    <h3>Patient Vitals</h3>
                  </div>

                  <div className="form-grid">

                    <div className="form-group">
                      <label>
                        Blood Pressure
                      </label>

                      <input
                        type="text"
                        name="bloodPressure"
                        value={form.bloodPressure}
                        onChange={handleChange}
                        placeholder="120/80 mmHg"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Temperature
                      </label>

                      <input
                        type="text"
                        name="temperature"
                        value={form.temperature}
                        onChange={handleChange}
                        placeholder="98.6 °F"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Heart Rate
                      </label>

                      <input
                        type="text"
                        name="heartRate"
                        value={form.heartRate}
                        onChange={handleChange}
                        placeholder="72 bpm"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Respiratory Rate
                      </label>

                      <input
                        type="text"
                        name="respiratoryRate"
                        value={form.respiratoryRate}
                        onChange={handleChange}
                        placeholder="16/min"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Oxygen Saturation
                      </label>

                      <input
                        type="text"
                        name="oxygenSaturation"
                        value={
                          form.oxygenSaturation
                        }
                        onChange={handleChange}
                        placeholder="98%"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Weight
                      </label>

                      <input
                        type="text"
                        name="weight"
                        value={form.weight}
                        onChange={handleChange}
                        placeholder="65 kg"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Height
                      </label>

                      <input
                        type="text"
                        name="height"
                        value={form.height}
                        onChange={handleChange}
                        placeholder="170 cm"
                      />
                    </div>

                  </div>

                </div>


                {/* ==================================================
                    CLINICAL INFORMATION
                ================================================== */}

                <div className="workspace-section">

                  <div className="workspace-section-title">
                    <h3>
                      Clinical Assessment
                    </h3>
                  </div>


                  <div className="form-group">

                    <label>
                      Symptoms
                    </label>

                    <textarea
                      name="symptoms"
                      value={form.symptoms}
                      onChange={handleChange}
                      placeholder="Describe patient's symptoms..."
                      rows="4"
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Diagnosis
                    </label>

                    <textarea
                      name="diagnosis"
                      value={form.diagnosis}
                      onChange={handleChange}
                      placeholder="Enter diagnosis..."
                      rows="4"
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Clinical Notes
                    </label>

                    <textarea
                      name="clinicalNotes"
                      value={form.clinicalNotes}
                      onChange={handleChange}
                      placeholder="Enter clinical observations and notes..."
                      rows="5"
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Treatment Plan
                    </label>

                    <textarea
                      name="treatmentPlan"
                      value={form.treatmentPlan}
                      onChange={handleChange}
                      placeholder="Enter treatment plan..."
                      rows="5"
                    />

                  </div>

                </div>


                {/* ==================================================
                    ACTIONS
                ================================================== */}

                <div className="workspace-actions">

                  <button
                    type="button"
                    className="save-consultation-btn"
                    onClick={saveConsultation}
                    disabled={
                      saving ||
                      completing ||
                      !consultation?._id ||
                      consultation?.status ===
                        "COMPLETED"
                    }
                  >
                    {saving
                      ? "Saving..."
                      : "Save Progress"}
                  </button>


                  <button
                    type="button"
                    className="complete-consultation-btn"
                    onClick={
                      completeConsultation
                    }
                    disabled={
                      saving ||
                      completing ||
                      !consultation?._id ||
                      consultation?.status ===
                        "COMPLETED"
                    }
                  >
                    {completing
                      ? "Completing..."
                      : consultation?.status ===
                        "COMPLETED"
                      ? "Completed"
                      : "Complete Consultation"}
                  </button>

                </div>


                {consultation?.status ===
                  "COMPLETED" && (

                  <div className="completed-banner">
                    This consultation has been
                    completed and can no longer be
                    edited.
                  </div>

                )}

              </>

            )}

          </section>

        )}


        {/* ====================================================
            APPOINTMENTS
        ==================================================== */}

        <section className="appointments-section">

          <div className="section-header">

            <div>
              <h2>My Appointments</h2>

              <p>
                Appointments assigned to you.
              </p>
            </div>

            <span className="appointment-count">
              {appointments.length} appointment
              {appointments.length !== 1
                ? "s"
                : ""}
            </span>

          </div>


          {/* LOADING */}

          {loading ? (

            <div className="loading-box">
              <div className="loader"></div>

              <p>
                Loading appointments...
              </p>
            </div>

          ) : appointments.length === 0 ? (

            <div className="empty-box">

              <div className="empty-icon">
                📅
              </div>

              <h3>
                No appointments found
              </h3>

              <p>
                You currently have no appointments
                assigned to you.
              </p>

            </div>

          ) : (

            <div className="appointment-list">

              {appointments.map(
                (appointment) => {

                  const isCompleted =
                    appointment.status ===
                    "COMPLETED";

                  const isCancelled =
                    appointment.status ===
                    "CANCELLED";

                  const isNoShow =
                    appointment.status ===
                    "NO_SHOW";

                  const isSelected =
                    selectedAppointment?._id ===
                    appointment._id;

                  return (

                    <article
                      className={`appointment-card ${
                        isSelected
                          ? "appointment-selected"
                          : ""
                      }`}
                      key={appointment._id}
                    >

                      {/* TIME */}

                      <div className="appointment-time">

                        <span className="time-label">
                          Time
                        </span>

                        <strong>
                          {appointment.timeSlot ||
                            "N/A"}
                        </strong>

                        <small>
                          {formatDate(
                            appointment.appointmentDate
                          )}
                        </small>

                      </div>


                      {/* PATIENT */}

                      <div className="appointment-patient">

                        <div className="patient-avatar">
                          {getPatientName(
                            appointment
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <h3>
                            {getPatientName(
                              appointment
                            )}
                          </h3>

                          <p>
                            Patient ID:{" "}
                            {getPatientId(
                              appointment
                            )}
                          </p>

                        </div>

                      </div>


                      {/* DETAILS */}

                      <div className="appointment-details">

                        <p>
                          <strong>
                            Department:
                          </strong>{" "}
                          {appointment
                            .departmentId
                            ?.name || "N/A"}
                        </p>

                        <p>
                          <strong>
                            Reason:
                          </strong>{" "}
                          {appointment.reason ||
                            "General consultation"}
                        </p>

                        <p>
                          <strong>
                            Appointment ID:
                          </strong>{" "}
                          {appointment.appointmentId ||
                            appointment._id}
                        </p>

                      </div>


                      {/* STATUS */}

                      <div className="appointment-status">

                        <span
                          className={`status-badge ${getStatusClass(
                            appointment.status
                          )}`}
                        >
                          {(
                            appointment.status ||
                            "BOOKED"
                          )
                            .replaceAll(
                              "_",
                              " "
                            )}
                        </span>

                      </div>


                      {/* ACTION */}

                      <div className="appointment-action">

                        {isCompleted ? (

                          <button
                            type="button"
                            className="view-btn"
                            onClick={() =>
                              startConsultation(
                                appointment
                              )
                            }
                          >
                            View Consultation
                          </button>

                        ) : isCancelled ||
                          isNoShow ? (

                          <button
                            type="button"
                            className="disabled-btn"
                            disabled
                          >
                            {isCancelled
                              ? "Cancelled"
                              : "No Show"}
                          </button>

                        ) : (

                          <button
                            type="button"
                            className="consultation-btn"
                            onClick={() =>
                              startConsultation(
                                appointment
                              )
                            }
                          >
                            {appointment.status ===
                              "IN_CONSULTATION"
                              ? "Resume Consultation"
                              : "Start Consultation"}
                          </button>

                        )}

                      </div>

                    </article>

                  );
                }
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default DoctorDashboard;