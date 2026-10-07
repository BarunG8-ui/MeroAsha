const LabRequest = require("../models/LabRequest");
const LabTest = require("../models/LabTest");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

// ============================================================
// GENERATE LAB REQUEST ID
// ============================================================

const generateRequestId = () => {
  return `LAB-${Date.now()
    .toString()
    .slice(-8)}${Math.floor(Math.random() * 10)}`;
};

// ============================================================
// CREATE LABORATORY REQUEST
// Doctor creates a laboratory request
// ============================================================

const createLabRequest = async (req, res, next) => {
  try {
    const {
      patientId,
      appointmentId,
      tests,
      clinicalNotes,
      priority,
    } = req.body;

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (
      !patientId ||
      !tests ||
      !Array.isArray(tests) ||
      tests.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Patient and at least one laboratory test are required.",
      });
    }

    // --------------------------------------------------------
    // FIND DOCTOR
    // IMPORTANT: req.user._id
    // --------------------------------------------------------

    const doctor = await Doctor.findOne({
      userId: req.user._id,
      active: true,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    // --------------------------------------------------------
    // FIND PATIENT
    // --------------------------------------------------------

    const patient = await Patient.findById(patientId);

    if (!patient || !patient.active) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    // --------------------------------------------------------
    // VALIDATE APPOINTMENT
    // --------------------------------------------------------

    if (appointmentId) {
      const appointment =
        await Appointment.findById(appointmentId);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found.",
        });
      }

      if (
        appointment.patientId.toString() !==
          patientId.toString() ||
        appointment.doctorId.toString() !==
          doctor._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Appointment does not belong to this doctor and patient.",
        });
      }
    }

    // --------------------------------------------------------
    // VALIDATE LABORATORY TESTS
    // --------------------------------------------------------

    const testIds = tests.map((test) => test.testId);

    const labTests = await LabTest.find({
      _id: { $in: testIds },
      active: true,
    });

    if (labTests.length !== testIds.length) {
      return res.status(400).json({
        success: false,
        message:
          "One or more laboratory tests are invalid or inactive.",
      });
    }

    // --------------------------------------------------------
    // PREPARE TEST ENTRIES
    // --------------------------------------------------------

    const formattedTests = tests.map((test) => ({
      testId: test.testId,
      instructions: test.instructions || "",
      status: "REQUESTED",
    }));

    // --------------------------------------------------------
    // CREATE LAB REQUEST
    // --------------------------------------------------------

    const labRequest = await LabRequest.create({
      requestId: generateRequestId(),

      patientId,

      doctorId: doctor._id,

      appointmentId: appointmentId || null,

      tests: formattedTests,

      clinicalNotes: clinicalNotes || "",

      priority: priority || "NORMAL",
    });

    // --------------------------------------------------------
    // POPULATE RESPONSE
    // --------------------------------------------------------

    const populatedRequest =
      await LabRequest.findById(labRequest._id)
        .populate(
          "patientId",
          "patientId userId"
        )
        .populate(
          "doctorId",
          "doctorId specialization"
        )
        .populate(
          "tests.testId",
          "name code category sampleType price"
        );

    return res.status(201).json({
      success: true,
      message:
        "Laboratory request created successfully.",
      labRequest: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET MY LABORATORY REQUESTS
// Patient views own laboratory requests
// ============================================================

const getMyLabRequests = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      userId: req.user._id,
      active: true,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    const labRequests = await LabRequest.find({
      patientId: patient._id,
    })
      .populate(
        "doctorId",
        "doctorId specialization"
      )
      .populate(
        "tests.testId",
        "name code category sampleType price"
      )
      .sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      count: labRequests.length,
      labRequests,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET LABORATORY REQUESTS
// Laboratory staff / Admin
// ============================================================

const getLabRequests = async (req, res, next) => {
  try {
    const {
      status,
      priority,
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status.toUpperCase();
    }

    if (priority) {
      filter.priority = priority.toUpperCase();
    }

    const labRequests = await LabRequest.find(filter)
      .populate(
        "patientId",
        "patientId userId bloodGroup"
      )
      .populate(
        "doctorId",
        "doctorId specialization"
      )
      .populate(
        "tests.testId",
        "name code category sampleType price"
      )
      .sort({
        priority: -1,
        requestedAt: 1,
      });

    return res.json({
      success: true,
      count: labRequests.length,
      labRequests,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ONE LABORATORY REQUEST
// ============================================================

const getLabRequestById = async (req, res, next) => {
  try {
    const labRequest =
      await LabRequest.findById(req.params.id)
        .populate(
          "patientId",
          "patientId userId bloodGroup"
        )
        .populate(
          "doctorId",
          "doctorId specialization"
        )
        .populate(
          "tests.testId",
          "name code category sampleType price"
        );

    if (!labRequest) {
      return res.status(404).json({
        success: false,
        message: "Laboratory request not found.",
      });
    }

    // --------------------------------------------------------
    // PATIENT OWNERSHIP CHECK
    // --------------------------------------------------------

    if (req.user.role === "PATIENT") {
      const patient = await Patient.findOne({
        userId: req.user._id,
        active: true,
      });

      if (
        !patient ||
        labRequest.patientId._id.toString() !==
          patient._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not allowed to view this request.",
        });
      }
    }

    return res.json({
      success: true,
      labRequest,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE LABORATORY REQUEST STATUS
// ============================================================

const updateLabRequestStatus = async (
  req,
  res,
  next
) => {
  try {
    const {
      status,
    } = req.body;

    // --------------------------------------------------------
    // ALLOWED STATUSES
    // --------------------------------------------------------

    const allowedStatuses = [
      "REQUESTED",
      "SAMPLE_COLLECTION",
      "PROCESSING",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid laboratory request status.",
      });
    }

    // --------------------------------------------------------
    // FIND REQUEST
    // --------------------------------------------------------

    const labRequest =
      await LabRequest.findById(req.params.id);

    if (!labRequest) {
      return res.status(404).json({
        success: false,
        message:
          "Laboratory request not found.",
      });
    }

    // --------------------------------------------------------
    // UPDATE MAIN REQUEST STATUS
    // --------------------------------------------------------

    labRequest.status = status;

    // --------------------------------------------------------
    // SYNCHRONIZE INDIVIDUAL TEST STATUS
    // --------------------------------------------------------

    const testStatusMap = {
      REQUESTED: "REQUESTED",
      SAMPLE_COLLECTION: "SAMPLE_COLLECTED",
      PROCESSING: "PROCESSING",
      COMPLETED: "COMPLETED",
      CANCELLED: "CANCELLED",
    };

    const testStatus =
      testStatusMap[status];

    if (Array.isArray(labRequest.tests)) {
      labRequest.tests.forEach((test) => {
        test.status = testStatus;
      });
    }

    // --------------------------------------------------------
    // COMPLETION TIME
    // --------------------------------------------------------

    if (status === "COMPLETED") {
      labRequest.completedAt =
        new Date();
    } else {
      labRequest.completedAt = null;
    }

    // --------------------------------------------------------
    // SAVE
    // --------------------------------------------------------

    await labRequest.save();

    // --------------------------------------------------------
    // RETURN UPDATED REQUEST
    // --------------------------------------------------------

    const updatedLabRequest =
      await LabRequest.findById(
        labRequest._id
      )
        .populate(
          "patientId",
          "patientId userId bloodGroup"
        )
        .populate(
          "doctorId",
          "doctorId specialization"
        )
        .populate(
          "tests.testId",
          "name code category sampleType price"
        );

    return res.json({
      success: true,
      message:
        "Laboratory request status updated successfully.",
      labRequest: updatedLabRequest,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createLabRequest,
  getMyLabRequests,
  getLabRequests,
  getLabRequestById,
  updateLabRequestStatus,
};