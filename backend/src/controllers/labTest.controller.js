const LabTest = require("../models/LabTest");

// ============================================================
// CREATE LABORATORY TEST
// ============================================================

const createLabTest = async (req, res, next) => {
  try {
    const {
      name,
      code,
      category,
      description,
      sampleType,
      preparationRequired,
      price,
      turnaroundTime,
    } = req.body;

    if (!name || !code || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, code, category and price are required.",
      });
    }

    const existingTest = await LabTest.findOne({
      $or: [
        { name: name.trim() },
        { code: code.trim().toUpperCase() },
      ],
    });

    if (existingTest) {
      return res.status(409).json({
        success: false,
        message: "Laboratory test already exists.",
      });
    }

    const labTest = await LabTest.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      category: category.trim(),
      description: description || "",
      sampleType: sampleType || "",
      preparationRequired: preparationRequired || "",
      price: Number(price),
      turnaroundTime: turnaroundTime || "",
    });

    return res.status(201).json({
      success: true,
      message: "Laboratory test created successfully.",
      labTest,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ALL LABORATORY TESTS
// ============================================================

const getLabTests = async (req, res, next) => {
  try {
    const { category, active } = req.query;

    const filter = {};

    if (category) {
      filter.category = category.toUpperCase();
    }

    if (active !== undefined) {
      filter.active = active === "true";
    }

    const labTests = await LabTest.find(filter).sort({
      name: 1,
    });

    return res.json({
      success: true,
      count: labTests.length,
      labTests,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ONE LABORATORY TEST
// ============================================================

const getLabTestById = async (req, res, next) => {
  try {
    const labTest = await LabTest.findById(req.params.id);

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: "Laboratory test not found.",
      });
    }

    return res.json({
      success: true,
      labTest,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE LABORATORY TEST
// ============================================================

const updateLabTest = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "code",
      "category",
      "description",
      "sampleType",
      "preparationRequired",
      "price",
      "turnaroundTime",
      "active",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.name) {
      updates.name = updates.name.trim();
    }

    if (updates.code) {
      updates.code = updates.code.trim().toUpperCase();
    }

    if (updates.category) {
      updates.category = updates.category.trim();
    }

    if (updates.price !== undefined) {
      updates.price = Number(updates.price);
    }

    const labTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: "Laboratory test not found.",
      });
    }

    return res.json({
      success: true,
      message: "Laboratory test updated successfully.",
      labTest,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createLabTest,
  getLabTests,
  getLabTestById,
  updateLabTest,
};