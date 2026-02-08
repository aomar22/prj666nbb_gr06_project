// AvailabilityV2.jsx
// UI-only reimplementation of the new Availability screen (v2)

import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUser, replaceTutorSchedule } from "../../api";
import { loadTutorDraft, saveTutorDraft } from "../../utils/tutorOnboardingDraft";

const DAYS = [
  { key: "MONDAY", label: "Monday" },
  { key: "TUESDAY", label: "Tuesday" },
  { key: "WEDNESDAY", label: "Wednesday" },
  { key: "THURSDAY", label: "Thursday" },
  { key: "FRIDAY", label: "Friday" },
  { key: "SATURDAY", label: "Saturday" },
  { key: "SUNDAY", label: "Sunday" },
];

const SESSION_LENGTHS = [15, 30, 60, 90];
function pad2(n) {
  return String(n).padStart(2, "0");
}

// 12-hour label
function format12h(hour24, minute) {
  const ap = hour24 >= 12 ? "PM" : "AM";
  let hh = hour24 % 12;
  if (hh === 0) hh = 12;
  const mm = pad2(minute);
  return `${hh}:${mm} ${ap}`;
}

// Parse "h:mm AM/PM" -> minutes since midnight
function toMinutes(t) {
  const m = String(t).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return NaN;

  let hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();

  if (hh === 12) hh = 0;
  let minutes = hh * 60 + mm;
  if (ap === "PM") minutes += 12 * 60;

  return minutes;
}

function minutesTo12h(mins) {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  return format12h(h24, m);
}

function isValidRange(start, end) {
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (!Number.isFinite(s) || !Number.isFinite(e)) return false;
  return e > s;
}

function overlapsAny(blocks, candidate, ignoreIndex = -1) {
  const s = toMinutes(candidate.start);
  const e = toMinutes(candidate.end);
  if (!Number.isFinite(s) || !Number.isFinite(e)) return true;

  return blocks.some((b, i) => {
    if (i === ignoreIndex) return false;
    const bs = toMinutes(b.start);
    const be = toMinutes(b.end);
    return s < be && e > bs;
  });
}

function buildTimeOptions() {
  // 15-min increments from 8:00 AM to 9:30 PM
  const out = [];
  for (let h = 8; h <= 21; h++) {
    for (const m of [0, 15, 30, 45]) {
      if (h === 21 && m > 30) continue; 
      out.push(format12h(h, m));
    }
  }
  return out;
}

function makeEmptyWeekly() {
  const base = {};
  for (const d of DAYS) base[d.key] = [];
  return base;
}

function buildPreviewSlots(weekly, slotDuration) {
  const result = {};

  for (const day of Object.keys(weekly)) {
    const blocks = weekly[day] || [];
    const slots = [];

    blocks.forEach((b, bi) => {
      const startM = toMinutes(b.start);
      const endM = toMinutes(b.end);
      
      if (!Number.isFinite(startM) || !Number.isFinite(endM) || endM <= startM) return;

      let cur = startM;
      while (cur + slotDuration <= endM) {
        const id = `${day}-${cur}-${slotDuration}`;
        const label = minutesTo12h(cur);

        slots.push({
           id,
           label,
           startMins: cur,
        });
        cur += slotDuration;
      }
    });

    result[day] = slots;
  }

  return result;
}

export default function AvailabilityV2() {
  const location = useLocation();
  const user = getUser();
  const [selectedDay, setSelectedDay] = useState("MONDAY");

  const fromOnboarding =
    location.state?.from?.startsWith("/onboarding") ||
    location.pathname.includes("/onboarding");

  const backTo = fromOnboarding ? "/onboarding/tutor" : "/dashboard/tutor";
  // const isOnboarded = Boolean(user?.isOnboarded);

  const TIME_OPTIONS = useMemo(() => buildTimeOptions(), []);
  const initialDraft = useMemo(() => {
      const draft = loadTutorDraft();
    return draft?.availabilityV2 || null;
  }, []);

  const [slotDuration, setSlotDuration] = useState(
    initialDraft?.slotDuration ?? 60
  );

  const [weekly, setWeekly] = useState(() => {
    const fallback = makeEmptyWeekly();
    const saved = initialDraft?.weekly;
      if (!saved) return fallback;
    const merged = { ...fallback };
      for (const d of Object.keys(fallback)) {
        if (Array.isArray(saved[d])) merged[d] = saved[d];
      }
      return merged;
    });
  const [weekOffset, setWeekOffset] = useState(0);

  const baseWeekStart = useMemo(() => {
    const d = new Date();
    const day = d.getDay(); 
    const diffToMonday = (day + 6) % 7; 
    d.setDate(d.getDate() - diffToMonday);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const WeekColumns = useMemo(() => {
  const start = new Date(baseWeekStart);
  start.setDate(start.getDate() + weekOffset * 7);

  const labels = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const keys = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];

  return keys.map((key, i) => {
      const dt = new Date(start);
      dt.setDate(start.getDate() + i);
      return {
        key,
        label: labels[i],
        date: dt,
        dayNum: dt.getDate(),
        month: dt.getMonth(),
        year: dt.getFullYear(),
      };
    });
  }, [baseWeekStart, weekOffset]);
    const monthLabel = useMemo(() => {
    const dt = WeekColumns[0]?.date;
    if (!dt) return "";
    return dt.toLocaleString("en-US", { month: "long", year: "numeric" });
  }, [WeekColumns]);
  const goPrevWeek = () => setWeekOffset((w) => w - 1);
  const goNextWeek = () => setWeekOffset((w) => w + 1);

  const weekRangeLabel = useMemo(() => {
    if (!WeekColumns.length) return "";
    const a = WeekColumns[0].date;
    const b = WeekColumns[6].date;
    const opts = { month: "short", day: "numeric" };
    return `${a.toLocaleDateString("en-US", opts)} – ${b.toLocaleDateString("en-US", opts)}`;
  }, [WeekColumns]);

  const [uiError, setUiError] = useState("");
  const [selectedPreviewId, setSelectedPreviewId] = useState(null);

  const previewSlots = useMemo(
    () => buildPreviewSlots(weekly, slotDuration),
    [weekly, slotDuration]
  );
 
  const handleAddBlock = (dayKey) => {
    handleSelectDay(dayKey);
    setUiError("");

    setWeekly((prev) => {
      const blocks = prev[dayKey] ? [...prev[dayKey]] : [];
      const last = blocks[blocks.length - 1];
      let start = "10:00 AM";
      let end = "11:00 AM";

      if (last?.end) {
        const lastEndM = toMinutes(last.end);
        if (Number.isFinite(lastEndM)) {
          start = minutesTo12h(lastEndM);
          end = minutesTo12h(lastEndM + slotDuration);
        }
      }

      const candidate = { start, end };

      if (!isValidRange(candidate.start, candidate.end) || overlapsAny(blocks, candidate)) {
        candidate.start = "10:00 AM";
        candidate.end = "11:00 AM";
      }

      blocks.push(candidate);
      return { ...prev, [dayKey]: blocks };
    });
  };

  const handleUpdateBlock = (dayKey, index, patch) => {
   handleSelectDay(dayKey);
    setUiError("");

    setWeekly((prev) => {
      const blocks = prev[dayKey] ? [...prev[dayKey]] : [];
      const cur = blocks[index] || { start: "10:00 AM", end: "11:00 AM" };
      const next = { ...cur, ...patch };

      if (!isValidRange(next.start, next.end)) {
        setUiError("End time must be after start time.");
        return prev;
      }

      if (overlapsAny(blocks, next, index)) {
        setUiError("Overlapping time blocks aren’t allowed.");
        return prev;
      }

      blocks[index] = next;
      return { ...prev, [dayKey]: blocks };
    });
  };

  const handleDeleteBlock = (dayKey, index) => {
    handleSelectDay(dayKey);
    setUiError("");
    setWeekly((prev) => {
      const blocks = prev[dayKey] ? [...prev[dayKey]] : [];
      blocks.splice(index, 1);
      return { ...prev, [dayKey]: blocks };
    });
  };

  const navigate = useNavigate();
  const handleSaveDraft = () => {
    setUiError("");
    const existing = loadTutorDraft() || {};
    saveTutorDraft({
      ...existing,
      availabilityV2: { slotDuration, weekly },
    });
    navigate(backTo);
  };
  const handleSelectDay = (dayKey) => {
    setSelectedDay(dayKey);
    setSelectedPreviewId(null);
  };

  async function handleSaveAvailability() {
    setUiError("");

    const currentUser = getUser();
    const tutorId = currentUser?.id;
    if (!tutorId) {
      setUiError("Missing tutor id. Please log in again.");
      return;
    }

    const schedule = buildScheduleRequestFromWeekly(weekly, slotDuration);

    if (!schedule.daySchedules.length) {
      setUiError("Please add at least one availability block before saving.");
      return;
    }

    try {
      const startDate = schedule.startDate;
      const endDate = new Date(
        new Date(startDate).setMonth(new Date(startDate).getMonth() + 4)
      )
        .toISOString()
        .slice(0, 10);

      await replaceTutorSchedule(tutorId, schedule, startDate, endDate);

      navigate(backTo, { replace: true });
    } catch (e) {
      setUiError(e?.message ?? "Failed to save availability.");
    }
  }

  const handleResetGenerated = () => {
    setSelectedPreviewId(null);
    setUiError("");
    setWeekly(makeEmptyWeekly());
  };

  const handleDeleteGenerated = () => {
    if (!selectedPreviewId) return;

    const [dayKey, startMinsStr, durStr] = String(selectedPreviewId).split("-");
    const startMins = Number(startMinsStr);
    const dur = Number(durStr);
    const endMins = startMins + dur;

    setWeekly(prev => {
      const dayBlocks = prev[dayKey] ? [...prev[dayKey]] : [];
      const nextBlocks = subtractIntervalFromBlocks(dayBlocks, startMins, endMins);
      return { ...prev, [dayKey]: normalizeBlocks(nextBlocks) };
    });

    setSelectedPreviewId(null);
  };

  function toBlockMinutes(block) {
    return { s: toMinutes(block.start), e: toMinutes(block.end) };
  }

  function minutesToBlock(s, e) {
    return { start: minutesTo12h(s), end: minutesTo12h(e) };
  }

  function subtractIntervalFromBlocks(blocks, cutS, cutE) {
    const out = [];
    for (const b of blocks) {
      const { s, e } = toBlockMinutes(b);
      if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) continue;

      if (cutE <= s || cutS >= e) {
        out.push(b);
        continue;
      }
      if (cutS > s) out.push(minutesToBlock(s, cutS));
      if (cutE < e) out.push(minutesToBlock(cutE, e));
    }
    return out;
  }

  function minutesToHHmm(totalMins) {
    const hh = String(Math.floor(totalMins / 60)).padStart(2, "0");
    const mm = String(totalMins % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  function normalizeBlocks(blocks) {
    const mins = blocks
      .map(toBlockMinutes)
      .filter(({ s, e }) => Number.isFinite(s) && Number.isFinite(e) && e > s)
      .sort((a, b) => a.s - b.s);

    const merged = [];
    for (const b of mins) {
      const last = merged[merged.length - 1];
      if (!last) merged.push({ ...b });
      else if (b.s <= last.e) last.e = Math.max(last.e, b.e);
      else merged.push({ ...b });
    }

    return merged.map(({ s, e }) => minutesToBlock(s, e));
  }

  function buildScheduleRequestFromWeekly(weekly, slotDuration) {
    const startDate = new Date().toISOString().slice(0, 10);

    const daySchedules = Object.entries(weekly)
      .map(([day, blocks]) => {
        const apiBlocks = (blocks || [])
          .map(b => {
            const startM = toMinutes(b.start);
            const endM = toMinutes(b.end);
            if (!Number.isFinite(startM) || !Number.isFinite(endM) || endM <= startM) return null;
            return { start: minutesToHHmm(startM), end: minutesToHHmm(endM) };
          })
          .filter(Boolean);

        return apiBlocks.length ? { day, blocks: apiBlocks } : null;
      })
    .filter(Boolean);

    return {
      startDate,
      slotDuration,
      recurring: true,
      daySchedules,
    };
  }

  return (
    <div className="min-h-screen bg-[#F4E4D7]">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-[210px] h-[870px] bg-[#7A0000] text-white px-5 pt-6 pb-[70px] flex flex-col">
          {/* Brand */}
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
              <img src="/hat.png" alt="logo" className="h-7 w-7" />
            </div>

            <div className="mt-3 text-center">
              <div className="text-[22px] font-extrabold leading-none">Scholarly</div>
              <div className="mt-1 text-[11px] font-semibold opacity-90">
                Connect. Learn. Grow.
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="mt-11 space-y-2 text-[15px] font-semibold">
            <SideLink
              to="/dashboard/tutor"
              active={location.pathname === "/dashboard/tutor"}
              icon={<HomeIcon />}
            >
              Dashboard
            </SideLink>

            <SideLink
              to="/dashboard/sessions"
              active={location.pathname.includes("/sessions")}
              icon={<CalendarIcon />}
            >
              My Sessions
            </SideLink>

            <SideLink
              to="/dashboard/availability-v2"
              active={location.pathname.includes("/availability")}
              icon={<ClockIcon />}
            >
              Availability
            </SideLink>

            <SideLink
              to="/dashboard/find-students"
              active={location.pathname.includes("/find")}
              icon={<UsersIcon />}
            >
              Find Students
            </SideLink>

            <SideLink
              to="/dashboard/messages"
              active={location.pathname.includes("/messages")}
              icon={<ChatIcon />}
            >
              Messages
            </SideLink>

            <SideLink
              to="/dashboard/reviews"
              active={location.pathname.includes("/reviews")}
              icon={<StarIcon />}
            >
              My Reviews
            </SideLink>
          </nav>

          {/* Bottom actions */}
          <div className="mt-60 pt-6 space-y-2 text-[15px] font-semibold">
            <SideLink
              to="/dashboard/settings"
              active={location.pathname.includes("/settings")}
              icon={<SettingsIcon />}
            >
              Settings
            </SideLink>

            <SideLink to="/logout" active={false} icon={<LogoutIcon />}>
              Log Out
            </SideLink>
          </div>
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
                  className="w-full h-[54px] rounded-full bg-white px-14 text-[18px] font-mono
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
                    alt="profile"
                    src="/avatar.png"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="mt-10 font-mono">
              <h1 className="text-[44px] font-extrabold tracking-tight">
                Set Your Availability <span className="ml-2 text-[28px] opacity-80">📅</span>
              </h1>
              <p className="text-[18px] font-bold text-black/70 -mt-1">
                Set the times you are available each week.
                <br />
                We will automatically create bookable session slots.
              </p>
            </div>
            

            {/* Weekly Availability */}
            <section className="mt-8 rounded-[22px] bg-white/70 border border-black/10 px-8 py-7">
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="text-[22px] font-semibold">Weekly Availability</div>

                    <div className="flex items-center gap-3">
                      <div className="text-[14px] font-semibold text-black/70">Session length:</div>
                      <select
                        value={slotDuration}
                        onChange={(e) => setSlotDuration(Number(e.target.value))}
                        className="h-[30px] rounded-full px-4 bg-[#EAEAEA] shadow-inner outline-none text-[13px] font-bold"
                      >
                        {SESSION_LENGTHS.map((m) => (
                          <option key={m} value={m}>
                            {m} min
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-3 h-[2px] w-full bg-black/20" />
                </div>
              </div>

              {uiError && (
                <div className="mt-4 rounded-[10px] bg-red-50 border border-red-200 px-3 py-2 text-[12px] font-semibold text-red-700">
                  {uiError}
                </div>
              )}

              <div className="mt-6 grid grid-cols-3 gap-6">
                {DAYS.map((d) => {
                  const blocks = weekly[d.key] || [];
                  const needsScroll = blocks.length > 2;

                  return (
                    <div
                      key={d.key}
                      className="rounded-[14px] bg-[#BBD9FF] p-4
                                 shadow-[0px_6px_10px_rgba(0,0,0,0.18)]"
                    >
                      <div className="text-[16px] font-bold">{d.label}:</div>

                      <div
                        className={[
                          "mt-3 space-y-3 pr-1",
                          needsScroll ? "max-h-[110px] overflow-y-auto" : "",
                        ].join(" ")}
                      >
                        {blocks.length === 0 ? (
                          <div className="text-[12px] text-black/60">No time blocks yet</div>
                        ) : (
                          blocks.map((b, idx) => (
                            <div key={`${d.key}-${idx}`} className="flex items-center gap-2">
                              <select
                                value={b.start}
                                onChange={(e) =>
                                  handleUpdateBlock(d.key, idx, { start: e.target.value })
                                }
                                className="h-[30px] w-[110px] rounded-full bg-white px-3 text-[12px] font-bold shadow outline-none"
                              >
                                {TIME_OPTIONS.map((t) => (
                                  <option key={`s-${t}`} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>

                              <div className="text-[16px] font-bold text-black/70">to</div>

                              <select
                                value={b.end}
                                onChange={(e) =>
                                  handleUpdateBlock(d.key, idx, { end: e.target.value })
                                }
                                className="h-[30px] w-[110px] rounded-full bg-white px-3 text-[12px] font-bold shadow outline-none"
                              >
                                {TIME_OPTIONS.map((t) => (
                                  <option key={`e-${t}`} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>

                              <button
                                type="button"
                                onClick={() => handleDeleteBlock(d.key, idx)}
                                className="ml-auto opacity-70 hover:opacity-100"
                                aria-label="Delete time block"
                                title="Delete"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddBlock(d.key)}
                        className="mt-4 w-full text-right text-[12px] font-bold underline underline-offset-4"
                      >
                        + Add time block
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Generated Session Slots */}
                  <section className="mt-10 rounded-[22px] bg-white/70 border border-black/10 px-8 py-7">
                    <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[28px] font-mono font-extrabold leading-none">Generated Session Slots</div>
                      <div className="mt-2 text-[14px] font-mono font-semibold text-black/70">Automatically created from your availability</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        type="button"
                        onClick={handleDeleteGenerated}
                        disabled={!selectedPreviewId}
                        className={["h-[38px] px-6 rounded-[10px] font-bold shadow",
                         selectedPreviewId ? "bg-[#C00000] text-white" 
                                          : "bg-[#C87A7A]/40 text-white/70 cursor-not-allowed"]
                                          .join(" ")}>
                                            Delete
                                            </button>
                      <button type="button" 
                              onClick={handleResetGenerated}
                              className="h-[38px] px-6 rounded-[10px] bg-[#0B2F86] text-white font-bold shadow">
                                Reset
                                </button>
                    </div>
                    </div>
                    
                      {/*Week Navigation*/}
                      <div className="flex items-center justify-between mb-3 mt-4">
                        <button type="button" onClick={goPrevWeek} className="text-[14px] font-bold">&lt; Previous Week</button>
                      <div className="flex flex-col items-center">
                      <div className="text-[16px] font-bold text-center font-mono text-black/70">{monthLabel}</div>
                      <div className="text-[12px] text-black/50 font-semibold font-mono text-center">{weekRangeLabel}</div>
                      </div>
                      <button type="button" onClick={goNextWeek} className="text-[14px] font-bold">Next Week &gt;</button>
                      </div>
                      
                   
                    <div className="mt-6 rounded-[14px] bg-white border border-black/10 overflow-hidden">
                    <div className="grid grid-cols-7">
                      {WeekColumns.map((c) => (
                      <div key={c.key} className="border-r border-black/10 last:border-r-0">
                        <div className="px-4 pt-4 pb-3 text-center">
                        <button type="button"
                          //onClick={() => setSelectedDay(c.key)}
                          onClick={() => handleSelectDay(c.key)}
                          className={[
                            "mx-auto text-[16px] font-bold transition-colors",
                            selectedDay === c.key
                              ? "text-[#C00000]"
                              : "text-black/40 hover:text-black/70",
                          ].join(" ")}
                        >
                          {c.label}
                        </button>
                        <div
                          className={[
                            "mx-auto mt-2 h-9 w-9 rounded-full flex items-center justify-center text-[22px] font-bold",
                            selectedDay === c.key ? "bg-[#0B2F86] text-white" : "text-black/70",
                          ].join(" ")}
                        >
                          {c.dayNum}
                        </div>
                      </div>
                      <div className="px-3 pb-4 space-y-3 min-h-[220px]">
                        {(previewSlots[c.key] || []).map((s) => {
                            const active = s.id === selectedPreviewId;
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  handleSelectDay(c.key);
                                  setSelectedPreviewId(active ? null : s.id);
                                }}
                                className={[
                                  "w-full rounded-full px-3 py-2 text-center text-[12px] font-extrabold shadow-sm",
                                  active
                                    ? "bg-black/20 text-black"
                                    : "bg-black/10 text-black/70 hover:bg-black/15",
                                ].join(" ")}
                              >
                                {s.label}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Bottom actions */}
            <div className="mt-10 flex items-center justify-center gap-8 pb-10">
              <Link
                to={backTo}
                className="h-[56px] w-[210px] rounded-[14px] bg-black/35 text-white/95
                           flex items-center justify-center text-[22px] font-bold
                           shadow-[0px_10px_20px_rgba(0,0,0,0.18)] hover:bg-black/40"
              >
                Cancel
              </Link>

              <button
                type="button"
                onClick={handleSaveAvailability}
                className="h-[56px] w-[260px] rounded-[14px] bg-[#0B70FF] text-white hover:bg-[#0A5ACC] transition
                           flex items-center justify-center text-[22px] font-bold
                           shadow-[0px_10px_20px_rgba(0,0,0,0.18)] hover:brightness-95"
              >
                Save Availability
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SideLink({ to, active, icon, children }) {
  return (
    <Link
      to={to}
      className={[
        "flex items-center gap-3 rounded-[10px] px-3 py-2 transition",
        active ? "bg-white/15" : "hover:bg-white/10",
      ].join(" ")}
    >
      <span className="opacity-95">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}


function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 6l1 16h10l1-16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 11v7M14 11v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
function IconBase({ children }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

function HomeIcon() {
  return (
    <IconBase>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function CalendarIcon() {
  return (
    <IconBase>
      <path
        d="M7 3v3M17 3v3M4 8h16M6 6h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

function ClockIcon() {
  return (
    <IconBase>
      <path
        d="M12 22a10 10 0 110-20 10 10 0 010 20z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 6v6l4 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function UsersIcon() {
  return (
    <IconBase>
      <path
        d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 11a4 4 0 100-8 4 4 0 000 8z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M22 21v-2a4 4 0 00-3-3.87"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 3.13a4 4 0 010 7.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

function ChatIcon() {
  return (
    <IconBase>
      <path
        d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function StarIcon() {
  return (
    <IconBase>
      <path
        d="M12 2l3 7 7 .5-5.3 4.6L18.5 21 12 17.2 5.5 21l1.8-6.9L2 9.5 9 9l3-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function SettingsIcon() {
  return (
    <IconBase>
      <path
        d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a7.8 7.8 0 000-6l2-1.1-2-3.5-2.3.7a8 8 0 00-5.2-3L11.5 0h-3L8 2a8 8 0 00-5.2 3l-2.3-.7-2 3.5L.5 9a7.8 7.8 0 000 6l-2 1.1 2 3.5 2.3-.7a8 8 0 005.2 3l.5 2h3l.4-2a8 8 0 005.2-3l2.3.7 2-3.5-2-1.1z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function LogoutIcon() {
  return (
    <IconBase>
      <path
        d="M10 17l1 4H5a2 2 0 01-2-2V5a2 2 0 012-2h6l-1 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15 12H8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 9l3 3-3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

