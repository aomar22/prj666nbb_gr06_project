import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <p>(Milestone 1: placeholder)</p>
      <p>
        Don’t have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}
