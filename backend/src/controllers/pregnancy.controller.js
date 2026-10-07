const PregnancyProfile = require("../models/PregnancyProfile");
const PregnancyVisit = require("../models/PregnancyVisit");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

const generateVisitId = () =>
  `PREG-VIS-${Math.floor(100000 + Math.random() * 900000)}`;

const calculateEDD = (lmp) => {
  const date = new Date(lmp);
  date.setDate(date.getDate() + 280);
  return date;
};

const calculateGestationalAge = (lmp, date = new Date()) => {
  const diffMs = new Date(date) - new Date(lmp);
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  return {
    weeks: Math.floor(diffDays / 7),
    days: diffDays % 7,
  };
};

const calculateTrimester = (weeks) => {
  if (weeks < 14) return "FIRST";
  if (weeks < 28) return "SECOND";
  return "THIRD";
};

// Create pregnancy profile
const createPregnancyProfile = async (req, res, next) => {
  try {
    const {
      pregnancyNumber,
      lastMenstrualPeriod,
      conceptionDate,
      bloodGroup,
      gravida,
      para,
      abortions,
      livingChildren,
      riskLevel,
      riskFactors,
      previousPregnancyHistory,
      medicalConditions,
      currentMedications,
      allergies,
      notes,
    } = req.body;

    if (!pregnancyNumber || !lastMenstrualPeriod) {
      return res.status(400).json({
        success: false,
        message: "pregnancyNumber and lastMenstrualPeriod are required",
      });
    }

    // Get the patient belonging to the logged-in user.
    // Never trust patientId supplied by a PATIENT request.
    const patient = await Patient.findOne({
      userId: req.user._id,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found. Create your patient profile first.",
      });
    }

    const existingProfile = await PregnancyProfile.findOne({
      patientId: patient._id,
      active: true,
      status: "ACTIVE",
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Patient already has an active pregnancy profile",
      });
    }

    const lmpDate = new Date(lastMenstrualPeriod);

    if (Number.isNaN(lmpDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid lastMenstrualPeriod",
      });
    }

    if (lmpDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Last menstrual period cannot be in the future",
      });
    }

    const edd = calculateEDD(lmpDate);

    const pregnancy = await PregnancyProfile.create({
      patientId: patient._id,
      pregnancyNumber,
      lastMenstrualPeriod: lmpDate,
      expectedDeliveryDate: edd,
      conceptionDate: conceptionDate || null,
      bloodGroup: bloodGroup || patient.bloodGroup || "UNKNOWN",
      gravida: gravida ?? 1,
      para: para ?? 0,
      abortions: abortions ?? 0,
      livingChildren: livingChildren ?? 0,
      riskLevel: riskLevel || "LOW",
      riskFactors: riskFactors || [],
      previousPregnancyHistory: previousPregnancyHistory || "",
      medicalConditions: medicalConditions || [],
      currentMedications: currentMedications || [],
      allergies: allergies || [],
      notes: notes || "",
      registeredBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Pregnancy profile created successfully",
      data: pregnancy,
    });
  } catch (error) {
    next(error);
  }
};

// Get patient's own pregnancy profile
const getMyPregnancyProfile = async (req, res, next) => {
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

    const pregnancy = await PregnancyProfile.findOne({
      patientId: patient._id,
      active: true,
    }).populate("patientId");

    if (!pregnancy) {
      return res.status(404).json({
        success: false,
        message: "Pregnancy profile not found",
      });
    }

    const gestationalAge = calculateGestationalAge(
      pregnancy.lastMenstrualPeriod
    );

    const trimester = calculateTrimester(gestationalAge.weeks);

    return res.json({
      success: true,
      data: {
        pregnancy,
        gestationalAge,
        trimester,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get pregnancy profile by ID
const getPregnancyProfileById = async (req, res, next) => {
  try {
    const pregnancy = await PregnancyProfile.findById(req.params.id)
      .populate("patientId")
      .populate("registeredBy", "name email role");

    if (!pregnancy) {
      return res.status(404).json({
        success: false,
        message: "Pregnancy profile not found",
      });
    }

    if (req.user.role === "PATIENT") {
      const patient = await Patient.findOne({
        userId: req.user._id,
      });

      if (
        !patient ||
        pregnancy.patientId._id.toString() !== patient._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    const gestationalAge = calculateGestationalAge(
      pregnancy.lastMenstrualPeriod
    );

    return res.json({
      success: true,
      data: {
        pregnancy,
        gestationalAge,
        trimester: calculateTrimester(gestationalAge.weeks),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update pregnancy profile
const updatePregnancyProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      "conceptionDate",
      "bloodGroup",
      "gravida",
      "para",
      "abortions",
      "livingChildren",
      "riskLevel",
      "riskFactors",
      "previousPregnancyHistory",
      "medicalConditions",
      "currentMedications",
      "allergies",
      "status",
      "notes",
      "active",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const pregnancy = await PregnancyProfile.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!pregnancy) {
      return res.status(404).json({
        success: false,
        message: "Pregnancy profile not found",
      });
    }

    return res.json({
      success: true,
      message: "Pregnancy profile updated successfully",
      data: pregnancy,
    });
  } catch (error) {
    next(error);
  }
};

// Create antenatal visit
const createPregnancyVisit = async (req, res, next) => {
  try {
    const {
      pregnancyId,
      doctorId,
      visitDate,
      weightKg,
      bloodPressure,
      pulseRate,
      temperatureC,
      fetalHeartRate,
      fundalHeightCm,
      symptoms,
      examinationNotes,
      investigations,
      medications,
      riskAssessment,
      recommendations,
      nextVisitDate,
      notes,
    } = req.body;

    if (!pregnancyId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: "pregnancyId and doctorId are required",
      });
    }

    const pregnancy = await PregnancyProfile.findById(pregnancyId);

    if (!pregnancy) {
      return res.status(404).json({
        success: false,
        message: "Pregnancy profile not found",
      });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const actualVisitDate = visitDate || new Date();

    const gestationalAge = calculateGestationalAge(
      pregnancy.lastMenstrualPeriod,
      actualVisitDate
    );

    const visit = await PregnancyVisit.create({
      visitId: generateVisitId(),
      pregnancyId,
      patientId: pregnancy.patientId,
      doctorId,
      visitDate: actualVisitDate,
      gestationalAgeWeeks: gestationalAge.weeks,
      weightKg: weightKg ?? null,
      bloodPressure: bloodPressure || {},
      pulseRate: pulseRate ?? null,
      temperatureC: temperatureC ?? null,
      fetalHeartRate: fetalHeartRate ?? null,
      fundalHeightCm: fundalHeightCm ?? null,
      symptoms: symptoms || [],
      examinationNotes: examinationNotes || "",
      investigations: investigations || [],
      medications: medications || [],
      riskAssessment: riskAssessment || pregnancy.riskLevel,
      recommendations: recommendations || "",
      nextVisitDate: nextVisitDate || null,
      notes: notes || "",
      recordedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Pregnancy visit recorded successfully",
      data: {
        visit,
        gestationalAge,
        trimester: calculateTrimester(gestationalAge.weeks),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get pregnancy visits
const getPregnancyVisits = async (req, res, next) => {
  try {
    const pregnancy = await PregnancyProfile.findById(req.params.id);

    if (!pregnancy) {
      return res.status(404).json({
        success: false,
        message: "Pregnancy profile not found",
      });
    }

    if (req.user.role === "PATIENT") {
      const patient = await Patient.findOne({
        userId: req.user._id,
      });

      if (
        !patient ||
        pregnancy.patientId.toString() !== patient._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    const visits = await PregnancyVisit.find({
      pregnancyId: pregnancy._id,
    })
      .populate("doctorId")
      .sort({ visitDate: -1 });

    return res.json({
      success: true,
      data: visits,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPregnancyProfile,
  getMyPregnancyProfile,
  getPregnancyProfileById,
  updatePregnancyProfile,
  createPregnancyVisit,
  getPregnancyVisits,
};
