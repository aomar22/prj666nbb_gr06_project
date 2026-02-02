
// "Availability is a reusable page accessed from onboarding and dashboard navigation"
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { getUser } from "../../api";
import { loadTutorDraft, saveTutorDraft } from "../../utils/tutorOnboardingDraft";

const WEEK_DAYS = [
  { key: "SUN", label: "SUN", dayNum: "8" },
  { key: "MON", label: "MON", dayNum: "9", active: true },
  { key: "TUE", label: "TUE", dayNum: "10" },
  { key: "WED", label: "WED", dayNum: "11" },
  { key: "THU", label: "THU", dayNum: "12" },
  { key: "FRI", label: "FRI", dayNum: "13" },
  { key: "SAT", label: "SAT", dayNum: "14" },
];

const MOCK_SLOTS = {
  MON: ["1:00 PM", "4:00 PM"],
  TUE: ["2:30 PM", "3:15 PM"],
  WED: ["10:30 AM", "11:15 AM", "1:45 PM", "2:30 PM", "3:15 PM", "4:00 PM"],
  FRI: ["9:00 AM", "9:45 AM"],
  WED2: ["2:30 PM", "3:15 PM", "4:00 PM"],
};

const TIME_OPTIONS = [
  "8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM",
  "11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM",
  "2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM",
  "5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM",
  "8:00 PM","8:30 PM","9:00 PM","9:30 PM",
];

export default function Availability() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  // Determine if user came from onboarding - check both state and current path
  const fromOnboarding = 
    location.state?.from?.startsWith("/onboarding") || 
    location.pathname.includes("/onboarding");
  const isOnboarded = Boolean(user?.isOnboarded);

  const backTo = fromOnboarding ? "/onboarding/tutor" : "/dashboard/tutor";
  const backLabel = fromOnboarding ? "Back to Tutor Setup" : "Back to Tutor Dashboard";

  // Active route helper (works for /dashboard/availability and /onboarding/tutor/availability)
  const isAvailabilityRoute = location.pathname.includes("/availability");

  // Draft-backed availability so onboarding can show "Edit availability"
  const initialAvailability = useMemo(() => {
    const draft = loadTutorDraft();
    return Array.isArray(draft?.availability) ? draft.availability : [];
  }, []);

  const [selectedDay, setSelectedDay] = useState("MON");
  const [selectedDateText, setSelectedDateText] = useState("Monday Oct 9, 2025");
  const [startTime, setStartTime] = useState("8:00 PM");
  const [endTime, setEndTime] = useState("8:40 PM");
  const [availability, setAvailability] = useState(initialAvailability);

  console.log("USER:", user);

  // -------- Handlers (UI-only) --------
  const handleReset = () => {
    setStartTime("8:00 PM");
    setEndTime("8:40 PM");
  };

  const handleSave = () => {
    const next = [
      ...availability,
      { day: selectedDay, dateLabel: selectedDateText, startTime, endTime },
    ];

    setAvailability(next);
    saveTutorDraft({ availability: next });

    navigate(backTo);
  };

  const handleDelete = () => {
    setAvailability([]);
    saveTutorDraft({ availability: [] });
  };

  // -------- Render --------
  return (
    <div className="min-h-screen bg-[#F4E4D7]">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-[240px] bg-[#7A0000] text-white px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                <img src="/hat.png" alt="logo" className="h-7 w-7" />
              </div>
              <div>
                <div className="text-2xl font-extrabold leading-none">Scholarly</div>
                <div className="text-xs opacity-90 font-semibold">Connect. Learn. Grow.</div>
              </div>
            </div>

            {/* Navigation links (real links + active styling) */}
            <nav className="mt-10 space-y-3 font-mono text-[18px]">
              <NavLink to="/dashboard" active={location.pathname === "/dashboard"}>
                Dashboard
              </NavLink>

              <NavLink to="/dashboard/sessions" active={location.pathname.includes("/sessions")}>
                My Sessions
              </NavLink>

              <NavLink
                to="/dashboard/availability"
                active={isAvailabilityRoute && !fromOnboarding}
              >
                Availability
              </NavLink>

              <NavLink to="/dashboard/find-students" active={location.pathname.includes("/find")}>
                Find Students
              </NavLink>

              <NavLink to="/dashboard/messages" active={location.pathname.includes("/messages")}>
                Messages
              </NavLink>

              <NavLink to="/dashboard/reviews" active={location.pathname.includes("/reviews")}>
                My Reviews
              </NavLink>

              <div className="pt-10 space-y-3 text-[16px] opacity-95">
                <NavLink to="/dashboard/settings" active={location.pathname.includes("/settings")}>
                  Settings
                </NavLink>
                <NavLink to="/logout" active={false}>
                  Log Out
                </NavLink>
              </div>
            </nav>
          </aside>

          {/* Main */}
          <main className="flex-1 px-10 py-6">
            {/* Top bar */}
            <div className="flex items-center gap-6">
              <div className="relative flex-1">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-70">
                  <SearchIcon />
                </div>
                <input
                  className="w-full h-[54px] rounded-full bg-white px-14 text-[18px]
                             shadow-[0px_6px_14px_rgba(0,0,0,0.18)] outline-none"
                  placeholder="Search Student or Courses"
                />
              </div>

              <div className="flex items-center gap-6">
                <button className="relative" type="button">
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500" />
                  <BellIcon />
                </button>

                <div className="h-10 w-10 rounded-full bg-black/20 overflow-hidden">
                  <img
                    alt="avatar"
                    src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&h=200&fit=crop"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="mt-10">
              <h1 className="text-[44px] font-extrabold tracking-tight">
                Set Your Availability <span className="ml-2 text-[22px] opacity-80">📅</span>
              </h1>
              <p className="text-[18px] text-black/70 -mt-1">
                Manage your weekly schedule to let learners book sessions
              </p>
            </div>

            {/* Calendar + chart */}
            <div className="mt-8 grid grid-cols-[1fr_280px] gap-10 items-start">
              {/* Calendar */}
              <div className="relative">
                <button
                  type="button"
                  className="absolute -left-10 top-1/2 -translate-y-1/2 text-black/60 hover:text-black"
                >
                  <span className="text-3xl">←</span>
                </button>

                <div className="rounded-[10px] bg-white/70 border border-black/10 px-8 py-6">
                  {/* Week header */}
                  <div className="grid grid-cols-7 gap-4 text-center">
                    {WEEK_DAYS.map((d) => {
                      const isActive = d.key === "MON"; // prototype highlight
                      return (
                        <button
                          key={d.key}
                          type="button"
                          onClick={() => setSelectedDay(d.key)}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="text-[12px] font-bold text-black/60">{d.label}</div>
                          <div
                            className={[
                              "h-10 w-10 rounded-full flex items-center justify-center text-[18px] font-bold",
                              isActive ? "bg-blue-600 text-white" : "text-black/75",
                            ].join(" ")}
                          >
                            {d.dayNum}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Slots grid */}
                  <div className="mt-6 grid grid-cols-7 gap-4">
                    {WEEK_DAYS.map((d) => {
                      const chips = MOCK_SLOTS[d.key] || [];
                      return (
                        <div
                          key={d.key}
                          className="min-h-[240px] border-l border-black/10 first:border-l-0 px-2"
                        >
                          <div className="flex flex-col gap-2 pt-1">
                            {chips.map((t) => (
                              <div
                                key={`${d.key}-${t}`}
                                className="rounded-full bg-black/10 px-3 py-2 text-center
                                           text-[12px] font-semibold text-black/70"
                              >
                                {t}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  className="absolute -right-10 top-1/2 -translate-y-1/2 text-black/60 hover:text-black"
                >
                  <span className="text-3xl">→</span>
                </button>
              </div>

              {/* Chart */}
              <div className="rounded-[22px] bg-[#D9D9D9] px-6 py-6 shadow-[0px_10px_20px_rgba(0,0,0,0.18)]">
                <div className="text-[18px] font-bold text-black">Total Hours / Week</div>

                <div className="mt-5 flex items-end justify-between gap-6 h-[180px]">
                  <Bar label="Last Week" value="10" heightClass="h-[120px]" />
                  <Bar label="This Week" value="12" heightClass="h-[155px]" active />
                  <Bar label="Next week" value="04" heightClass="h-[70px]" />
                </div>
              </div>
            </div>

            {/* Enter Time + actions */}
            <div className="mt-10 grid grid-cols-[1fr_220px] gap-10 items-start">
              {/* Enter Time */}
              <div className="rounded-[22px] bg-[#BBD9FF] px-10 py-8 shadow-[0px_10px_20px_rgba(0,0,0,0.18)]">
                <div className="flex items-center justify-between">
                  <div className="text-center w-full">
                    <div className="text-[34px] font-extrabold">Enter Time</div>
                    <div className="text-[26px] font-extrabold mt-2">{selectedDateText}</div>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="ml-6 h-[34px] px-5 rounded-full bg-[#0B2F86] text-white font-bold shadow"
                  >
                    Reset
                  </button>
                </div>

                <div className="mt-8 flex items-center justify-center gap-16 text-[20px] font-semibold">
                  <div className="flex items-center gap-4">
                    <span>Start Time:</span>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="h-[38px] rounded-full px-4 bg-white shadow outline-none"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-4">
                    <span>End Time:</span>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="h-[38px] rounded-full px-4 bg-white shadow outline-none"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleSave}
                  className="h-[54px] rounded-[10px] bg-[#2E6B2F] text-white
                             text-[20px] font-extrabold shadow-[0px_6px_12px_rgba(0,0,0,0.25)]"
                >
                  SAVE
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="h-[54px] rounded-[10px] bg-[#7A0000] text-white
                             text-[20px] font-extrabold shadow-[0px_6px_12px_rgba(0,0,0,0.25)]"
                >
                  Delete
                </button>

                {/* Keep your back navigation behavior */}
                <Link
                  to={backTo}
                  className="mt-6 h-[44px] rounded-[10px] bg-white/60 border border-black/10
                             text-black/70 font-bold hover:bg-white flex items-center justify-center"
                >
                  {backLabel}
                </Link>

                {/* Optional: show mode (doesn't change logic) */}
                <div className="mt-2 text-xs text-black/50 text-center">
                  {fromOnboarding ? "Onboarding flow" : "Dashboard flow"} · Onboarded:{" "}
                  {isOnboarded ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// ---------------- Small UI Helpers ----------------

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={[
        "block rounded-[8px] px-3 py-2 transition",
        active ? "bg-white/20 font-extrabold" : "hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function Bar({ label, value, heightClass, active }) {
  return (
    <div className="flex flex-col items-center justify-end w-full">
      <div className="text-[14px] font-bold text-black/70 mb-2">{value}</div>
      <div
        className={[
          "w-[38px] rounded-[6px] shadow-inner",
          heightClass,
          active ? "bg-[#7A0000]" : "bg-[#A66A6A]",
        ].join(" ")}
      />
      <div className="text-[12px] font-bold text-black/70 mt-2 text-center">
        {label}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 21l-4.3-4.3m1.3-5.2a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M13.7 21a2 2 0 01-3.4 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
