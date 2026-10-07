const Prescription = require("../models/Prescription");
const Medicine = require("../models/Medicine");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

const generatePrescriptionId = () => {
  return `PRE-${Math.floor(100000 + Math.random() * 900000)}`;
};

// ============================================================
// CREATE PRESCRIPTION
// ============================================================

const createPrescription = async (req, res, next) => {
  try {
    const {
      patientId,
      doctorId,
      consultationId,
      medicines,
      notes,
    } = req.body;

    if (
      !patientId ||
      !doctorId ||
      !medicines ||
      !Array.isArray(medicines) ||
      medicines.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Patient, doctor and at least one medicine are required",
      });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const processedMedicines = [];

    for (const item of medicines) {
      if (
        !item.medicineId ||
        !item.dosage ||
        !item.frequency ||
        !item.duration ||
        item.quantity === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each medicine requires medicineId, dosage, frequency, duration and quantity",
        });
      }

      const medicine = await Medicine.findById(item.medicineId);

      if (!medicine || !medicine.active) {
        return res.status(404).json({
          success: false,
          message: `Medicine not found or inactive: ${item.medicineId}`,
        });
      }

      processedMedicines.push({
        medicineId: medicine._id,
        medicineName: `${medicine.name} ${medicine.strength}`,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        quantity: item.quantity,
        instructions: item.instructions || "",
      });
    }

    const prescription = await Prescription.create({
      prescriptionId: generatePrescriptionId(),
      patientId,
      doctorId,
      consultationId: consultationId || null,
      medicines: processedMedicines,
      notes: notes || "",
      status: "ACTIVE",
    });

    const populatedPrescription =
      await Prescription.findById(prescription._id)
        .populate(
          "patientId",
          "patientId userId dateOfBirth gender bloodGroup"
        )
        .populate(
          "doctorId",
          "doctorId specialization qualification"
        );

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription: populatedPrescription,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PATIENT PRESCRIPTION HISTORY
// ============================================================

const getMyPrescriptions = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      userId: req.user.userId,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const prescriptions = await Prescription.find({
      patientId: patient._id,
    })
      .populate(
        "doctorId",
        "doctorId specialization qualification"
      )
      .sort({ prescribedAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET PRESCRIPTION BY ID
// ============================================================

const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(
      req.params.id
    )
      .populate(
        "patientId",
        "patientId userId dateOfBirth gender bloodGroup"
      )
      .populate(
        "doctorId",
        "doctorId specialization qualification"
      );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// CANCEL PRESCRIPTION
// ============================================================

const cancelPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(
      req.params.id
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    if (prescription.status === "DISPENSED") {
      return res.status(400).json({
        success: false,
        message: "A dispensed prescription cannot be cancelled",
      });
    }

    prescription.status = "CANCELLED";

    await prescription.save();

    res.status(200).json({
      success: true,
      message: "Prescription cancelled successfully",
      prescription,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createPrescription,
  getMyPrescriptions,
  getPrescriptionById,
  cancelPrescription,
};