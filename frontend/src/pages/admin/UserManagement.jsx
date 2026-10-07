import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "http://localhost:5001/api";

function UserManagement() {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load all users
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load users");
      }

      setUsers(data.users || []);
    } catch (err) {
      console.error("Load users error:", err);
      setError(err.message || "Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  // Activate / deactivate user
  const updateUserStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            active: !currentStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user status");
      }

      // Update user immediately in UI
      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                active: !currentStatus,
              }
            : user
        )
      );
    } catch (err) {
      console.error("Update user status error:", err);
      alert(err.message || "Unable to update user status");
    }
  };

  useEffect(() => {
    if (token) {
      loadUsers();
    }
  }, [token]);

  // Loading
  if (loading) {
    return (
      <div>
        <h2>User Management</h2>
        <p>Loading users...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div>
        <h2>User Management</h2>

        <p style={{ color: "red" }}>
          {error}
        </p>

        <button onClick={loadUsers}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>MeroAsha User Management</h1>

      <hr />

      <div>
        <h3>User Statistics</h3>

        <p>
          <strong>Total Users:</strong> {users.length}
        </p>

        <p>
          <strong>Active Users:</strong>{" "}
          {users.filter((user) => user.active).length}
        </p>

        <p>
          <strong>Inactive Users:</strong>{" "}
          {users.filter((user) => !user.active).length}
        </p>
      </div>

      <hr />

      <h2>All Users</h2>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          cellSpacing="0"
          width="100%"
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>

                <td>{user.email}</td>

                <td>
                  {user.phone || "-"}
                </td>

                <td>
                  {user.role}
                </td>

                <td>
                  {user.active ? (
                    <strong>Active</strong>
                  ) : (
                    <strong>Inactive</strong>
                  )}
                </td>

                <td>
                  <button
                    onClick={() =>
                      updateUserStatus(
                        user._id,
                        user.active
                      )
                    }
                  >
                    {user.active
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr />

      <button onClick={loadUsers}>
        Refresh Users
      </button>
    </div>
  );
}

export default UserManagement;