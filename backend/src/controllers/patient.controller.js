const Patient = require("../models/Patient");

function generatePatientId() {
  const timestamp = Date.now().toString().slice(-8);
  return `PAT-${timestamp}`;
}

// ==========================================
// CREATE PATIENT PROFILE
// POST /api/patients
// ==========================================
const createPatient = async (req, res, next) => {
  try {
    const existingPatient = await Patient.findOne({
      userId: req.user._id,
    });

    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: "Patient profile already exists",
      });
    }

    const patient = await Patient.create({
      userId: req.user._id,
      patientId: generatePatientId(),

      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      bloodGroup: req.body.bloodGroup,
      address: req.body.address,
      emergencyContact: req.body.emergencyContact,

      allergies: req.body.allergies || [],
      chronicConditions: req.body.chronicConditions || [],
      currentMedications: req.body.currentMedications || [],

      medicalNotes: req.body.medicalNotes,
      insurance: req.body.insurance,
    });

    return res.status(201).json({
      success: true,
      message: "Patient profile created successfully",
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET MY PATIENT PROFILE
// GET /api/patients/me
// ==========================================
const getMyPatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      userId: req.user._id,
    }).populate(
      "userId",
      "name email phone role active"
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE MY PATIENT PROFILE
// PATCH /api/patients/me
// ==========================================
const updateMyPatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      userId: req.user._id,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    // Fields that the patient is allowed to update
    const allowedFields = [
      "dateOfBirth",
      "gender",
      "bloodGroup",
      "phone",
      "address",
      "emergencyContact",
      "allergies",
      "chronicConditions",
      "currentMedications",
      "medicalNotes",
      "insurance",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        patient[field] = req.body[field];
      }
    });

    await patient.save();

    return res.status(200).json({
      success: true,
      message: "Patient profile updated successfully",
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PATIENT DASHBOARD
// GET /api/patients/dashboard
// ==========================================
const getPatientDashboard = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      userId: req.user._id,
    }).populate(
      "userId",
      "name email phone role active"
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    return res.status(200).json({
      success: true,

      dashboard: {
        patient: {
          patientId: patient.patientId,

          name: patient.userId.name,
          email: patient.userId.email,

          phone:
            patient.phone ||
            patient.userId.phone,

          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          bloodGroup: patient.bloodGroup,

          address: patient.address,
          emergencyContact: patient.emergencyContact,

          allergies: patient.allergies || [],
          chronicConditions:
            patient.chronicConditions || [],

          currentMedications:
            patient.currentMedications || [],

          active: patient.active,
        },

        statistics: {
          appointments: 0,
          upcomingAppointments: 0,
          medicalRecords: 0,
          labReports: 0,
          prescriptions: 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
  createPatient,
  getMyPatientProfile,
  updateMyPatientProfile,
  getPatientDashboard,
};