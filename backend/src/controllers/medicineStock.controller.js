const MedicineStock = require("../models/MedicineStock");
const Medicine = require("../models/Medicine");

// ============================================================
// ADD MEDICINE STOCK
// ============================================================

const addMedicineStock = async (req, res, next) => {
  try {
    const {
      medicineId,
      batchNumber,
      quantity,
      expiryDate,
      purchasePrice,
      sellingPrice,
      supplier,
      receivedDate,
    } = req.body;

    if (
      !medicineId ||
      !batchNumber ||
      quantity === undefined ||
      !expiryDate ||
      purchasePrice === undefined ||
      sellingPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Medicine, batch number, quantity, expiry date, purchase price and selling price are required",
      });
    }

    // Check medicine
    const medicine = await Medicine.findById(medicineId);

    if (!medicine || !medicine.active) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found or inactive",
      });
    }

    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    // Validate expiry date
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

    // Check duplicate batch
    const existingStock = await MedicineStock.findOne({
      medicineId,
      batchNumber: batchNumber.trim(),
    });

    if (existingStock) {
      return res.status(409).json({
        success: false,
        message: "This batch already exists for the selected medicine",
      });
    }

    const stock = await MedicineStock.create({
      medicineId,
      batchNumber: batchNumber.trim(),
      quantity,
      availableQuantity: quantity,
      expiryDate: expiry,
      purchasePrice,
      sellingPrice,
      supplier: supplier || "",
      receivedDate: receivedDate || new Date(),
      active: true,
    });

    const populatedStock = await MedicineStock.findById(stock._id)
      .populate(
        "medicineId",
        "name genericName brandName strength dosageForm"
      );

    res.status(201).json({
      success: true,
      message: "Medicine stock added successfully",
      stock: populatedStock,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ALL MEDICINE STOCK
// ============================================================

const getMedicineStock = async (req, res, next) => {
  try {
    const { medicineId, active, expiringSoon } = req.query;

    const filter = {};

    if (medicineId) {
      filter.medicineId = medicineId;
    }

    if (active !== undefined) {
      filter.active = active === "true";
    }

    // Find medicines expiring within 30 days
    if (expiringSoon === "true") {
      const today = new Date();

      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(
        thirtyDaysLater.getDate() + 30
      );

      filter.expiryDate = {
        $gte: today,
        $lte: thirtyDaysLater,
      };
    }

    const stocks = await MedicineStock.find(filter)
      .populate(
        "medicineId",
        "name genericName brandName strength dosageForm"
      )
      .sort({
        expiryDate: 1,
      });

    res.status(200).json({
      success: true,
      count: stocks.length,
      stocks,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET STOCK BY ID
// ============================================================

const getMedicineStockById = async (req, res, next) => {
  try {
    const stock = await MedicineStock.findById(req.params.id)
      .populate(
        "medicineId",
        "name genericName brandName strength dosageForm"
      );

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Medicine stock not found",
      });
    }

    res.status(200).json({
      success: true,
      stock,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE MEDICINE STOCK
// ============================================================

const updateMedicineStock = async (req, res, next) => {
  try {
    const allowedFields = [
      "batchNumber",
      "expiryDate",
      "purchasePrice",
      "sellingPrice",
      "supplier",
      "active",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    if (updates.expiryDate) {
      const expiry = new Date(updates.expiryDate);

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

      updates.expiryDate = expiry;
    }

    const stock = await MedicineStock.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).populate(
      "medicineId",
      "name genericName brandName strength dosageForm"
    );

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Medicine stock not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medicine stock updated successfully",
      stock,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE AVAILABLE QUANTITY
// ============================================================

const updateStockQuantity = async (req, res, next) => {
  try {
    const { availableQuantity } = req.body;

    if (
      availableQuantity === undefined ||
      availableQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Available quantity must be zero or greater",
      });
    }

    const stock = await MedicineStock.findByIdAndUpdate(
      req.params.id,
      {
        availableQuantity,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate(
      "medicineId",
      "name genericName brandName strength dosageForm"
    );

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Medicine stock not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Stock quantity updated successfully",
      stock,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addMedicineStock,
  getMedicineStock,
  getMedicineStockById,
  updateMedicineStock,
  updateStockQuantity,
};