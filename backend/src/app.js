const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// ============================================================
// ROUTES
// ============================================================

const healthRoutes = require("./routes/health.routes");
const testRoutes = require("./routes/test.routes");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const patientRoutes = require("./routes/patient.routes");

const departmentRoutes = require("./routes/department.routes");
const doctorRoutes = require("./routes/doctor.routes");

const appointmentRoutes = require("./routes/appointment.routes");
const queueRoutes = require("./routes/queue.routes");
const consultationRoutes = require("./routes/consultation.routes");

const medicalRecordRoutes = require("./routes/medicalRecord.routes");

const labTestRoutes = require("./routes/labTest.routes");
const labRequestRoutes = require("./routes/labRequest.routes");
const labReportRoutes = require("./routes/labReport.routes");

const medicineRoutes = require("./routes/medicine.routes");
const medicineStockRoutes = require("./routes/medicineStock.routes");
const prescriptionRoutes = require("./routes/prescription.routes");
const pharmacyRoutes = require("./routes/pharmacy.routes");

const bloodInventoryRoutes = require("./routes/bloodInventory.routes");
const bloodDonationRoutes = require("./routes/bloodDonation.routes");
const bloodRequestRoutes = require("./routes/bloodRequest.routes");
const bloodIssueRoutes = require("./routes/bloodIssue.routes");

const ambulanceRoutes = require("./routes/ambulance.routes");
const emergencyRoutes = require("./routes/emergency.routes");

const pregnancyRoutes = require("./routes/pregnancy.routes");

const notificationRoutes = require("./routes/notification.routes");


// ============================================================
// CREATE EXPRESS APP
// ============================================================

const app = express();


// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);


// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);


// ============================================================
// BODY PARSER
// ============================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);


// ============================================================
// RATE LIMITING
// ============================================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);


// ============================================================
// REQUEST LOGGER
// ============================================================

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log(
      `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
});


// ============================================================
// ROOT ROUTE
// ============================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MeroAsha Hospital Management System API",
    service: "MeroAsha",
    status: "running",
    version: "1.0.0",
  });
});


// ============================================================
// HEALTH CHECK
// ============================================================

app.use(
  "/api/health",
  healthRoutes
);


// ============================================================
// TEST ROUTES
// ============================================================

app.use(
  "/api/test",
  testRoutes
);


// ============================================================
// PHASE 2 - AUTHENTICATION
// ============================================================

app.use(
  "/api/auth",
  authRoutes
);


// ============================================================
// PHASE 3 - USER MANAGEMENT
// ============================================================

app.use(
  "/api/users",
  userRoutes
);


// ============================================================
// PHASE 4 - PATIENT MANAGEMENT
// ============================================================

app.use(
  "/api/patients",
  patientRoutes
);


// ============================================================
// PHASE 5 - DEPARTMENTS
// ============================================================

app.use(
  "/api/departments",
  departmentRoutes
);


// ============================================================
// PHASE 5 - DOCTORS
// ============================================================

app.use(
  "/api/doctors",
  doctorRoutes
);


// ============================================================
// PHASE 6 - APPOINTMENTS
// ============================================================

app.use(
  "/api/appointments",
  appointmentRoutes
);


// ============================================================
// PHASE 6 - QUEUE
// ============================================================

app.use(
  "/api/queue",
  queueRoutes
);


// ============================================================
// PHASE 7 - CONSULTATION
// ============================================================

app.use(
  "/api/consultations",
  consultationRoutes
);


// ============================================================
// PHASE 8 - MEDICAL RECORDS
// ============================================================

app.use(
  "/api/medical-records",
  medicalRecordRoutes
);


// ============================================================
// PHASE 9 - LABORATORY
// ============================================================

app.use(
  "/api/lab-tests",
  labTestRoutes
);

app.use(
  "/api/lab-requests",
  labRequestRoutes
);

app.use(
  "/api/lab-reports",
  labReportRoutes
);


// ============================================================
// PHASE 10 - PHARMACY
// ============================================================

app.use(
  "/api/medicines",
  medicineRoutes
);

app.use(
  "/api/medicine-stock",
  medicineStockRoutes
);

app.use(
  "/api/prescriptions",
  prescriptionRoutes
);

app.use(
  "/api/pharmacy",
  pharmacyRoutes
);


// ============================================================
// PHASE 11 - BLOOD BANK
// ============================================================

app.use(
  "/api/blood-inventory",
  bloodInventoryRoutes
);

app.use(
  "/api/blood-donations",
  bloodDonationRoutes
);

app.use(
  "/api/blood-requests",
  bloodRequestRoutes
);

app.use(
  "/api/blood-issues",
  bloodIssueRoutes
);


// ============================================================
// PHASE 12 - AMBULANCE
// ============================================================

app.use(
  "/api/ambulances",
  ambulanceRoutes
);


// ============================================================
// PHASE 12 - EMERGENCY
// ============================================================

app.use(
  "/api/emergency",
  emergencyRoutes
);


// ============================================================
// PHASE 13 - PREGNANCY CARE
// ============================================================

app.use(
  "/api/pregnancy",
  pregnancyRoutes
);


// ============================================================
// PHASE 14 - NOTIFICATIONS
// ============================================================

app.use(
  "/api/notifications",
  notificationRoutes
);


// ============================================================
// 404 - ROUTE NOT FOUND
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});


// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((error, req, res, next) => {
  console.error("API Error:", error);

  // ----------------------------------------------------------
  // Mongoose Validation Error
  // ----------------------------------------------------------

  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map(
      (item) => item.message
    );

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }


  // ----------------------------------------------------------
  // Mongoose Cast Error
  // ----------------------------------------------------------

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }


  // ----------------------------------------------------------
  // MongoDB Duplicate Key Error
  // ----------------------------------------------------------

  if (error.code === 11000) {
    const duplicateFields = Object.keys(
      error.keyPattern || {}
    );

    return res.status(409).json({
      success: false,
      message: "Duplicate record already exists",
      fields: duplicateFields,
    });
  }


  // ----------------------------------------------------------
  // JWT Errors
  // ----------------------------------------------------------

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }


  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Authentication token has expired",
    });
  }


  // ----------------------------------------------------------
  // Default Error
  // ----------------------------------------------------------

  return res.status(
    error.statusCode || 500
  ).json({
    success: false,
    message:
      error.message ||
      "Internal server error",
  });
});


// ============================================================
// EXPORT APP
// ============================================================

module.exports = app;