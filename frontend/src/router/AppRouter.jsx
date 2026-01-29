import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "../auth/pages/SignUp";
import Login from "../auth/pages/Login";
import EmailVerification from "../auth/pages/EmailVerification";
import Home from "../auth/pages/Home";
import Onboarding from "../auth/pages/Onboarding";
import Dashboard from "../pages/Dashboard";
import LearnerOnboarding from "../pages/onboarding/LearnerOnboarding";
import TutorOnboarding from "../pages/onboarding/TutorOnboarding";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicRoute><Navigate to="/home" replace /></PublicRoute>} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/verify-email" element={<EmailVerification />} />

        {/* Protected routes - require authentication */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/onboarding/learner"
          element={
            <ProtectedRoute requiredRole="LEARNER">
              <LearnerOnboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/tutor"
          element={
            <ProtectedRoute requiredRole="TUTOR">
              <TutorOnboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireOnboarded>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
