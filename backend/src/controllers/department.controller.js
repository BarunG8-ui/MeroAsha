const mongoose = require("mongoose");
const Department = require("../models/Department");

// ============================================================
// CREATE DEPARTMENT
// ============================================================
const createDepartment = async (req, res, next) => {
  try {
    const {
      name,
      code,
      description,
      location,
      floor,
      contactNumber,
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Department name and code are required",
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    const existingDepartment = await Department.findOne({
      $or: [
        { name: name.trim() },
        { code: normalizedCode },
      ],
    });

    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message: "Department with this name or code already exists",
      });
    }

    const department = await Department.create({
      name: name.trim(),
      code: normalizedCode,
      description: description?.trim() || "",
      location: location?.trim() || "",
      floor: floor?.trim() || "",
      contactNumber: contactNumber?.trim() || "",
      active: true,
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ALL DEPARTMENTS
// ============================================================
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .sort({ name: 1 });

    return res.json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET DEPARTMENT BY ID
// ============================================================
const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.json({
      success: true,
      department,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE DEPARTMENT
// ============================================================
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    const {
      name,
      code,
      description,
      location,
      floor,
      contactNumber,
    } = req.body;

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (name !== undefined) {
      department.name = name.trim();
    }

    if (code !== undefined) {
      department.code = code.trim().toUpperCase();
    }

    if (description !== undefined) {
      department.description = description.trim();
    }

    if (location !== undefined) {
      department.location = location.trim();
    }

    if (floor !== undefined) {
      department.floor = floor.trim();
    }

    if (contactNumber !== undefined) {
      department.contactNumber = contactNumber.trim();
    }

    await department.save();

    return res.json({
      success: true,
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE DEPARTMENT STATUS
// ============================================================
const updateDepartmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    if (typeof active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Active status must be true or false",
      });
    }

    const department = await Department.findByIdAndUpdate(
      id,
      { active },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.json({
      success: true,
      message: active
        ? "Department activated successfully"
        : "Department deactivated successfully",
      department,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  updateDepartmentStatus,
};