const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} = require("../services/notification.service");

const getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, limit } = req.query;

    const notifications = await getUserNotifications(req.user._id, {
      unreadOnly: unreadOnly === "true",
      limit,
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await getUnreadNotificationCount(req.user._id);

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await markNotificationAsRead(
      req.params.id,
      req.user._id
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const result = await markAllNotificationsAsRead(req.user._id);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
