import { Navigate, useLocation } from "react-router-dom";

export default function TutorOnboarding() {
  const { state } = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded shadow">
        Tutor onboarding placeholder (coming next)
      </div>
    </div>
  );
}
