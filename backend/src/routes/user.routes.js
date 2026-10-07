const express = require("express");

const {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole
} = require("../controllers/user.controller");

const {
  authenticate
} = require("../middleware/auth.middleware");

const {
  authorizeRoles
} = require("../middleware/role.middleware");

const router = express.Router();

/*
 * Only administrators can manage users.
 */

router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  getUsers
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  getUserById
);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("ADMIN"),
  updateUserStatus
);

router.patch(
  "/:id/role",
  authenticate,
  authorizeRoles("ADMIN"),
  updateUserRole
);

module.exports = router;