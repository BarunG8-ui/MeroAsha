import React, { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../services/api";
import "./MedicalRecordManagement.css";

const emptyForm = {
  allergies: "",
  chronicConditions: "",
  currentMedications: [],
  pastMedicalHistory: "",
  surgicalHistory: "",
  familyHistory: "",
  medicalNotes: "",
  importantInformation: "",
};

function MedicalRecordManagement() {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  /*
  ============================================================
  LOAD ALL MEDICAL RECORDS
  Doctor/Admin only
  ============================================================
  */

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest(
        "/medical-records"
      );

      setRecords(
        response.medicalRecords || []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load medical records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  /*
  ============================================================
  SEARCH
  ============================================================
  */

  const filteredRecords = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return records;
    }

    return records.filter((record) => {
      const patient =
        record.patientId;

      const user =
        patient?.userId;

      return (
        patient?.patientId
          ?.toLowerCase()
          .includes(value) ||

        user?.name
          ?.toLowerCase()
          .includes(value) ||

        user?.email
          ?.toLowerCase()
          .includes(value) ||

        user?.phone
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [records, search]);

  /*
  ============================================================
  SELECT RECORD
  ============================================================
  */

  const selectRecord = (record) => {
    setSelectedRecord(record);

    setForm({
      allergies: (
        record.allergies || []
      ).join(", "),

      chronicConditions: (
        record.chronicConditions || []
      ).join(", "),

      currentMedications:
        record.currentMedications || [],

      pastMedicalHistory:
        record.pastMedicalHistory || "",

      surgicalHistory:
        record.surgicalHistory || "",

      familyHistory:
        record.familyHistory || "",

      medicalNotes:
        record.medicalNotes || "",

      importantInformation:
        record.importantInformation || "",
    });

    setError("");
    setSuccess("");
  };

  /*
  ============================================================
  FORM CHANGE
  ============================================================
  */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /*
  ============================================================
  MEDICATION CHANGE
  ============================================================
  */

  const updateMedication = (
    index,
    field,
    value
  ) => {
    setForm((previous) => {
      const medications = [
        ...previous.currentMedications,
      ];

      medications[index] = {
        ...medications[index],
        [field]: value,
      };

      return {
        ...previous,
        currentMedications:
          medications,
      };
    });
  };

  /*
  ============================================================
  ADD MEDICATION
  ============================================================
  */

  const addMedication = () => {
    setForm((previous) => ({
      ...previous,

      currentMedications: [
        ...previous.currentMedications,

        {
          name: "",
          dosage: "",
          frequency: "",
          startedAt: null,
        },
      ],
    }));
  };

  /*
  ============================================================
  REMOVE MEDICATION
  ============================================================
  */

  const removeMedication = (index) => {
    setForm((previous) => ({
      ...previous,

      currentMedications:
        previous.currentMedications.filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
    }));
  };

  /*
  ============================================================
  SAVE
  ============================================================
  */

  const handleSave = async (event) => {
    event.preventDefault();

    if (!selectedRecord) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const patientId =
        selectedRecord.patientId?._id;

      if (!patientId) {
        throw new Error(
          "Patient ID is missing."
        );
      }

      const allergies = form.allergies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const chronicConditions =
        form.chronicConditions
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

      const currentMedications =
        form.currentMedications
          .filter(
            (medicine) =>
              medicine.name?.trim()
          )
          .map((medicine) => ({
            name:
              medicine.name?.trim() ||
              "",

            dosage:
              medicine.dosage?.trim() ||
              "",

            frequency:
              medicine.frequency?.trim() ||
              "",

            startedAt:
              medicine.startedAt ||
              null,
          }));

      const response =
        await apiRequest(
          `/medical-records/patient/${patientId}`,
          {
            method: "PATCH",

            body: JSON.stringify({
              allergies,
              chronicConditions,
              currentMedications,

              pastMedicalHistory:
                form.pastMedicalHistory,

              surgicalHistory:
                form.surgicalHistory,

              familyHistory:
                form.familyHistory,

              medicalNotes:
                form.medicalNotes,

              importantInformation:
                form.importantInformation,
            }),
          }
        );

      const updatedRecord =
        response.medicalRecord;

      setSelectedRecord(
        updatedRecord
      );

      setRecords((previous) =>
        previous.map((record) =>
          String(record._id) ===
          String(updatedRecord._id)
            ? updatedRecord
            : record
        )
      );

      setSuccess(
        "Medical record updated successfully."
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to update medical record."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  ============================================================
  FORMAT DATE
  ============================================================
  */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {
    return (
      <div className="staff-medical-page">
        <div className="staff-medical-loading">
          Loading medical records...
        </div>
      </div>
    );
  }

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <div className="staff-medical-page">

      <div className="staff-medical-header">

        <div>
          <span className="staff-medical-label">
            CLINICAL RECORDS
          </span>

          <h1>
            Medical Record Management
          </h1>

          <p>
            Review and maintain patient
            clinical information.
          </p>
        </div>

        <div className="record-count">
          {records.length}
          <span>
            Records
          </span>
        </div>

      </div>


      {error && (
        <div className="staff-medical-message error">
          {error}
        </div>
      )}


      {success && (
        <div className="staff-medical-message success">
          {success}
        </div>
      )}


      <div className="staff-medical-layout">

        {/* ==================================================
            RECORD LIST
        ================================================== */}

        <section className="record-list-panel">

          <div className="panel-heading">

            <div>
              <h2>
                Patients
              </h2>

              <span>
                Select a patient record
              </span>
            </div>

          </div>


          <div className="record-search">

            <input
              type="text"
              placeholder="Search patient, ID, email..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>


          <div className="record-list">

            {filteredRecords.length === 0 ? (

              <div className="empty-records">
                No medical records found.
              </div>

            ) : (

              filteredRecords.map(
                (record) => {

                  const patient =
                    record.patientId;

                  const user =
                    patient?.userId;

                  const active =
                    selectedRecord?._id ===
                    record._id;

                  return (
                    <button
                      key={record._id}
                      type="button"
                      className={`record-list-item ${
                        active
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        selectRecord(
                          record
                        )
                      }
                    >

                      <div className="patient-avatar">
                        {(
                          user?.name ||
                          "P"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="patient-summary">

                        <strong>
                          {user?.name ||
                            "Patient"}
                        </strong>

                        <span>
                          {patient?.patientId ||
                            "No patient ID"}
                        </span>

                        <small>
                          Updated{" "}
                          {formatDate(
                            record.updatedAt
                          )}
                        </small>

                      </div>

                    </button>
                  );
                }
              )

            )}

          </div>

        </section>


        {/* ==================================================
            EDITOR
        ================================================== */}

        <section className="record-editor-panel">

          {!selectedRecord ? (

            <div className="record-empty-state">

              <div className="empty-icon">
                +
              </div>

              <h2>
                Select a patient
              </h2>

              <p>
                Choose a patient from the
                list to view and edit their
                medical record.
              </p>

            </div>

          ) : (

            <form
              onSubmit={handleSave}
              className="record-editor"
            >

              {/* ==========================================
                  PATIENT HEADER
              ========================================== */}

              <div className="patient-header">

                <div>

                  <span>
                    Patient
                  </span>

                  <h2>
                    {selectedRecord
                      .patientId
                      ?.userId
                      ?.name ||
                      "Patient"}
                  </h2>

                  <p>
                    ID:{" "}
                    {selectedRecord
                      .patientId
                      ?.patientId ||
                      "-"}
                  </p>

                </div>

                <div className="patient-meta">

                  <span>
                    {selectedRecord
                      .patientId
                      ?.bloodGroup ||
                      "Blood group N/A"}
                  </span>

                  <span>
                    {selectedRecord
                      .patientId
                      ?.gender ||
                      "Gender N/A"}
                  </span>

                </div>

              </div>


              {/* ==========================================
                  ALLERGIES
              ========================================== */}

              <div className="editor-section">

                <h3>
                  Allergies
                </h3>

                <p>
                  Separate multiple allergies
                  with commas.
                </p>

                <input
                  name="allergies"
                  value={form.allergies}
                  onChange={handleChange}
                  placeholder="Penicillin, Dust, Latex"
                />

              </div>


              {/* ==========================================
                  CHRONIC CONDITIONS
              ========================================== */}

              <div className="editor-section">

                <h3>
                  Chronic Conditions
                </h3>

                <p>
                  Record clinically relevant
                  long-term conditions.
                </p>

                <input
                  name="chronicConditions"
                  value={
                    form.chronicConditions
                  }
                  onChange={handleChange}
                  placeholder="Diabetes, Hypertension"
                />

              </div>


              {/* ==========================================
                  CURRENT MEDICATIONS
              ========================================== */}

              <div className="editor-section">

                <div className="section-heading-row">

                  <div>
                    <h3>
                      Current Medications
                    </h3>

                    <p>
                      Maintain active medications
                      for the patient.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={addMedication}
                  >
                    + Add Medicine
                  </button>

                </div>


                {form.currentMedications.length ===
                0 ? (

                  <div className="no-medications">
                    No current medications.
                  </div>

                ) : (

                  <div className="medication-editor">

                    {form.currentMedications.map(
                      (
                        medicine,
                        index
                      ) => (

                        <div
                          className="medication-row"
                          key={index}
                        >

                          <input
                            placeholder="Medicine name"
                            value={
                              medicine.name ||
                              ""
                            }
                            onChange={(event) =>
                              updateMedication(
                                index,
                                "name",
                                event.target
                                  .value
                              )
                            }
                          />

                          <input
                            placeholder="Dosage"
                            value={
                              medicine.dosage ||
                              ""
                            }
                            onChange={(event) =>
                              updateMedication(
                                index,
                                "dosage",
                                event.target
                                  .value
                              )
                            }
                          />

                          <input
                            placeholder="Frequency"
                            value={
                              medicine.frequency ||
                              ""
                            }
                            onChange={(event) =>
                              updateMedication(
                                index,
                                "frequency",
                                event.target
                                  .value
                              )
                            }
                          />

                          <input
                            type="date"
                            value={
                              medicine.startedAt
                                ? String(
                                    medicine.startedAt
                                  ).slice(
                                    0,
                                    10
                                  )
                                : ""
                            }
                            onChange={(event) =>
                              updateMedication(
                                index,
                                "startedAt",
                                event.target
                                  .value
                              )
                            }
                          />

                          <button
                            type="button"
                            className="remove-medication"
                            onClick={() =>
                              removeMedication(
                                index
                              )
                            }
                          >
                            Remove
                          </button>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>


              {/* ==========================================
                  HISTORY
              ========================================== */}

              <div className="editor-grid">

                <div className="editor-section">

                  <h3>
                    Past Medical History
                  </h3>

                  <textarea
                    name="pastMedicalHistory"
                    value={
                      form.pastMedicalHistory
                    }
                    onChange={handleChange}
                    rows="5"
                    placeholder="Previous illnesses, admissions..."
                  />

                </div>


                <div className="editor-section">

                  <h3>
                    Surgical History
                  </h3>

                  <textarea
                    name="surgicalHistory"
                    value={
                      form.surgicalHistory
                    }
                    onChange={handleChange}
                    rows="5"
                    placeholder="Previous surgeries..."
                  />

                </div>

              </div>


              <div className="editor-grid">

                <div className="editor-section">

                  <h3>
                    Family History
                  </h3>

                  <textarea
                    name="familyHistory"
                    value={
                      form.familyHistory
                    }
                    onChange={handleChange}
                    rows="5"
                    placeholder="Relevant family medical history..."
                  />

                </div>


                <div className="editor-section">

                  <h3>
                    Medical Notes
                  </h3>

                  <textarea
                    name="medicalNotes"
                    value={
                      form.medicalNotes
                    }
                    onChange={handleChange}
                    rows="5"
                    placeholder="Clinical notes..."
                  />

                </div>

              </div>


              {/* ==========================================
                  IMPORTANT INFORMATION
              ========================================== */}

              <div className="editor-section important-editor">

                <h3>
                  Important Information
                </h3>

                <textarea
                  name="importantInformation"
                  value={
                    form.importantInformation
                  }
                  onChange={handleChange}
                  rows="5"
                  placeholder="Important clinical alerts or information..."
                />

              </div>


              {/* ==========================================
                  AUDIT
              ========================================== */}

              <div className="record-audit">

                <div>
                  <span>
                    Last updated
                  </span>

                  <strong>
                    {formatDate(
                      selectedRecord.updatedAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Updated by
                  </span>

                  <strong>
                    {selectedRecord
                      .lastUpdatedBy
                      ?.name ||
                      "Not available"}
                  </strong>
                </div>

              </div>


              {/* ==========================================
                  SAVE
              ========================================== */}

              <div className="editor-actions">

                <button
                  type="submit"
                  className="save-record-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Medical Record"}
                </button>

              </div>

            </form>

          )}

        </section>

      </div>

    </div>
  );
}

export default MedicalRecordManagement;