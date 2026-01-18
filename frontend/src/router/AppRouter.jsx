import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "../auth/pages/SignUp";
import Login from "../auth/pages/Login";
import EmailVerification from "../auth/pages/EmailVerification";
import Home from "../auth/pages/Home";
import Onboarding from "../auth/pages/Onboarding";


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/home" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
  );
}
