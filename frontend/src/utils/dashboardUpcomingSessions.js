import {
  getTutorSessions,
  getLearnerById,
  getLearnerSessions,
  getTutorById,
} from "../api";
import { getSlotStartInstant, getBookingStartInstant } from "./sessionTimeUtils";

function isGenericTutorLabel(value) {
  const v = String(value || "").trim().toLowerCase();
  return !v || v === "tutor" || v === "unknown" || v === "unknown user";
}

function parseTutorNameFromText(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  const sessionWithMatch = text.match(/^session\s+with\s+(.+)$/i);
  if (sessionWithMatch?.[1]) return sessionWithMatch[1].trim();

  const withMatch = text.match(/\bwith\s+([a-z][a-z'\-]+(?:\s+[a-z][a-z'\-]+){0,3})\b/i);
  if (withMatch?.[1]) return withMatch[1].trim();

  return "";
}

function extractBookingTutorId(raw) {
  return (
    raw?.tutorId ??
    raw?.tutorProfileId ??
    raw?.tutorUser?.id ??
    raw?.tutorUserId ??
    raw?.bookedTutorId ??
    raw?.tutor?.tutorId ??
    raw?.tutor?.userId ??
    raw?.tutor?.user?.id ??
    raw?.tutor?.id ??
    null
  );
}

function extractBookingTutorName(raw) {
  const directName =
    raw?.tutorName ||
    raw?.tutorDisplayName ||
    raw?.tutorFullName ||
    raw?.tutor?.name ||
    raw?.tutor?.displayName ||
    raw?.tutor?.fullName ||
    raw?.otherUserName ||
    "";
  if (!isGenericTutorLabel(directName)) return String(directName).trim();

  const first = raw?.tutorFirstName || raw?.tutor?.firstName || "";
  const last = raw?.tutorLastName || raw?.tutor?.lastName || "";
  const combined = [first, last].filter(Boolean).join(" ").trim();
  if (combined) return combined;

  const parsedFromMessage =
    parseTutorNameFromText(raw?.message) ||
    parseTutorNameFromText(raw?.title) ||
    parseTutorNameFromText(raw?.description);

  return parsedFromMessage || "Tutor";
}

function extractBookingTutorImage(raw) {
  return (
    raw?.tutorProfileImageUrl ||
    raw?.tutorProfilePicture ||
    raw?.tutor?.profileImageUrl ||
    raw?.tutor?.profilePictureUrl ||
    raw?.tutor?.profilePicture ||
    raw?.tutor?.avatar ||
    raw?.profileImageUrl ||
    raw?.profilePictureUrl ||
    raw?.profilePicture ||
    raw?.avatar ||
    null
  );
}

// function tutorNameFromBookingMessage(message) {
//   const s = (message || "").replace(/^Session with\s+/i, "").trim();
//   return s || "Tutor";
// }

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
  const tutorIds = [
    ...new Set(slice.map((x) => extractBookingTutorId(x.raw)).filter(Boolean)),
  ];
  const tutorMap = new Map();
  await Promise.all(
    tutorIds.map(async (tid) => {
      const key = String(tid);
      try {
        tutorMap.set(key, await getTutorById(tid));
      } catch {
        tutorMap.set(key, null);
      }
    })
  );

  return slice.map(({ raw, start }) => {
    const bookingTutorId = extractBookingTutorId(raw);
    const bookingTutorName = extractBookingTutorName(raw);
    const bookingTutorImage = extractBookingTutorImage(raw);
    const tutor = bookingTutorId ? tutorMap.get(String(bookingTutorId)) : null;

    const tutorResolvedName = [tutor?.firstName, tutor?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    const tutorName = tutorResolvedName || bookingTutorName;
    const courseLabel =
      Array.isArray(tutor?.coursesOffered) && tutor.coursesOffered.length
        ? tutor.coursesOffered.join(", ")
        : tutor?.program || "";
    return {
      id: raw.slotId,
      slotId: raw.slotId,
      tutorId: bookingTutorId,
      tutorName: tutorName || "Tutor",
      tutorFirstName:
        tutor?.firstName || raw?.tutorFirstName || raw?.tutor?.firstName || "",
      tutorLastName:
        tutor?.lastName || raw?.tutorLastName || raw?.tutor?.lastName || "",
      // tutorProfileImageUrl:
      //    tutor?.profileImageUrl ||
      //    tutor?.profilePicture ||
      //    tutor?.avatar ||
      //    bookingTutorImage ||
      //    null,
      //     tutor: tutor
      //       ? {
      //           id: bookingTutorId,
      //           firstName: tutor.firstName || "",
      //           lastName: tutor.lastName || "",
      //           name: tutorResolvedName || tutorName || "Tutor",
      //           profileImageUrl:
      //             tutor.profileImageUrl ||
      //             tutor.profilePicture ||
      //             tutor.avatar ||
      //             bookingTutorImage ||
      //             null,
      //           profilePicture:
      //             tutor.profileImageUrl ||
      //             tutor.profilePicture ||
      //             tutor.avatar ||
      //             bookingTutorImage ||
      //             null,
      //           avatar:
      //             tutor.profileImageUrl ||
      //             tutor.profilePicture ||
      //             tutor.avatar ||
      //             bookingTutorImage ||
      //             null,
        // }
        //     : {
        //         id: bookingTutorId,
        //         name: bookingTutorName,
        //         firstName: raw?.tutorFirstName || raw?.tutor?.firstName || "",
        //         lastName: raw?.tutorLastName || raw?.tutor?.lastName || "",
        //         profileImageUrl: bookingTutorImage,
        //         profilePicture: bookingTutorImage,
        //         avatar: bookingTutorImage,
        //       },
        tutorProfileImageUrl: null,
        tutor: tutor
          ? {
              id: bookingTutorId,
              firstName: tutor.firstName || "",
              lastName: tutor.lastName || "",
              name: tutorResolvedName || tutorName || "Tutor",
              profileImageUrl: null,
              profilePicture: null,
              avatar: null,
            }
          : {
              id: bookingTutorId,
              name: bookingTutorName,
              firstName: raw?.tutorFirstName || raw?.tutor?.firstName || "",
              lastName: raw?.tutorLastName || raw?.tutor?.lastName || "",
              profileImageUrl: null,
              profilePicture: null,
              avatar: null,
            },
      courseLabel,
      start,
      sessionType: raw.sessionType,
      status: raw.status,
      currentCount: raw.currentCount,
      maxCapacity: raw.maxCapacity,
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
