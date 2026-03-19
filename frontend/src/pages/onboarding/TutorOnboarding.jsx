import { useEffect, useMemo, useState, useRef } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import {
  loadTutorDraft,
  saveTutorDraft,
  clearTutorDraft,
} from "../../utils/tutorOnboardingDraft";
import { getUser, setUser, setToken, onboardUser } from "../../api";
import {
  PROGRAMS,
  CAMPUSES,
  COURSES,
  TEACHING_MODES,
  SESSION_TYPES,
} from "../../constants/options";

export default function TutorOnboarding() {
  const navigate = useNavigate();
  const user = getUser();
  const location = useLocation();
  const hasMountedRef = useRef(false);
  const coursesDropdownRef = useRef(null);
  const modesDropdownRef = useRef(null);
  //const sessionDropdownRef = useRef(null);

  // Redirect to login if no user data (not logged in)
  if (!user?.email) {
    return (
      <Navigate
        to='/login'
        replace
      />
    );
  }

  // Already onboarded, redirect to dashboard
  if (user?.isOnboarded) {
    return (
      <Navigate
        to='/dashboard'
        replace
      />
    );
  }

  // Initialize state from draft (runs only once on component creation)
  //const draft = loadTutorDraft();
  const [draft] = useState(() => loadTutorDraft());
  useEffect(() => {
    const handleBeforeUnload = () => {
      clearTutorDraft();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  //   const [draft] = useState(() => {
  //   const navEntry = performance.getEntriesByType?.("navigation")?.[0];
  //   const isReload = navEntry?.type === "reload";

  //   if (isReload) {
  //     clearTutorDraft();     // wipe storage
  //     return null;           // no draft => empty form
  //   }

  //   return loadTutorDraft(); // normal navigation => restore draft
  // });

  const [firstName, setFirstName] = useState(draft?.firstName || "");
  const [lastName, setLastName] = useState(draft?.lastName || "");
  const [campus, setCampus] = useState(draft?.campus || "");
  const [coursesOffered, setCoursesOffered] = useState(
    draft?.coursesOffered || [],
  );
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [modesOpen, setModesOpen] = useState(false);
  const [program, setProgram] = useState(draft?.program || "");
  const [about, setAbout] = useState(draft?.about || "");
  const [teachingMode, setTeachingMode] = useState(draft?.teachingMode || []);
  const [sessionType, setSessionType] = useState(draft?.sessionType || "");
  //const [sessionOpen, setSessionOpen] = useState(false);
  const [availability, setAvailability] = useState(
    location.state?.availability || draft?.availability || null,
  );
  const hasAvailability =
    Array.isArray(availability?.daySchedules) &&
    availability.daySchedules.length > 0;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        coursesDropdownRef.current &&
        !coursesDropdownRef.current.contains(event.target)
      ) {
        setCoursesOpen(false);
      }
      if (
        modesDropdownRef.current &&
        !modesDropdownRef.current.contains(event.target)
      ) {
        setModesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Save draft whenever form data changes (skip first render after mount)
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    saveTutorDraft({
      firstName,
      lastName,
      campus,
      program,
      about,
      coursesOffered,
      teachingMode,
      sessionType,
      availability,
    });
  }, [
    firstName,
    lastName,
    campus,
    program,
    about,
    coursesOffered,
    teachingMode,
    sessionType,
    availability,
  ]);

  const toggleCourse = (course) => {
    setCoursesOffered((prev) => {
      if (prev.includes(course)) return prev.filter((c) => c !== course);
      return [...prev, course];
    });
  };

  const removeCourse = (course) => {
    setCoursesOffered((prev) => prev.filter((c) => c !== course));
  };
  const toggleTeachingMode = (mode) => {
    setTeachingMode((prev) => {
      if (prev.includes(mode)) return prev.filter((m) => m !== mode);
      return [...prev, mode];
    });
  };

  const removeTeachingMode = (mode) => {
    setTeachingMode((prev) => prev.filter((m) => m !== mode));
  };

  const canSubmit = useMemo(() => {
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      Boolean(campus) &&
      Boolean(program) &&
      Array.isArray(coursesOffered) &&
      coursesOffered.length > 0 &&
      Array.isArray(teachingMode) &&
      teachingMode.length > 0 &&
      Boolean(sessionType) &&
      hasAvailability
    );
  }, [
    firstName,
    lastName,
    campus,
    program,
    coursesOffered,
    teachingMode,
    sessionType,
    hasAvailability,
  ]);

  const handleContinue = async (e) => {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      setError(
        "Please complete all required fields (availability is required).",
      );
      return;
    }
    setLoading(true);
    try {
      const response = await onboardUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        campus,
        program,
        about: about.trim(),
        coursesOffered,
        teachingMode,
        sessionType,
        availability,
      });

      // Update stored token if a new one is returned
      if (response?.token) {
        setToken(response.token);
      }

      // Update stored user data
      const profile = response?.profile || {};
      const updatedUser = {
        ...user,
        firstName: response?.firstName || firstName.trim(),
        lastName: response?.lastName || lastName.trim(),
        campus: response?.campus || campus,
        isOnboarded: true,

        profile: {
          program: profile.program ?? program,
          about: profile.about ?? about.trim(),
          coursesOffered: profile.coursesOffered ?? coursesOffered,
          teachingMode: profile.teachingMode ?? teachingMode,
          sessionType: profile.sessionType ?? sessionType,
        },
      };

      setUser(updatedUser);
      clearTutorDraft();

      // Redirect to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/seneca-5.jpg')] bg-cover bg-center flex items-center justify-center p-6">
      {/* Card */}
      <div className='w-[750.84px] h-[800px] bg-white rounded-[10px] shadow-2xl overflow-hidden'>
        <div className='relative h-[205.25px] bg-[#0B2F86] flex flex-col items-center justify-center pt-[52px]'>
          <div className='absolute top-5 left-1/2 -translate-x-1/2'>
            <div
              className='h-[80px] w-[88px] rounded-full bg-[#C6E2FF]
                           flex items-center justify-center shadow-lg'
              style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
            >
              <img
                src='/hat.png'
                alt='Scholarly logo'
                className='h-[48px] w-[48px]'
              />
            </div>
          </div>

          <div className='pt-6 text-center'>
            <h1 className="text-white font-['Inter'] text-[40px] font-bold leading-[40px] mt-6">
              Scholarly
            </h1>
            <p className='text-[#D2D0D0] text-[15px] font-bold mt-2'>
              Connect. Learn. Grow.
            </p>
          </div>
        </div>
        {/* Body */}
        <div className='px-[50px] pt-[15px] pb-[22px] max-h-[595px] overflow-y-auto'>
          <div
            className='font-mono text-[#0066CC] top-[180px]
           left-[26px] text-[50px] font-bold leading-none'
          >
            Congratulations!
          </div>

          <div
            className='font-mono text-[#0066CC] top-[268.76px]
                         left-[26px] text-[25px] font-bold mt-2'
          >
            Your account has been created.
          </div>

          <div className='font-mono text-black top-[30px] left-[26px] text-[25px] font-bold mt-2 leading-snug'>
            Let's set up your tutor profile so learners can find you.
          </div>

          <form
            onSubmit={handleContinue}
            className='mt-2 space-y-4'
          >
            {/* 2-column fields (8 fields total) */}
            <div className='grid grid-cols-2 gap-6'>
              {/* 1) First Name */}
              <div className='space-y-2'>
                <label className='block font-mono text-black text-[18px]'>
                  First Name <span className='text-red-600'>*</span>
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder=''
                  className='w-full h-[53px] rounded-[10px]
                          border border-[#E5E5E5] px-4 font-mono
                          text-[18px] outline-none'
                  style={{ boxShadow: "0px 0px 10px 0px #00000059" }}
                />
              </div>

              {/* 2) Last Name */}
              <div className='space-y-2'>
                <label className='block font-mono text-black text-[18px]'>
                  Last Name <span className='text-red-600'>*</span>
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder=''
                  className='w-full h-[53px] rounded-[10px]
                          border border-[#E5E5E5] px-4 font-mono
                          text-[18px] outline-none'
                  style={{ boxShadow: "0px 0px 10px 0px #00000059" }}
                />
              </div>

              {/* 3) Program */}
              <div className='col-span-2 space-y-2'>
                <label className='font-mono text-black text-[18px]'>
                  Program / Major <span className='text-red-600'>*</span>
                </label>
                <div className='relative w-full'>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className='w-full h-[53px] rounded-[10px]
                            border border-[#E5E5E5] px-4 pr-14 font-mono
                            text-[18px] outline-none appearance-none bg-white
                            shadow-[0px_0px_10px_0px_#00000059]'
                  >
                    <option
                      value=''
                      disabled
                    >
                      {/* Select program */}
                    </option>
                    {PROGRAMS.map((p) => (
                      <option
                        key={p}
                        value={p}
                      >
                        {p}
                      </option>
                    ))}
                  </select>

                  <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 h-[34px] w-[44px] rounded-full border border-[#E5E5E5] bg-white shadow flex items-center justify-center shadow-[0px_3px_5px_0px_#000000]'>
                    <svg
                      width='18'
                      height='18'
                      viewBox='0 0 20 20'
                      fill='none'
                    >
                      <path
                        d='M5 7.5L10 12.5L15 7.5'
                        stroke='#111'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 4) Campus */}
              <div className='space-y-2'>
                <label className='font-mono text-black text-[18px]'>
                  Campus <span className='text-red-600'>*</span>
                </label>
                <div className='relative w-full'>
                  <select
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    className='w-full h-[53px] rounded-[10px]
                            border border-[#E5E5E5] px-4 pr-14 font-mono
                            text-[18px] outline-none appearance-none bg-white
                            shadow-[0px_0px_10px_0px_#00000059]'
                  >
                    <option
                      value=''
                      disabled
                    >
                      {/* Select campus */}
                    </option>
                    {CAMPUSES.map((c) => (
                      <option
                        key={c}
                        value={c}
                      >
                        {c}
                      </option>
                    ))}
                  </select>

                  <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 h-[34px] w-[44px] rounded-full border border-[#E5E5E5] bg-white shadow flex items-center justify-center shadow-[0px_3px_5px_0px_#000000]'>
                    <svg
                      width='18'
                      height='18'
                      viewBox='0 0 20 20'
                      fill='none'
                    >
                      <path
                        d='M5 7.5L10 12.5L15 7.5'
                        stroke='#111'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 5) Courses Offered  */}
              <div className='space-y-2'>
                <label className='font-mono text-black text-[18px]'>
                  Courses like to offer <span className='text-red-600'>*</span>
                </label>

                <div
                  className='relative w-full'
                  ref={coursesDropdownRef}
                >
                  <button
                    type='button'
                    onClick={() => setCoursesOpen((v) => !v)}
                    className='w-full h-[53px] rounded-[10px]
                            border border-[#E5E5E5] px-4 pr-14
                            font-mono text-[18px] outline-none
                            bg-white text-left shadow-[0px_0px_10px_0px_#00000059]'
                  >
                    <span className='font-mono text-[18px] text-black'>
                      {coursesOffered.length === 0
                        ? ""
                        : // ? "Select courses"
                          coursesOffered.length <= 2
                          ? coursesOffered.join(", ")
                          : `${coursesOffered.slice(0, 2).join(", ")} +${
                              coursesOffered.length - 2
                            }`}
                    </span>
                  </button>

                  <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 h-[34px] w-[44px] rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center shadow-[0px_3px_5px_0px_#000000]'>
                    <svg
                      width='18'
                      height='18'
                      viewBox='0 0 20 20'
                      fill='none'
                    >
                      <path
                        d='M5 7.5L10 12.5L15 7.5'
                        stroke='#111'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </div>

                  {coursesOpen && (
                    <div className='absolute z-30 mt-2 w-full rounded-[10px] border border-[#E5E5E5] bg-white shadow-[0px_10px_25px_rgba(0,0,0,0.18)]'>
                      <div className='max-h-[220px] overflow-auto py-2'>
                        {COURSES.map((c) => {
                          const checked = coursesOffered.includes(c);
                          return (
                            <button
                              key={c}
                              type='button'
                              onClick={() => toggleCourse(c)}
                              className='w-full px-4 py-2 flex items-center gap-3 hover:bg-black/5 text-left'
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
                                    width='14'
                                    height='14'
                                    viewBox='0 0 20 20'
                                    fill='none'
                                  >
                                    <path
                                      d='M16.5 5.5L8.5 13.5L4 9'
                                      stroke='white'
                                      strokeWidth='2.2'
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                    />
                                  </svg>
                                )}
                              </span>
                              <span className='font-mono text-[16px] text-black'>
                                {c}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className='px-4 py-3 border-t border-black/10 flex items-center justify-between'>
                        <p className='font-mono text-[14px] text-black/60'>
                          Selected: {coursesOffered.length}
                        </p>
                        <button
                          type='button'
                          onClick={() => setCoursesOpen(false)}
                          className='font-mono text-[14px] text-[#0066CC] font-bold'
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chips of courses offered */}
                <div className='w-full flex flex-wrap gap-2 pt-2'>
                  {coursesOffered.map((c) => (
                    <span
                      key={c}
                      className='inline-flex items-center gap-2
                               rounded-full border border-black/10
                               bg-black/5 px-3 py-1 font-mono text-[14px]'
                    >
                      {c}
                      <button
                        type='button'
                        onClick={() => removeCourse(c)}
                        className='h-5 w-5 rounded-full bg-white border border-black/10 flex items-center justify-center leading-none text-red-600'
                        aria-label={`Remove ${c}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 6) Session Type */}
              <div className='space-y-2'>
                <label className='font-mono text-black text-[18px]'>
                  Session Type <span className='text-red-600'>*</span>
                </label>

                <div className='relative w-full'>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                    className='w-full h-[53px] rounded-[10px]
                            border border-[#E5E5E5] px-4 pr-14 font-mono
                            text-[18px] outline-none appearance-none bg-white
                            shadow-[0px_0px_10px_0px_#00000059]'
                  >
                    <option value='' disabled>
                      {/* Select session type */}
                    </option>

                    {SESSION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 h-[34px] w-[44px] rounded-full border border-[#E5E5E5] bg-white shadow flex items-center justify-center shadow-[0px_3px_5px_0px_#000000]'>
                    <svg width='18' height='18' viewBox='0 0 20 20' fill='none'>
                      <path
                        d='M5 7.5L10 12.5L15 7.5'
                        stroke='#111'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 7) Teaching Mode */}
              <div className='space-y-2'>
                <label className='font-mono text-black text-[18px]'>
                  Teaching Mode <span className='text-red-600'>*</span>
                </label>

                <div
                  className='relative w-full'
                  ref={modesDropdownRef}
                >
                  <button
                    type='button'
                    onClick={() => setModesOpen((v) => !v)}
                    className='w-full h-[53px] rounded-[10px]
                            border border-[#E5E5E5] px-4 pr-14
                            font-mono text-[18px] outline-none
                            bg-white text-left shadow-[0px_0px_10px_0px_#00000059]'
                  >
                    <span className='font-mono text-[18px] text-black'>
                      {teachingMode.length === 0
                        ? ""
                        : // ? "Select teaching mode"
                          teachingMode.length <= 2
                          ? teachingMode.join(", ")
                          : `${teachingMode.slice(0, 2).join(", ")} +${
                              teachingMode.length - 2
                            }`}
                    </span>
                  </button>

                  <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 h-[34px] w-[44px] rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center shadow-[0px_3px_5px_0px_#000000]'>
                    <svg
                      width='18'
                      height='18'
                      viewBox='0 0 20 20'
                      fill='none'
                    >
                      <path
                        d='M5 7.5L10 12.5L15 7.5'
                        stroke='#111'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </div>

                  {modesOpen && (
                    <div className='absolute z-30 mt-2 w-full rounded-[10px] border border-[#E5E5E5] bg-white shadow-[0px_10px_25px_rgba(0,0,0,0.18)]'>
                      <div className='max-h-[180px] overflow-auto py-2'>
                        {TEACHING_MODES.map((m) => {
                          const checked = teachingMode.includes(m);
                          return (
                            <button
                              key={m}
                              type='button'
                              onClick={() => toggleTeachingMode(m)}
                              className='w-full px-4 py-2 flex items-center gap-3 hover:bg-black/5 text-left'
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
                                    width='14'
                                    height='14'
                                    viewBox='0 0 20 20'
                                    fill='none'
                                  >
                                    <path
                                      d='M16.5 5.5L8.5 13.5L4 9'
                                      stroke='white'
                                      strokeWidth='2.2'
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                    />
                                  </svg>
                                )}
                              </span>
                              <span className='font-mono text-[16px] text-black'>
                                {m}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className='px-4 py-3 border-t border-black/10 flex items-center justify-between'>
                        <p className='font-mono text-[14px] text-black/60'>
                          Selected: {teachingMode.length}
                        </p>
                        <button
                          type='button'
                          onClick={() => setModesOpen(false)}
                          className='font-mono text-[14px] text-[#0066CC] font-bold'
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className='w-full flex flex-wrap gap-2 pt-2'>
                  {teachingMode.map((m) => (
                    <span
                      key={m}
                      className='inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3 py-1 font-mono text-[14px]'
                    >
                      {m}
                      <button
                        type='button'
                        onClick={() => removeTeachingMode(m)}
                        className='h-5 w-5 rounded-full bg-white border border-black/10 flex items-center justify-center leading-none text-red-600'
                        aria-label={`Remove ${m}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 8) Availability*/}
              <div className='space-y-2 justify-self-center col-span-2 w-full'>
                <label className='font-mono text-black text-[18px]'>
                  Availability <span className='text-red-600'>*</span>
                </label>

                <button
                  type='button'
                  onClick={() =>
                    navigate("/onboarding/tutor/availability-v2", {
                      state: { from: "/onboarding/tutor", sessionType },
                    })
                  }
                  className='w-full h-[53px] rounded-[10px]
                          border-2 border-[#0066CC]
                          text-[blue] font-bold py-3
                          px-4 font-mono text-[18px]
                          text-left bg-[#E6F0FF]
                          shadow-[0px_0px_10px_0px_#00000059]
                          hover:bg-blue-100'
                >
                  {hasAvailability ? "Edit availability" : "Set availability"}
                </button>

                <p className='font-mono text-[14px] text-black/60'>
                  Required to complete setup.
                </p>
              </div>
            </div>

            {/* Full-width field */}
            <div className='space-y-2'>
              <label className='font-mono text-black text-[18px]'>
                About <span className='text-black/50'>(optional)</span>
              </label>
              <div className='relative w-full'>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={3}
                  placeholder='Tell learners about yourself...'
                  className='w-full h-[100px] rounded-[10px]
                          border border-[#E5E5E5] px-4 py-3
                          font-mono text-[16px] outline-none
                          resize-none shadow-[0px_0px_10px_0px_#00000059]'
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className='mt-2 font-mono text-red-600 text-[16px] font-semibold'>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className='mt-4 flex justify-center'>
              <button
                type='submit'
                disabled={loading || !canSubmit}
                className={`w-[466px] h-[54px] rounded-[10px]
                        bg-[#0066CC] text-white
                        font-mono text-[24px]
                        shadow-[0px_4px_4px_0px_#00000040] ${
                          loading || !canSubmit
                            ? "opacity-70 cursor-not-allowed"
                            : "hover:brightness-110"
                        }`}
              >
                {loading ? "Completing Setup..." : "Complete Setup"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {coursesOpen && (
        <button
          type='button'
          onClick={() => setCoursesOpen(false)}
          className='fixed inset-0 z-20 cursor-default'
          aria-label='Close courses dropdown'
        />
      )}
      {modesOpen && (
        <button
          type='button'
          onClick={() => setModesOpen(false)}
          className='fixed inset-0 z-20 cursor-default'
          aria-label='Close teaching mode dropdown'
        />
      )}
    </div>
  );
}
