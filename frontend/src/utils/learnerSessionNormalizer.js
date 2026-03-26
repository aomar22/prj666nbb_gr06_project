import { combineLocalDateAndTime } from "./sessionTimeUtils";

function formatTime(dateInput) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "--";

  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateInput) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "--";

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function addOneHour(dateInput) {
  const d = dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(d.getHours() + 1);
  return d;
}

function tutorNameFromMessage(message) {
  const s = (message || "").replace(/^Session with\s+/i, "").trim();
  return s || "Tutor";
}

function toStartDate(session) {
  if (session?.start) {
    const d = session.start instanceof Date ? session.start : new Date(session.start);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (session?.date != null && session?.startTime != null) {
    return combineLocalDateAndTime(session.date, session.startTime);
  }
  return null;
}

function toEndDate(session, startDate) {
  if (session?.end) {
    const d = session.end instanceof Date ? session.end : new Date(session.end);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (session?.date != null && session?.endTime != null) {
    return combineLocalDateAndTime(session.date, session.endTime);
  }
  if (startDate) return addOneHour(startDate);
  return null;
}

function computeStatus(session, endDate, now) {
  if (session?.status) return session.status;
  if (endDate && endDate < now) return "COMPLETED";
  return "BOOKED";
}

/**
 * Normalize any learner-session-like object to the shared card model.
 * Supports both learner booking DTO rows and dashboard utility rows.
 */
export function mapLearnerSessionToCard(session, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date();
  const appendCourseLabel = options.appendCourseLabel === true;

  const startDate = toStartDate(session);
  const endDate = toEndDate(session, startDate);
  const status = computeStatus(session, endDate, now);

  const baseTutorName = session?.tutorName || tutorNameFromMessage(session?.message);
  const tutorName =
    appendCourseLabel && session?.courseLabel && String(session.courseLabel).trim()
      ? `${baseTutorName} - ${session.courseLabel}`
      : baseTutorName;

  const dateLabel = startDate
    ? formatDate(startDate)
    : session?.date
      ? formatDate(`${session.date}T00:00:00`)
      : "--";

  const timeLabel =
    startDate && endDate
      ? `${formatTime(startDate)} - ${formatTime(endDate)}`
      : session?.startTime && session?.endTime
        ? `${session.startTime} - ${session.endTime}`
        : "--";

  return {
    id: session?.slotId ?? session?.id,
    slotId: session?.slotId ?? session?.id,
    tutorId: session?.tutorId,
    learnerId: session?.learnerId,
    status,
    tutorName: tutorName || "Tutor",
    rating: session?.rating ?? "--",
    reviews: session?.reviews ?? "0 reviews",
    date: dateLabel,
    time: timeLabel,
    mode: session?.mode ?? "Online",
    sessionType: session?.sessionType ?? "INDIVIDUAL",
    currentCount: session?.currentCount ?? 1,
    maxCapacity: session?.maxCapacity ?? 1,
    avatarSrc: session?.avatarSrc || `https://ui-avatars.com/api/?name=${encodeURIComponent(baseTutorName || "Tutor")}&background=f5e6dc&color=7A0000&size=128`,
  };
}
