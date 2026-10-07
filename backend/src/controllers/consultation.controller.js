const mongoose = require("mongoose");

const Consultation = require("../models/Consultation");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");


// ============================================================
// GENERATE CONSULTATION ID
// ============================================================

const generateConsultationId = async () => {
  let consultationId;
  let exists = true;

  while (exists) {
    const randomNumber =
      Math.floor(100000 + Math.random() * 900000);

    consultationId = `CON-${randomNumber}`;

    exists = await Consultation.findOne({
      consultationId,
    });
  }

  return consultationId;
};


// ============================================================
// CREATE CONSULTATION
// ============================================================

const createConsultation = async (req, res, next) => {
  try {
    const {
      appointmentId,
      symptoms,
      diagnosis,
      clinicalNotes,
      treatmentPlan,
      vitals,
    } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(
      appointmentId
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled appointment cannot start consultation",
      });
    }

    if (appointment.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Appointment is already completed",
      });
    }

    const existingConsultation =
      await Consultation.findOne({
        appointmentId: appointment._id,
      });

    if (existingConsultation) {
      return res.status(409).json({
        success: false,
        message:
          "Consultation already exists for this appointment",
        consultation: existingConsultation,
      });
    }

    const consultationId =
      await generateConsultationId();

    const consultation =
      await Consultation.create({
        consultationId,

        appointmentId: appointment._id,

        patientId: appointment.patientId,

        doctorId: appointment.doctorId,

        departmentId: appointment.departmentId,

        symptoms: symptoms?.trim() || "",

        diagnosis: diagnosis?.trim() || "",

        clinicalNotes:
          clinicalNotes?.trim() || "",

        treatmentPlan:
          treatmentPlan?.trim() || "",

        vitals: vitals || {},

        status: "IN_PROGRESS",

        startedAt: new Date(),

        createdBy: req.user._id,
      });

    appointment.status =
      "IN_CONSULTATION";

    appointment.consultationStartedAt =
      new Date();

    await appointment.save();

    const populatedConsultation =
      await Consultation.findById(
        consultation._id
      )
        .populate(
          "patientId",
          "patientId dateOfBirth gender bloodGroup phone"
        )
        .populate({
          path: "doctorId",
          select:
            "doctorId specialization qualification consultationFee userId",
          populate: {
            path: "userId",
            select: "name email phone",
          },
        })
        .populate(
          "departmentId",
          "name code location floor"
        )
        .populate(
          "appointmentId",
          "appointmentId appointmentDate timeSlot status"
        );

    return res.status(201).json({
      success: true,
      message:
        "Consultation started successfully",
      consultation: populatedConsultation,
    });
  } catch (error) {
    next(error);
  }
};


// ============================================================
// GET CONSULTATION BY APPOINTMENT
// ============================================================
// NEW MODULE
// Used by Doctor Consultation frontend
// ============================================================

const getConsultationByAppointment = async (
  req,
  res,
  next
) => {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        appointmentId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const consultation =
      await Consultation.findOne({
        appointmentId,
      })
        .populate(
          "patientId",
          "patientId dateOfBirth gender bloodGroup phone address allergies chronicConditions"
        )
        .populate({
          path: "doctorId",
          select:
            "doctorId specialization qualification consultationFee userId",
          populate: {
            path: "userId",
            select: "name email phone",
          },
        })
        .populate(
          "departmentId",
          "name code location floor"
        )
        .populate(
          "appointmentId",
          "appointmentId appointmentDate timeSlot reason notes status"
        );

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    return res.status(200).json({
      success: true,
      consultation,
    });
  } catch (error) {
    next(error);
  }
};


// ============================================================
// GET CONSULTATION BY ID
// ============================================================

const getConsultationById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid consultation ID",
      });
    }

    const consultation =
      await Consultation.findById(id)
        .populate(
          "patientId",
          "patientId dateOfBirth gender bloodGroup phone"
        )
        .populate({
          path: "doctorId",
          select:
            "doctorId specialization qualification consultationFee userId",
          populate: {
            path: "userId",
            select: "name email phone",
          },
        })
        .populate(
          "departmentId",
          "name code location floor"
        )
        .populate(
          "appointmentId",
          "appointmentId appointmentDate timeSlot status"
        );

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    return res.json({
      success: true,
      consultation,
    });
  } catch (error) {
    next(error);
  }
};


// ============================================================
// UPDATE CONSULTATION
// ============================================================

const updateConsultation = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid consultation ID",
      });
    }

    const {
      symptoms,
      diagnosis,
      clinicalNotes,
      treatmentPlan,
      vitals,
    } = req.body;

    const consultation =
      await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    if (
      consultation.status === "COMPLETED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Completed consultation cannot be modified",
      });
    }

    if (symptoms !== undefined) {
      consultation.symptoms =
        symptoms.trim();
    }

    if (diagnosis !== undefined) {
      consultation.diagnosis =
        diagnosis.trim();
    }

    if (clinicalNotes !== undefined) {
      consultation.clinicalNotes =
        clinicalNotes.trim();
    }

    if (treatmentPlan !== undefined) {
      consultation.treatmentPlan =
        treatmentPlan.trim();
    }

    if (vitals !== undefined) {
      consultation.vitals = {
        ...consultation.vitals?.toObject?.(),
        ...vitals,
      };
    }

    consultation.updatedBy =
      req.user._id;

    await consultation.save();

    const updatedConsultation =
      await Consultation.findById(
        consultation._id
      )
        .populate(
          "patientId",
          "patientId dateOfBirth gender bloodGroup phone"
        )
        .populate({
          path: "doctorId",
          select:
            "doctorId specialization qualification consultationFee userId",
          populate: {
            path: "userId",
            select: "name email phone",
          },
        })
        .populate(
          "departmentId",
          "name code location floor"
        )
        .populate(
          "appointmentId",
          "appointmentId appointmentDate timeSlot status"
        );

    return res.json({
      success: true,
      message:
        "Consultation updated successfully",
      consultation: updatedConsultation,
    });
  } catch (error) {
    next(error);
  }
};


// ============================================================
// COMPLETE CONSULTATION
// ============================================================

const completeConsultation = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid consultation ID",
      });
    }

    const consultation =
      await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    if (
      consultation.status === "COMPLETED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Consultation is already completed",
      });
    }

    consultation.status = "COMPLETED";

    consultation.completedAt =
      new Date();

    consultation.updatedBy =
      req.user._id;

    await consultation.save();

    const appointment =
      await Appointment.findById(
        consultation.appointmentId
      );

    if (appointment) {
      appointment.status =
        "COMPLETED";

      appointment.completedAt =
        new Date();

      await appointment.save();
    }

    return res.json({
      success: true,
      message:
        "Consultation completed successfully",
      consultation,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};


// ============================================================
// GET PATIENT CONSULTATIONS
// ============================================================

const getPatientConsultations = async (
  req,
  res,
  next
) => {
  try {
    const patient =
      await Patient.findOne({
        userId: req.user._id,
        active: true,
      });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const consultations =
      await Consultation.find({
        patientId: patient._id,
      })
        .populate({
          path: "doctorId",
          select:
            "doctorId specialization qualification consultationFee userId",
          populate: {
            path: "userId",
            select: "name email phone",
          },
        })
        .populate(
          "departmentId",
          "name code"
        )
        .populate(
          "appointmentId",
          "appointmentId appointmentDate timeSlot status"
        )
        .sort({
          createdAt: -1,
        });

    return res.json({
      success: true,
      count: consultations.length,
      consultations,
    });
  } catch (error) {
    next(error);
  }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createConsultation,

  // NEW
  getConsultationByAppointment,

  getConsultationById,

  updateConsultation,

  completeConsultation,

  getPatientConsultations,
};