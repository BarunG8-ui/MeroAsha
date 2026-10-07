const mongoose = require("mongoose");

const Prescription = require("../models/Prescription");
const MedicineStock = require("../models/MedicineStock");
const PharmacyTransaction = require("../models/PharmacyTransaction");

// ============================================================
// GENERATE TRANSACTION ID
// ============================================================

const generateTransactionId = () => {
  return `PHM-${Math.floor(100000 + Math.random() * 900000)}`;
};

// ============================================================
// GET ACTIVE PRESCRIPTIONS
// ============================================================

const getActivePrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({
      status: {
        $in: ["ACTIVE", "PARTIALLY_DISPENSED"],
      },
    })
      .populate(
        "patientId",
        "patientId userId dateOfBirth gender bloodGroup"
      )
      .populate(
        "doctorId",
        "doctorId specialization qualification"
      )
      .sort({
        prescribedAt: 1,
      });

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
// DISPENSE PRESCRIPTION
// ============================================================

const dispensePrescription = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { prescriptionId, notes } = req.body;

    if (!prescriptionId) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Prescription ID is required",
      });
    }

    const prescription = await Prescription.findById(
      prescriptionId
    ).session(session);

    if (!prescription) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    if (
      !["ACTIVE", "PARTIALLY_DISPENSED"].includes(
        prescription.status
      )
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "This prescription cannot be dispensed",
      });
    }

    const transactionItems = [];

    let totalAmount = 0;

    // ----------------------------------------------------------
    // PROCESS EACH PRESCRIBED MEDICINE
    // ----------------------------------------------------------

    for (const prescribedMedicine of prescription.medicines) {
      const requiredQuantity =
        prescribedMedicine.quantity;

      // Find the earliest-expiring active stock
      const stock = await MedicineStock.findOne({
        medicineId: prescribedMedicine.medicineId,
        active: true,
        availableQuantity: {
          $gte: requiredQuantity,
        },
        expiryDate: {
          $gt: new Date(),
        },
      })
        .sort({
          expiryDate: 1,
        })
        .session(session);

      if (!stock) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            `Insufficient stock for ${prescribedMedicine.medicineName}`,
        });
      }

      const medicineTotal =
        stock.sellingPrice * requiredQuantity;

      totalAmount += medicineTotal;

      transactionItems.push({
        medicineId: prescribedMedicine.medicineId,
        stockId: stock._id,
        medicineName: prescribedMedicine.medicineName,
        batchNumber: stock.batchNumber,
        quantity: requiredQuantity,
        unitPrice: stock.sellingPrice,
        totalPrice: medicineTotal,
      });

      // --------------------------------------------------------
      // DEDUCT STOCK
      // --------------------------------------------------------

      stock.availableQuantity -= requiredQuantity;

      await stock.save({
        session,
      });

      // Automatically deactivate empty stock
      if (stock.availableQuantity === 0) {
        stock.active = false;

        await stock.save({
          session,
        });
      }
    }

    // ----------------------------------------------------------
    // CREATE PHARMACY TRANSACTION
    // ----------------------------------------------------------

    const transaction =
      await PharmacyTransaction.create(
        [
          {
            transactionId: generateTransactionId(),

            prescriptionId:
              prescription._id,

            patientId:
              prescription.patientId,

            dispensedBy:
              req.user.userId,

            items: transactionItems,

            totalAmount,

            paymentStatus: "PENDING",

            dispensingStatus: "DISPENSED",

            notes: notes || "",

            dispensedAt: new Date(),
          },
        ],
        {
          session,
        }
      );

    // ----------------------------------------------------------
    // UPDATE PRESCRIPTION
    // ----------------------------------------------------------

    prescription.status = "DISPENSED";

    prescription.dispensedAt = new Date();

    await prescription.save({
      session,
    });

    await session.commitTransaction();

    const populatedTransaction =
      await PharmacyTransaction.findById(
        transaction[0]._id
      )
        .populate(
          "prescriptionId",
          "prescriptionId status"
        )
        .populate(
          "patientId",
          "patientId userId"
        )
        .populate(
          "dispensedBy",
          "name email role"
        );

    res.status(201).json({
      success: true,
      message:
        "Prescription dispensed successfully",
      transaction:
        populatedTransaction,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};

// ============================================================
// GET PHARMACY TRANSACTION BY ID
// ============================================================

const getPharmacyTransactionById = async (
  req,
  res,
  next
) => {
  try {
    const transaction =
      await PharmacyTransaction.findById(
        req.params.id
      )
        .populate(
          "prescriptionId",
          "prescriptionId status"
        )
        .populate(
          "patientId",
          "patientId userId"
        )
        .populate(
          "dispensedBy",
          "name email role"
        );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PATIENT PHARMACY HISTORY
// ============================================================

const getMyPharmacyHistory = async (
  req,
  res,
  next
) => {
  try {
    const Patient = require("../models/Patient");

    const patient = await Patient.findOne({
      userId: req.user.userId,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const transactions =
      await PharmacyTransaction.find({
        patientId: patient._id,
      })
        .populate(
          "prescriptionId",
          "prescriptionId status"
        )
        .populate(
          "dispensedBy",
          "name role"
        )
        .sort({
          dispensedAt: -1,
        });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getActivePrescriptions,
  dispensePrescription,
  getPharmacyTransactionById,
  getMyPharmacyHistory,
};