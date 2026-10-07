const mongoose = require("mongoose");

const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Department = require("../models/Department");

const {
  sendAppointmentConfirmationEmail,
} = require("../services/email.service");

// ============================================================
// STANDARD HOSPITAL CONSULTATION SLOTS
// ============================================================

const DEFAULT_TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
];

// ============================================================
// GENERATE UNIQUE APPOINTMENT ID
// ============================================================

const generateAppointmentId = async () => {
  let appointmentId;
  let exists = true;

  while (exists) {
    const randomNumber = Math.floor(
      100000 + Math.random() * 900000
    );

    appointmentId = `APT-${randomNumber}`;

    exists = await Appointment.findOne({
      appointmentId,
    });
  }

  return appointmentId;
};

// ============================================================
// CREATE APPOINTMENT
// ============================================================

const createAppointment = async (req, res, next) => {
  try {
    const {
      doctorId,
      departmentId,
      appointmentDate,
      timeSlot,
      reason,
      notes,
    } = req.body;

    // ----------------------------------------------------------
    // Validate required fields
    // ----------------------------------------------------------

    if (
      !doctorId ||
      !departmentId ||
      !appointmentDate ||
      !timeSlot
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Doctor, department, appointment date and time slot are required",
      });
    }

    // ----------------------------------------------------------
    // Validate ObjectIds
    // ----------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    // ----------------------------------------------------------
    // Find patient
    // ----------------------------------------------------------

    const patient = await Patient.findOne({
      userId: req.user._id,
      active: true,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message:
          "Patient profile not found. Please create your patient profile first.",
      });
    }

    // ----------------------------------------------------------
    // Find doctor
    // ----------------------------------------------------------

    const doctor = await Doctor.findById(doctorId)
      .populate("userId", "name email phone");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (!doctor.active) {
      return res.status(400).json({
        success: false,
        message: "Doctor is currently inactive",
      });
    }

    if (!doctor.availableForConsultation) {
      return res.status(400).json({
        success: false,
        message:
          "Doctor is currently unavailable for consultation",
      });
    }

    // ----------------------------------------------------------
    // Find department
    // ----------------------------------------------------------

    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (!department.active) {
      return res.status(400).json({
        success: false,
        message: "Department is currently inactive",
      });
    }

    // ----------------------------------------------------------
    // Verify doctor belongs to selected department
    // ----------------------------------------------------------

    if (
      String(doctor.departmentId) !==
      String(departmentId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Selected doctor does not belong to this department",
      });
    }

    // ----------------------------------------------------------
    // Validate appointment date
    // ----------------------------------------------------------

    const selectedDate = new Date(
      `${appointmentDate}T00:00:00`
    );

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date",
      });
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Appointment date cannot be in the past",
      });
    }

    // ----------------------------------------------------------
    // Validate time slot
    // ----------------------------------------------------------

    if (!DEFAULT_TIME_SLOTS.includes(timeSlot)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment time slot",
      });
    }

    // ----------------------------------------------------------
    // Check whether slot is already booked
    // ----------------------------------------------------------

    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existingAppointment =
      await Appointment.findOne({
        doctorId,
        appointmentDate: {
          $gte: dayStart,
          $lte: dayEnd,
        },
        timeSlot,
        status: {
          $nin: ["CANCELLED", "NO_SHOW"],
        },
      });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message:
          "This appointment slot is already booked. Please select another time.",
      });
    }

    // ----------------------------------------------------------
    // Generate unique appointment ID
    // ----------------------------------------------------------

    const appointmentId = await generateAppointmentId();

    // ----------------------------------------------------------
    // Create appointment
    // ----------------------------------------------------------

    const appointment = await Appointment.create({
      appointmentId,
      patientId: patient._id,
      doctorId,
      departmentId,
      appointmentDate: selectedDate,
      timeSlot,
      reason: reason?.trim() || "",
      notes: notes?.trim() || "",
      status: "BOOKED",
      bookedBy: req.user._id,
    });

    // ----------------------------------------------------------
    // Populate appointment details
    // ----------------------------------------------------------

    const populatedAppointment =
      await Appointment.findById(appointment._id)
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
        );

    // ----------------------------------------------------------
    // Send appointment confirmation email
    // ----------------------------------------------------------

    let emailSent = false;

    try {
      await sendAppointmentConfirmationEmail({
        patientEmail: req.user.email,
        patientName: req.user.name,
        appointment: populatedAppointment,
      });

      emailSent = true;

      console.log(
        `Appointment confirmation email sent to ${req.user.email}`
      );
    } catch (emailError) {
      console.error(
        "Appointment created but confirmation email failed:",
        emailError.message
      );
    }

    // ----------------------------------------------------------
    // Final response
    // ----------------------------------------------------------

    return res.status(201).json({
      success: true,
      message: emailSent
        ? "Appointment booked successfully. Confirmation email sent."
        : "Appointment booked successfully, but confirmation email could not be sent.",
      appointmentToken: appointmentId,
      emailSent,
      appointment: populatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET MY APPOINTMENTS
// ============================================================

const getMyAppointments = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      userId: req.user._id,
      active: true,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const appointments = await Appointment.find({
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
        "name code location floor"
      )
      .sort({
        appointmentDate: -1,
        createdAt: -1,
      });

    return res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ALL APPOINTMENTS
// ============================================================

const getAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
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
      .sort({
        appointmentDate: 1,
        timeSlot: 1,
      });

    return res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET DOCTOR'S OWN APPOINTMENTS
// ============================================================

const getDoctorAppointments = async (req, res, next) => {
  try {
    // ----------------------------------------------------------
    // Find doctor profile linked to logged-in user
    // ----------------------------------------------------------

    const doctor = await Doctor.findOne({
      userId: req.user._id,
      active: true,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    // ----------------------------------------------------------
    // Optional date filter
    // Example:
    // /api/appointments/doctor/my?date=2026-10-05
    // ----------------------------------------------------------

    const { date } = req.query;

    const filter = {
      doctorId: doctor._id,
      active: true,
    };

    if (date) {
      const startDate = new Date(
        `${date}T00:00:00`
      );

      const endDate = new Date(
        `${date}T23:59:59.999`
      );

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid appointment date",
        });
      }

      filter.appointmentDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // ----------------------------------------------------------
    // Find doctor's appointments
    // ----------------------------------------------------------

    const appointments = await Appointment.find(filter)
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name email phone",
        },
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
        "name code location floor"
      )
      .sort({
        appointmentDate: 1,
        timeSlot: 1,
      });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET APPOINTMENT BY ID
// ============================================================

const getAppointmentById = async (req, res, next) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment =
      await Appointment.findById(req.params.id)
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
        );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET AVAILABLE APPOINTMENT SLOTS
// ============================================================

const getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;

    // ----------------------------------------------------------
    // Validate request
    // ----------------------------------------------------------

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: "Doctor and date are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    // ----------------------------------------------------------
    // Check doctor
    // ----------------------------------------------------------

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (
      !doctor.active ||
      !doctor.availableForConsultation
    ) {
      return res.json({
        success: true,
        date,
        doctorId,
        slots: [],
      });
    }

    // ----------------------------------------------------------
    // Date range
    // ----------------------------------------------------------

    const startDate = new Date(
      `${date}T00:00:00`
    );

    const endDate = new Date(
      `${date}T23:59:59.999`
    );

    if (Number.isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    // ----------------------------------------------------------
    // Get booked appointments
    // ----------------------------------------------------------

    const bookedAppointments =
      await Appointment.find({
        doctorId,
        appointmentDate: {
          $gte: startDate,
          $lte: endDate,
        },
        status: {
          $nin: ["CANCELLED", "NO_SHOW"],
        },
      }).select("timeSlot");

    const bookedSlots = new Set(
      bookedAppointments.map(
        (appointment) => appointment.timeSlot
      )
    );

    // ----------------------------------------------------------
    // Build availability
    // ----------------------------------------------------------

    const slots = DEFAULT_TIME_SLOTS.map(
      (timeSlot) => ({
        timeSlot,
        available: !bookedSlots.has(timeSlot),
      })
    );

    return res.json({
      success: true,
      date,
      doctorId,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// CANCEL MY APPOINTMENT
// ============================================================

const cancelMyAppointment = async (
  req,
  res,
  next
) => {
  try {
    const { cancellationReason } = req.body;

    // ----------------------------------------------------------
    // Find patient
    // ----------------------------------------------------------

    const patient = await Patient.findOne({
      userId: req.user._id,
      active: true,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    // ----------------------------------------------------------
    // Find patient's appointment
    // ----------------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment =
      await Appointment.findOne({
        _id: req.params.id,
        patientId: patient._id,
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // ----------------------------------------------------------
    // Check cancellation eligibility
    // ----------------------------------------------------------

    if (
      [
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW",
      ].includes(appointment.status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This appointment cannot be cancelled",
      });
    }

    // ----------------------------------------------------------
    // Cancel appointment
    // ----------------------------------------------------------

    appointment.status = "CANCELLED";

    appointment.cancelledBy = req.user._id;

    appointment.cancellationReason =
      cancellationReason?.trim() || "";

    await appointment.save();

    return res.json({
      success: true,
      message:
        "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE APPOINTMENT STATUS
// ============================================================

const updateAppointmentStatus = async (
  req,
  res,
  next
) => {
  try {
    const { status } = req.body;

    // ----------------------------------------------------------
    // Allowed statuses
    // ----------------------------------------------------------

    const allowedStatuses = [
      "BOOKED",
      "CONFIRMED",
      "CHECKED_IN",
      "IN_CONSULTATION",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status",
      });
    }

    // ----------------------------------------------------------
    // Validate appointment ID
    // ----------------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    // ----------------------------------------------------------
    // Update status
    // ----------------------------------------------------------

    const appointment =
      await Appointment.findByIdAndUpdate(
        req.params.id,
        {
          status,
        },
        {
          new: true,
          runValidators: true,
        }
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
        );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.json({
      success: true,
      message:
        "Appointment status updated successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createAppointment,
  getMyAppointments,
  getAppointments,
  getDoctorAppointments,
  getAppointmentById,
  getAvailableSlots,
  cancelMyAppointment,
  updateAppointmentStatus,
};