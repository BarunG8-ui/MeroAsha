const EmergencyRequest = require("../models/EmergencyRequest");
const Ambulance = require("../models/Ambulance");
const AmbulanceDriver = require("../models/AmbulanceDriver");
const Patient = require("../models/Patient");

const generateEmergencyId = () => {
  return `EMR-${Math.floor(100000 + Math.random() * 900000)}`;
};

// CREATE EMERGENCY REQUEST
const createEmergencyRequest = async (req, res, next) => {
  try {
    const {
      patientId,
      patientName,
      patientPhone,
      emergencyType,
      severity,
      pickupLocation,
      destinationHospital,
      medicalNotes,
      remarks,
    } = req.body;

    if (!patientName) {
      return res.status(400).json({
        success: false,
        message: "Patient name is required",
      });
    }

    if (!emergencyType) {
      return res.status(400).json({
        success: false,
        message: "Emergency type is required",
      });
    }

    if (!severity) {
      return res.status(400).json({
        success: false,
        message: "Severity is required",
      });
    }

    if (!pickupLocation || !pickupLocation.address) {
      return res.status(400).json({
        success: false,
        message: "Pickup location address is required",
      });
    }

    if (!destinationHospital) {
      return res.status(400).json({
        success: false,
        message: "Destination hospital is required",
      });
    }

    if (patientId) {
      const patient = await Patient.findById(patientId);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }
    }

    let emergencyId = generateEmergencyId();

    while (await EmergencyRequest.findOne({ emergencyId })) {
      emergencyId = generateEmergencyId();
    }

    const emergency = await EmergencyRequest.create({
      emergencyId,
      patientId: patientId || null,
      requestedBy: req.user._id,
      patientName,
      patientPhone: patientPhone || "",
      emergencyType,
      severity,
      pickupLocation,
      destinationHospital,
      medicalNotes: medicalNotes || "",
      remarks: remarks || "",
      status: "REQUESTED",
    });

    res.status(201).json({
      success: true,
      message: "Emergency request created successfully",
      data: emergency,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL EMERGENCY REQUESTS
const getEmergencyRequests = async (req, res, next) => {
  try {
    const { status, severity } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (severity) {
      filter.severity = severity;
    }

    const emergencies = await EmergencyRequest.find(filter)
      .populate("patientId")
      .populate("requestedBy", "name email role")
      .populate("ambulanceId")
      .populate("driverId")
      .sort({ requestedAt: -1 });

    res.json({
      success: true,
      count: emergencies.length,
      data: emergencies,
    });
  } catch (error) {
    next(error);
  }
};

// GET MY EMERGENCY REQUESTS
const getMyEmergencyRequests = async (req, res, next) => {
  try {
    const emergencies = await EmergencyRequest.find({
      requestedBy: req.user._id,
    })
      .populate("ambulanceId")
      .populate("driverId")
      .sort({ requestedAt: -1 });

    res.json({
      success: true,
      count: emergencies.length,
      data: emergencies,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE EMERGENCY REQUEST
const getEmergencyRequestById = async (req, res, next) => {
  try {
    const emergency = await EmergencyRequest.findById(req.params.id)
      .populate("patientId")
      .populate("requestedBy", "name email role")
      .populate("ambulanceId")
      .populate("driverId");

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found",
      });
    }

    if (
      req.user.role === "PATIENT" &&
      emergency.requestedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this emergency request",
      });
    }

    res.json({
      success: true,
      data: emergency,
    });
  } catch (error) {
    next(error);
  }
};

// GET AVAILABLE AMBULANCES
const getAvailableEmergencyAmbulances = async (req, res, next) => {
  try {
    const ambulances = await Ambulance.find({
      status: "AVAILABLE",
      active: true,
    })
      .populate("driverId")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: ambulances.length,
      data: ambulances,
    });
  } catch (error) {
    next(error);
  }
};

// DISPATCH EMERGENCY
const dispatchEmergency = async (req, res, next) => {
  try {
    const emergency = await EmergencyRequest.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found",
      });
    }

    if (emergency.status !== "REQUESTED") {
      return res.status(400).json({
        success: false,
        message: `Emergency request cannot be dispatched from ${emergency.status} status`,
      });
    }

    const { ambulanceId } = req.body;

    if (!ambulanceId) {
      return res.status(400).json({
        success: false,
        message: "Ambulance ID is required",
      });
    }

    const ambulance = await Ambulance.findById(ambulanceId);

    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: "Ambulance not found",
      });
    }

    if (ambulance.status !== "AVAILABLE" || !ambulance.active) {
      return res.status(400).json({
        success: false,
        message: "Ambulance is not available",
      });
    }

    if (!ambulance.driverId) {
      return res.status(400).json({
        success: false,
        message: "No driver assigned to this ambulance",
      });
    }

    const driver = await AmbulanceDriver.findById(ambulance.driverId);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Ambulance driver not found",
      });
    }

    if (
      driver.availabilityStatus === "ON_TRIP" ||
      driver.availabilityStatus === "UNAVAILABLE"
    ) {
      return res.status(400).json({
        success: false,
        message: "Driver is not available",
      });
    }

    ambulance.status = "DISPATCHED";
    await ambulance.save();

    driver.availabilityStatus = "ON_TRIP";
    await driver.save();

    emergency.ambulanceId = ambulance._id;
    emergency.driverId = driver._id;
    emergency.status = "DISPATCHED";
    emergency.dispatchedAt = new Date();

    await emergency.save();

    const updatedEmergency = await EmergencyRequest.findById(emergency._id)
      .populate("ambulanceId")
      .populate("driverId");

    res.json({
      success: true,
      message: "Emergency ambulance dispatched successfully",
      data: updatedEmergency,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE EMERGENCY STATUS
const updateEmergencyStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;

    const allowedStatuses = [
      "REQUESTED",
      "DISPATCHED",
      "EN_ROUTE",
      "ARRIVED",
      "PATIENT_PICKED_UP",
      "AT_HOSPITAL",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid emergency status",
      });
    }

    const emergency = await EmergencyRequest.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found",
      });
    }

    if (
      emergency.status === "COMPLETED" ||
      emergency.status === "CANCELLED"
    ) {
      return res.status(400).json({
        success: false,
        message: `Emergency request is already ${emergency.status}`,
      });
    }

    emergency.status = status;

    if (status === "ARRIVED") {
      emergency.arrivedAt = new Date();
    }

    if (status === "COMPLETED") {
      emergency.completedAt = new Date();
    }

    if (status === "CANCELLED") {
      emergency.cancellationReason = cancellationReason || "";
    }

    await emergency.save();

    // Synchronize ambulance and driver status
    if (emergency.ambulanceId) {
      const ambulance = await Ambulance.findById(emergency.ambulanceId);

      if (ambulance) {
        if (
          ["DISPATCHED", "EN_ROUTE", "ARRIVED", "PATIENT_PICKED_UP"].includes(
            status
          )
        ) {
          ambulance.status = "ON_TRIP";
        }

        if (status === "AT_HOSPITAL") {
          ambulance.status = "RETURNING";
        }

        if (status === "COMPLETED" || status === "CANCELLED") {
          ambulance.status = "AVAILABLE";
        }

        await ambulance.save();
      }
    }

    if (emergency.driverId) {
      const driver = await AmbulanceDriver.findById(emergency.driverId);

      if (driver) {
        if (
          ["DISPATCHED", "EN_ROUTE", "ARRIVED", "PATIENT_PICKED_UP"].includes(
            status
          )
        ) {
          driver.availabilityStatus = "ON_TRIP";
        }

        if (status === "COMPLETED" || status === "CANCELLED") {
          driver.availabilityStatus = "AVAILABLE";
        }

        await driver.save();
      }
    }

    const updatedEmergency = await EmergencyRequest.findById(emergency._id)
      .populate("ambulanceId")
      .populate("driverId");

    res.json({
      success: true,
      message: "Emergency status updated successfully",
      data: updatedEmergency,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmergencyRequest,
  getEmergencyRequests,
  getMyEmergencyRequests,
  getEmergencyRequestById,
  getAvailableEmergencyAmbulances,
  dispatchEmergency,
  updateEmergencyStatus,
};