import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // "learner" | "tutor"
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isSenecaEmail = (value) =>
    /^[A-Za-z0-9._%+-]+@myseneca\.ca$/i.test(value.trim());

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!isSenecaEmail(email)) {
      setError("Use a valid Seneca email (@myseneca.ca).");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!role) {
      setError("Please select Learner or Tutor.");
      return;
    }

    // Milestone 1: store initial user record (frontend stub)
    const initialUser = { email: email.trim().toLowerCase(), role };
    localStorage.setItem("scholarly_initial_user", JSON.stringify(initialUser));

    // Milestone 1: redirect to email verification
    navigate("/verify-email", { state: initialUser });
  };

  return (
    <div>
      <h1>Sign Up</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Seneca Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@myseneca.ca"
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
          />
        </div>

        <div>
          <p>Who will you be?</p>
          <button type="button" onClick={() => setRole("learner")}>
            Learner {role === "learner" ? "✓" : ""}
          </button>
          <button type="button" onClick={() => setRole("tutor")}>
            Tutor {role === "tutor" ? "✓" : ""}
          </button>
        </div>

        {error && <p style={{ color: "crimson" }}>{error}</p>}

        <button type="submit">Create Account</button>
      </form>

      <p>
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </div>
  );
}

