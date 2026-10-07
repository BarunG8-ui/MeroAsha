const Ambulance = require("../models/Ambulance");
const AmbulanceDriver = require("../models/AmbulanceDriver");

// Generate unique ambulance ID
const generateAmbulanceId = () => {
  return `AMB-${Math.floor(100000 + Math.random() * 900000)}`;
};

// Generate unique driver ID
const generateDriverId = () => {
  return `DRV-${Math.floor(100000 + Math.random() * 900000)}`;
};

// --------------------------------------------------
// AMBULANCE
// --------------------------------------------------

// Create ambulance
const createAmbulance = async (req, res, next) => {
  try {
    const {
      vehicleNumber,
      ambulanceType,
      capacity,
      equipment,
      currentLocation,
    } = req.body;

    if (!vehicleNumber || !ambulanceType) {
      const error = new Error(
        "Vehicle number and ambulance type are required"
      );
      error.statusCode = 400;
      return next(error);
    }

    const existingAmbulance = await Ambulance.findOne({
      vehicleNumber: vehicleNumber.toUpperCase(),
    });

    if (existingAmbulance) {
      const error = new Error(
        "An ambulance with this vehicle number already exists"
      );
      error.statusCode = 409;
      return next(error);
    }

    let ambulanceId;

    do {
      ambulanceId = generateAmbulanceId();
    } while (await Ambulance.exists({ ambulanceId }));

    const ambulance = await Ambulance.create({
      ambulanceId,
      vehicleNumber: vehicleNumber.toUpperCase(),
      ambulanceType,
      capacity: capacity || 1,
      equipment: equipment || [],
      currentLocation: currentLocation || {},
    });

    res.status(201).json({
      success: true,
      message: "Ambulance created successfully",
      data: ambulance,
    });
  } catch (error) {
    next(error);
  }
};

// Get all ambulances
const getAmbulances = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.ambulanceType) {
      filter.ambulanceType = req.query.ambulanceType;
    }

    if (req.query.active !== undefined) {
      filter.active = req.query.active === "true";
    }

    const ambulances = await Ambulance.find(filter)
      .populate("driverId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ambulances.length,
      data: ambulances,
    });
  } catch (error) {
    next(error);
  }
};

// Get available ambulances
const getAvailableAmbulances = async (req, res, next) => {
  try {
    const ambulances = await Ambulance.find({
      active: true,
      status: "AVAILABLE",
    })
      .populate("driverId")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: ambulances.length,
      data: ambulances,
    });
  } catch (error) {
    next(error);
  }
};

// Get ambulance by ID
const getAmbulanceById = async (req, res, next) => {
  try {
    const ambulance = await Ambulance.findById(req.params.id)
      .populate("driverId");

    if (!ambulance) {
      const error = new Error("Ambulance not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: ambulance,
    });
  } catch (error) {
    next(error);
  }
};

// Update ambulance
const updateAmbulance = async (req, res, next) => {
  try {
    const allowedFields = [
      "ambulanceType",
      "capacity",
      "equipment",
      "currentLocation",
      "active",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const ambulance = await Ambulance.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("driverId");

    if (!ambulance) {
      const error = new Error("Ambulance not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Ambulance updated successfully",
      data: ambulance,
    });
  } catch (error) {
    next(error);
  }
};

// Assign driver to ambulance
const assignDriver = async (req, res, next) => {
  try {
    const { driverId } = req.body;

    if (!driverId) {
      const error = new Error("Driver ID is required");
      error.statusCode = 400;
      return next(error);
    }

    const ambulance = await Ambulance.findById(req.params.id);

    if (!ambulance) {
      const error = new Error("Ambulance not found");
      error.statusCode = 404;
      return next(error);
    }

    const driver = await AmbulanceDriver.findById(driverId);

    if (!driver) {
      const error = new Error("Driver not found");
      error.statusCode = 404;
      return next(error);
    }

    if (!driver.active) {
      const error = new Error("Driver is inactive");
      error.statusCode = 400;
      return next(error);
    }

    if (
      driver.availabilityStatus === "ON_TRIP" ||
      driver.availabilityStatus === "UNAVAILABLE"
    ) {
      const error = new Error(
        "Driver is currently unavailable"
      );
      error.statusCode = 400;
      return next(error);
    }

    // Remove driver from another ambulance
    await Ambulance.updateMany(
      {
        driverId: driver._id,
        _id: { $ne: ambulance._id },
      },
      {
        $set: {
          driverId: null,
        },
      }
    );

    ambulance.driverId = driver._id;
    await ambulance.save();

    driver.availabilityStatus = "ON_DUTY";
    await driver.save();

    const updatedAmbulance = await Ambulance.findById(
      ambulance._id
    ).populate("driverId");

    res.status(200).json({
      success: true,
      message: "Driver assigned successfully",
      data: updatedAmbulance,
    });
  } catch (error) {
    next(error);
  }
};

// Remove driver from ambulance
const removeDriver = async (req, res, next) => {
  try {
    const ambulance = await Ambulance.findById(req.params.id);

    if (!ambulance) {
      const error = new Error("Ambulance not found");
      error.statusCode = 404;
      return next(error);
    }

    if (!ambulance.driverId) {
      const error = new Error(
        "No driver is currently assigned"
      );
      error.statusCode = 400;
      return next(error);
    }

    const driver = await AmbulanceDriver.findById(
      ambulance.driverId
    );

    ambulance.driverId = null;
    await ambulance.save();

    if (driver) {
      driver.availabilityStatus = "AVAILABLE";
      await driver.save();
    }

    res.status(200).json({
      success: true,
      message: "Driver removed successfully",
      data: ambulance,
    });
  } catch (error) {
    next(error);
  }
};

// Update ambulance status
const updateAmbulanceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "AVAILABLE",
      "DISPATCHED",
      "ON_TRIP",
      "RETURNING",
      "MAINTENANCE",
      "UNAVAILABLE",
    ];

    if (!allowedStatuses.includes(status)) {
      const error = new Error("Invalid ambulance status");
      error.statusCode = 400;
      return next(error);
    }

    const ambulance = await Ambulance.findById(
      req.params.id
    );

    if (!ambulance) {
      const error = new Error("Ambulance not found");
      error.statusCode = 404;
      return next(error);
    }

    ambulance.status = status;
    await ambulance.save();

    // Keep driver status synchronized
    if (ambulance.driverId) {
      const driver = await AmbulanceDriver.findById(
        ambulance.driverId
      );

      if (driver) {
        if (status === "ON_TRIP") {
          driver.availabilityStatus = "ON_TRIP";
        } else if (status === "AVAILABLE") {
          driver.availabilityStatus = "ON_DUTY";
        } else if (
          status === "MAINTENANCE" ||
          status === "UNAVAILABLE"
        ) {
          driver.availabilityStatus = "UNAVAILABLE";
        }

        await driver.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Ambulance status updated successfully",
      data: ambulance,
    });
  } catch (error) {
    next(error);
  }
};

// Update ambulance location
const updateAmbulanceLocation = async (req, res, next) => {
  try {
    const {
      address,
      latitude,
      longitude,
    } = req.body;

    if (
      latitude !== undefined &&
      (latitude < -90 || latitude > 90)
    ) {
      const error = new Error("Invalid latitude");
      error.statusCode = 400;
      return next(error);
    }

    if (
      longitude !== undefined &&
      (longitude < -180 || longitude > 180)
    ) {
      const error = new Error("Invalid longitude");
      error.statusCode = 400;
      return next(error);
    }

    const ambulance = await Ambulance.findByIdAndUpdate(
      req.params.id,
      {
        currentLocation: {
          address: address || "",
          latitude:
            latitude !== undefined ? latitude : null,
          longitude:
            longitude !== undefined ? longitude : null,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!ambulance) {
      const error = new Error("Ambulance not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Ambulance location updated successfully",
      data: ambulance,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// AMBULANCE DRIVER
// --------------------------------------------------

// Create driver
const createDriver = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      licenseNumber,
      licenseExpiryDate,
      address,
      remarks,
    } = req.body;

    if (!name || !phone || !licenseNumber) {
      const error = new Error(
        "Name, phone and license number are required"
      );
      error.statusCode = 400;
      return next(error);
    }

    const existingDriver = await AmbulanceDriver.findOne({
      licenseNumber: licenseNumber.toUpperCase(),
    });

    if (existingDriver) {
      const error = new Error(
        "A driver with this license number already exists"
      );
      error.statusCode = 409;
      return next(error);
    }

    let driverId;

    do {
      driverId = generateDriverId();
    } while (await AmbulanceDriver.exists({ driverId }));

    const driver = await AmbulanceDriver.create({
      driverId,
      name,
      phone,
      licenseNumber: licenseNumber.toUpperCase(),
      licenseExpiryDate: licenseExpiryDate || null,
      address: address || "",
      remarks: remarks || "",
    });

    res.status(201).json({
      success: true,
      message: "Ambulance driver created successfully",
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

// Get all drivers
const getDrivers = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.availabilityStatus) {
      filter.availabilityStatus =
        req.query.availabilityStatus;
    }

    if (req.query.active !== undefined) {
      filter.active = req.query.active === "true";
    }

    const drivers = await AmbulanceDriver.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    next(error);
  }
};

// Update driver
const updateDriver = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "phone",
      "licenseExpiryDate",
      "address",
      "availabilityStatus",
      "active",
      "remarks",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const driver = await AmbulanceDriver.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!driver) {
      const error = new Error("Driver not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Driver updated successfully",
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAmbulance,
  getAmbulances,
  getAvailableAmbulances,
  getAmbulanceById,
  updateAmbulance,
  assignDriver,
  removeDriver,
  updateAmbulanceStatus,
  updateAmbulanceLocation,

  createDriver,
  getDrivers,
  updateDriver,
};