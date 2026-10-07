const API_BASE_URL = "http://localhost:5001/api";

export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error("Backend request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Backend connection error:", error);
    throw error;
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("meroasha_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong."
    );
  }

  return data;
};