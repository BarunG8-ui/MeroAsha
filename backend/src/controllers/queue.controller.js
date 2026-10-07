const Queue = require("../models/Queue");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");

// ============================================================
// GENERATE QUEUE ID
// ============================================================

const generateQueueId = async () => {
  let queueId;
  let exists = true;

  while (exists) {
    const randomNumber = Math.floor(
      100000 + Math.random() * 900000
    );

    queueId = `QUE-${randomNumber}`;

    exists = await Queue.findOne({ queueId });
  }

  return queueId;
};

// ============================================================
// GET NEXT TOKEN NUMBER
// ============================================================

const getNextTokenNumber = async (doctorId, queueDate) => {
  const startOfDay = new Date(queueDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(queueDate);
  endOfDay.setHours(23, 59, 59, 999);

  const lastQueue = await Queue.findOne({
    doctorId,

    queueDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  }).sort({
    tokenNumber: -1,
  });

  return lastQueue ? lastQueue.tokenNumber + 1 : 1;
};

// ============================================================
// REAL-TIME QUEUE UPDATE HELPER
// ============================================================

const emitQueueUpdates = async (req, doctorId, queueDate) => {
  try {
    const io = req.app.get("io");

    if (!io) {
      console.warn(
        "Socket.IO instance not available for queue update"
      );

      return;
    }

    const startOfDay = new Date(queueDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(queueDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all active queue entries for this doctor today.
    const queues = await Queue.find({
      doctorId,

      queueDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },

      status: {
        $nin: ["COMPLETED", "CANCELLED"],
      },
    })
      .populate(
        "patientId",
        "userId patientId dateOfBirth gender bloodGroup phone"
      )
      .populate(
        "doctorId",
        "userId doctorId specialization qualification consultationFee"
      )
      .populate(
        "departmentId",
        "name code location floor"
      )
      .populate(
        "appointmentId",
        "appointmentId appointmentDate timeSlot reason status"
      )
      .sort({
        tokenNumber: 1,
      });

    // Current patient being called/in consultation.
    const activeQueue = queues
      .filter((item) =>
        ["CALLED", "IN_CONSULTATION"].includes(
          item.status
        )
      )
      .sort(
        (a, b) =>
          b.tokenNumber - a.tokenNumber
      )[0];

    const currentTokenNumber = activeQueue
      ? activeQueue.tokenNumber
      : null;

    // Send a personalized queue state to every patient.
    for (const patientQueue of queues) {
      const patientUserId =
        patientQueue.patientId?.userId;

      if (!patientUserId) {
        continue;
      }

      const patientsAhead = queues.filter(
        (item) =>
          item.tokenNumber <
            patientQueue.tokenNumber &&
          ["WAITING", "CALLED", "IN_CONSULTATION"].includes(
            item.status
          )
      ).length;

      const queuePayload = {
        _id: patientQueue._id,
        queueId: patientQueue.queueId,

        patientId:
          patientQueue.patientId?._id,

        doctorId:
          patientQueue.doctorId,

        departmentId:
          patientQueue.departmentId,

        appointmentId:
          patientQueue.appointmentId,

        tokenNumber:
          patientQueue.tokenNumber,

        currentTokenNumber,

        patientsAhead,

        status:
          patientQueue.status,

        calledAt:
          patientQueue.calledAt || null,

        consultationStartedAt:
          patientQueue.consultationStartedAt ||
          null,

        completedAt:
          patientQueue.completedAt || null,

        queueDate:
          patientQueue.queueDate,
      };

      io.to(
        `user:${patientUserId.toString()}`
      ).emit(
        "queue:update",
        queuePayload
      );
    }

    console.log(
      `Real-time queue update emitted for doctor ${doctorId}`
    );
  } catch (error) {
    console.error(
      "Failed to emit queue updates:",
      error
    );
  }
};

// ============================================================
// CREATE QUEUE FROM APPOINTMENT
// ============================================================

const createQueue = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    // --------------------------------------------------------
    // Validate appointment ID
    // --------------------------------------------------------

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    // --------------------------------------------------------
    // Find appointment
    // --------------------------------------------------------

    const appointment = await Appointment.findById(
      appointmentId
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // --------------------------------------------------------
    // Prevent cancelled appointment
    // --------------------------------------------------------

    if (appointment.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled appointment cannot enter queue",
      });
    }

    // --------------------------------------------------------
    // PATIENT OWNERSHIP CHECK
    // --------------------------------------------------------

    if (req.user.role === "PATIENT") {
      const patient = await Patient.findOne({
        userId: req.user._id,
      });

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found",
        });
      }

      if (
        appointment.patientId.toString() !==
        patient._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only create a queue for your own appointment",
        });
      }
    }

    // --------------------------------------------------------
    // Check if appointment already has queue
    // --------------------------------------------------------

    const existingQueue = await Queue.findOne({
      appointmentId: appointment._id,
    });

    if (existingQueue) {
      return res.status(409).json({
        success: false,
        message:
          "Appointment is already in the queue",
        queue: existingQueue,
      });
    }

    // --------------------------------------------------------
    // Generate queue date
    // --------------------------------------------------------

    const queueDate = new Date(
      appointment.appointmentDate
    );

    // --------------------------------------------------------
    // Generate token number
    // --------------------------------------------------------

    const tokenNumber =
      await getNextTokenNumber(
        appointment.doctorId,
        queueDate
      );

    // --------------------------------------------------------
    // Generate queue ID
    // --------------------------------------------------------

    const queueId =
      await generateQueueId();

    // --------------------------------------------------------
    // Create queue
    // --------------------------------------------------------

    const queue = await Queue.create({
      queueId,

      appointmentId:
        appointment._id,

      patientId:
        appointment.patientId,

      doctorId:
        appointment.doctorId,

      departmentId:
        appointment.departmentId,

      queueDate,

      tokenNumber,

      status: "WAITING",
    });

    // --------------------------------------------------------
    // Update appointment status
    // --------------------------------------------------------

    appointment.status = "CHECKED_IN";

    await appointment.save();

    // --------------------------------------------------------
    // Populate queue information
    // --------------------------------------------------------

    const populatedQueue =
      await Queue.findById(queue._id)
        .populate(
          "patientId",
          "userId patientId dateOfBirth gender bloodGroup phone"
        )
        .populate(
          "doctorId",
          "userId doctorId specialization qualification consultationFee"
        )
        .populate(
          "departmentId",
          "name code location floor"
        )
        .populate(
          "appointmentId",
          "appointmentId appointmentDate timeSlot reason status"
        );

    // --------------------------------------------------------
    // REAL-TIME UPDATE
    // --------------------------------------------------------

    await emitQueueUpdates(
      req,
      appointment.doctorId,
      queueDate
    );

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    res.status(201).json({
      success: true,

      message:
        "Patient added to queue successfully",

      queue: populatedQueue,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET DOCTOR QUEUE FOR A DATE
// ============================================================

const getDoctorQueue = async (
  req,
  res,
  next
) => {
  try {
    const { doctorId } = req.params;

    const { date } = req.query;

    // --------------------------------------------------------
    // Use requested date or today's date
    // --------------------------------------------------------

    const queueDate = date
      ? new Date(date)
      : new Date();

    // --------------------------------------------------------
    // Validate date
    // --------------------------------------------------------

    if (
      Number.isNaN(
        queueDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    // --------------------------------------------------------
    // Start of day
    // --------------------------------------------------------

    const startOfDay =
      new Date(queueDate);

    startOfDay.setHours(
      0,
      0,
      0,
      0
    );

    // --------------------------------------------------------
    // End of day
    // --------------------------------------------------------

    const endOfDay =
      new Date(queueDate);

    endOfDay.setHours(
      23,
      59,
      59,
      999
    );

    // --------------------------------------------------------
    // Find queue
    // --------------------------------------------------------

    const queue =
      await Queue.find({
        doctorId,

        queueDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
        .populate(
          "patientId",
          "userId patientId dateOfBirth gender bloodGroup phone"
        )
        .populate(
          "doctorId",
          "userId doctorId specialization qualification"
        )
        .populate(
          "departmentId",
          "name code"
        )
        .populate(
          "appointmentId",
          "appointmentId appointmentDate timeSlot reason status"
        )
        .sort({
          tokenNumber: 1,
        });

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    res.json({
      success: true,

      count: queue.length,

      queue,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET MY QUEUE
// ============================================================

const getMyQueue = async (
  req,
  res,
  next
) => {
  try {
    // --------------------------------------------------------
    // Find patient profile
    // --------------------------------------------------------

    const patient =
      await Patient.findOne({
        userId: req.user._id,
      });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message:
          "Patient profile not found",
      });
    }

    // --------------------------------------------------------
    // Find patient's queues
    // --------------------------------------------------------

    const queue =
      await Queue.find({
        patientId: patient._id,
      })
        .populate(
          "doctorId",
          "userId doctorId specialization qualification"
        )
        .populate(
          "departmentId",
          "name code"
        )
        .populate(
          "appointmentId",
          "appointmentId appointmentDate timeSlot reason status"
        )
        .sort({
          queueDate: -1,
          tokenNumber: 1,
        });

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    res.json({
      success: true,

      count: queue.length,

      queue,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// CALL NEXT PATIENT
// ============================================================

const callNextPatient = async (
  req,
  res,
  next
) => {
  try {
    const { doctorId } = req.params;

    // --------------------------------------------------------
    // TODAY'S DATE RANGE
    // --------------------------------------------------------

    const today = new Date();

    const startOfDay =
      new Date(today);

    startOfDay.setHours(
      0,
      0,
      0,
      0
    );

    const endOfDay =
      new Date(today);

    endOfDay.setHours(
      23,
      59,
      59,
      999
    );

    // --------------------------------------------------------
    // Find next WAITING patient
    // --------------------------------------------------------

    const queue =
      await Queue.findOne({
        doctorId,

        queueDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },

        status: "WAITING",
      }).sort({
        tokenNumber: 1,
      });

    // --------------------------------------------------------
    // No patient
    // --------------------------------------------------------

    if (!queue) {
      return res.status(404).json({
        success: false,
        message:
          "No waiting patients in today's queue",
      });
    }

    // --------------------------------------------------------
    // Change status
    // --------------------------------------------------------

    queue.status = "CALLED";

    queue.calledAt = new Date();

    await queue.save();

    // --------------------------------------------------------
    // Populate queue information
    // --------------------------------------------------------

    const populatedQueue =
      await Queue.findById(
        queue._id
      )
        .populate(
          "patientId",
          "userId patientId dateOfBirth gender bloodGroup phone"
        )
        .populate(
          "doctorId",
          "userId doctorId specialization qualification"
        )
        .populate(
          "departmentId",
          "name code location floor"
        )
        .populate(
          "appointmentId",
          "appointmentId appointmentDate timeSlot reason status"
        );

    // --------------------------------------------------------
    // REAL-TIME UPDATE
    // --------------------------------------------------------

    await emitQueueUpdates(
      req,
      doctorId,
      today
    );

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    res.json({
      success: true,

      message:
        "Next patient called successfully",

      queue: populatedQueue,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// START CONSULTATION
// ============================================================

const startConsultation = async (
  req,
  res,
  next
) => {
  try {
    const queue =
      await Queue.findById(
        req.params.id
      );

    // --------------------------------------------------------
    // Queue not found
    // --------------------------------------------------------

    if (!queue) {
      return res.status(404).json({
        success: false,
        message:
          "Queue entry not found",
      });
    }

    // --------------------------------------------------------
    // Validate queue status
    // --------------------------------------------------------

    if (
      !["CALLED", "WAITING"].includes(
        queue.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Patient cannot start consultation from the current queue status",
      });
    }

    // --------------------------------------------------------
    // Update queue
    // --------------------------------------------------------

    queue.status =
      "IN_CONSULTATION";

    queue.consultationStartedAt =
      new Date();

    await queue.save();

    // --------------------------------------------------------
    // Update appointment
    // --------------------------------------------------------

    await Appointment.findByIdAndUpdate(
      queue.appointmentId,
      {
        status:
          "IN_CONSULTATION",
      }
    );

    // --------------------------------------------------------
    // REAL-TIME UPDATE
    // --------------------------------------------------------

    await emitQueueUpdates(
      req,
      queue.doctorId,
      queue.queueDate
    );

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    res.json({
      success: true,

      message:
        "Consultation started",

      queue,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// COMPLETE QUEUE
// ============================================================

const completeQueue = async (
  req,
  res,
  next
) => {
  try {
    const queue =
      await Queue.findById(
        req.params.id
      );

    // --------------------------------------------------------
    // Queue not found
    // --------------------------------------------------------

    if (!queue) {
      return res.status(404).json({
        success: false,
        message:
          "Queue entry not found",
      });
    }

    // --------------------------------------------------------
    // Validate status
    // --------------------------------------------------------

    if (
      queue.status !==
      "IN_CONSULTATION"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only patients currently in consultation can be completed",
      });
    }

    // --------------------------------------------------------
    // Complete queue
    // --------------------------------------------------------

    queue.status =
      "COMPLETED";

    queue.completedAt =
      new Date();

    await queue.save();

    // --------------------------------------------------------
    // Complete appointment
    // --------------------------------------------------------

    await Appointment.findByIdAndUpdate(
      queue.appointmentId,
      {
        status:
          "COMPLETED",
      }
    );

    // --------------------------------------------------------
    // REAL-TIME UPDATE
    // --------------------------------------------------------

    await emitQueueUpdates(
      req,
      queue.doctorId,
      queue.queueDate
    );

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    res.json({
      success: true,

      message:
        "Queue completed successfully",

      queue,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// EXPORT CONTROLLERS
// ============================================================

module.exports = {
  createQueue,
  getDoctorQueue,
  getMyQueue,
  callNextPatient,
  startConsultation,
  completeQueue,
};