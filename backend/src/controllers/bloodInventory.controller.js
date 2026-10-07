const BloodInventory = require("../models/BloodInventory");

// ============================================================
// CREATE / ADD BLOOD INVENTORY
// ============================================================

const createBloodInventory = async (req, res, next) => {
  try {
    const {
      bloodGroup,
      componentType,
      unitsAvailable,
      minimumRequiredUnits,
      expiryDate,
      storageLocation,
    } = req.body;

    if (
      !bloodGroup ||
      !componentType ||
      unitsAvailable === undefined ||
      !expiryDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Blood group, component type, units available and expiry date are required",
      });
    }

    const minimumUnits =
      minimumRequiredUnits === undefined
        ? 5
        : Number(minimumRequiredUnits);

    const units = Number(unitsAvailable);

    if (!Number.isInteger(units) || units < 0) {
      return res.status(400).json({
        success: false,
        message: "Units available must be a non-negative integer",
      });
    }

    if (!Number.isInteger(minimumUnits) || minimumUnits < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum required units must be a non-negative integer",
      });
    }

    const expiry = new Date(expiryDate);

    if (Number.isNaN(expiry.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid expiry date",
      });
    }

    if (expiry <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be in the future",
      });
    }

    let status = "AVAILABLE";

    if (units === 0) {
      status = "UNAVAILABLE";
    } else if (units <= minimumUnits) {
      status = "LOW_STOCK";
    }

    const inventory = await BloodInventory.create({
      bloodGroup,
      componentType,
      unitsAvailable: units,
      minimumRequiredUnits: minimumUnits,
      expiryDate: expiry,
      storageLocation: storageLocation || "Blood Bank",
      status,
      lastUpdatedBy: req.user.userId,
      active: units > 0,
    });

    res.status(201).json({
      success: true,
      message: "Blood inventory created successfully",
      inventory,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ALL BLOOD INVENTORY
// ============================================================

const getBloodInventory = async (req, res, next) => {
  try {
    const {
      bloodGroup,
      componentType,
      status,
    } = req.query;

    const filter = {};

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    if (componentType) {
      filter.componentType = componentType;
    }

    if (status) {
      filter.status = status;
    }

    const inventory = await BloodInventory.find(filter)
      .populate("lastUpdatedBy", "name email role")
      .sort({
        bloodGroup: 1,
        componentType: 1,
        expiryDate: 1,
      });

    res.status(200).json({
      success: true,
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET AVAILABLE INVENTORY
// ============================================================

const getAvailableBloodInventory = async (req, res, next) => {
  try {
    const inventory = await BloodInventory.find({
      active: true,
      unitsAvailable: { $gt: 0 },
      expiryDate: { $gt: new Date() },
      status: {
        $in: ["AVAILABLE", "LOW_STOCK"],
      },
    })
      .populate("lastUpdatedBy", "name email role")
      .sort({
        bloodGroup: 1,
        componentType: 1,
        expiryDate: 1,
      });

    res.status(200).json({
      success: true,
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET INVENTORY BY ID
// ============================================================

const getBloodInventoryById = async (req, res, next) => {
  try {
    const inventory = await BloodInventory.findById(req.params.id)
      .populate("lastUpdatedBy", "name email role");

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Blood inventory record not found",
      });
    }

    res.status(200).json({
      success: true,
      inventory,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE INVENTORY DETAILS
// ============================================================

const updateBloodInventory = async (req, res, next) => {
  try {
    const {
      minimumRequiredUnits,
      expiryDate,
      storageLocation,
      active,
    } = req.body;

    const inventory = await BloodInventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Blood inventory record not found",
      });
    }

    if (minimumRequiredUnits !== undefined) {
      const minimumUnits = Number(minimumRequiredUnits);

      if (
        !Number.isInteger(minimumUnits) ||
        minimumUnits < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Minimum required units must be a non-negative integer",
        });
      }

      inventory.minimumRequiredUnits = minimumUnits;
    }

    if (expiryDate !== undefined) {
      const expiry = new Date(expiryDate);

      if (Number.isNaN(expiry.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiry date",
        });
      }

      inventory.expiryDate = expiry;
    }

    if (storageLocation !== undefined) {
      inventory.storageLocation = storageLocation;
    }

    if (active !== undefined) {
      if (typeof active !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Active must be true or false",
        });
      }

      inventory.active = active;
    }

    // ----------------------------------------------------------
    // Recalculate status
    // ----------------------------------------------------------

    if (
      inventory.expiryDate <= new Date()
    ) {
      inventory.status = "EXPIRED";
      inventory.active = false;
    } else if (inventory.unitsAvailable === 0) {
      inventory.status = "UNAVAILABLE";
      inventory.active = false;
    } else if (
      inventory.unitsAvailable <=
      inventory.minimumRequiredUnits
    ) {
      inventory.status = "LOW_STOCK";
    } else {
      inventory.status = "AVAILABLE";
    }

    inventory.lastUpdatedBy = req.user.userId;

    await inventory.save();

    res.status(200).json({
      success: true,
      message: "Blood inventory updated successfully",
      inventory,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// ADJUST INVENTORY QUANTITY
// ============================================================

const adjustBloodInventory = async (req, res, next) => {
  try {
    const { quantityChange } = req.body;

    if (quantityChange === undefined) {
      return res.status(400).json({
        success: false,
        message: "Quantity change is required",
      });
    }

    const change = Number(quantityChange);

    if (!Number.isInteger(change) || change === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity change must be a non-zero integer",
      });
    }

    const inventory = await BloodInventory.findById(
      req.params.id
    );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Blood inventory record not found",
      });
    }

    const newQuantity =
      inventory.unitsAvailable + change;

    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Inventory quantity cannot become negative",
      });
    }

    inventory.unitsAvailable = newQuantity;

    // ----------------------------------------------------------
    // Recalculate inventory status
    // ----------------------------------------------------------

    if (inventory.expiryDate <= new Date()) {
      inventory.status = "EXPIRED";
      inventory.active = false;
    } else if (newQuantity === 0) {
      inventory.status = "UNAVAILABLE";
      inventory.active = false;
    } else if (
      newQuantity <= inventory.minimumRequiredUnits
    ) {
      inventory.status = "LOW_STOCK";
      inventory.active = true;
    } else {
      inventory.status = "AVAILABLE";
      inventory.active = true;
    }

    inventory.lastUpdatedBy = req.user.userId;

    await inventory.save();

    res.status(200).json({
      success: true,
      message: "Blood inventory quantity adjusted successfully",
      inventory,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// CHECK / UPDATE EXPIRED INVENTORY
// ============================================================

const updateExpiredInventory = async (req, res, next) => {
  try {
    const result = await BloodInventory.updateMany(
      {
        expiryDate: { $lte: new Date() },
        status: {
          $ne: "EXPIRED",
        },
      },
      {
        $set: {
          status: "EXPIRED",
          active: false,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Expired blood inventory updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBloodInventory,
  getBloodInventory,
  getAvailableBloodInventory,
  getBloodInventoryById,
  updateBloodInventory,
  adjustBloodInventory,
  updateExpiredInventory,
};