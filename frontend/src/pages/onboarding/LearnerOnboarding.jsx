import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

const PROGRAMS = [
  "CPA (Computer Programming & Analysis)",
  "Software Engineering",
  "Computer Science",
  "Business",
  "Other",
];

const CAMPUSES = ["Newnham", "Seneca@York", "King", "Markham", "Online"];

export default function LearnerOnboarding() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // local storage only
  const initialUser = useMemo(() => {
    if (state?.email) return state;
    try {
      const raw = localStorage.getItem("scholarly_initial_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [state]);

  if (!initialUser?.email) return <Navigate to="/login" replace />;

  const [fullName, setFullName] = useState("");
  const [program, setProgram] = useState("");
  const [semester, setSemester] = useState("Sem 4");
  const [campus, setCampus] = useState("");
  const [error, setError] = useState("");

  const handleContinue = (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !program || !semester || !campus) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      localStorage.setItem(
        "scholarly_learner_profile_draft",
        JSON.stringify({
          email: initialUser.email,
          role: "learner",
          fullName: fullName.trim(),
          program,
          semester,
          campus,
        })
      );
    } catch {
      setError("An unexpected error occurred. Please try again."); return;
    }

    navigate("/login", { replace: true });
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

          <form onSubmit={handleContinue} className="mt-2  space-y-1.5">
            
                  <div className="space-y-2">
                    <label className="block font-mono text-black text-[18px]
                                   text-neutral-900">
                    Full Name <span className="text-red-600">*</span>
                    </label>
                    
                    <input 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder=""
                    className="w-[426px] h-[54px] rounded-[10px]
                               border border-[#E5E5E5] shadow-md
                               px-4 font-mono text-[18px] outline-none"
                               style={{boxShadow: "0px 0px 10px 0px #00000059"}}
                    />
                  </div>

                  {/* Program + Semester row */}
            <div className="mt-3 flex items-end gap-10">
              <div className="space-y-2">
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

              <div className="space-y-2">
                <label className="font-mono text-black text-[18px]">Semester</label>
                <div className="relative w-[220px]">
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-[212px] h-[54px] rounded-full border
                               border-[#E5E5E5] shadow-md px-6 pr-12
                               font-mono text-[18px] outline-none
                                appearance-none
                                bg-white text-center"
                                style={{ boxShadow: "0px 3px 5px 0px #000000"}}
                  >
                    {["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute
                                  top-1/2 right-6 -translate-y-1/2
                                  rounded-full border border-[#E5E5E5] 
                                  h-[34px] w-[44px] 
                                  bg-white flex items-center justify-center"
                                  style={{ boxShadow: "0px 3px 5px 0px #000000"}}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                     <path d="M5 7.5L10 12.5L15 7.5"
                           stroke="#111"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round" />
                    </svg>
                  </div>
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
                className="w-[560px] h-[64px] rounded-[10px] bg-[#0066CC] text-white font-mono text-[24px] shadow-xl"
              >
                Continue to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
