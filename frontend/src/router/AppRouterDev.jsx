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
import AvailabilityV2 from "../pages/availability/AvailabilityV2";
import BookingSession from "../pages/booking/BookingSession";
import TutorSessionManagement from "../pages/booking/TutorSessionManagement";
import LearnerMyReviews from "../pages/dashboard/LearnerMyReviews";
import TutorMyReviews from "../pages/dashboard/TutorMyReviews";
import { getUser } from "../api";

function DashboardReviewsRedirect() {
  const role = getUser()?.role?.toUpperCase();
  if (role === "LEARNER") {
    return <Navigate to="/dashboard/learner/reviews" replace />;
  }
  return <Navigate to="/dashboard/tutor/reviews" replace />;
}

// Component to redirect to role-specific dashboard based on user's role
function DashboardRedirect() {
  const user = getUser();
  const role = user?.role?.toUpperCase();
  
  if (role === "TUTOR") {
    return <Navigate to="/dashboard/tutor" replace />;
  }
  return <Navigate to="/dashboard/learner" replace />;
}


export default function AppRouterDev() {
  return (
    <BrowserRouter>
      <Routes>
        {/* All routes are now direct - no ProtectedRoute wrappers */}
        <Route
          path='/'
          element={
            <Navigate
              to='/home'
              replace
            />
          }
        />
        <Route
          path='/home'
          element={<Home />}
        />
        <Route
          path='/signup'
          element={<SignUp />}
        />
        <Route
          path='/login'
          element={<Login />}
        />
        <Route
          path='/verify-email'
          element={<EmailVerification />}
        />

        {/* Onboarding routes unlocked */}
        <Route
          path='/onboarding/learner'
          element={<LearnerOnboarding />}
        />
        <Route
          path='/onboarding/tutor'
          element={<TutorOnboarding />}
        />
        <Route
          path='/onboarding/tutor/availability-v2'
          element={<AvailabilityV2 />}
        />

        {/* Dashboard unlocked - redirects based on user role */}
        <Route
          path='/dashboard'
          element={<DashboardRedirect />}
        />
        <Route
          path='/dashboard/learner'
          element={<LearnerDashboard />}
        />
        <Route
          path='/dashboard/learner/reviews'
          element={<LearnerMyReviews />}
        />
        <Route
          path="/dashboard/reviews"
          element={<DashboardReviewsRedirect />}
        />
         <Route
            path='/dashboard/learner/booking'
            element={<BookingSession />}
          />
        <Route
          path='/dashboard/tutor'
          element={<TutorDashboard />}
        />
        <Route
          path='/dashboard/tutor/reviews'
          element={<TutorMyReviews />}
        />
        <Route
          path='/dashboard/tutor/sessions'
          element={<TutorSessionManagement />}
        />
        <Route
          path='/dashboard/availability-v2'
          element={<AvailabilityV2 />}
        />

        {/* Catch-all for dev: Redirect any unknown route to home */}
        <Route
          path='*'
          element={
            <Navigate
              to='/home'
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
