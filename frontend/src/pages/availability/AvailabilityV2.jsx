// AvailabilityV2.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import { getUser, replaceTutorSchedule, getTutorAllSlots } from "../../api";
import {
  loadTutorDraft,
  saveTutorDraft,
} from "../../utils/tutorOnboardingDraft";
import TopBar from "../../components/layout/Topbar";
import TrashIcon from "../../components/icons/TrashIcon";
import WeeklySlotCalendar from "../../components/calendar/WeeklySlotCalendar";

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

function parseToMinutes(t) {
  const str = String(t ?? "").trim();
  if (!str) return NaN;

  // UI format: "h:mm AM/PM"
  const m12 = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) {
    let hh = parseInt(m12[1], 10);
    const mm = parseInt(m12[2], 10);
    const ap = m12[3].toUpperCase();

    if (hh === 12) hh = 0;
    let mins = hh * 60 + mm;
    if (ap === "PM") mins += 12 * 60;
    return mins;
  }

  // Backend format: "HH:mm" / "HH:mm:ss" / "HH:mm:ss.SSS"
  const m24 = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/);
  if (m24) {
    const hh = Number(m24[1]);
    const mm = Number(m24[2]);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return NaN;
    return hh * 60 + mm;
  }

  return NaN;
}

function minutesTo12h(mins) {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  return format12h(h24, m);
}

function isValidRange(start, end) {
  const s = parseToMinutes(start);
  const e = parseToMinutes(end);
  if (!Number.isFinite(s) || !Number.isFinite(e)) return false;
  return e > s;
}

function overlapsAny(blocks, candidate, ignoreIndex = -1) {
  const s = parseToMinutes(candidate.start);
  const e = parseToMinutes(candidate.end);
  if (!Number.isFinite(s) || !Number.isFinite(e)) return true;

  return blocks.some((b, i) => {
    if (i === ignoreIndex) return false;
    const bs = parseToMinutes(b.start);
    const be = parseToMinutes(b.end);
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
      const startM = parseToMinutes(b.start);
      const endM = parseToMinutes(b.end);

      if (!Number.isFinite(startM) || !Number.isFinite(endM) || endM <= startM)
        return;

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

function dateToDayKey(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const idx = d.getDay(); // 0=Sun ... 6=Sat
  return ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][idx];
}

function inferSlotDurationFromSlots(slots) {
  const durations = slots
    .map((s) => parseToMinutes(s.endTime) - parseToMinutes(s.startTime))
    .filter((d) => Number.isFinite(d) && d > 0);

  if (!durations.length) return null;

  const counts = new Map();
  for (const d of durations) counts.set(d, (counts.get(d) || 0) + 1);

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function mergeTimesIntoBlocks(timePairs) {
  const sorted = timePairs
    .filter((p) => Number.isFinite(p.s) && Number.isFinite(p.e) && p.e > p.s)
    .sort((a, b) => a.s - b.s || a.e - b.e);

  const merged = [];
  for (const p of sorted) {
    const last = merged[merged.length - 1];
    if (!last) merged.push({ ...p });
    else if (p.s <= last.e) last.e = Math.max(last.e, p.e);
    else merged.push({ ...p });
  }

  return merged.map(({ s, e }) => ({ start: minutesTo12h(s), end: minutesTo12h(e) }));
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
    initialDraft?.slotDuration ?? 60,
  );
  const [recurring, setRecurring] = useState(initialDraft?.recurring ?? true);
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
    //const diffToMonday = (day + 6) % 7;
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const WeekColumns = useMemo(() => {
    const start = new Date(baseWeekStart);
    start.setDate(start.getDate() + weekOffset * 7);

    const labels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const keys = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];

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

  // const weekRangeLabel = useMemo(() => {
  //   if (!WeekColumns.length) return "";
  //   const a = WeekColumns[0].date;
  //   const b = WeekColumns[6].date;
  //   const opts = { month: "short", day: "numeric" };
  //   return `${a.toLocaleDateString("en-US", opts)} – ${b.toLocaleDateString("en-US", opts)}`;
  // }, [WeekColumns]);

  const [uiError, setUiError] = useState("");
  const [selectedPreviewId, setSelectedPreviewId] = useState(null);

  const previewSlots = useMemo(
    () => buildPreviewSlots(weekly, slotDuration),
    [weekly, slotDuration],
  );

  useEffect(() => {
    if (fromOnboarding) return;

    const tutorId = user?.id;
    if (!tutorId) return;

    let cancelled = false;

    (async () => {
      try {
        setUiError("");

        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 42); // 6 weeks

        const startDate = start.toISOString().slice(0, 10);
        const endDate = end.toISOString().slice(0, 10);

        const res = await getTutorAllSlots(tutorId, startDate, endDate);
        if (cancelled) return;

        const slots = Array.isArray(res) ? res : (res?.data ?? []);
        if (!slots.length) {
          setWeekly(makeEmptyWeekly());
          return;
        }

        const byDayKey = new Map();
        for (const s of slots) {
          if (!s?.date || !s?.startTime || !s?.endTime) continue;

          const dayKey = dateToDayKey(s.date);
          const st = parseToMinutes(s.startTime);
          const en = parseToMinutes(s.endTime);
          if (!Number.isFinite(st) || !Number.isFinite(en) || en <= st) continue;

          if (!byDayKey.has(dayKey)) byDayKey.set(dayKey, []);
          byDayKey.get(dayKey).push({ s: st, e: en });
        }

        const nextWeekly = makeEmptyWeekly();
        for (const [dayKey, pairs] of byDayKey.entries()) {
          nextWeekly[dayKey] = mergeTimesIntoBlocks(pairs);
        }

        setWeekly(nextWeekly);

        const inferred = inferSlotDurationFromSlots(slots);
        if (inferred && SESSION_LENGTHS.includes(inferred)) {
          setSlotDuration(inferred);
        }
      } catch (e) {
        if (!cancelled) setUiError(e?.message ?? "Failed to load availability.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fromOnboarding, user?.id]);


  const handleAddBlock = (dayKey) => {
    handleSelectDay(dayKey);
    setUiError("");

    setWeekly((prev) => {
      const blocks = prev[dayKey] ? [...prev[dayKey]] : [];
      const last = blocks[blocks.length - 1];
      let start = "10:00 AM";
      let end = "11:00 AM";

      if (last?.end) {
        const lastEndM = parseToMinutes(last.end);
        if (Number.isFinite(lastEndM)) {
          start = minutesTo12h(lastEndM);
          end = minutesTo12h(lastEndM + slotDuration);
        }
      }

      const candidate = { start, end };

      if (
        !isValidRange(candidate.start, candidate.end) ||
        overlapsAny(blocks, candidate)
      ) {
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
      availabilityV2: { slotDuration, weekly, recurring },
    });
    const schedule = buildScheduleRequestFromWeekly(
      weekly,
      slotDuration,
      recurring,
    );
    navigate(backTo, { state: { availability: schedule } });
  };
  const handleSelectDay = (dayKey) => {
    setSelectedDay(dayKey);
    setSelectedPreviewId(null);
  };

  async function handleSaveAvailability() {
    setUiError("");
    // during onboarding process, save availability button will create "draft" schedule. Onboarding will handle api request.
    if (fromOnboarding) {
      handleSaveDraft();
      return;
    }
    const currentUser = getUser();
    const tutorId = currentUser?.id;
    if (!tutorId) {
      setUiError("Missing tutor id. Please log in again.");
      return;
    }

    const schedule = buildScheduleRequestFromWeekly(
      weekly,
      slotDuration,
      recurring,
    );

    if (!schedule.daySchedules.length) {
      setUiError("Please add at least one availability block before saving.");
      return;
    }

    try {
      const startDate = schedule.startDate;
      const endDate = new Date(
        new Date(startDate).setMonth(new Date(startDate).getMonth() + 4),
      )
        .toISOString()
        .slice(0, 10);

      await replaceTutorSchedule(tutorId, schedule, startDate, endDate);

      navigate(backTo, { replace: true, state: { availability: schedule } });
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

    setWeekly((prev) => {
      const dayBlocks = prev[dayKey] ? [...prev[dayKey]] : [];
      const nextBlocks = subtractIntervalFromBlocks(
        dayBlocks,
        startMins,
        endMins,
      );
      return { ...prev, [dayKey]: normalizeBlocks(nextBlocks) };
    });

    setSelectedPreviewId(null);
  };

  function toBlockMinutes(block) {
    return { s: parseToMinutes(block.start), e: parseToMinutes(block.end) };
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

  function buildScheduleRequestFromWeekly(weekly, slotDuration, recurring) {
    const startDate = new Date().toISOString().slice(0, 10);

    const daySchedules = Object.entries(weekly)
      .map(([day, blocks]) => {
        const apiBlocks = (blocks || [])
          .map((b) => {
            const startM = parseToMinutes(b.start);
            const endM = parseToMinutes(b.end);
            if (
              !Number.isFinite(startM) ||
              !Number.isFinite(endM) ||
              endM <= startM
            )
              return null;
            return { start: minutesToHHmm(startM), end: minutesToHHmm(endM) };
          })
          .filter(Boolean);

        return apiBlocks.length ? { day, blocks: apiBlocks } : null;
      })
      .filter(Boolean);

    return {
      startDate,
      slotDuration,
      recurring,
      daySchedules,
    };
  }

  return (
    <div className='h-screen bg-[#F4E4D7] overflow-hidden'>
      <div className='w-full'>
        <div className='flex h-screen'>
          <Sidebar />

          {/* Main */}
          <main className='flex-1 overflow-y-auto px-10 py-6'>
            {/* Top bar */}
            <TopBar />
            {/* Title */}
            <div className='mt-10 font-mono'>
              <h1 className='text-[44px] font-extrabold tracking-tight'>
                Set Your Availability{" "}
                <span className='ml-2 text-[28px] opacity-80'>📅</span>
              </h1>
              <p className='text-[18px] font-bold text-black/70 -mt-1'>
                {recurring
                  ? "Set the times you are available each week."
                  : "Set the times for a one-time appointment."}
                <br />
                We will automatically create bookable session slots.
              </p>
            </div>

            {/* Weekly Availability */}
            <section className='mt-8 rounded-[22px] bg-white/70 border border-black/10 px-8 py-7'>
              <div className='flex items-center justify-between'>
                <div className='w-full'>
                  <div className='flex items-center justify-between'>
                    <div className='text-[22px] font-semibold'>
                      Weekly Availability
                    </div>

                    <div className='flex items-center gap-3'>
                      <div className='text-[14px] font-semibold text-black/70'>
                        Session length:
                      </div>
                      <select
                        value={slotDuration}
                        onChange={(e) =>
                          setSlotDuration(Number(e.target.value))
                        }
                        className='h-[30px] rounded-full px-4 justify-center bg-[#EAEAEA] shadow-inner outline-none text-[13px] font-bold'
                      >
                        {SESSION_LENGTHS.map((m) => (
                          <option
                            key={m}
                            value={m}
                          >
                            {m} min
                          </option>
                        ))}
                      </select>
                      <span className='text-[14px] font-semibold text-black/70'>
                        Recurring weekly
                      </span>
                      <label className='flex items-center gap-2 cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={recurring}
                          onChange={(e) => setRecurring(e.target.checked)}
                          className='h-4 w-4 accent-[#0066CC]'
                        />
                      </label>
                    </div>
                  </div>

                  <div className='mt-3 h-[2px] w-full bg-black/20' />
                </div>
              </div>

              {uiError && (
                <div className='mt-4 rounded-[10px] bg-red-50 border border-red-200 px-3 py-2 text-[12px] font-semibold text-red-700'>
                  {uiError}
                </div>
              )}

              <div className='mt-6 grid grid-cols-3 gap-6'>
                {DAYS.map((d) => {
                  const blocks = weekly[d.key] || [];
                  const needsScroll = blocks.length > 2;

                  return (
                    <div
                      key={d.key}
                      className='rounded-[14px] bg-[#BBD9FF] p-4
                                 shadow-[0px_6px_10px_rgba(0,0,0,0.18)]'
                    >
                      <div className='text-[16px] font-bold'>{d.label}:</div>

                      <div
                        className={[
                          "mt-3 space-y-3 pr-1",
                          needsScroll ? "max-h-[110px] overflow-y-auto" : "",
                        ].join(" ")}
                      >
                        {blocks.length === 0 ? (
                          <div className='text-[14px] text-black/60'>
                            No time blocks yet
                          </div>
                        ) : (
                          blocks.map((b, idx) => (
                            <div
                              key={`${d.key}-${idx}`}
                              className='flex items-center gap-2'
                            >
                              <select
                                value={b.start}
                                onChange={(e) =>
                                  handleUpdateBlock(d.key, idx, {
                                    start: e.target.value,
                                  })
                                }
                                className='h-[30px] w-[140px] rounded-full bg-white px-3 text-[14px] text-center font-bold shadow outline-none'
                              >
                                {TIME_OPTIONS.map((t) => (
                                  <option
                                    key={`s-${t}`}
                                    value={t}
                                  >
                                    {t}
                                  </option>
                                ))}
                              </select>

                              <div className='text-[16px] font-bold text-black/70'>
                                to
                              </div>

                              <select
                                value={b.end}
                                onChange={(e) =>
                                  handleUpdateBlock(d.key, idx, {
                                    end: e.target.value,
                                  })
                                }
                                className='h-[30px] w-[140px] rounded-full bg-white px-3 text-[14px] text-center font-bold shadow outline-none'
                              >
                                {TIME_OPTIONS.map((t) => (
                                  <option
                                    key={`e-${t}`}
                                    value={t}
                                  >
                                    {t}
                                  </option>
                                ))}
                              </select>

                              <button
                                type='button'
                                onClick={() => handleDeleteBlock(d.key, idx)}
                                className='ml-auto opacity-70 hover:opacity-100'
                                aria-label='Delete time block'
                                title='Delete'
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      <button
                        type='button'
                        onClick={() => handleAddBlock(d.key)}
                        className='mt-4 w-full text-right text-[14px] font-bold underline underline-offset-4'
                      >
                        + Add time block
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Generated Session Slots */}
            <section className='mt-10 rounded-[22px] bg-white/70 border border-black/10 px-8 py-7'>
              <div className='flex items-start justify-between'>
                <div>
                  <div className='text-[28px] font-mono font-extrabold leading-none'>
                    Generated Session Slots
                  </div>
                  <div className='mt-2 text-[14px] font-mono font-semibold text-black/70'>
                    Automatically created from your availability
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <button
                    type='button'
                    onClick={handleDeleteGenerated}
                    disabled={!selectedPreviewId}
                    className={[
                      "h-[38px] px-6 rounded-[10px] font-bold shadow",
                      selectedPreviewId
                        ? "bg-[#C00000] text-white"
                        : "bg-[#C87A7A]/40 text-white/70 cursor-not-allowed",
                    ].join(" ")}
                  >
                    Delete
                  </button>
                  <button
                    type='button'
                    onClick={handleResetGenerated}
                    className='h-[38px] px-6 rounded-[10px] bg-[#0B2F86] text-white font-bold shadow'
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Week Navigation
              <div className='flex items-center justify-between mb-3 mt-4'>
                <button
                  type='button'
                  onClick={goPrevWeek}
                  className='text-[14px] font-bold'
                >
                  &lt; Previous Week
                </button>
                <div className='flex flex-col items-center'>
                  <div className='text-[18px] font-bold text-center font-mono text-black/70'>
                    {monthLabel}
                  </div>
                  <div className='text-[14px] text-black/50 font-semibold font-mono text-center'>
                    {weekRangeLabel}
                  </div>
                </div>
                <button
                  type='button'
                  onClick={goNextWeek}
                  className='text-[14px] font-bold'
                >
                  Next Week &gt;
                </button>
              </div>

              <div className='mt-6 rounded-[14px] bg-white border border-black/10 overflow-hidden'>
                <div className='grid grid-cols-7'>
                  {WeekColumns.map((c) => (
                    <div
                      key={c.key}
                      className='border-r border-black/10 last:border-r-0'
                    >
                      <div className='px-4 pt-4 pb-3 text-center'>
                        <button
                          type='button'
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
                            selectedDay === c.key
                              ? "bg-[#0B2F86] text-white"
                              : "text-black/70",
                          ].join(" ")}
                        >
                          {c.dayNum}
                        </div>
                      </div>
                      <div className='px-3 pb-4 space-y-3 min-h-[220px]'>
                        {(previewSlots[c.key] || []).map((s) => {
                          const active = s.id === selectedPreviewId;
                          return (
                            <button
                              key={s.id}
                              type='button'
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
              </div> */}
              <WeeklySlotCalendar
                  slotsByDayKey={previewSlots}
                  selectedDayKey={selectedDay}
                  onSelectDayKey={handleSelectDay}
                  selectedSlotId={selectedPreviewId}
                  onSelectSlotId={setSelectedPreviewId}
                  minBodyHeight={220}
                  onSlotClick={(slot, col) => {
                    handleSelectDay(col.key);
                    setSelectedPreviewId((prev) => (prev === slot.id ? null : slot.id));
                  }}
                />

            </section>

            {/* Bottom actions */}
            <div className='mt-10 flex items-center justify-center gap-8 pb-10'>
              <Link
                to={backTo}
                className='h-[56px] w-[210px] rounded-[14px] bg-black/35 text-white/95
                           flex items-center justify-center text-[22px] font-bold
                           shadow-[0px_10px_20px_rgba(0,0,0,0.18)] hover:bg-black/40'
              >
                Cancel
              </Link>

              <button
                type='button'
                onClick={handleSaveAvailability}
                className='h-[56px] w-[260px] rounded-[14px] bg-[#0B70FF] text-white hover:bg-[#0A5ACC] transition
                           flex items-center justify-center text-[22px] font-bold
                           shadow-[0px_10px_20px_rgba(0,0,0,0.18)] hover:brightness-95'
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


