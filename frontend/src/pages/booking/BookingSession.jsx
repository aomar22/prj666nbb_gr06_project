import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageCard from "../../components/ui/PageCard";
import WeeklySlotCalendar from "../../components/calendar/WeeklySlotCalendar";
import { bookSlot, getUser, getTutorAllSlots, searchTutors } from "../../api";
import BookingConfirmationModal from "../../components/booking/BookingConfirmationModal";

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
  if (Number.isFinite(slot?.capacity) && Number.isFinite(slot?.bookedCount)) {
    return slot.bookedCount < slot.capacity;
  }
  
  if (typeof slot?.isAvailable === "boolean") {
    return slot.isAvailable;
  }
  
  if (typeof slot?.status === "string") {
    return slot.status === "AVAILABLE";
  }
  
  return true;
}

export default function BookingSession() {
  const location = useLocation();
  const stateTutor = location.state?.tutor;
  const tutorId = location.state?.tutorId ?? stateTutor?.id ?? "T102"; // use passed tutor id so correct tutor is shown

  const [tutorProfile, setTutorProfile] = useState(null);

  const [slotsByDayKey, setSlotsByDayKey] = useState(() => makeEmptyWeek());
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // TEMP: demo slot to test confirm + modal (remove after backend is ready)
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
        },
      },
    ];
    return next;
  }, []);

  const [selectedDayKey, setSelectedDayKey] = useState("MONDAY");
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [confirmError, setConfirmError] = useState("");
  const profilePic = "/profile_pic2.png";

  const canConfirm = Boolean(selectedSlot?.raw?.id);

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

        for (const k of Object.keys(next)) {
          next[k].sort(
            (a, b) =>
              parseToMinutes(a.raw?.startTime) - parseToMinutes(b.raw?.startTime),
          );
        }

        setSlotsByDayKey(next);

        setSelectedSlotId((prev) => {
          if (!prev) return prev;
          const stillExists = Object.values(next).some((arr) =>
            arr.some((x) => x.id === prev),
          );
          if (!stillExists) {
            setSelectedSlot(null);
            return null;
          }
          return prev;
        });
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

  const handleReset = () => {
    setSelectedSlotId(null);
    setSelectedSlot(null);
    setConfirmError("");
  };

  const [isBooking, setIsBooking] = useState(false);
  const handleConfirm = async () => {
    setConfirmError("");

    if (!selectedSlot?.raw?.id) {
      setConfirmError("Please select an available time slot first.");
      return;
    }
    if (isBooking) return;

    try {
      setIsBooking(true);
      const learnerId = getUser()?.id;
      await bookSlot(selectedSlot.raw.id, learnerId);
      setConfirmOpen(true);
    } catch (e) {
      setConfirmError(e?.message ?? "Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const tutorName = useMemo(() => {
    if (tutorProfile) {
      const fn = tutorProfile.firstName ?? "";
      const ln = tutorProfile.lastName ?? "";
      const full = `${fn} ${ln}`.trim();
      return full || "Tutor";
    }
    if (stateTutor) {
      const fn = stateTutor.firstName ?? "";
      const ln = stateTutor.lastName ?? "";
      const full = `${fn} ${ln}`.trim();
      return full || "Tutor";
    }
    return "Tutor";
  }, [tutorProfile, stateTutor]);

  const ratingLabel = useMemo(() => {
    const r = tutorProfile?.rating ?? stateTutor?.rating;
    if (typeof r === "number") return r.toFixed(1);
    return "—";
  }, [tutorProfile, stateTutor]);

  const reviewCount = tutorProfile?.reviewCount ?? stateTutor?.reviewCount ?? 0;

  const tutorAvatarUrl = tutorProfile?.profilePictureUrl ?? stateTutor?.avatar ?? stateTutor?.profilePictureUrl ?? profilePic;
  
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleContinue = () => {
    setConfirmOpen(false);
    navigate("/dashboard/learner");
  };

  return (
    <DashboardLayout>
      <PageCard className="mt-6 p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-[83px] w-[85px]
                             top-[12px]overflow-hidden
                             rounded-full shadow bg-black/10">
              <img
                src={tutorAvatarUrl}
                alt={tutorName}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="font-mono">
              <div className="text-[30px] font-extrabold leading-none">
                {tutorName}
              </div>
              <div className="mt-2 flex items-center gap-3 text-[16px] font-bold text-black/80">
                <span>★ {ratingLabel}</span>
                <span className="text-black/50">({reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              className="
                w-[156px] h-[61px] rounded-[17px]
                bg-[#FF4245] text-white
                font-medium text-[20px] leading-[20px]
                flex items-center justify-center
                shadow-[0px_6px_14px_rgba(0,0,0,0.18)]
                hover:brightness-95 transition
              "
            >
              Message
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard/learner/find-tutors/profile", { state: { tutor: location.state?.tutor || tutorProfile } })}
              className="
                w-[156px] h-[61px] rounded-[17px]
                bg-[#FF4245] text-white
                font-medium text-[20px] leading-[20px]
                flex items-center justify-center
                shadow-[0px_6px_14px_rgba(0,0,0,0.18)]
                hover:brightness-95 transition
              "
            >
              View Profile
            </button>
          </div>
        </div>

        <div className="mt-8 font-mono">
          <div className="flex items-center gap-4">
            <h1 className="text-[36px] font-extrabold leading-none">
              Book your session
            </h1>
            <div className="grid h-9 w-9 place-items-center rounded-[8px] bg-black/10 text-[18px] font-extrabold text-black/70">
              📅
            </div>
          </div>

          <p className="mt-2 text-[20px] font-bold text-black/70">
            Select preferred time and session details to confirm your tutoring appointment.
          </p>
        </div>

        <div className="mt-6">
          <WeeklySlotCalendar
            // slotsByDayKey={slotsByDayKey}
            slotsByDayKey={Object.values(slotsByDayKey).some((a) => a.length) ? slotsByDayKey : demoSlotsByDayKey} //for demo purpose

            selectedDayKey={selectedDayKey}
            onSelectDayKey={(k) => {
              setSelectedDayKey(k);
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
          <div className="flex-1 rounded-[24px] bg-[#BBD9FF] px-4 py-7 shadow-[0px_10px_20px_rgba(0,0,0,0.10)]">
            <div className="text-center text-[20px] font-extrabold">
              Selected Time
            </div>

            <div className="mt-1 text-center text-[20px] font-extrabold">
              {selectedDateLabel}
            </div>

            <div className="mt-6 px-20 flex items-center justify-between gap-8">
              <div className="flex items-center gap-3">
                <div className="text-[18px] font-bold">Start Time:</div>
                <div className="h-[36px] min-w-[130px] rounded-full bg-white px-5 grid place-items-center text-[16px] font-extrabold shadow">
                  {startTime}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-[18px] font-bold">End Time:</div>
                <div className="h-[36px] min-w-[130px] rounded-full bg-white px-5 grid place-items-center text-[16px] font-extrabold shadow">
                  {endTime}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-[179px]">
            <button
              type="button"
              disabled={!canConfirm}
              onClick={handleConfirm}
              className={`
                w-[179px] h-[45px]
                rounded-[17px]
                bg-[#4C7045] text-white
                text-[20px] leading-[20px]
                font-medium
                flex items-center justify-center gap-[10px]
                shadow-[0px_4px_10px_rgba(0,0,0,0.18)]
                transition
                ${
                  canConfirm
                    ? "hover:brightness-95"
                    : "opacity-50 cursor-not-allowed"
                }
              `}
            >
              {isBooking ? "Confirming..." : "Confirm Booking"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="
                w-[179px] h-[45px]
                rounded-[17px]
                bg-[#FF4245] text-white
                text-[20px] leading-[20px]
                font-medium
                flex items-center justify-center gap-[10px]
                shadow-[0px_4px_10px_rgba(0,0,0,0.18)]
                hover:brightness-95 transition
              "
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
      <BookingConfirmationModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onContinue={handleContinue}
      />
      {/* <div className="pb-10" /> */}
    </DashboardLayout>
  );
}
