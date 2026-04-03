import { getLearnerMyReviews, getTutorById } from "../api";
import { getCachedLearnerReviews } from "./learnerReviewsCache";

/** Shown when API + cache return nothing (My Reviews page + dashboard). */
export const LEARNER_PLACEHOLDER_REVIEWS_RAW = [
  {
    id: "placeholder-learner-1",
    tutorFirstName: "Brad",
    tutorLastName: "Pitt",
    tutorProfileImageUrl: null,
    rating: 5,
    comment: "Very patient and explains everything clearly!",
    createdAt: "2026-03-18T10:00:00.000Z",
  },
  {
    id: "placeholder-learner-2",
    tutorFirstName: "Emma",
    tutorLastName: "Stone",
    tutorProfileImageUrl: null,
    rating: 4,
    comment:
      "Helpful with IPC144 — I finally understand loops and arrays after our session.",
    createdAt: "2026-03-14T16:20:00.000Z",
  },
  {
    id: "placeholder-learner-3",
    tutorFirstName: "James",
    tutorLastName: "Wilson",
    tutorProfileImageUrl: null,
    rating: 5,
    comment: "Structured notes and great examples. Would book again.",
    createdAt: "2026-03-10T09:15:00.000Z",
  },
  {
    id: "placeholder-learner-4",
    tutorFirstName: "Sarah",
    tutorLastName: "Chen",
    tutorProfileImageUrl: null,
    rating: 4,
    comment: "Good pace for DBS311 — answers questions without rushing.",
    createdAt: "2026-03-08T11:45:00.000Z",
  },
  {
    id: "placeholder-learner-5",
    tutorFirstName: "Marcus",
    tutorLastName: "Nguyen",
    tutorProfileImageUrl: null,
    rating: 3,
    comment: "Solid session; a bit fast on joins but we covered what I needed.",
    createdAt: "2026-03-05T13:00:00.000Z",
  },
  {
    id: "placeholder-learner-6",
    tutorFirstName: "Priya",
    tutorLastName: "Sharma",
    tutorProfileImageUrl: null,
    rating: 5,
    comment: "Encouraging and clear — my confidence for the midterm is way up.",
    createdAt: "2026-03-01T08:30:00.000Z",
  },
];

/**
 * Normalize one review row (API ReviewResponse + optional tutor profile, or cached shape).
 * Backend: { id, tutorId, learnerId, learnerName, rating, comment, createdAt }
 */
export function normalizeLearnerWrittenReview(raw, tutorDto = null) {
  if (!raw || typeof raw !== "object") return null;
  const id =
    raw.id != null
      ? String(raw.id)
      : `row-${raw.tutorId}-${raw.createdAt}-${raw.rating}`;
  const tutorFirstName =
    tutorDto?.firstName ??
    raw.tutorFirstName ??
    raw.tutor?.firstName ??
    raw.firstName ??
    "";
  const tutorLastName =
    tutorDto?.lastName ??
    raw.tutorLastName ??
    raw.tutor?.lastName ??
    raw.lastName ??
    "";
  const tutorProfileImageUrl =
    raw.tutorProfileImageUrl ??
    raw.tutorProfilePicture ??
    raw.tutor?.profileImageUrl ??
    raw.tutor?.profilePicture ??
    raw.tutor?.avatar ??
    null;
  return {
    id,
    tutorId: raw.tutorId ?? raw.tutor?.id ?? tutorDto?.id ?? null,
    tutorFirstName,
    tutorLastName,
    tutorProfileImageUrl,
    rating: Math.min(5, Math.max(0, Number(raw.rating) || 0)),
    comment: raw.comment ?? raw.text ?? "",
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
  };
}

export function mergeLearnerWrittenReviews(apiList, cachedList) {
  const map = new Map();
  for (const c of cachedList) {
    const n = normalizeLearnerWrittenReview(c);
    if (n) map.set(n.id, n);
  }
  for (const a of apiList) {
    const n = normalizeLearnerWrittenReview(a);
    if (n) map.set(n.id, { ...map.get(n.id), ...n });
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/** Load tutor profiles for unique tutorIds (GET /api/tutors/{id}). */
export async function enrichLearnerReviewsWithTutors(apiList) {
  if (!Array.isArray(apiList) || apiList.length === 0) return [];
  const ids = [...new Set(apiList.map((r) => r.tutorId).filter(Boolean))];
  const tutorMap = new Map();
  await Promise.all(
    ids.map(async (tid) => {
      try {
        const t = await getTutorById(tid);
        tutorMap.set(tid, t);
      } catch {
        tutorMap.set(tid, null);
      }
    })
  );
  return apiList.map((raw) => {
    const t = raw.tutorId ? tutorMap.get(raw.tutorId) : null;
    return normalizeLearnerWrittenReview(raw, t);
  });
}

export function learnerReviewTutorDisplayName(r) {
  const n = [r.tutorFirstName, r.tutorLastName].filter(Boolean).join(" ").trim();
  return n || "Tutor";
}

export function learnerReviewTutorAvatarSrc(r) {
  return r.tutorProfileImageUrl || null;
}

/**
 * All reviews written by the learner (newest first), merged with local cache,
 * with tutor names enriched from backend.
 */
export async function fetchMergedLearnerReviewsForLearner() {
  let apiRows = [];
  try {
    const data = await getLearnerMyReviews();
    apiRows = Array.isArray(data) ? data : data?.content ?? [];
  } catch {
    apiRows = [];
  }
  const enriched = await enrichLearnerReviewsWithTutors(apiRows);
  const cached = getCachedLearnerReviews();
  const merged = mergeLearnerWrittenReviews(enriched, cached);
  return merged;
}

/** Most recent reviews for learner dashboard (newest first). */
export async function fetchRecentLearnerReviewsForDashboard(limit = 3) {
  const list = await fetchMergedLearnerReviewsForLearner();
  return list.slice(0, Math.max(0, limit));
}
