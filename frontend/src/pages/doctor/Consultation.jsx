import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Consultation.css";

const API_BASE_URL = "http://localhost:5001/api";

const Consultation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [consultationId, setConsultationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
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
  });

  const getToken = () => {
    return (
      localStorage.getItem("meroasha_token") ||
      localStorage.getItem("token")
    );
  };

  const getHeaders = () => {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  /*
   * Load an existing consultation if one already exists.
   *
   * This prevents the doctor from accidentally creating
   * a second consultation for the same appointment.
   */
  useEffect(() => {
    const loadConsultation = async () => {
      if (!appointmentId) {
        setError("Appointment ID is missing.");
        setLoading(false);
        return;
      }

      const token = getToken();

      if (!token) {
        setError("Authentication token is missing. Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        /*
         * First check whether a consultation already exists.
         *
         * The backend may return 404 when it does not exist.
         * That is normal for a new consultation.
         */
        const response = await fetch(
          `${API_BASE_URL}/consultations/by-appointment/${appointmentId}`,
          {
            method: "GET",
            headers: getHeaders(),
          }
        );

        if (response.ok) {
          const result = await response.json();

          const consultation =
            result.consultation ||
            result.data ||
            result;

          if (consultation && consultation._id) {
            setConsultationId(consultation._id);

            setFormData({
              symptoms: consultation.symptoms || "",
              diagnosis: consultation.diagnosis || "",
              clinicalNotes: consultation.clinicalNotes || "",
              treatmentPlan: consultation.treatmentPlan || "",

              bloodPressure:
                consultation.vitals?.bloodPressure || "",

              temperature:
                consultation.vitals?.temperature || "",

              heartRate:
                consultation.vitals?.heartRate || "",

              respiratoryRate:
                consultation.vitals?.respiratoryRate || "",

              oxygenSaturation:
                consultation.vitals?.oxygenSaturation || "",

              weight:
                consultation.vitals?.weight || "",

              height:
                consultation.vitals?.height || "",
            });
          }
        } else if (response.status !== 404) {
          const result = await response.json().catch(() => ({}));

          setError(
            result.message ||
              "Unable to load consultation information."
          );
        }
      } catch (err) {
        console.error("Consultation loading error:", err);

        setError(
          "Unable to connect to the MeroAsha server."
        );
      } finally {
        setLoading(false);
      }
    };

    loadConsultation();
  }, [appointmentId]);

  /*
   * Create a new consultation.
   */
  const createConsultation = async () => {
    const response = await fetch(
      `${API_BASE_URL}/consultations`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          appointmentId,
          symptoms: formData.symptoms,
          diagnosis: formData.diagnosis,
          clinicalNotes: formData.clinicalNotes,
          treatmentPlan: formData.treatmentPlan,

          vitals: {
            bloodPressure: formData.bloodPressure,
            temperature: formData.temperature,
            heartRate: formData.heartRate,
            respiratoryRate: formData.respiratoryRate,
            oxygenSaturation: formData.oxygenSaturation,
            weight: formData.weight,
            height: formData.height,
          },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to create consultation."
      );
    }

    const consultation =
      result.consultation ||
      result.data ||
      result;

    if (consultation?._id) {
      setConsultationId(consultation._id);
    }

    return consultation;
  };

  /*
   * Update an existing consultation.
   */
  const updateConsultation = async () => {
    const response = await fetch(
      `${API_BASE_URL}/consultations/${consultationId}`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          symptoms: formData.symptoms,
          diagnosis: formData.diagnosis,
          clinicalNotes: formData.clinicalNotes,
          treatmentPlan: formData.treatmentPlan,

          vitals: {
            bloodPressure: formData.bloodPressure,
            temperature: formData.temperature,
            heartRate: formData.heartRate,
            respiratoryRate: formData.respiratoryRate,
            oxygenSaturation: formData.oxygenSaturation,
            weight: formData.weight,
            height: formData.height,
          },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to update consultation."
      );
    }

    return result;
  };

  /*
   * Save consultation.
   */
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (!getToken()) {
        throw new Error(
          "Authentication token is missing. Please login again."
        );
      }

      if (consultationId) {
        await updateConsultation();

        setMessage(
          "Consultation updated successfully."
        );
      } else {
        await createConsultation();

        setMessage(
          "Consultation started and saved successfully."
        );
      }
    } catch (err) {
      console.error("Save consultation error:", err);

      setError(
        err.message ||
          "Unable to save consultation."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Complete consultation.
   */
  const handleComplete = async () => {
    if (!consultationId) {
      setError(
        "Please save the consultation before completing it."
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
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/consultations/${consultationId}/complete`,
        {
          method: "PATCH",
          headers: getHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to complete consultation."
        );
      }

      setMessage(
        "Consultation completed successfully."
      );
    } catch (err) {
      console.error(
        "Complete consultation error:",
        err
      );

      setError(
        err.message ||
          "Unable to complete consultation."
      );
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="consultation-page">
        <div className="consultation-loading">
          <div className="loading-spinner"></div>
          <p>Loading consultation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="consultation-page">

      {/* ================= HEADER ================= */}

      <div className="consultation-header">

        <div>
          <p className="page-label">
            DOCTOR PORTAL
          </p>

          <h1>
            Patient Consultation
          </h1>

          <p className="page-description">
            Record clinical findings, diagnosis,
            treatment and patient vitals.
          </p>
        </div>

        <div className="consultation-status">
          <span className="status-dot"></span>

          {consultationId
            ? "Consultation In Progress"
            : "Ready to Start"}
        </div>

      </div>


      {/* ================= ALERTS ================= */}

      {error && (
        <div className="consultation-alert error">
          {error}
        </div>
      )}

      {message && (
        <div className="consultation-alert success">
          {message}
        </div>
      )}


      {/* ================= PATIENT ================= */}

      <div className="patient-card">

        <div className="patient-avatar">
          P
        </div>

        <div className="patient-info">

          <h2>
            Patient Consultation
          </h2>

          <p>
            Appointment ID: {appointmentId}
          </p>

        </div>

      </div>


      <form onSubmit={handleSave}>

        {/* ================= CLINICAL INFORMATION ================= */}

        <section className="consultation-card">

          <div className="section-header">

            <div>
              <h2>
                Clinical Information
              </h2>

              <p>
                Record the patient's current
                clinical condition.
              </p>
            </div>

          </div>


          <div className="form-grid">

            <div className="form-group full-width">

              <label>
                Symptoms
              </label>

              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                placeholder="Describe patient's symptoms..."
                rows="4"
              />

            </div>


            <div className="form-group full-width">

              <label>
                Diagnosis
              </label>

              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder="Enter diagnosis..."
                rows="4"
              />

            </div>


            <div className="form-group full-width">

              <label>
                Clinical Notes
              </label>

              <textarea
                name="clinicalNotes"
                value={formData.clinicalNotes}
                onChange={handleChange}
                placeholder="Enter examination findings and clinical observations..."
                rows="5"
              />

            </div>


            <div className="form-group full-width">

              <label>
                Treatment Plan
              </label>

              <textarea
                name="treatmentPlan"
                value={formData.treatmentPlan}
                onChange={handleChange}
                placeholder="Describe recommended treatment and follow-up..."
                rows="4"
              />

            </div>

          </div>

        </section>


        {/* ================= VITALS ================= */}

        <section className="consultation-card">

          <div className="section-header">

            <div>

              <h2>
                Patient Vitals
              </h2>

              <p>
                Enter the latest patient measurements.
              </p>

            </div>

          </div>


          <div className="vitals-grid">

            <div className="form-group">

              <label>
                Blood Pressure
              </label>

              <input
                name="bloodPressure"
                value={formData.bloodPressure}
                onChange={handleChange}
                placeholder="120/80 mmHg"
              />

            </div>


            <div className="form-group">

              <label>
                Temperature
              </label>

              <input
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                placeholder="98.6 °F"
              />

            </div>


            <div className="form-group">

              <label>
                Heart Rate
              </label>

              <input
                name="heartRate"
                value={formData.heartRate}
                onChange={handleChange}
                placeholder="72 bpm"
              />

            </div>


            <div className="form-group">

              <label>
                Respiratory Rate
              </label>

              <input
                name="respiratoryRate"
                value={formData.respiratoryRate}
                onChange={handleChange}
                placeholder="16 /min"
              />

            </div>


            <div className="form-group">

              <label>
                Oxygen Saturation
              </label>

              <input
                name="oxygenSaturation"
                value={formData.oxygenSaturation}
                onChange={handleChange}
                placeholder="98%"
              />

            </div>


            <div className="form-group">

              <label>
                Weight
              </label>

              <input
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="65 kg"
              />

            </div>


            <div className="form-group">

              <label>
                Height
              </label>

              <input
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="170 cm"
              />

            </div>

          </div>

        </section>


        {/* ================= ACTIONS ================= */}

        <div className="consultation-actions">

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate("/doctor/dashboard")
            }
          >
            Back to Dashboard
          </button>


          <button
            type="submit"
            className="primary-button"
            disabled={saving || completing}
          >
            {saving
              ? "Saving..."
              : consultationId
                ? "Update Consultation"
                : "Start & Save Consultation"}
          </button>


          {consultationId && (
            <button
              type="button"
              className="complete-button"
              onClick={handleComplete}
              disabled={saving || completing}
            >
              {completing
                ? "Completing..."
                : "Complete Consultation"}
            </button>
          )}

        </div>

      </form>

    </div>
  );
};

export default Consultation;