const express = require("express");

const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  updateDepartmentStatus,
} = require("../controllers/department.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// ADMIN → Create department
router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  createDepartment
);

// AUTHENTICATED USERS → View all departments
router.get(
  "/",
  authenticate,
  getDepartments
);

// AUTHENTICATED USERS → View one department
router.get(
  "/:id",
  authenticate,
  getDepartmentById
);

// ADMIN → Update department
router.patch(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updateDepartment
);

// ADMIN → Activate / deactivate department
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("ADMIN"),
  updateDepartmentStatus
);

module.exports = router;