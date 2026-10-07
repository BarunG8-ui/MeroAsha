import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

const API_BASE_URL = "http://localhost:5001/api";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("meroasha_token")
  );

  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async (authToken) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Authentication failed"
        );
      }

      setUser(data.user);

      return data.user;

    } catch (error) {
      console.error(
        "Failed to fetch current user:",
        error
      );

      localStorage.removeItem("meroasha_token");

      setToken(null);
      setUser(null);

      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken =
        localStorage.getItem("meroasha_token");

      if (storedToken) {
        await fetchCurrentUser(storedToken);
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      localStorage.setItem(
        "meroasha_token",
        data.token
      );

      setToken(data.token);
      setUser(data.user);

      return data;

    } catch (error) {
      console.error("Login error:", error);

      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("meroasha_token");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;