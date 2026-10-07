import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email address.";
    }

    if (!formData.phone.trim()) {
      return "Please enter your phone number.";
    }

    if (!formData.password) {
      return "Please create a password.";
    }

    if (formData.password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5001/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed."
        );
      }

      setSuccess(
        "Your MeroAsha account has been created successfully."
      );

      /*
       * The backend returns the newly created user.
       * We log the user in using the same credentials.
       */
      await login(
        formData.email.trim(),
        formData.password
      );

      setTimeout(() => {
        navigate("/patient/dashboard");
      }, 300);

    } catch (error) {
      setError(
        error.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* =========================
            BRAND PANEL
        ========================== */}

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
              YOUR HEALTHCARE JOURNEY
            </span>

            <h2>
              One account for
              <span> your care.</span>
            </h2>

            <p>
              Create your secure MeroAsha patient account
              and access connected healthcare services from
              one place.
            </p>

          </div>

          <div className="auth-features">

            <div>
              <strong>01</strong>
              <span>Manage your appointments</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Access your medical records</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Stay connected with your hospital</span>
            </div>

          </div>

        </div>

        {/* =========================
            FORM PANEL
        ========================== */}

        <div className="auth-form-panel">

          <div className="auth-form-wrapper">

            {/* Mobile brand */}

            <div className="mobile-auth-brand">

              <div className="auth-logo">M</div>

              <div>
                <strong>MeroAsha</strong>
                <span>Connected Healthcare</span>
              </div>

            </div>

            {/* Heading */}

            <div className="auth-heading">

              <span>GET STARTED</span>

              <h2>Create your account</h2>

              <p>
                Register as a patient to access MeroAsha.
              </p>

            </div>

            {/* Error */}

            {error && (
              <div className="auth-alert auth-alert-error">
                <strong>Registration unsuccessful</strong>
                <span>{error}</span>
              </div>
            )}

            {/* Success */}

            {success && (
              <div className="auth-alert auth-alert-success">
                <strong>Account created</strong>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Name */}

              <div className="form-group">

                <label htmlFor="name">
                  Full name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />

              </div>

              {/* Email */}

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

              {/* Phone */}

              <div className="form-group">

                <label htmlFor="phone">
                  Phone number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />

              </div>

              {/* Password */}

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
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

              </div>

              {/* Confirm Password */}

              <div className="form-group">

                <div className="form-label-row">

                  <label htmlFor="confirmPassword">
                    Confirm password
                  </label>

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

              </div>

              {/* Submit */}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Creating account..."
                  : "Create patient account"}
              </button>

            </form>

            {/* Login */}

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-register">

              <span>
                Already have an account?
              </span>

              <Link to="/login">
                Sign in
              </Link>

            </div>

            {/* Security */}

            <div className="auth-security-note">

              <span className="security-dot"></span>

              <span>
                Your account is protected by secure
                authentication.
              </span>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Register;