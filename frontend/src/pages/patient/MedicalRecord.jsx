import React, { useEffect, useState } from "react";

import { apiRequest } from "../../services/api";

import "./MedicalRecord.css";


function MedicalRecord() {
  const [record, setRecord] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /*
  ==========================================================
  LOAD PATIENT MEDICAL RECORD
  ==========================================================
  */

  const loadMedicalRecord = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await apiRequest(
          "/medical-records/me"
        );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Failed to load medical record."
        );
      }

      setRecord(
        response.medicalRecord
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load medical record."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadMedicalRecord();
  }, []);


  /*
  ==========================================================
  DATE FORMAT
  ==========================================================
  */

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Date(
        date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "-";
    }
  };


  const formatDateTime = (date) => {
    if (!date) return "-";

    try {
      return new Date(
        date
      ).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "-";
    }
  };


  /*
  ==========================================================
  LOADING
  ==========================================================
  */

  if (loading) {
    return (
      <div className="medical-record-page">

        <div className="medical-record-card loading-card">

          <div className="loading-spinner"></div>

          <p>
            Loading your medical record...
          </p>

        </div>

      </div>
    );
  }


  /*
  ==========================================================
  ERROR
  ==========================================================
  */

  if (error) {
    return (
      <div className="medical-record-page">

        <div className="medical-record-card error-card">

          <div className="error-icon">
            !
          </div>

          <h2>
            Unable to load medical record
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={loadMedicalRecord}
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }


  /*
  ==========================================================
  PAGE
  ==========================================================
  */

  return (
    <div className="medical-record-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="medical-record-header">

        <div>

          <div className="record-kicker">
            PATIENT CLINICAL RECORD
          </div>

          <h1>
            Medical Record
          </h1>

          <p>
            Your clinical information is maintained
            securely by the hospital.
          </p>

        </div>


        <div className="record-header-actions">

          <div className="record-status">

            <span className="status-dot"></span>

            Read Only

          </div>

        </div>

      </div>


      {/* ==================================================
          INFORMATION NOTICE
      ================================================== */}

      <div className="read-only-notice">

        <div className="notice-icon">
          i
        </div>

        <div>

          <strong>
            Clinical record is read-only
          </strong>

          <p>
            Medical information can only be
            updated by authorized doctors or
            hospital administrators.
          </p>

        </div>

      </div>


      {/* ==================================================
          CLINICAL SUMMARY
      ================================================== */}

      <div className="clinical-alert-grid">

        {/* ALLERGIES */}

        <div className="clinical-alert allergy-alert">

          <div className="alert-icon">
            ⚠
          </div>

          <div>

            <span>
              ALLERGIES
            </span>

            <strong>
              {record?.allergies?.length
                ? record.allergies.join(", ")
                : "No known allergies"}
            </strong>

          </div>

        </div>


        {/* CONDITIONS */}

        <div className="clinical-alert condition-alert">

          <div className="alert-icon">
            +
          </div>

          <div>

            <span>
              CHRONIC CONDITIONS
            </span>

            <strong>
              {record?.chronicConditions?.length
                ? record.chronicConditions.join(", ")
                : "None recorded"}
            </strong>

          </div>

        </div>


        {/* BLOOD GROUP */}

        <div className="clinical-alert blood-alert">

          <div className="alert-icon">
            🩸
          </div>

          <div>

            <span>
              BLOOD GROUP
            </span>

            <strong>
              {record?.patientId?.bloodGroup ||
                "Not recorded"}
            </strong>

          </div>

        </div>

      </div>


      {/* ==================================================
          PATIENT INFORMATION
      ================================================== */}

      <div className="medical-record-card">

        <div className="section-title">

          <div>

            <span className="section-kicker">
              IDENTITY
            </span>

            <h2>
              Patient Information
            </h2>

          </div>

        </div>


        <div className="patient-info-grid">

          <div className="info-item">

            <span>
              Patient ID
            </span>

            <strong>
              {record?.patientId?.patientId ||
                "-"}
            </strong>

          </div>


          <div className="info-item">

            <span>
              Date of Birth
            </span>

            <strong>
              {record?.patientId?.dateOfBirth
                ? formatDate(
                    record.patientId.dateOfBirth
                  )
                : "-"}
            </strong>

          </div>


          <div className="info-item">

            <span>
              Gender
            </span>

            <strong>
              {record?.patientId?.gender ||
                "-"}
            </strong>

          </div>


          <div className="info-item">

            <span>
              Blood Group
            </span>

            <strong>
              {record?.patientId?.bloodGroup ||
                "-"}
            </strong>

          </div>


          <div className="info-item">

            <span>
              Phone
            </span>

            <strong>
              {record?.patientId?.phone ||
                "-"}
            </strong>

          </div>

        </div>

      </div>


      {/* ==================================================
          MEDICAL INFORMATION
      ================================================== */}

      <div className="medical-record-card">

        <div className="section-title">

          <div>

            <span className="section-kicker">
              CLINICAL DATA
            </span>

            <h2>
              Medical Information
            </h2>

          </div>

        </div>


        {/* ALLERGIES */}

        <div className="form-group">

          <label>
            Allergies
          </label>

          <div className="display-box">

            {record?.allergies?.length
              ? record.allergies.join(", ")
              : "No known allergies"}

          </div>

        </div>


        {/* CHRONIC CONDITIONS */}

        <div className="form-group">

          <label>
            Chronic Conditions
          </label>

          <div className="display-box">

            {record?.chronicConditions?.length
              ? record.chronicConditions.join(", ")
              : "No chronic conditions"}

          </div>

        </div>


        {/* MEDICATIONS */}

        <div className="form-group">

          <label>
            Current Medications
          </label>

          <div className="medication-list">

            {record?.currentMedications?.length ? (

              record.currentMedications.map(
                (medicine, index) => (

                  <div
                    className="medication-display"
                    key={
                      medicine._id ||
                      index
                    }
                  >

                    <div className="medicine-main">

                      <div className="medicine-icon">
                        Rx
                      </div>

                      <div>

                        <strong>
                          {medicine.name ||
                            "Medicine"}
                        </strong>

                        <span>
                          {medicine.dosage ||
                            "Dosage not specified"}
                        </span>

                      </div>

                    </div>


                    <div className="medicine-frequency">

                      <span>
                        Frequency
                      </span>

                      <strong>
                        {medicine.frequency ||
                          "Not specified"}
                      </strong>

                    </div>

                  </div>

                )

              )

            ) : (

              <p className="empty-text">
                No current medications.
              </p>

            )}

          </div>

        </div>


        {/* PAST MEDICAL HISTORY */}

        <div className="form-group">

          <label>
            Past Medical History
          </label>

          <div className="display-box large">

            {record?.pastMedicalHistory ||
              "No information provided."}

          </div>

        </div>


        {/* SURGICAL HISTORY */}

        <div className="form-group">

          <label>
            Surgical History
          </label>

          <div className="display-box large">

            {record?.surgicalHistory ||
              "No information provided."}

          </div>

        </div>


        {/* FAMILY HISTORY */}

        <div className="form-group">

          <label>
            Family History
          </label>

          <div className="display-box large">

            {record?.familyHistory ||
              "No information provided."}

          </div>

        </div>


        {/* MEDICAL NOTES */}

        <div className="form-group">

          <label>
            Medical Notes
          </label>

          <div className="display-box large">

            {record?.medicalNotes ||
              "No information provided."}

          </div>

        </div>


        {/* IMPORTANT INFORMATION */}

        <div className="form-group">

          <label>
            Important Information
          </label>

          <div className="display-box large important-box">

            {record?.importantInformation ||
              "No important information provided."}

          </div>

        </div>

      </div>


      {/* ==================================================
          RECORD METADATA
      ================================================== */}

      <div className="record-metadata">

        <div>

          <span>
            Record Created
          </span>

          <strong>
            {record?.createdAt
              ? formatDate(
                  record.createdAt
                )
              : "-"}
          </strong>

        </div>


        <div>

          <span>
            Last Updated
          </span>

          <strong>
            {record?.updatedAt
              ? formatDateTime(
                  record.updatedAt
                )
              : "-"}
          </strong>

        </div>


        <div>

          <span>
            Last Updated By
          </span>

          <strong>
            {record?.lastUpdatedBy?.name
              ? record.lastUpdatedBy.name
              : "Hospital Staff"}
          </strong>

        </div>

      </div>

    </div>
  );
}

export default MedicalRecord;