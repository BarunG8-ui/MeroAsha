const Medicine = require("../models/Medicine");

/*
 * Create Medicine
 * ADMIN / PHARMACIST
 */
const createMedicine = async (req, res, next) => {
  try {
    const {
      name,
      genericName,
      brandName,
      category,
      strength,
      dosageForm,
      manufacturer,
      description,
      prescriptionRequired,
      unitPrice,
    } = req.body;

    if (
      !name ||
      !genericName ||
      !category ||
      !strength ||
      !dosageForm ||
      unitPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, generic name, category, strength, dosage form and unit price are required",
      });
    }

    const existingMedicine = await Medicine.findOne({
      name: name.trim(),
      strength: strength.trim(),
    });

    if (existingMedicine) {
      return res.status(409).json({
        success: false,
        message: "Medicine with the same name and strength already exists",
      });
    }

    const medicine = await Medicine.create({
      name,
      genericName,
      brandName,
      category,
      strength,
      dosageForm,
      manufacturer,
      description,
      prescriptionRequired,
      unitPrice,
    });

    res.status(201).json({
      success: true,
      message: "Medicine created successfully",
      medicine,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * Get All Medicines
 * ADMIN / PHARMACIST / DOCTOR
 */
const getMedicines = async (req, res, next) => {
  try {
    const { active } = req.query;

    const filter = {};

    if (active !== undefined) {
      filter.active = active === "true";
    }

    const medicines = await Medicine.find(filter)
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * Get Medicine By ID
 * ADMIN / PHARMACIST / DOCTOR
 */
const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    res.status(200).json({
      success: true,
      medicine,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * Update Medicine
 * ADMIN / PHARMACIST
 */
const updateMedicine = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "genericName",
      "brandName",
      "category",
      "strength",
      "dosageForm",
      "manufacturer",
      "description",
      "prescriptionRequired",
      "unitPrice",
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

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      medicine,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
};