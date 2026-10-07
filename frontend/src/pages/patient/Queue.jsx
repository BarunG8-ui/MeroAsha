import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import "./Queue.css";

const API_BASE_URL = "http://localhost:5001/api";

function Queue() {
  const { token } = useAuth();
  const { socket } = useNotifications();

  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Fetch patient's queue
  // --------------------------------------------------
  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/queue/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load queue status"
        );
      }

      // Backend returns queue as an array.
      const queueList = Array.isArray(data.queue)
        ? data.queue
        : Array.isArray(data.data?.queue)
        ? data.data.queue
        : Array.isArray(data.data)
        ? data.data
        : [];

      // Prefer an active queue.
      const activeStatuses = [
        "WAITING",
        "QUEUED",
        "CALLED",
        "IN_CONSULTATION",
      ];

      const activeQueue =
        queueList.find((item) =>
          activeStatuses.includes(item.status)
        ) ||
        queueList[0] ||
        null;

      setQueue(activeQueue);
    } catch (err) {
      console.error("Queue error:", err);
      setError(
        err.message || "Unable to load queue status"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Initial queue fetch
  // --------------------------------------------------
  useEffect(() => {
    if (token) {
      fetchQueue();
    }
  }, [token]);

  // --------------------------------------------------
  // Real-time Socket.IO queue updates
  // --------------------------------------------------
  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdate = (queueData) => {
      console.log(
        "Real-time queue update received:",
        queueData
      );

      if (!queueData) return;

      setQueue((previousQueue) => {
        if (!previousQueue) {
          return queueData;
        }

        return {
          ...previousQueue,
          ...queueData,
        };
      });
    };

    socket.on("queue:update", handleQueueUpdate);

    return () => {
      socket.off("queue:update", handleQueueUpdate);
    };
  }, [socket]);

  // --------------------------------------------------
  // Queue status styling
  // --------------------------------------------------
  const getStatusClass = (status) => {
    switch (status) {
      case "WAITING":
      case "QUEUED":
        return "queue-status-waiting";

      case "CALLED":
        return "queue-status-called";

      case "IN_CONSULTATION":
        return "queue-status-consultation";

      case "COMPLETED":
        return "queue-status-completed";

      case "CANCELLED":
        return "queue-status-cancelled";

      default:
        return "";
    }
  };

  // --------------------------------------------------
  // Queue status label
  // --------------------------------------------------
  const getStatusLabel = (status) => {
    switch (status) {
      case "WAITING":
      case "QUEUED":
        return "WAITING";

      case "CALLED":
        return "CALLED";

      case "IN_CONSULTATION":
        return "IN CONSULTATION";

      case "COMPLETED":
        return "COMPLETED";

      case "CANCELLED":
        return "CANCELLED";

      default:
        return status || "UNKNOWN";
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="queue-page">
        <div className="queue-loading">
          <div className="queue-spinner"></div>
          <p>Loading live queue status...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------
  return (
    <div className="queue-page">

      {/* Header */}
      <div className="queue-header">
        <div>
          <span className="page-eyebrow">
            PATIENT PORTAL
          </span>

          <h1>Live Queue Status</h1>

          <p>
            Track your position in the hospital
            consultation queue.
          </p>
        </div>

        <button
          className="queue-refresh-btn"
          onClick={fetchQueue}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="queue-error">
          <strong>Unable to load queue</strong>

          <span>{error}</span>

          <button onClick={fetchQueue}>
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!error && !queue && (
        <div className="queue-empty">
          <div className="queue-empty-icon">
            🎫
          </div>

          <h2>No active queue</h2>

          <p>
            You don't currently have an active
            hospital queue.
          </p>
        </div>
      )}

      {/* Queue */}
      {!error && queue && (
        <>
          {/* Live Banner */}
          <div className="queue-live-banner">
            <span className="live-dot"></span>

            <div>
              <strong>LIVE QUEUE</strong>

              <span>
                Queue information updates
                automatically.
              </span>
            </div>
          </div>

          {/* Main Queue Card */}
          <div className="queue-main-card">

            {/* Your Token */}
            <div className="queue-token-section">

              <span className="queue-label">
                YOUR TOKEN
              </span>

              <div className="queue-token">
                {queue.tokenNumber ??
                  queue.token ??
                  "--"}
              </div>

              <span
                className={`queue-status ${getStatusClass(
                  queue.status
                )}`}
              >
                {getStatusLabel(queue.status)}
              </span>
            </div>

            <div className="queue-divider"></div>

            {/* Current Token */}
            <div className="queue-stat">
              <span className="queue-stat-label">
                CURRENT TOKEN
              </span>

              <strong>
                {queue.currentTokenNumber ??
                  queue.currentToken ??
                  "--"}
              </strong>
            </div>

            {/* Patients Ahead */}
            <div className="queue-stat">
              <span className="queue-stat-label">
                PATIENTS AHEAD
              </span>

              <strong>
                {queue.patientsAhead ??
                  (queue.currentTokenNumber != null &&
                  queue.tokenNumber != null
                    ? Math.max(
                        queue.tokenNumber -
                          queue.currentTokenNumber -
                          1,
                        0
                      )
                    : "--")}
              </strong>
            </div>
          </div>

          {/* Queue Details */}
          <div className="queue-details-grid">

            {/* Doctor */}
            <div className="queue-detail-card">
              <span>DOCTOR</span>

              <strong>
                {queue.doctorId?.userId?.name ||
                  queue.doctorId?.name ||
                  queue.doctorName ||
                  "Doctor"}
              </strong>
            </div>

            {/* Department */}
            <div className="queue-detail-card">
              <span>DEPARTMENT</span>

              <strong>
                {queue.departmentId?.name ||
                  queue.departmentName ||
                  "Department"}
              </strong>
            </div>

            {/* Room */}
            <div className="queue-detail-card">
              <span>ROOM</span>

              <strong>
                {queue.roomNumber ||
                  queue.room ||
                  "Not assigned"}
              </strong>
            </div>

            {/* Queue ID */}
            <div className="queue-detail-card">
              <span>QUEUE ID</span>

              <strong>
                {queue.queueId ||
                  queue._id ||
                  "—"}
              </strong>
            </div>
          </div>

          {/* Information */}
          <div className="queue-information">

            <h2>What happens next?</h2>

            <div className="queue-steps">

              {/* Step 1 */}
              <div className="queue-step">
                <div className="step-number">
                  1
                </div>

                <div>
                  <strong>
                    Wait for your token
                  </strong>

                  <p>
                    Stay available while patients
                    ahead are being consulted.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="queue-step">
                <div className="step-number">
                  2
                </div>

                <div>
                  <strong>
                    Watch the live status
                  </strong>

                  <p>
                    Your queue position will update
                    when the doctor calls the next
                    patient.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="queue-step">
                <div className="step-number">
                  3
                </div>

                <div>
                  <strong>
                    Proceed when called
                  </strong>

                  <p>
                    When your token is called,
                    proceed to the assigned
                    consultation room.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Queue;