import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageCard from "../../components/ui/PageCard";
import WeeklySlotCalendar from "../../components/calendar/WeeklySlotCalendar";
import { getTutorAllSlots, searchTutors } from "../../api";

function makeEmptyWeek() {
  return {
    MONDAY: [],
    TUESDAY: [],
    WEDNESDAY: [],
    THURSDAY: [],
    FRIDAY: [],
    SATURDAY: [],
    SUNDAY: [],
  };
}

function dateToDayKey(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const idx = d.getDay();
  return [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ][idx];
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function parseToMinutes(t) {
  const str = String(t ?? "").trim();
  const m24 = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/);
  if (!m24) return NaN;
  const hh = Number(m24[1]);
  const mm = Number(m24[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return NaN;
  return hh * 60 + mm;
}

function minutesTo12h(mins) {
  const hour24 = Math.floor(mins / 60);
  const minute = mins % 60;
  const ap = hour24 >= 12 ? "PM" : "AM";
  let hh = hour24 % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${pad2(minute)} ${ap}`;
}

function isSlotAvailable(slot) {
  if (typeof slot?.isAvailable === "boolean") return slot.isAvailable;
  if (typeof slot?.status === "string") return slot.status === "AVAILABLE";
  if (Number.isFinite(slot?.capacity) && Number.isFinite(slot?.bookedCount)) {
    return slot.bookedCount < slot.capacity;
  }
  return true;
}

export default function LearnerSessionReschedule() {
  const location = useLocation();
  const navigate = useNavigate();

  const session = location.state?.session;
  const tutorId = session?.tutorId ?? "T102";

  const [tutorProfile, setTutorProfile] = useState(null);
  const [slotsByDayKey, setSlotsByDayKey] = useState(() => makeEmptyWeek());
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedDayKey, setSelectedDayKey] = useState("MONDAY");
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [confirmError, setConfirmError] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);

  const profilePic = "/profile_pic2.png";

  const demoSlotsByDayKey = useMemo(() => {
    const next = makeEmptyWeek();
    const today = new Date();
    const daysUntilWed = (3 - today.getDay() + 7) % 7 || 7;
    const nextWed = new Date(today);
    nextWed.setDate(today.getDate() + daysUntilWed);
    const wedDateStr = nextWed.toISOString().slice(0, 10);

    next.WEDNESDAY = [
      {
        id: `demo-${wedDateStr}-1430`,
        label: "2:30 PM",
        raw: {
          id: "DEMO_SLOT_1",
          date: wedDateStr,
          startTime: "14:30:00",
          endTime: "15:10:00",
          status: "AVAILABLE",
        },
      },
      {
        id: `demo-${wedDateStr}-1515`,
        label: "3:15 PM",
        raw: {
          id: "DEMO_SLOT_2",
          date: wedDateStr,
          startTime: "15:15:00",
          endTime: "15:55:00",
          status: "AVAILABLE",
        },
      },
    ];

    return next;
  }, []);

  useEffect(() => {
    if (!tutorId) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await searchTutors({ q: "", page: 0, size: 50 });
        const tutor = res?.content?.find((t) => String(t.id) === String(tutorId));
        if (!cancelled) setTutorProfile(tutor || null);
      } catch {
        if (!cancelled) setTutorProfile(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tutorId]);

  useEffect(() => {
    if (!tutorId) return;

    let cancelled = false;

    (async () => {
      try {
        setLoadingSlots(true);

        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 42);

        const startDate = start.toISOString().slice(0, 10);
        const endDate = end.toISOString().slice(0, 10);

        const res = await getTutorAllSlots(tutorId, startDate, endDate);
        const all = Array.isArray(res) ? res : res?.data ?? [];

        if (cancelled) return;

        const next = makeEmptyWeek();

        for (const s of all) {
          if (!s?.date || !s?.startTime || !s?.endTime) continue;
          if (!isSlotAvailable(s)) continue;

          const dayKey = dateToDayKey(s.date);
          const startM = parseToMinutes(s.startTime);
          if (!Number.isFinite(startM)) continue;

          next[dayKey].push({
            id: s.id ?? `${s.date}-${s.startTime}`,
            label: minutesTo12h(startM),
            raw: s,
          });
        }

        for (const key of Object.keys(next)) {
          next[key].sort(
            (a, b) =>
              parseToMinutes(a.raw?.startTime) - parseToMinutes(b.raw?.startTime)
          );
        }

        setSlotsByDayKey(next);
      } catch {
        if (!cancelled) setSlotsByDayKey(makeEmptyWeek());
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tutorId]);

  const tutorName = useMemo(() => {
    if (session?.tutorName) return session.tutorName;
    if (!tutorProfile) return "Tutor";
    const fn = tutorProfile.firstName ?? "";
    const ln = tutorProfile.lastName ?? "";
    const full = `${fn} ${ln}`.trim();
    return full || "Tutor";
  }, [session, tutorProfile]);

  const ratingLabel = useMemo(() => {
    if (session?.rating) return session.rating;
    const r = tutorProfile?.rating;
    if (typeof r === "number") return r.toFixed(1);
    return "—";
  }, [session, tutorProfile]);

  const reviewCountLabel = useMemo(() => {
    if (session?.reviews) return session.reviews;
    const count = tutorProfile?.reviewCount ?? 0;
    return `${count} reviews`;
  }, [session, tutorProfile]);

  const selectedDateLabel = useMemo(() => {
    if (!selectedSlot?.date) return "—";
    return selectedSlot.date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [selectedSlot]);

  const startTime = selectedSlot?.label ?? "—";

  const endTime = useMemo(() => {
    const raw = selectedSlot?.raw;
    if (!raw?.endTime) return "—";
    const endM = parseToMinutes(raw.endTime);
    if (!Number.isFinite(endM)) return "—";
    return minutesTo12h(endM);
  }, [selectedSlot]);

  const canConfirm = Boolean(selectedSlot?.raw?.id);

  function handleReset() {
    setSelectedSlotId(null);
    setSelectedSlot(null);
    setConfirmError("");
  }

  function handleClose() {
    navigate("/dashboard/learner/sessions");
  }

  async function handleConfirmReschedule() {
    setConfirmError("");

    if (!selectedSlot?.raw?.id) {
      setConfirmError("Please select an available time slot first.");
      return;
    }

    if (isRescheduling) return;

    try {
      setIsRescheduling(true);

      console.log("Reschedule placeholder:", {
        oldSession: session,
        newSlot: selectedSlot.raw,
      });

      navigate("/dashboard/learner/sessions");
    } catch (e) {
      setConfirmError(e?.message ?? "Reschedule failed. Please try again.");
    } finally {
      setIsRescheduling(false);
    }
  }

  return (
    <DashboardLayout>
      <PageCard className="mt-6 p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-[83px] w-[85px] overflow-hidden rounded-full bg-black/10 shadow">
              <img
                src={tutorProfile?.profilePictureUrl || "/profile_pic2.png"}
                alt="Tutor"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="font-mono">
              <div className="text-[30px] font-extrabold leading-none">
                {tutorName}
              </div>
              <div className="mt-2 flex items-center gap-3 text-[16px] font-bold text-black/80">
                <span>★ {ratingLabel}</span>
                <span className="text-black/50">({reviewCountLabel})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              className="flex h-[61px] w-[156px] items-center justify-center rounded-[17px] bg-[#FF4245] text-[20px] font-medium leading-[20px] text-white shadow-[0px_6px_14px_rgba(0,0,0,0.18)] transition hover:brightness-95"
            >
              Message
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard/learner/find-tutors/profile", {
                  state: { tutor: location.state?.tutor || tutorProfile },
                })
              }
              className="flex h-[61px] w-[156px] items-center justify-center rounded-[17px] bg-[#FF4245] text-[20px] font-medium leading-[20px] text-white shadow-[0px_6px_14px_rgba(0,0,0,0.18)] transition hover:brightness-95"
            >
              View Profile
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="grid h-[40px] w-[40px] place-items-center rounded-full bg-black/10 text-[20px] font-bold text-black/60 transition hover:bg-black/15"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div className="mt-8 font-mono">
          <h1 className="text-[36px] font-extrabold leading-none">
            You are changing the date and time of this session
          </h1>

          <p className="mt-2 text-[20px] font-bold text-black/70">
            Only available time slots are shown. If needed, message the tutor before rescheduling.
          </p>
        </div>

        <div className="mt-6">
          <WeeklySlotCalendar
            slotsByDayKey={
              Object.values(slotsByDayKey).some((a) => a.length)
                ? slotsByDayKey
                : demoSlotsByDayKey
            }
            selectedDayKey={selectedDayKey}
            onSelectDayKey={(key) => {
              setSelectedDayKey(key);
              setSelectedSlotId(null);
              setSelectedSlot(null);
              setConfirmError("");
            }}
            selectedSlotId={selectedSlotId}
            onSelectSlotId={setSelectedSlotId}
            minBodyHeight={260}
            onSlotClick={(slot, col) => {
              setSelectedSlotId(slot.id);
              setSelectedSlot({
                id: slot.id,
                label: slot.label,
                dayKey: col.key,
                date: col.date,
                raw: slot.raw,
              });
              setConfirmError("");
            }}
          />

          {loadingSlots && (
            <div className="mt-3 text-center text-[12px] font-bold text-black/40">
              Loading availability…
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center gap-6">
          <div className="flex-1 rounded-[24px] bg-[#BBD9FF] px-10 py-7 shadow-[0px_10px_20px_rgba(0,0,0,0.10)]">
            <div className="text-center text-[20px] font-extrabold">
              Selected Time
            </div>

            <div className="mt-1 text-center text-[20px] font-extrabold">
              {selectedDateLabel}
            </div>

            <div className="mt-6 flex items-center justify-between gap-8 px-20">
              <div className="flex items-center gap-3">
                <div className="text-[18px] font-bold">Start Time:</div>
                <div className="grid h-[36px] min-w-[130px] place-items-center rounded-full bg-white px-5 text-[16px] font-extrabold shadow">
                  {startTime}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-[18px] font-bold">End Time:</div>
                <div className="grid h-[36px] min-w-[130px] place-items-center rounded-full bg-white px-5 text-[16px] font-extrabold shadow">
                  {endTime}
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-[179px] flex-col gap-3">
            <button
              type="button"
              disabled={!canConfirm}
              onClick={handleConfirmReschedule}
              className={`flex h-[45px] w-[179px] items-center justify-center gap-[10px] rounded-[17px] bg-[#4C7045] text-[20px] font-medium leading-[20px] text-white shadow-[0px_4px_10px_rgba(0,0,0,0.18)] transition ${
                canConfirm ? "hover:brightness-95" : "cursor-not-allowed opacity-50"
              }`}
            >
              {isRescheduling ? "Rescheduling..." : "Reschedule"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex h-[45px] w-[179px] items-center justify-center gap-[10px] rounded-[17px] bg-[#FF4245] text-[20px] font-medium leading-[20px] text-white shadow-[0px_4px_10px_rgba(0,0,0,0.18)] transition hover:brightness-95"
            >
              Reset
            </button>

            {confirmError && (
              <div className="mt-1 rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-bold text-red-700">
                {confirmError}
              </div>
            )}
          </div>
        </div>
      </PageCard>
    </DashboardLayout>
  );
}