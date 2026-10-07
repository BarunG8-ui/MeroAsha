const mongoose = require("mongoose");

const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Department = require("../models/Department");

// ============================================================
// GET ALL DOCTORS
// ============================================================

const getDoctors = async (req, res, next) => {
  try {
    const { departmentId, search, active } = req.query;

    const filter = {};

    if (active !== undefined) {
      filter.active = active === "true";
    } else {
      filter.active = true;
    }

    if (departmentId) {
      if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid department ID",
        });
      }

      filter.departmentId = departmentId;
    }

    const doctors = await Doctor.find(filter)
      .populate({
        path: "userId",
        select: "name email phone",
      })
      .populate(
        "departmentId",
        "name code description location floor contactNumber"
      )
      .sort({
        createdAt: -1,
      });

    let filteredDoctors = doctors;

    if (search && search.trim()) {
      const searchText = search.trim().toLowerCase();

      filteredDoctors = doctors.filter((doctor) => {
        const doctorName = doctor.userId?.name?.toLowerCase() || "";
        const specialization =
          doctor.specialization?.toLowerCase() || "";
        const qualification =
          doctor.qualification?.toLowerCase() || "";
        const doctorId =
          doctor.doctorId?.toLowerCase() || "";

        return (
          doctorName.includes(searchText) ||
          specialization.includes(searchText) ||
          qualification.includes(searchText) ||
          doctorId.includes(searchText)
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: filteredDoctors.length,
      doctors: filteredDoctors,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET DOCTORS BY DEPARTMENT
// ============================================================

const getDoctorsByDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    const department = await Department.findOne({
      _id: departmentId,
      active: true,
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const doctors = await Doctor.find({
      departmentId,
      active: true,
    })
      .populate({
        path: "userId",
        select: "name email phone",
      })
      .populate(
        "departmentId",
        "name code description location floor contactNumber"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      department,
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET SINGLE DOCTOR
// ============================================================

const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findOne({
      _id: id,
      active: true,
    })
      .populate({
        path: "userId",
        select: "name email phone",
      })
      .populate(
        "departmentId",
        "name code description location floor contactNumber"
      );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// ADMIN → UPDATE DOCTOR STATUS
// ============================================================

const updateDoctorStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active, availableForConsultation } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (active !== undefined) {
      doctor.active = Boolean(active);
    }

    if (availableForConsultation !== undefined) {
      doctor.availableForConsultation =
        Boolean(availableForConsultation);
    }

    await doctor.save();

    const updatedDoctor = await Doctor.findById(doctor._id)
      .populate({
        path: "userId",
        select: "name email phone",
      })
      .populate(
        "departmentId",
        "name code description location floor contactNumber"
      );

    return res.status(200).json({
      success: true,
      message: "Doctor status updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getDoctorsByDepartment,
  updateDoctorStatus,
};