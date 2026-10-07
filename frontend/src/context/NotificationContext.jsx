import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const API_BASE_URL = "http://localhost:5001/api";
const SOCKET_URL = "http://localhost:5001";

const NotificationContext = createContext(null);

function NotificationProvider({ children }) {
  const { token, user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  const refreshNotifications = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load notifications"
        );
      }

      setNotifications(
        data.notifications ||
          data.data?.notifications ||
          data.data ||
          []
      );
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD UNREAD COUNT
  // =========================================================

  const refreshUnreadCount = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load unread count"
        );
      }

      setUnreadCount(
        data.unreadCount ??
          data.data?.unreadCount ??
          0
      );
    } catch (error) {
      console.error(
        "Failed to load unread notification count:",
        error
      );
    }
  };

  // =========================================================
  // MARK ONE NOTIFICATION AS READ
  // =========================================================

  const markAsRead = async (notificationId) => {
    if (!token || !notificationId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to mark notification as read"
        );
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                read: true,
                readAt: new Date(),
              }
            : notification
        )
      );

      setUnreadCount((previous) =>
        Math.max(previous - 1, 0)
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };

  // =========================================================
  // MARK ALL NOTIFICATIONS AS READ
  // =========================================================

  const markAllNotificationsAsRead = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark all notifications as read"
        );
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
          readAt: new Date(),
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  };

  // =========================================================
  // INITIAL NOTIFICATION DATA
  // =========================================================

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    refreshNotifications();
    refreshUnreadCount();
  }, [token]);

  // =========================================================
  // SOCKET.IO CONNECTION
  // =========================================================

  useEffect(() => {
    if (!token || !user) {
      setSocket(null);
      return;
    }

    console.log("Connecting to MeroAsha Socket.IO...");

    const socketConnection = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket"],
    });

    socketConnection.on("connect", () => {
      console.log(
        "MeroAsha Socket connected:",
        socketConnection.id
      );
    });

    socketConnection.on("connect_error", (error) => {
      console.error(
        "Socket connection error:",
        error.message
      );
    });

    socketConnection.on("disconnect", (reason) => {
      console.log(
        "MeroAsha Socket disconnected:",
        reason
      );
    });

    // =======================================================
    // REAL-TIME NOTIFICATION
    // =======================================================

    socketConnection.on(
      "notification:new",
      (notification) => {
        console.log(
          "New real-time notification:",
          notification
        );

        setNotifications((previous) => [
          notification,
          ...previous,
        ]);

        setUnreadCount((previous) => previous + 1);
      }
    );

    // =======================================================
    // REAL-TIME QUEUE UPDATE
    // =======================================================

    socketConnection.on(
      "queue:update",
      (queueData) => {
        console.log(
          "Real-time queue update:",
          queueData
        );

        // Queue page will listen to this event
        // through the same Socket.IO connection.
      }
    );

    setSocket(socketConnection);

    return () => {
      console.log("Closing MeroAsha Socket connection");

      socketConnection.disconnect();
      setSocket(null);
    };
  }, [token, user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        socket,

        markAsRead,
        markAllNotificationsAsRead,

        refreshNotifications,
        refreshUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () =>
  useContext(NotificationContext);

export default NotificationProvider;