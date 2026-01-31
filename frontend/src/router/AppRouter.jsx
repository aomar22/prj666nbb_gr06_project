import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "../auth/pages/SignUp";
import Login from "../auth/pages/Login";
import EmailVerification from "../auth/pages/EmailVerification";
import Home from "../auth/pages/Home";
import Onboarding from "../auth/pages/Onboarding";
import LearnerDashboard from "../pages/dashboard/LearnerDashboard";
import TutorDashboard from "../pages/dashboard/TutorDashboard";
import LearnerOnboarding from "../pages/onboarding/LearnerOnboarding";
import TutorOnboarding from "../pages/onboarding/TutorOnboarding";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import Availability from "../pages/availability/Availability";
import { getUser } from "../api";

// Component to redirect to role-specific dashboard
function DashboardRedirect() {
  const user = getUser();
  const role = user?.role?.toUpperCase();
  
  if (role === "TUTOR") {
    return <Navigate to="/dashboard/tutor" replace />;
  }
  return <Navigate to="/dashboard/learner" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path='/'
          element={
            <PublicRoute>
              <Navigate
                to='/home'
                replace
              />
            </PublicRoute>
          }
        />
        <Route
          path='/home'
          element={<Home />}
        />
        <Route
          path='/signup'
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path='/login'
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path='/verify-email'
          element={<EmailVerification />}
        />

        {/* Protected routes - require authentication */}
        <Route
          path='/onboarding/learner'
          element={
            <ProtectedRoute requiredRole='LEARNER'>
              <LearnerOnboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path='/onboarding/tutor'
          element={
            <ProtectedRoute requiredRole='TUTOR'>
              <TutorOnboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path='/onboarding/tutor/availability'
          element={<Availability/>}
        />
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute requireOnboarded>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path='/dashboard/learner'
          element={
            <ProtectedRoute requiredRole='LEARNER' requireOnboarded>
              <LearnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/dashboard/tutor'
          element={
            <ProtectedRoute requiredRole='TUTOR' requireOnboarded>
              <TutorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/dashboard/availability'
          element={
          <ProtectedRoute requiredRole='TUTOR' requireOnboarded>
            <Availability />
          </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
