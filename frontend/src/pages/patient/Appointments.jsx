import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Appointments.css";

const API_BASE_URL = "http://localhost:5001/api";

function Appointments() {
  const { token, user } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [bookingSuccess, setBookingSuccess] = useState(null);

  const [form, setForm] = useState({
    departmentId: "",
    doctorId: "",
    appointmentDate: "",
    timeSlot: "",
    reason: "",
    notes: "",
  });

  // ==========================================================
  // AUTH HEADERS
  // ==========================================================

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  // ==========================================================
  // FETCH DEPARTMENTS
  // ==========================================================

  const fetchDepartments = async () => {
    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/departments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load departments"
        );
      }

      setDepartments(data.departments || []);
    } catch (err) {
      console.error("Department error:", err);
      setError(err.message);
    }
  };

  // ==========================================================
  // FETCH APPOINTMENTS
  // ==========================================================

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/appointments/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load appointments"
        );
      }

      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("Appointment fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // FETCH DOCTORS BY DEPARTMENT
  // ==========================================================

  const fetchDoctors = async (departmentId) => {
    if (!departmentId) {
      setDoctors([]);
      return;
    }

    try {
      setLoadingDoctors(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/doctors/department/${departmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load doctors"
        );
      }

      setDoctors(data.doctors || []);
    } catch (err) {
      console.error("Doctor fetch error:", err);
      setDoctors([]);
      setError(err.message);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // ==========================================================
  // FETCH AVAILABLE TIME SLOTS
  // ==========================================================

  const fetchAvailableSlots = async (
    doctorId,
    appointmentDate
  ) => {
    if (!doctorId || !appointmentDate) {
      setAvailableSlots([]);
      return;
    }

    try {
      setLoadingSlots(true);
      setError("");

      const params = new URLSearchParams({
        doctorId,
        date: appointmentDate,
      });

      const response = await fetch(
        `${API_BASE_URL}/appointments/availability?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load available slots"
        );
      }

      setAvailableSlots(data.slots || []);

      // Clear selected slot when date/doctor changes
      setForm((previous) => ({
        ...previous,
        timeSlot: "",
      }));
    } catch (err) {
      console.error("Slot fetch error:", err);
      setAvailableSlots([]);
      setError(err.message);
    } finally {
      setLoadingSlots(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    if (!token) return;

    fetchDepartments();
    fetchAppointments();
  }, [token]);

  // ==========================================================
  // HANDLE FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setError("");
    setSuccessMessage("");

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // --------------------------------------------------------
    // Department changed
    // --------------------------------------------------------

    if (name === "departmentId") {
      setForm((previous) => ({
        ...previous,
        departmentId: value,
        doctorId: "",
        appointmentDate: "",
        timeSlot: "",
      }));

      setDoctors([]);
      setAvailableSlots([]);

      if (value) {
        fetchDoctors(value);
      }

      return;
    }

    // --------------------------------------------------------
    // Doctor changed
    // --------------------------------------------------------

    if (name === "doctorId") {
      setAvailableSlots([]);

      setForm((previous) => ({
        ...previous,
        doctorId: value,
        timeSlot: "",
      }));

      if (value && form.appointmentDate) {
        fetchAvailableSlots(
          value,
          form.appointmentDate
        );
      }

      return;
    }

    // --------------------------------------------------------
    // Date changed
    // --------------------------------------------------------

    if (name === "appointmentDate") {
      setAvailableSlots([]);

      setForm((previous) => ({
        ...previous,
        appointmentDate: value,
        timeSlot: "",
      }));

      if (form.doctorId && value) {
        fetchAvailableSlots(
          form.doctorId,
          value
        );
      }

      return;
    }
  };

  // ==========================================================
  // BOOK APPOINTMENT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setBookingSuccess(null);

    // --------------------------------------------------------
    // Frontend validation
    // --------------------------------------------------------

    if (
      !form.departmentId ||
      !form.doctorId ||
      !form.appointmentDate ||
      !form.timeSlot
    ) {
      setError(
        "Please select department, doctor, date and time."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/appointments`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            doctorId: form.doctorId,
            departmentId: form.departmentId,
            appointmentDate: form.appointmentDate,
            timeSlot: form.timeSlot,
            reason: form.reason,
            notes: form.notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to book appointment"
        );
      }

      // --------------------------------------------------------
      // Save booking success information
      // --------------------------------------------------------

      setBookingSuccess({
        token: data.appointmentToken,
        emailSent: data.emailSent,
        appointment: data.appointment,
      });

      setSuccessMessage(data.message);

      // --------------------------------------------------------
      // Reset form
      // --------------------------------------------------------

      setForm({
        departmentId: "",
        doctorId: "",
        appointmentDate: "",
        timeSlot: "",
        reason: "",
        notes: "",
      });

      setDoctors([]);
      setAvailableSlots([]);

      // --------------------------------------------------------
      // Refresh appointments
      // --------------------------------------------------------

      await fetchAppointments();
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // CANCEL APPOINTMENT
  // ==========================================================

  const cancelAppointment = async (appointmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/appointments/${appointmentId}/cancel`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            cancellationReason:
              "Cancelled by patient",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to cancel appointment"
        );
      }

      setSuccessMessage(
        "Appointment cancelled successfully."
      );

      await fetchAppointments();
    } catch (err) {
      console.error("Cancel appointment error:", err);
      setError(err.message);
    }
  };

  // ==========================================================
  // DATE MINIMUM
  // ==========================================================

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================================
  // STATUS CLASS
  // ==========================================================

  const getStatusClass = (status) => {
    return `status-${String(status || "")
      .toLowerCase()
      .replaceAll("_", "-")}`;
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="appointments-page">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="appointments-header">
        <div>
          <span className="page-eyebrow">
            PATIENT PORTAL
          </span>

          <h1>My Appointments</h1>

          <p>
            Book and track your hospital appointments
            in one place.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={fetchAppointments}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="alert alert-error">
          <span>⚠</span>
          <div>
            <strong>Unable to process request</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* ======================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {successMessage && !bookingSuccess && (
        <div className="alert alert-success">
          <span>✓</span>
          <div>{successMessage}</div>
        </div>
      )}

      {/* ======================================================
          BOOKING SUCCESS CARD
      ====================================================== */}

      {bookingSuccess && (
        <div className="appointment-success-card">

          <div className="success-icon">
            ✓
          </div>

          <h2>
            Appointment Booked Successfully
          </h2>

          <p>
            Your appointment has been successfully
            registered with MeroAsha Hospital.
          </p>

          {/* Appointment token */}

          <div className="appointment-token-box">
            <span>
              APPOINTMENT TOKEN
            </span>

            <strong>
              {bookingSuccess.token}
            </strong>
          </div>

          {/* Gmail information */}

          {bookingSuccess.emailSent ? (
            <div className="email-success">
              <strong>✓ Confirmation email sent</strong>

              <span>
                Appointment confirmation has been
                sent to your registered Gmail:
              </span>

              <b>
                {user?.email}
              </b>
            </div>
          ) : (
            <div className="email-warning">
              <strong>
                ⚠ Email could not be sent
              </strong>

              <span>
                Your appointment is still booked.
                Please keep your appointment token.
              </span>
            </div>
          )}

          <button
            type="button"
            className="book-another-button"
            onClick={() => {
              setBookingSuccess(null);
              setSuccessMessage("");
            }}
          >
            Book Another Appointment
          </button>
        </div>
      )}

      {/* ======================================================
          NEW APPOINTMENT
      ====================================================== */}

      {!bookingSuccess && (
        <section className="appointment-card">

          <div className="section-heading">
            <div>
              <span className="section-label">
                NEW APPOINTMENT
              </span>

              <h2>Book an Appointment</h2>

              <p>
                Choose your department, doctor,
                date and consultation time.
              </p>
            </div>
          </div>

          <form
            className="appointment-form"
            onSubmit={handleSubmit}
          >

            {/* ==================================================
                DEPARTMENT
            ================================================== */}

            <div className="form-group">
              <label htmlFor="departmentId">
                Department
              </label>

              <select
                id="departmentId"
                name="departmentId"
                value={form.departmentId}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select department
                </option>

                {departments.map((department) => (
                  <option
                    key={department._id}
                    value={department._id}
                  >
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ==================================================
                DOCTOR
            ================================================== */}

            <div className="form-group">
              <label htmlFor="doctorId">
                Doctor
              </label>

              <select
                id="doctorId"
                name="doctorId"
                value={form.doctorId}
                onChange={handleChange}
                disabled={!form.departmentId || loadingDoctors}
                required
              >
                <option value="">
                  {!form.departmentId
                    ? "Select department first"
                    : loadingDoctors
                    ? "Loading doctors..."
                    : doctors.length === 0
                    ? "No doctors available"
                    : "Select doctor"}
                </option>

                {doctors.map((doctor) => (
                  <option
                    key={doctor._id}
                    value={doctor._id}
                  >
                    {doctor.userId?.name || "Doctor"} —{" "}
                    {doctor.specialization || "General"}
                  </option>
                ))}
              </select>
            </div>

            {/* ==================================================
                DATE
            ================================================== */}

            <div className="form-group">
              <label htmlFor="appointmentDate">
                Appointment Date
              </label>

              <input
                id="appointmentDate"
                type="date"
                name="appointmentDate"
                value={form.appointmentDate}
                onChange={handleChange}
                min={today}
                disabled={!form.doctorId}
                required
              />
            </div>

            {/* ==================================================
                TIME
            ================================================== */}

            <div className="form-group">
              <label htmlFor="timeSlot">
                Available Time
              </label>

              <select
                id="timeSlot"
                name="timeSlot"
                value={form.timeSlot}
                onChange={handleChange}
                disabled={
                  !form.appointmentDate ||
                  loadingSlots
                }
                required
              >
                <option value="">
                  {!form.appointmentDate
                    ? "Select date first"
                    : loadingSlots
                    ? "Loading available slots..."
                    : availableSlots.length === 0
                    ? "No slots available"
                    : "Select time"}
                </option>

                {availableSlots
                  .filter((slot) => slot.available)
                  .map((slot) => (
                    <option
                      key={slot.timeSlot}
                      value={slot.timeSlot}
                    >
                      {slot.timeSlot}
                    </option>
                  ))}
              </select>
            </div>

            {/* ==================================================
                REASON
            ================================================== */}

            <div className="form-group form-group-full">
              <label htmlFor="reason">
                Reason for Visit
              </label>

              <input
                id="reason"
                type="text"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Example: Fever, headache, regular check-up"
              />
            </div>

            {/* ==================================================
                NOTES
            ================================================== */}

            <div className="form-group form-group-full">
              <label htmlFor="notes">
                Additional Notes
                <span>Optional</span>
              </label>

              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Add any additional information for the doctor..."
                rows="4"
              />
            </div>

            {/* ==================================================
                REGISTERED EMAIL INFORMATION
            ================================================== */}

            <div className="email-info-box form-group-full">
              <div className="email-info-icon">
                ✉
              </div>

              <div>
                <strong>
                  Appointment confirmation
                </strong>

                <p>
                  Confirmation will be sent to your
                  registered Gmail:
                </p>

                <b>
                  {user?.email || "Registered email"}
                </b>
              </div>
            </div>

            {/* ==================================================
                SUBMIT
            ================================================== */}

            <div className="form-actions form-group-full">
              <button
                type="submit"
                className="book-button"
                disabled={loading}
              >
                {loading
                  ? "Booking Appointment..."
                  : "Book Appointment"}
              </button>
            </div>

          </form>
        </section>
      )}

      {/* ======================================================
          MY APPOINTMENTS
      ====================================================== */}

      <section className="appointment-list-section">

        <div className="section-heading">
          <div>
            <span className="section-label">
              APPOINTMENT HISTORY
            </span>

            <h2>My Appointments</h2>

            <p>
              View your upcoming and previous
              appointments.
            </p>
          </div>
        </div>

        {loading && appointments.length === 0 ? (
          <div className="empty-state">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              📅
            </div>

            <h3>
              No appointments yet
            </h3>

            <p>
              Book your first appointment using
              the form above.
            </p>
          </div>
        ) : (
          <div className="appointment-list">

            {appointments.map((appointment) => {

              const doctorName =
                appointment.doctorId?.userId?.name ||
                "Doctor";

              const departmentName =
                appointment.departmentId?.name ||
                "Department";

              const canCancel = [
                "BOOKED",
                "CONFIRMED",
              ].includes(appointment.status);

              return (
                <div
                  className="appointment-item"
                  key={appointment._id}
                >

                  {/* Left */}

                  <div className="appointment-main">

                    <div className="appointment-top">

                      <span
                        className={`appointment-status ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        {appointment.status?.replaceAll(
                          "_",
                          " "
                        )}
                      </span>

                      <span className="appointment-token">
                        {appointment.appointmentId}
                      </span>

                    </div>

                    <h3>
                      {doctorName}
                    </h3>

                    <p className="appointment-specialization">
                      {appointment.doctorId
                        ?.specialization ||
                        "Medical Consultation"}
                    </p>

                    <div className="appointment-details">

                      <div>
                        <span>Department</span>
                        <strong>
                          {departmentName}
                        </strong>
                      </div>

                      <div>
                        <span>Date</span>
                        <strong>
                          {formatDate(
                            appointment.appointmentDate
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Time</span>
                        <strong>
                          {appointment.timeSlot}
                        </strong>
                      </div>

                    </div>

                    {appointment.reason && (
                      <div className="appointment-reason">
                        <span>
                          Reason
                        </span>

                        <p>
                          {appointment.reason}
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Right */}

                  <div className="appointment-actions">

                    {canCancel && (
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={() =>
                          cancelAppointment(
                            appointment._id
                          )
                        }
                      >
                        Cancel
                      </button>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </section>

    </div>
  );
}

export default Appointments;