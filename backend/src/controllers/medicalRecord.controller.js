const mongoose = require("mongoose");

const MedicalRecord = require("../models/MedicalRecord");
const Patient = require("../models/Patient");


/*
============================================================
HELPER
============================================================
Populate a medical record consistently.
============================================================
*/

const populateMedicalRecord = async (recordId) => {
  return MedicalRecord.findById(recordId)
    .populate({
      path: "patientId",
      populate: {
        path: "userId",
        select: "name email phone",
      },
    })
    .populate({
      path: "lastUpdatedBy",
      select: "name email role",
    });
};


/*
============================================================
GET MY MEDICAL RECORD
============================================================

PATIENT ONLY

Patient can see only their own record.

============================================================
*/

const getMyMedicalRecord = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      userId: req.user._id,
      active: true,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const medicalRecord = await MedicalRecord.findOne({
      patientId: patient._id,
    })
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name email phone",
        },
      })
      .populate({
        path: "lastUpdatedBy",
        select: "name email role",
      });

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    return res.status(200).json({
      success: true,
      medicalRecord,
    });
  } catch (error) {
    next(error);
  }
};


/*
============================================================
GET MEDICAL RECORD BY ID
============================================================

ADMIN / DOCTOR / PATIENT

Patient can only access their own record.

============================================================
*/

const getMedicalRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medical record ID",
      });
    }

    const medicalRecord = await MedicalRecord.findById(id)
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name email phone",
        },
      })
      .populate({
        path: "lastUpdatedBy",
        select: "name email role",
      });

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    if (req.user.role === "PATIENT") {
      const patient = medicalRecord.patientId;

      if (
        !patient ||
        String(patient.userId) !== String(req.user._id)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to access this medical record",
        });
      }
    }

    return res.status(200).json({
      success: true,
      medicalRecord,
    });
  } catch (error) {
    next(error);
  }
};


/*
============================================================
GET PATIENT MEDICAL RECORD
============================================================

PATIENT:
    Own record only

DOCTOR:
    Any patient

ADMIN:
    Any patient

NURSE:
    Any patient - view only

============================================================
*/

const getPatientMedicalRecord = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Patient can only view their own record
    if (req.user.role === "PATIENT") {
      if (
        String(patient.userId) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to access this medical record",
        });
      }
    }

    const medicalRecord = await MedicalRecord.findOne({
      patientId: patient._id,
    })
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name email phone",
        },
      })
      .populate({
        path: "lastUpdatedBy",
        select: "name email role",
      });

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    return res.status(200).json({
      success: true,
      medicalRecord,
    });
  } catch (error) {
    next(error);
  }
};


/*
============================================================
GET ALL MEDICAL RECORDS
============================================================

ADMIN / DOCTOR

============================================================
*/

const getMedicalRecords = async (req, res, next) => {
  try {
    const records = await MedicalRecord.find()
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name email phone",
        },
      })
      .populate({
        path: "lastUpdatedBy",
        select: "name email role",
      })
      .sort({
        updatedAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: records.length,
      medicalRecords: records,
    });
  } catch (error) {
    next(error);
  }
};


/*
============================================================
CREATE MEDICAL RECORD
============================================================

ONLY ADMIN / DOCTOR

============================================================
*/

const createMedicalRecord = async (req, res, next) => {
  try {
    // Extra controller-level protection
    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "DOCTOR"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only doctors and administrators can create medical records.",
      });
    }

    const {
      patientId,
      allergies,
      chronicConditions,
      currentMedications,
      pastMedicalHistory,
      surgicalHistory,
      familyHistory,
      medicalNotes,
      importantInformation,
    } = req.body;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const existingRecord = await MedicalRecord.findOne({
      patientId,
    });

    if (existingRecord) {
      return res.status(409).json({
        success: false,
        message:
          "Medical record already exists for this patient",
      });
    }

    const medicalRecord =
      await MedicalRecord.create({
        patientId,

        allergies: Array.isArray(allergies)
          ? allergies
          : [],

        chronicConditions:
          Array.isArray(chronicConditions)
            ? chronicConditions
            : [],

        currentMedications:
          Array.isArray(currentMedications)
            ? currentMedications
            : [],

        pastMedicalHistory:
          pastMedicalHistory || "",

        surgicalHistory:
          surgicalHistory || "",

        familyHistory:
          familyHistory || "",

        medicalNotes:
          medicalNotes || "",

        importantInformation:
          importantInformation || "",

        lastUpdatedBy: req.user._id,
      });

    const populatedRecord =
      await populateMedicalRecord(
        medicalRecord._id
      );

    return res.status(201).json({
      success: true,
      message:
        "Medical record created successfully",
      medicalRecord: populatedRecord,
    });
  } catch (error) {
    next(error);
  }
};


/*
============================================================
UPDATE PATIENT MEDICAL RECORD
============================================================

ONLY ADMIN / DOCTOR

PATIENT:
    BLOCKED

NURSE:
    BLOCKED

============================================================
*/

const updateMedicalRecord = async (req, res, next) => {
  try {
    /*
    --------------------------------------------------------
    HARD SECURITY CHECK
    --------------------------------------------------------
    Even if someone bypasses the frontend, this blocks them.
    --------------------------------------------------------
    */

    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "DOCTOR"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only doctors and administrators can edit medical records.",
      });
    }

    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient =
      await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    let medicalRecord =
      await MedicalRecord.findOne({
        patientId,
      });

    /*
    --------------------------------------------------------
    If record does not exist, doctor/admin can create it.
    --------------------------------------------------------
    */

    if (!medicalRecord) {
      medicalRecord =
        await MedicalRecord.create({
          patientId,
          lastUpdatedBy: req.user._id,
        });
    }

    const {
      allergies,
      chronicConditions,
      currentMedications,
      pastMedicalHistory,
      surgicalHistory,
      familyHistory,
      medicalNotes,
      importantInformation,
    } = req.body;

    if (allergies !== undefined) {
      medicalRecord.allergies =
        Array.isArray(allergies)
          ? allergies
          : [];
    }

    if (chronicConditions !== undefined) {
      medicalRecord.chronicConditions =
        Array.isArray(chronicConditions)
          ? chronicConditions
          : [];
    }

    if (currentMedications !== undefined) {
      medicalRecord.currentMedications =
        Array.isArray(currentMedications)
          ? currentMedications
          : [];
    }

    if (pastMedicalHistory !== undefined) {
      medicalRecord.pastMedicalHistory =
        pastMedicalHistory;
    }

    if (surgicalHistory !== undefined) {
      medicalRecord.surgicalHistory =
        surgicalHistory;
    }

    if (familyHistory !== undefined) {
      medicalRecord.familyHistory =
        familyHistory;
    }

    if (medicalNotes !== undefined) {
      medicalRecord.medicalNotes =
        medicalNotes;
    }

    if (importantInformation !== undefined) {
      medicalRecord.importantInformation =
        importantInformation;
    }

    /*
    --------------------------------------------------------
    Audit information
    --------------------------------------------------------
    */

    medicalRecord.lastUpdatedBy =
      req.user._id;

    await medicalRecord.save();

    const populatedRecord =
      await populateMedicalRecord(
        medicalRecord._id
      );

    return res.status(200).json({
      success: true,
      message:
        "Medical record updated successfully",
      medicalRecord: populatedRecord,
    });
  } catch (error) {
    next(error);
  }
};


/*
============================================================
EXPORTS
============================================================
*/

module.exports = {
  getMyMedicalRecord,
  getMedicalRecordById,
  getPatientMedicalRecord,
  getMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
};