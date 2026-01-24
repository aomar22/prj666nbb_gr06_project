import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

const PROGRAMS = [
  "CPA (Computer Programming & Analysis)",
  "Software Engineering",
  "Computer Science",
  "Business",
  "Other",
];

const STATUSES = ["Current Student", "Alumni", "Graduated"];

const COURSES = [
  "WEB222",
  "WEB322",
  "WEB422",
  "PRJ666",
  "DBS211",
  "OOP244",
  "IPC144",
  "CPP",
  "Other",
];

const CAMPUSES = ["Newnham", "Seneca@York", "King", "Markham", "Online"];

export default function TutorOnboarding() {
  const navigate = useNavigate();
  const { state } = useLocation();

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
  const [academicStatus, setAcademicStatus] = useState("");
  const [campus, setCampus] = useState("");
  const [coursesOffered, setCoursesOffered] = useState([]);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [error, setError] = useState("");

  const toggleCourse = (course) => {
    setCoursesOffered((prev) => {
      if (prev.includes(course)) return prev.filter((c) => c !== course);
      return [...prev, course];
    });
  };

  const removeCourse = (course) => {
    setCoursesOffered((prev) => prev.filter((c) => c !== course));
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setError("");

    const ok =
      fullName.trim() &&
      program &&
      academicStatus &&
      campus &&
      Array.isArray(coursesOffered) &&
      coursesOffered.length > 0;

    if (!ok) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      localStorage.setItem(
        "scholarly_tutor_profile_draft",
        JSON.stringify({
          email: initialUser.email,
          role: "tutor",
          fullName: fullName.trim(),
          program,
          academicStatus,
          coursesOffered,
          campus,
        })
      );
    } catch {
      setError("An unexpected error occurred. Please try again.");
      return;
    }

    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[url('/seneca-5.jpg')] bg-cover bg-center flex items-center justify-center p-6">
      <div className="w-[750.84px] h-[800px] top-18 bg-white rounded-[10px] shadow-2xl overflow-visible">
        <div className="relative h-[205.25px] bg-[#0B2F86] flex flex-col items-center justify-center pt-[52px]">
          <div className="absolute top-5 left-1/2 -translate-x-1/2">
            <div className="h-[80px] w-[88px] rounded-full bg-[#C6E2FF]
                           flex items-center justify-center shadow-lg"
                           style={{boxShadow: "0px 4px 4px 0px #00000040"}}>
              <img
                src="/hat.png"
                alt="Scholarly logo"
                className="h-[48px] w-[48px]"
              />
            </div>
          </div>

          <div className="pt-6 text-center">
            <h1 className="text-white font-['Inter'] text-[40px] font-bold leading-[40px] font-bold mt-6">
              Scholarly
            </h1>
            <p className="text-[#D2D0D0] text-[15px] font-bold mt-2">
              Connect. Learn. Grow.
            </p>
          </div>
        </div>

        <div className="px-[50px] pt-[15px] pb-[22px]">
          <div className="font-mono text-[#0066CC] top-[180px]
           left-[26px] text-[50px] font-bold leading-none">
            Congratulations!
          </div>

          <div className="font-mono text-[#0066CC] top-[268.76px] left-[26px] text-[25px] font-bold mt-2">
            Your account has been created.
          </div>

          <div className="font-mono text-black top-[30px] left-[26px] text-[25px] font-bold mt-2 leading-snug">
            Let's set up your tutor profile so learners can find you.
          </div>

          <form onSubmit={handleContinue} className="mt-2 space-y-1.5">
            <div className="space-y-2">
              <label className="block font-mono text-black text-[18px] text-neutral-900">
                Full Name <span className="text-red-600">*</span>
              </label>

              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder=""
                className="w-[426px] h-[53px] rounded-[10px]
                           border border-[#E5E5E5] px-4 font-mono 
                           text-[18px] outline-none"
                           style={{boxShadow: "0px 0px 10px 0px #00000059"}}
              />
            </div>

            <div className="mt-3 flex items-end gap-10">
              <div className="space-y-2">
                <label className="font-mono text-black text-[18px]">
                  Program / Major <span className="text-red-600">*</span>
                </label>
                <div className="relative w-[426px]">
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-[426px] h-[53px] rounded-[10px] border border-[#E5E5E5] px-4 pr-14 font-mono text-[18px] outline-none appearance-none bg-white shadow-[0px_0px_10px_0px_#00000059]"
                  >
                    <option value="" disabled></option>
                    {PROGRAMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 h-[34px] w-[44px] rounded-full border border-[#E5E5E5] bg-white shadow flex items-center justify-center shadow-[0px_3px_5px_0px_#000000]">
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
                <label className="font-mono text-black text-[18px]">
                  Academic Status <span className="text-red-600">*</span>
                </label>
                <div className="relative w-[220px]">
                  <select
                    value={academicStatus}
                    onChange={(e) => setAcademicStatus(e.target.value)}
                    className="w-[212px] h-[54px] rounded-full border
                               border-[#E5E5E5] px-6 pr-12 
                               font-Callout font-semibold text-[15px] outline-none
                              appearance-none bg-white text-center
                              font-[#666666]"
                              style={{boxShadow: "0px 3px 5px 0px #000000"}}
                  >
                    <option value="" disabled></option>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute top-1/2 right-6 -translate-y-1/2 rounded-full border border-[#E5E5E5]
                   h-[20px] w-[17px] bg-white flex items-center justify-center"
                    style={{boxShadow: "0px 3px 5px 0px #000000"}}>
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
            </div>

            <div className="mt-2 flex items-start gap-10">
              <div className="space-y-2 w-[426px]">
                <label className="font-mono text-black text-[18px]">
                  Courses like to offer <span className="text-red-600">*</span>
                </label>

                <div className="relative w-[426px]">
                  <button
                    type="button"
                    onClick={() => setCoursesOpen((v) => !v)}
                    className="w-[426px] h-[53px] rounded-[10px]
                               border border-[#E5E5E5] px-4 pr-14
                              font-mono text-[18px] outline-none
                              bg-white text-left shadow-[0px_0px_10px_0px_#00000059]"
                    
                  >
                    {coursesOffered.length === 0 ? "" : ""}
                  </button>

                  <div className="pointer-events-none absolute
                   top-1/2 right-3 -translate-y-1/2 h-[34px] w-[44px]
                    rounded-full border border-[#E5E5E5] bg-white 
                    flex items-center justify-center
                    shadow-[0px_3px_5px_0px_#000000] " 
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

                  {coursesOpen && (
                    <div className="absolute z-30 mt-2 w-[426px] rounded-[10px]
                                     border border-[#E5E5E5] bg-white
                                      shadow-[0px_10px_25px_rgba(0,0,0,0.18)]">
                      <div className="max-h-[220px] overflow-auto py-2">
                        {COURSES.map((c) => {
                          const checked = coursesOffered.includes(c);
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => toggleCourse(c)}
                              className="w-full px-4 py-2 flex items-center
                                         gap-3 hover:bg-black/5 text-left"
                            >
                              <span
                                className={[
                                  "h-5 w-5 rounded-[6px] border border-black/20 flex items-center justify-center",
                                  checked
                                    ? "bg-[#0066CC] border-[#0066CC]"
                                    : "bg-white",
                                ].join(" ")}
                              >
                                {checked && (
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                  >
                                    <path
                                      d="M16.5 5.5L8.5 13.5L4 9"
                                      stroke="white"
                                      strokeWidth="2.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </span>
                              <span className="font-mono text-[16px] text-black">
                                {c}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="px-4 py-3 border-t border-black/10 flex items-center justify-between">
                        <p className="font-mono text-[14px] text-black/60">
                          Selected: {coursesOffered.length}
                        </p>
                        <button
                          type="button"
                          onClick={() => setCoursesOpen(false)}
                          className="font-mono text-[14px] text-[#0066CC] font-bold"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-[426px] flex flex-wrap gap-2 pt-2">
                  {coursesOffered.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-2
                       rounded-full border border-black/10 bg-black/5
                        px-3 py-1 font-mono text-[14px]"
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() => removeCourse(c)}
                        className="h-5 w-5 rounded-full bg-white border border-black/10 flex items-center justify-center leading-none text-red-600"
                        aria-label={`Remove ${c}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-black text-[18px]
                                   ">
                  Campus <span className="text-red-600">*</span>
                </label>

                <div className="relative w-[220px]">
                  <select
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    className="w-[212px] h-[54px] rounded-full
                               border border-[#E5E5E5] px-6 pr-10
                              font-Callout font-semibold text-[15px]
                               outline-none font-[#666666]
                               appearance-none bg-white text-center
                               shadow-[0px_3px_5px_0px_#000000]
                               
                        "
                  
                  >
                    <option value="" disabled></option>
                    {CAMPUSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute
                                top-1/2 right-6 -translate-y-1/2
                                 rounded-full border border-[#E5E5E5]
                                  h-[20px] w-[17px] bg-white flex
                                   items-center justify-center"
                                   style={{boxShadow: "0px 3px 5px 0px #000000"}}>
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
            </div>
          <div className="mt-2">
            
              {error && (
                <div className="mt-2 font-mono text-red-600
                 text-[16px] font-semibold">
                 {error}
                </div>
              )}
            
            <div className="-top-6 flex justify-center">
              <button
                type="submit"
                className="w-[466px] h-[54px] rounded-[10px]
                           bg-[#0066CC]
                           text-white 
                           font-mono text-[24px]
                           shadow-[0px_4px_4px_0px_#00000040]"
              >
                Continue to Login
              </button>
            </div>
            </div>
          </form>
        </div>
      </div>

      {coursesOpen && (
        <button
          type="button"
          onClick={() => setCoursesOpen(false)}
          className="fixed inset-0 z-20 cursor-default"
          aria-label="Close courses dropdown"
        />
      )}
    </div>
  );
}
