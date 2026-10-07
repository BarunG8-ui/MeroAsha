const mongoose = require("mongoose");

const BloodIssue = require("../models/BloodIssue");
const BloodRequest = require("../models/BloodRequest");
const BloodInventory = require("../models/BloodInventory");

const generateIssueId = () => {
  return `BIS-${Math.floor(100000 + Math.random() * 900000)}`;
};

// ============================================================
// ISSUE BLOOD
// ============================================================

const issueBlood = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const {
      bloodRequestId,
      unitsToIssue,
      remarks,
    } = req.body;

    if (!bloodRequestId) {
      return res.status(400).json({
        success: false,
        message: "Blood request ID is required",
      });
    }

    session.startTransaction();

    const bloodRequest = await BloodRequest.findById(
      bloodRequestId
    ).session(session);

    if (!bloodRequest) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      });
    }

    if (
      !["APPROVED", "PARTIALLY_FULFILLED"].includes(
        bloodRequest.status
      )
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Blood request must be approved before blood can be issued",
      });
    }

    // ----------------------------------------------------------
    // Calculate already issued units
    // ----------------------------------------------------------

    const previousIssues = await BloodIssue.find({
      bloodRequestId: bloodRequest._id,
      status: "ISSUED",
    }).session(session);

    const alreadyIssued = previousIssues.reduce(
      (total, issue) => total + issue.unitsIssued,
      0
    );

    const remainingUnits =
      bloodRequest.unitsRequired - alreadyIssued;

    if (remainingUnits <= 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "This blood request has already been fulfilled",
      });
    }

    const requestedUnits =
      unitsToIssue === undefined
        ? remainingUnits
        : Number(unitsToIssue);

    if (
      !Number.isInteger(requestedUnits) ||
      requestedUnits <= 0
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Units to issue must be a positive integer",
      });
    }

    if (requestedUnits > remainingUnits) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: `Only ${remainingUnits} unit(s) remain to be fulfilled`,
      });
    }

    // ----------------------------------------------------------
    // Find eligible inventory
    // FEFO = First Expiry, First Out
    // ----------------------------------------------------------

    const now = new Date();

    const inventory = await BloodInventory.find({
      bloodGroup: bloodRequest.bloodGroup,
      componentType: bloodRequest.componentType,
      active: true,
      expiryDate: { $gt: now },
      unitsAvailable: { $gt: 0 },
      status: {
        $in: ["AVAILABLE", "LOW_STOCK"],
      },
    })
      .sort({ expiryDate: 1 })
      .session(session);

    if (!inventory.length) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "No suitable blood inventory is currently available",
      });
    }

    // ----------------------------------------------------------
    // Allocate units across inventory batches
    // ----------------------------------------------------------

    let remainingToAllocate = requestedUnits;

    const allocations = [];

    for (const stock of inventory) {
      if (remainingToAllocate <= 0) {
        break;
      }

      const unitsFromThisStock = Math.min(
        stock.unitsAvailable,
        remainingToAllocate
      );

      stock.unitsAvailable -= unitsFromThisStock;

      // --------------------------------------------------------
      // Update inventory status
      // --------------------------------------------------------

      if (stock.unitsAvailable === 0) {
        stock.status = "UNAVAILABLE";
        stock.active = false;
      } else if (
        stock.unitsAvailable <= stock.minimumRequiredUnits
      ) {
        stock.status = "LOW_STOCK";
      } else {
        stock.status = "AVAILABLE";
      }

      stock.lastUpdatedBy = req.user.userId;

      await stock.save({ session });

      allocations.push({
        inventoryId: stock._id,
        unitsIssued: unitsFromThisStock,
      });

      remainingToAllocate -= unitsFromThisStock;
    }

    // ----------------------------------------------------------
    // Not enough blood available
    // ----------------------------------------------------------

    if (remainingToAllocate > 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Insufficient blood inventory to fulfill this issue",
      });
    }

    // ----------------------------------------------------------
    // Create blood issue
    // ----------------------------------------------------------

    const issueId = generateIssueId();

    const [bloodIssue] = await BloodIssue.create(
      [
        {
          issueId,
          bloodRequestId: bloodRequest._id,
          patientId: bloodRequest.patientId,
          bloodGroup: bloodRequest.bloodGroup,
          componentType: bloodRequest.componentType,
          unitsIssued: requestedUnits,
          allocations,
          issuedBy: req.user.userId,
          status: "ISSUED",
          issuedAt: new Date(),
          remarks: remarks || "",
        },
      ],
      { session }
    );

    // ----------------------------------------------------------
    // Calculate total fulfilled units
    // ----------------------------------------------------------

    const allIssues = await BloodIssue.find({
      bloodRequestId: bloodRequest._id,
      status: "ISSUED",
    }).session(session);

    const totalIssued = allIssues.reduce(
      (total, issue) => total + issue.unitsIssued,
      0
    );

    // ----------------------------------------------------------
    // Update blood request
    // ----------------------------------------------------------

    if (totalIssued >= bloodRequest.unitsRequired) {
      bloodRequest.status = "FULFILLED";
      bloodRequest.fulfilledAt = new Date();
    } else {
      bloodRequest.status = "PARTIALLY_FULFILLED";
    }

    await bloodRequest.save({ session });

    await session.commitTransaction();

    const populatedIssue = await BloodIssue.findById(
      bloodIssue._id
    )
      .populate("patientId")
      .populate("bloodRequestId")
      .populate("issuedBy", "name email role")
      .populate("allocations.inventoryId");

    res.status(201).json({
      success: true,
      message: "Blood issued successfully",
      issue: populatedIssue,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// ============================================================
// GET BLOOD ISSUES
// ============================================================

const getBloodIssues = async (req, res, next) => {
  try {
    const issues = await BloodIssue.find()
      .populate("patientId")
      .populate("bloodRequestId")
      .populate("issuedBy", "name email role")
      .populate("allocations.inventoryId")
      .sort({ issuedAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET MY BLOOD ISSUES
// ============================================================

const getMyBloodIssues = async (req, res, next) => {
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

    const issues = await BloodIssue.find({
      patientId: patient._id,
    })
      .populate("bloodRequestId")
      .populate("issuedBy", "name email role")
      .populate("allocations.inventoryId")
      .sort({ issuedAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET BLOOD ISSUE BY ID
// ============================================================

const getBloodIssueById = async (req, res, next) => {
  try {
    const issue = await BloodIssue.findById(req.params.id)
      .populate("patientId")
      .populate("bloodRequestId")
      .populate("issuedBy", "name email role")
      .populate("allocations.inventoryId");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Blood issue not found",
      });
    }

    // Patient can only access their own issue
    if (req.user.role === "PATIENT") {
      const Patient = require("../models/Patient");

      const patient = await Patient.findOne({
        userId: req.user.userId,
      });

      if (
        !patient ||
        issue.patientId._id.toString() !==
          patient._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view this blood issue",
        });
      }
    }

    res.status(200).json({
      success: true,
      issue,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  issueBlood,
  getBloodIssues,
  getMyBloodIssues,
  getBloodIssueById,
};