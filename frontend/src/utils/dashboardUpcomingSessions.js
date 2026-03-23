import {
  getTutorSessions,
  getLearnerById,
  getLearnerSessions,
  getTutorById,
} from "../api";
import { getSlotStartInstant, getBookingStartInstant } from "./sessionTimeUtils";

function tutorNameFromBookingMessage(message) {
  const s = (message || "").replace(/^Session with\s+/i, "").trim();
  return s || "Tutor";
}

/**
 * Learner dashboard: this learner's upcoming bookings (future, not completed).
 * GET /api/availability/learner/{id}/bookings + GET /api/tutors/{id} for names/courses.
 */
export async function fetchLearnerUpcomingSessionsForDashboard(
  learnerId,
  limit = 6
) {
  if (learnerId == null) return [];
  let list = [];
  try {
    const data = await getLearnerSessions(String(learnerId));
    list = Array.isArray(data) ? data : [];
  } catch {
    return [];
  }

  const now = new Date();
  const withStart = list
    .filter((b) => b.status !== "COMPLETED")
    .map((b) => {
      const start = getBookingStartInstant(b);
      return { raw: b, start };
    })
    .filter((x) => x.start && x.start > now)
    .sort((a, b) => a.start - b.start);

  const slice = withStart.slice(0, Math.max(0, limit));
  const tutorIds = [...new Set(slice.map((x) => x.raw.tutorId).filter(Boolean))];
  const tutorMap = new Map();
  await Promise.all(
    tutorIds.map(async (tid) => {
      try {
        tutorMap.set(tid, await getTutorById(tid));
      } catch {
        tutorMap.set(tid, null);
      }
    })
  );

  return slice.map(({ raw, start }) => {
    const tutor = tutorMap.get(raw.tutorId);
    const tutorName = tutor
      ? [tutor.firstName, tutor.lastName].filter(Boolean).join(" ").trim()
      : tutorNameFromBookingMessage(raw.message);
    const courseLabel =
      Array.isArray(tutor?.coursesOffered) && tutor.coursesOffered.length
        ? tutor.coursesOffered.join(", ")
        : tutor?.program || "";
    return {
      id: raw.slotId,
      slotId: raw.slotId,
      tutorId: raw.tutorId,
      tutorName: tutorName || "Tutor",
      courseLabel,
      start,
      sessionType: raw.sessionType,
      status: raw.status,
    };
  });
}

/**
 * Tutor dashboard: BOOKED future slots with learner names from API.
 */
export async function fetchTutorUpcomingSessionsForDashboard(
  tutorId,
  limit = 6
) {
  if (tutorId == null) return [];
  let slots = [];
  try {
    const data = await getTutorSessions(String(tutorId));
    slots = Array.isArray(data) ? data : [];
  } catch {
    return [];
  }

  const now = new Date();
  const withStart = slots
    .filter((s) => s.status === "BOOKED")
    .map((s) => {
      const start = getSlotStartInstant(s);
      return { raw: s, start };
    })
    .filter((x) => x.start && x.start > now)
    .sort((a, b) => a.start - b.start);

  const slice = withStart.slice(0, Math.max(0, limit));
  const learnerIds = [
    ...new Set(slice.map((x) => x.raw.learnerIds?.[0]).filter(Boolean)),
  ];
  const learnerMap = new Map();
  await Promise.all(
    learnerIds.map(async (lid) => {
      try {
        learnerMap.set(lid, await getLearnerById(lid));
      } catch {
        learnerMap.set(lid, null);
      }
    })
  );

  return slice.map(({ raw, start }) => {
    const lid = raw.learnerIds?.[0];
    const learner = lid ? learnerMap.get(lid) : null;
    const learnerName = learner
      ? [learner.firstName, learner.lastName].filter(Boolean).join(" ").trim()
      : "Student";
    return {
      id: raw.id,
      slotId: raw.id,
      learnerId: lid,
      learnerName: learnerName || "Student",
      course: learner?.program || "",
      startTime: start,
      teachingMode: "ONLINE",
      sessionType: raw.sessionType,
    };
  });
}
