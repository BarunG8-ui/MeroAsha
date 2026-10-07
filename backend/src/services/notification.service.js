const Notification = require("../models/Notification");

const createNotification = async ({
  recipientId,
  type,
  title,
  message,
  data = {},
  priority = "NORMAL",
}) => {
  const notification = await Notification.create({
    recipientId,
    type,
    title,
    message,
    data,
    priority,
  });

  return notification;
};

const getUserNotifications = async (userId, options = {}) => {
  const limit = Math.min(Number(options.limit) || 20, 100);

  const query = {
    recipientId: userId,
  };

  if (options.unreadOnly === true) {
    query.read = false;
  }

  return Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

const markNotificationAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipientId: userId,
    },
    {
      read: true,
      readAt: new Date(),
    },
    {
      new: true,
    }
  );
};

const markAllNotificationsAsRead = async (userId) => {
  return Notification.updateMany(
    {
      recipientId: userId,
      read: false,
    },
    {
      $set: {
        read: true,
        readAt: new Date(),
      },
    }
  );
};

const getUnreadNotificationCount = async (userId) => {
  return Notification.countDocuments({
    recipientId: userId,
    read: false,
  });
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
};
