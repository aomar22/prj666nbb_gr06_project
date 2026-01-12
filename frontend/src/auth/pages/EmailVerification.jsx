import { useLocation, Link } from "react-router-dom";

export default function EmailVerification() {
  const { state } = useLocation();
  return (
    <div>
      <h1>Email Verification</h1>
      <p>Check your Seneca email to verify your account.</p>

      {state?.email && (
        <p>
          Verifying <b>{state.email}</b> as <b>{state.role}</b>
        </p>
      )}

      <p>
        Back to <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
