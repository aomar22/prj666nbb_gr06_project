import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login, setToken, setUser } from "../../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();

  // Show success message if redirected from email verification
  const verifiedMessage = state?.verified
    ? "Email verified successfully! Please log in."
    : "";

  const isSenecaEmail = (value) =>
    /^[A-Za-z0-9._%+-]+@myseneca\.ca$/i.test(value.trim());

  const API_URL = "http://localhost:8080/api/auth";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation (Keep your existing checks)
    if (!isSenecaEmail(email)) {
      setError("Use a valid Seneca email (@myseneca.ca).");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      // Store token and user data
      if (response.token) {
        setToken(response.token);
      }

      // Store user data (excluding token)
      const userData = {
        id: response.id,
        email: response.email,
        role: response.role,
        firstName: response.firstName,
        lastName: response.lastName,
        campus: response.campus,
        isOnboarded: response.isOnboarded,
      };
      setUser(userData);

      // Redirect based on onboarding status
      if (response.isOnboarded) {
        navigate("/dashboard", { replace: true });
      } else {
        // Redirect to role-specific onboarding page
        const onboardingPath =
          response.role?.toUpperCase() === "TUTOR"
            ? "/onboarding/tutor"
            : "/onboarding/learner";
        navigate(onboardingPath, { replace: true });
      }
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginForm}>
        {/* Header Section - Dark Green */}
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <span style={styles.graduationCap}>🎓</span>
          </div>
          <h1 style={styles.logoText}>Scholarly</h1>
          <p style={styles.tagline}>Connect. Learn. Grow.</p>
        </div>

        {/* Body Section - White */}
        <div style={styles.body}>
          <h2 style={styles.welcomeText}>Welcome back</h2>

          {/* Success message from email verification */}
          {verifiedMessage && (
            <p style={styles.successMessage}>{verifiedMessage}</p>
          )}

          <form
            onSubmit={handleSubmit}
            style={styles.form}
          >
            <div style={styles.inputGroup}>
              <label style={styles.label}>Seneca Email</label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='name@myseneca.ca'
                style={styles.input}
                onFocus={(e) => (e.target.style.borderColor = "#1976D2")}
                onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter your password'
                style={styles.input}
                onFocus={(e) => (e.target.style.borderColor = "#1976D2")}
                onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button
              type='submit'
              style={{
                ...styles.loginButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
              onMouseEnter={(e) =>
                !loading && (e.target.style.backgroundColor = "#1565C0")
              }
              onMouseLeave={(e) =>
                !loading && (e.target.style.backgroundColor = "#1976D2")
              }
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p style={styles.signupText}>
            Don't have an account?{" "}
            <Link
              to='/signup'
              style={styles.signupLink}
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "relative",
    padding: "20px",
  },
  loginForm: {
    width: "100%",
    maxWidth: "450px",
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
    position: "relative",
    zIndex: 1,
  },
  header: {
    backgroundColor: "#1B5E20",
    padding: "40px 30px",
    textAlign: "center",
    color: "white",
  },
  iconCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  graduationCap: {
    fontSize: "40px",
  },
  logoText: {
    margin: "0 0 8px 0",
    fontSize: "32px",
    fontWeight: "bold",
    fontFamily: "Arial, sans-serif",
  },
  tagline: {
    margin: 0,
    fontSize: "14px",
    opacity: 0.95,
    fontFamily: "Arial, sans-serif",
  },
  body: {
    padding: "40px 30px",
    backgroundColor: "white",
  },
  welcomeText: {
    margin: "0 0 30px 0",
    fontSize: "24px",
    fontWeight: "600",
    color: "#333",
    fontFamily: "Arial, sans-serif",
  },
  successMessage: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    padding: "12px 16px",
    borderRadius: "4px",
    marginBottom: "20px",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
    fontFamily: "Arial, sans-serif",
  },
  input: {
    padding: "12px 15px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "white",
    outline: "none",
    transition: "border-color 0.2s",
  },
  error: {
    color: "#d32f2f",
    fontSize: "14px",
    margin: "-10px 0 0 0",
    fontFamily: "Arial, sans-serif",
  },
  loginButton: {
    padding: "14px",
    backgroundColor: "#1976D2",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "Arial, sans-serif",
    marginTop: "10px",
    transition: "background-color 0.2s",
  },
  signupText: {
    margin: "30px 0 0 0",
    textAlign: "center",
    fontSize: "14px",
    color: "#666",
    fontFamily: "Arial, sans-serif",
  },
  signupLink: {
    color: "#1976D2",
    textDecoration: "none",
    fontWeight: "500",
  },
};
