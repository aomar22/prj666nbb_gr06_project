import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getUser, setUser, setToken, onboardUser } from "../../api";
import { PROGRAMS, CAMPUSES } from "../../constants/options";

export default function LearnerOnboarding() {
  const navigate = useNavigate();
  const user = getUser();

  // Redirect to login if no user data (not logged in)
  if (!user?.email) {
    return <Navigate to="/login" replace />;
  }

  // Already onboarded, redirect to dashboard
  if (user?.isOnboarded) {
    return <Navigate to="/dashboard" replace />;
  }

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [program, setProgram] = useState("");
  const [campus, setCampus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async (e) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !program || !campus) {
      setError("Please complete all required fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await onboardUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        campus,
        program,
      });

      // Update stored token if a new one is returned
      if (response?.token) {
        setToken(response.token);
      }

      // Update stored user data
      const updatedUser = {
        ...user,
        firstName: response?.firstName || firstName.trim(),
        lastName: response?.lastName || lastName.trim(),
        campus: response?.campus || campus,
        isOnboarded: true,
      };
      setUser(updatedUser);

      // Redirect to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/seneca-5.jpg')] bg-cover bg-center flex items-center justify-center p-6">
      {/* Card */}
      <div className="w-[750.84px] h-[800px] bg-white rounded-[10px] shadow-2xl overflow-visible">
        {/* Header */}
        <div className="relative h-[205.25px] bg-[#0B2F86] flex flex-col items-center justify-center pt-[52px]">
          {/* floating logo circle */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2">
            <div className="h-[80px] w-[88px] rounded-full bg-white
             flex items-center justify-center shadow-lg"
             style={{boxShadow: "0px 4px 4px 0px #00000040"}}>
              <img src="/hat.png" alt="Scholarly logo" className="h-[48px] w-[48px]" />
            </div>
          </div>

          <div className="pt-6 text-center">
            <h1 className="text-white font-['Inter'] text-[40px] font-extrabold leading-[40px] font-bold mt-6">
              Scholarly
            </h1>
            <p className="text-[#D2D0D0] text-[15px] font-bold mt-2">
              Connect. Learn. Grow.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-[50px] pt-[15px] pb-[22px]">
          <div className="font-mono text-[#0066CC] text-[48px] font-bold leading-none">
            Congratulations!
          </div>

          <div className="font-mono text-[#0066CC] text-[25px]
                          top-[268.76px] left-[26px]
                         font-bold mt-2">
            Your account has been created.
          </div>

          <div className="font-mono text-black text-[25px] font-bold mt-2 leading-snug">
            We just need a few details to personalize
            <br />
            your learning experience.
          </div>

          <form onSubmit={handleContinue} className="mt-2 space-y-1.5">
            {/* First Name & Last Name row */}
            <div className="flex gap-6">
              <div className="space-y-2 flex-1">
                <label className="block font-mono text-black text-[18px] text-neutral-900">
                  First Name <span className="text-red-600">*</span>
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder=""
                  className="w-full h-[54px] rounded-[10px]
                             border border-[#E5E5E5] shadow-md
                             px-4 font-mono text-[18px] outline-none"
                  style={{boxShadow: "0px 0px 10px 0px #00000059"}}
                />
              </div>

              <div className="space-y-2 flex-1">
                <label className="block font-mono text-black text-[18px] text-neutral-900">
                  Last Name <span className="text-red-600">*</span>
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder=""
                  className="w-full h-[54px] rounded-[10px]
                             border border-[#E5E5E5] shadow-md
                             px-4 font-mono text-[18px] outline-none"
                  style={{boxShadow: "0px 0px 10px 0px #00000059"}}
                />
              </div>
            </div>

            {/* Program */}
            <div className="mt-3 space-y-2">
              <label className="font-mono text-black text-[18px]">Program / Major <span className="text-red-600">*</span></label>
              <div className="relative w-[426px]">
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-[426px] h-[53px] rounded-[10px]
                             border border-[#E5E5E5] shadow-md
                             px-4 pr-14 font-mono text-[18px]
                             outline-none appearance-none bg-white"
                             style={{ boxShadow: "0px 0px 10px 0px #00000059"}}
                >
                  <option value="" disabled>
                    Select program
                  </option>
                  {PROGRAMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                {/* small dropdown pill*/}
                <div className="pointer-events-none absolute top-1/2
                                right-3 -translate-y-1/2 h-[34px] w-[44px]
                                rounded-full border border-[#E5E5E5]
                                bg-white shadow flex items-center justify-center"
                                style={{ boxShadow: "0px 3px 5px 0px #000000"}}
                                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="#111"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Campus */}
            <div className="mt-7 space-y-2">
              <label className="font-mono text-black text-[18px]">Campus
                <span className="text-red-600">*</span>
              </label>
              <div className="relative w-[426px]">
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-[426px] h-[54px] rounded-[10px]
                       border border-[#E5E5E5] shadow-md px-4 pr-14 font-mono text-[18px] outline-none appearance-none bg-white"
                  style={{boxShadow: "0px 0px 10px 0px #00000059"}}
                >
                  <option value="" disabled>
                    Select campus
                  </option>
                  {CAMPUSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute top-1/2 right-3
                                -translate-y-1/2 h-[34px] w-[44px] rounded-full
                                border border-[#E5E5E5] bg-white shadow flex
                                items-center justify-center"
                                style={{ boxShadow: "0px 3px 5px 0px #000000"}}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="#111"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 font-mono text-red-600 text-[16px] font-semibold">
                {error}
              </div>
            )}

            {/* Button */}
            <div className="mt-10 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className={`w-[560px] h-[64px] rounded-[10px] bg-[#0066CC] text-white font-mono text-[24px] shadow-xl ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Completing Setup..." : "Complete Setup"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
