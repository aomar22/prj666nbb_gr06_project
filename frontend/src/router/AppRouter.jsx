import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "../auth/pages/SignUp";
import Login from "../auth/pages/Login";
import EmailVerification from "../auth/pages/EmailVerification";
import Home from "../auth/pages/Home";
import LearnerDashboard from "../pages/dashboard/LearnerDashboard";
import TutorDashboard from "../pages/dashboard/TutorDashboard";
import FindTutors from "../pages/dashboard/FindTutors";
import FindTutorsResults from "../pages/dashboard/FindTutorsResults";
import ViewTutorProfile from "../pages/dashboard/ViewTutorProfile";
import LearnerOnboarding from "../pages/onboarding/LearnerOnboarding";
import TutorOnboarding from "../pages/onboarding/TutorOnboarding";
import { getUser } from "../api";
import AvailabilityV2 from "../pages/availability/AvailabilityV2";
import BookingSession from "../pages/booking/BookingSession";
import LearnerSessionManagement from "../pages/booking/LearnerSessionManagement";
import LearnerSessionReschedule from "../pages/booking/LearnerSessionReschedule";
import TutorSessionManagement from "../pages/booking/TutorSessionManagement";
import EditProfile from "../pages/settings/learner/EditProfile";
import LearnerPassword from "../pages/settings/learner/LearnerPassword";
import TutorEditProfile from "../pages/settings/tutor/TutorEditProfile";
import TutorPassword from "../pages/settings/tutor/TutorPassword";

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
        <Route path='/' element={<Navigate to='/home' replace />} />
        <Route path='/home' element={<Home />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<Login />} />
        <Route path='/verify-email' element={<EmailVerification />} />

        {/* Onboarding routes */}
        <Route path='/onboarding/learner' element={<LearnerOnboarding />} />
        <Route path='/onboarding/tutor' element={<TutorOnboarding />} />
        <Route path='/onboarding/tutor/availability-v2' element={<AvailabilityV2 />} />

        {/* Dashboard routes */}
        <Route path='/dashboard' element={<DashboardRedirect />} />
        <Route path='/dashboard/learner' element={<LearnerDashboard />} />
        <Route path='/dashboard/learner/find-tutors' element={<FindTutors />} />
        <Route path='/dashboard/learner/find-tutors/results' element={<FindTutorsResults />} />
        <Route path='/dashboard/learner/find-tutors/profile' element={<ViewTutorProfile />} />
        <Route path='/dashboard/learner/booking' element={<BookingSession />} />
        <Route path='/dashboard/learner/sessions' element={<LearnerSessionManagement />} />
        <Route path='/dashboard/learner/sessions/reschedule' element={<LearnerSessionReschedule />} />
        <Route path='/dashboard/tutor' element={<TutorDashboard />} />
        <Route path='/dashboard/tutor/sessions' element={<TutorSessionManagement />} />
        <Route path='/dashboard/availability-v2' element={<AvailabilityV2 />} />

        {/* Settings Routes */}
        <Route path="/settings/learner/profile/edit" element={<EditProfile />} />
        <Route path="/settings/learner/profile/password" element={<LearnerPassword />} />
        <Route path="/settings/tutor/profile/edit" element={<TutorEditProfile />} />
        <Route path="/settings/tutor/profile/password" element={<TutorPassword />} />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
