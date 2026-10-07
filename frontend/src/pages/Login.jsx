import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await login(
        formData.email,
        formData.password
      );

      const role = data.user?.role;

      if (role === "PATIENT") {
        navigate("/patient/dashboard");
      } else if (role === "ADMIN") {
        navigate("/admin/users");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setError(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-brand-panel">
          <div className="auth-brand">
            <div className="auth-logo">M</div>

            <div>
              <h1>MeroAsha</h1>
              <span>Connected Healthcare</span>
            </div>
          </div>

          <div className="auth-brand-content">
            <span className="auth-eyebrow">
              DIGITAL HEALTHCARE PLATFORM
            </span>

            <h2>
              Healthcare that stays
              <span> connected.</span>
            </h2>

            <p>
              Secure access to appointments, medical records,
              laboratory reports, prescriptions and other
              hospital services.
            </p>
          </div>

          <div className="auth-features">
            <div>
              <strong>01</strong>
              <span>Secure patient records</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Connected hospital services</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Real-time healthcare updates</span>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-wrapper">

            <div className="mobile-auth-brand">
              <div className="auth-logo">M</div>
              <div>
                <strong>MeroAsha</strong>
                <span>Connected Healthcare</span>
              </div>
            </div>

            <div className="auth-heading">
              <span>WELCOME BACK</span>
              <h2>Sign in to your account</h2>
              <p>
                Access your MeroAsha healthcare portal.
              </p>
            </div>

            {error && (
              <div className="auth-alert auth-alert-error">
                <strong>Unable to sign in</strong>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-register">
              <span>Don't have a MeroAsha account?</span>

              <Link to="/register">
                Create an account
              </Link>
            </div>

            <div className="auth-security-note">
              <span className="security-dot"></span>

              <span>
                Your healthcare information is protected
                by secure authentication.
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;