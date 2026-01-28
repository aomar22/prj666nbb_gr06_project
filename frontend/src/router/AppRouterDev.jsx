import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "../auth/pages/SignUp";
import Login from "../auth/pages/Login";
import EmailVerification from "../auth/pages/EmailVerification";
import Home from "../auth/pages/Home";
import Onboarding from "../auth/pages/Onboarding";
import Dashboard from "../pages/Dashboard";
import LearnerOnboarding from "../pages/onboarding/LearnerOnboarding";
import TutorOnboarding from "../pages/onboarding/TutorOnboarding";

export default function AppRouterDev() {
  return (
    <BrowserRouter>
      <Routes>
        {/* All routes are now direct - no ProtectedRoute wrappers */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        
        {/* Onboarding routes unlocked */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/onboarding/learner" element={<LearnerOnboarding />} />
        <Route path="/onboarding/tutor" element={<TutorOnboarding />} />
        
        {/* Dashboard unlocked */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Catch-all for dev: Redirect any unknown route to home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}