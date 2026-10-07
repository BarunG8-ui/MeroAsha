const BloodRequest = require("../models/BloodRequest");
const Patient = require("../models/Patient");

const generateRequestId = () => {
  return `BRQ-${Math.floor(100000 + Math.random() * 900000)}`;
};

// ============================================================
// CREATE BLOOD REQUEST
// ============================================================

const createBloodRequest = async (req, res, next) => {
  try {
    const {
      patientId,
      bloodGroup,
      componentType,
      unitsRequired,
      urgency,
      reason,
      requiredBy,
      remarks,
    } = req.body;

    if (
      !patientId ||
      !bloodGroup ||
      !componentType ||
      !unitsRequired ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Patient ID, blood group, component type, units required and reason are required",
      });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const request = await BloodRequest.create({
      requestId: generateRequestId(),
      patientId: patient._id,
      requestedBy: req.user.userId,
      bloodGroup,
      componentType,
      unitsRequired,
      urgency: urgency || "NORMAL",
      reason,
      requiredBy: requiredBy || null,
      status: "REQUESTED",
      remarks: remarks || "",
    });

    const populatedRequest = await BloodRequest.findById(request._id)
      .populate("patientId", "patientId userId dateOfBirth gender bloodGroup")
      .populate("requestedBy", "name email role");

    res.status(201).json({
      success: true,
      message: "Blood request created successfully",
      request: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ALL BLOOD REQUESTS
// ============================================================

const getBloodRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.find()
      .populate(
        "patientId",
        "patientId userId dateOfBirth gender bloodGroup"
      )
      .populate("requestedBy", "name email role")
      .populate("approvedBy", "name email role")
      .sort({
        urgency: -1,
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET MY BLOOD REQUESTS
// ============================================================

const getMyBloodRequests = async (req, res, next) => {
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

    const requests = await BloodRequest.find({
      patientId: patient._id,
    })
      .populate("requestedBy", "name email role")
      .populate("approvedBy", "name email role")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET BLOOD REQUEST BY ID
// ============================================================

const getBloodRequestById = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate(
        "patientId",
        "patientId userId dateOfBirth gender bloodGroup"
      )
      .populate("requestedBy", "name email role")
      .populate("approvedBy", "name email role");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      });
    }

    res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE BLOOD REQUEST STATUS
// ============================================================

const updateBloodRequestStatus = async (req, res, next) => {
  try {
    const {
      status,
      remarks,
    } = req.body;

    const allowedStatuses = [
      "REQUESTED",
      "APPROVED",
      "PARTIALLY_FULFILLED",
      "FULFILLED",
      "REJECTED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood request status",
      });
    }

    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      });
    }

    request.status = status;

    if (remarks !== undefined) {
      request.remarks = remarks;
    }

    if (status === "APPROVED") {
      request.approvedBy = req.user.userId;
      request.approvedAt = new Date();
    }

    if (status === "FULFILLED") {
      request.fulfilledAt = new Date();
    }

    await request.save();

    const updatedRequest = await BloodRequest.findById(request._id)
      .populate(
        "patientId",
        "patientId userId dateOfBirth gender bloodGroup"
      )
      .populate("requestedBy", "name email role")
      .populate("approvedBy", "name email role");

    res.status(200).json({
      success: true,
      message: "Blood request status updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBloodRequest,
  getBloodRequests,
  getMyBloodRequests,
  getBloodRequestById,
  updateBloodRequestStatus,
};