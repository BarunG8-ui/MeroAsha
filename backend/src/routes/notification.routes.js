const express = require("express");

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notification.controller");

const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, getNotifications);

router.get("/unread-count", authenticate, getUnreadCount);

router.patch("/read-all", authenticate, markAllAsRead);

router.patch("/:id/read", authenticate, markAsRead);

module.exports = router;
