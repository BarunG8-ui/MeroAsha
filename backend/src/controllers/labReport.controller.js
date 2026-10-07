const LabReport = require("../models/LabReport");
const LabRequest = require("../models/LabRequest");
const Patient = require("../models/Patient");

// ============================================================
// GENERATE REPORT ID
// ============================================================

const generateReportId = () => {
  return `REP-${Date.now()
    .toString()
    .slice(-8)}${Math.floor(Math.random() * 10)}`;
};

// ============================================================
// CREATE LABORATORY REPORT
// ============================================================

const createLabReport = async (req, res, next) => {
  try {
    const {
      labRequestId,
      testId,
      result,
      unit,
      referenceRange,
      interpretation,
      remarks,
    } = req.body;

    if (!labRequestId || !testId) {
      return res.status(400).json({
        success: false,
        message: "Laboratory request and test are required.",
      });
    }

    // --------------------------------------------------------
    // FIND LAB REQUEST
    // --------------------------------------------------------

    const labRequest = await LabRequest.findById(labRequestId);

    if (!labRequest) {
      return res.status(404).json({
        success: false,
        message: "Laboratory request not found.",
      });
    }

    // --------------------------------------------------------
    // CHECK REQUESTED TEST
    // --------------------------------------------------------

    const requestedTest = labRequest.tests.find(
      (test) =>
        test.testId &&
        test.testId.toString() === testId.toString()
    );

    if (!requestedTest) {
      return res.status(400).json({
        success: false,
        message:
          "This test is not included in the laboratory request.",
      });
    }

    // --------------------------------------------------------
    // PREVENT DUPLICATE REPORT
    // --------------------------------------------------------

    const existingReport = await LabReport.findOne({
      labRequestId,
      testId,
    });

    if (existingReport) {
      return res.status(409).json({
        success: false,
        message: "A report already exists for this test.",
      });
    }

    // --------------------------------------------------------
    // CREATE REPORT
    // --------------------------------------------------------

    const report = await LabReport.create({
      reportId: generateReportId(),

      labRequestId,

      patientId: labRequest.patientId,

      testId,

      result: result || "",

      unit: unit || "",

      referenceRange: referenceRange || "",

      interpretation: interpretation || "",

      remarks: remarks || "",

      // IMPORTANT:
      // authenticate middleware stores the User document
      // in req.user, so use req.user._id
      performedBy: req.user._id,
    });

    // --------------------------------------------------------
    // UPDATE INDIVIDUAL TEST STATUS
    // --------------------------------------------------------

    requestedTest.status = "COMPLETED";

    await labRequest.save();

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    const populatedReport = await LabReport.findById(
      report._id
    )
      .populate(
        "patientId",
        "patientId userId bloodGroup"
      )
      .populate(
        "testId",
        "name code category sampleType price"
      )
      .populate(
        "labRequestId",
        "requestId priority status requestedAt"
      );

    return res.status(201).json({
      success: true,
      message: "Laboratory report created successfully.",
      report: populatedReport,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PATIENT - GET MY LAB REPORTS
// ============================================================

const getMyLabReports = async (req, res, next) => {
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

    const reports = await LabReport.find({
      patientId: patient._id,
    })
      .populate(
        "testId",
        "name code category sampleType"
      )
      .populate(
        "labRequestId",
        "requestId priority status requestedAt"
      )
      .populate(
        "performedBy",
        "name email role"
      )
      .populate(
        "verifiedBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET LAB REPORT BY ID
// ============================================================

const getLabReportById = async (req, res, next) => {
  try {
    const report = await LabReport.findById(req.params.id)
      .populate(
        "testId",
        "name code category sampleType"
      )
      .populate(
        "labRequestId",
        "requestId priority status requestedAt"
      )
      .populate(
        "patientId",
        "patientId userId bloodGroup"
      )
      .populate(
        "performedBy",
        "name email role"
      )
      .populate(
        "verifiedBy",
        "name email role"
      );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Laboratory report not found.",
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
        report.patientId._id.toString() !==
          patient._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not allowed to view this report.",
        });
      }
    }

    return res.json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// FINALIZE LABORATORY REPORT
// ============================================================

const finalizeLabReport = async (req, res, next) => {
  try {
    const report = await LabReport.findById(
      req.params.id
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Laboratory report not found.",
      });
    }

    // --------------------------------------------------------
    // FINALIZE
    // --------------------------------------------------------

    report.reportStatus = "FINAL";

    report.verifiedBy = req.user._id;

    report.reportedAt = new Date();

    await report.save();

    const finalizedReport = await LabReport.findById(
      report._id
    )
      .populate(
        "patientId",
        "patientId userId bloodGroup"
      )
      .populate(
        "testId",
        "name code category sampleType"
      )
      .populate(
        "labRequestId",
        "requestId priority status requestedAt"
      )
      .populate(
        "performedBy",
        "name email role"
      )
      .populate(
        "verifiedBy",
        "name email role"
      );

    return res.json({
      success: true,
      message:
        "Laboratory report finalized successfully.",
      report: finalizedReport,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createLabReport,
  getMyLabReports,
  getLabReportById,
  finalizeLabReport,
};