import { getLearnerMyReviews, getTutorById, searchTutors } from "../api";
import { getCachedLearnerReviews } from "./learnerReviewsCache";

/** Shown when API + cache return nothing (My Reviews page + dashboard). */
export const LEARNER_PLACEHOLDER_REVIEWS_RAW = [
  {
    id: "placeholder-learner-1",
    tutorFirstName: "Brad",
    tutorLastName: "Pitt",
    tutorProfileImageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    comment: "Very patient and explains everything clearly!",
    createdAt: "2026-03-18T10:00:00.000Z",
  },
  {
    id: "placeholder-learner-2",
    tutorFirstName: "Emma",
    tutorLastName: "Stone",
    tutorProfileImageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    rating: 4,
    comment:
      "Helpful with IPC144 — I finally understand loops and arrays after our session.",
    createdAt: "2026-03-14T16:20:00.000Z",
  },
  {
    id: "placeholder-learner-3",
    tutorFirstName: "James",
    tutorLastName: "Wilson",
    tutorProfileImageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    comment: "Structured notes and great examples. Would book again.",
    createdAt: "2026-03-10T09:15:00.000Z",
  },
  {
    id: "placeholder-learner-4",
    tutorFirstName: "Sarah",
    tutorLastName: "Chen",
    tutorProfileImageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 4,
    comment: "Good pace for DBS311 — answers questions without rushing.",
    createdAt: "2026-03-08T11:45:00.000Z",
  },
  {
    id: "placeholder-learner-5",
    tutorFirstName: "Marcus",
    tutorLastName: "Nguyen",
    tutorProfileImageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 3,
    comment: "Solid session; a bit fast on joins but we covered what I needed.",
    createdAt: "2026-03-05T13:00:00.000Z",
  },
  {
    id: "placeholder-learner-6",
    tutorFirstName: "Priya",
    tutorLastName: "Sharma",
    tutorProfileImageUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
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
  if (r.tutorProfileImageUrl) return r.tutorProfileImageUrl;
  const name = learnerReviewTutorDisplayName(r);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=f5e6dc&color=7A0000&size=128`;
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
  if (merged.length > 0) return merged;

  // Keep placeholder layout, but use real tutor names from backend when possible.
  try {
    const page = await searchTutors({
      q: "",
      page: 0,
      size: 6,
      sortBy: "rating",
      sortDirection: "desc",
    });
    const tutors = Array.isArray(page?.content) ? page.content : [];
    if (tutors.length > 0) {
      const now = Date.now();
      return tutors.slice(0, 6).map((t, i) =>
        normalizeLearnerWrittenReview({
          id: `placeholder-backend-${t.id ?? i}`,
          tutorId: t.id ?? null,
          tutorFirstName: t.firstName ?? "",
          tutorLastName: t.lastName ?? "",
          tutorProfileImageUrl: t.profilePictureUrl ?? null,
          rating: Math.max(1, Number(t.rating) || 4),
          comment: "No written review yet.",
          createdAt: new Date(now - i * 86400000).toISOString(),
        })
      );
    }
  } catch {
    // Fall through to static placeholders below.
  }

  return LEARNER_PLACEHOLDER_REVIEWS_RAW.map((row) =>
    normalizeLearnerWrittenReview(row, null)
  ).filter(Boolean);
}

/** Most recent reviews for learner dashboard (newest first). */
export async function fetchRecentLearnerReviewsForDashboard(limit = 3) {
  const list = await fetchMergedLearnerReviewsForLearner();
  return list.slice(0, Math.max(0, limit));
}
