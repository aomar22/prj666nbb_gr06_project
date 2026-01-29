import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../api";

/**
 * ProtectedRoute - Wraps routes that require authentication
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authenticated
 * @param {boolean} props.requireOnboarded - If true, also requires user to be onboarded
 * @param {string} props.requiredRole - If set, requires user to have this role (e.g., "LEARNER" or "TUTOR")
 */
export default function ProtectedRoute({ children, requireOnboarded = false, requiredRole = null }) {
  const token = getToken();
  const user = getUser();

  // No token or incomplete user data - redirect to login
  // Must have both a valid token AND user object with email to be considered authenticated
  if (!token || !user || !user.email) {
    //try to detect an initial (unverified) user from localStorage
    let initialUser = null;
    try {
      const raw = localStorage.getItem("scholarly_initial_user");
      initialUser = raw ? JSON.parse(raw) : null;
    } catch {
      initialUser = null;
    }

    // if there is one, send them to the verify page
    if (initialUser?.email) {
      return <Navigate to="/verify-email" replace />;
    }

    //fall back to the login redirect
    return <Navigate to="/login" replace />;
  }

  // Role-based access control - redirect to correct onboarding if role doesn't match
  if (requiredRole && user.role?.toUpperCase() !== requiredRole.toUpperCase()) {
    // User is trying to access wrong role's page, redirect to their correct onboarding
    const correctPath =
      user.role?.toUpperCase() === "TUTOR"
        ? "/onboarding/tutor"
        : "/onboarding/learner";
    return <Navigate to={correctPath} replace />;
  }

  // If requireOnboarded is true and user is not onboarded, redirect to onboarding
  if (requireOnboarded && !user.isOnboarded) {
    const onboardingPath =
      user.role?.toUpperCase() === "TUTOR"
        ? "/onboarding/tutor"
        : "/onboarding/learner";
    return <Navigate to={onboardingPath} replace />;
  }

  return children;
}
