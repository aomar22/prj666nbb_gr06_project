// src/router/PublicRoute.jsx
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  try {
    const raw = localStorage.getItem("scholarly_initial_user");
    const initialUser = raw ? JSON.parse(raw) : null;
    if (initialUser?.email) {
      return <Navigate to="/verify-email" replace />;
    }
  } catch {
    // ignore
  }
  return children;
}
