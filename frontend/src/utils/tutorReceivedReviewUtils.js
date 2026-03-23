import { getTutorReviews, getTutorSessions, getLearnerById } from "../api";
import { getCachedTutorReceivedReviews } from "./tutorReceivedReviewsCache";

/** Shown when API + cache return nothing (My Reviews page + dashboard). */
export const TUTOR_PLACEHOLDER_REVIEWS_RAW = [
  {
    id: "placeholder-tutor-1",
    learnerFirstName: "Jordan",
    learnerLastName: "Lee",
    learnerProfileImageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    comment: "Very patient and explains everything clearly!",
    createdAt: "2026-03-18T10:00:00.000Z",
  },
  {
    id: "placeholder-tutor-2",
    learnerFirstName: "Maya",
    learnerLastName: "Patel",
    learnerProfileImageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    comment:
      "Clear examples for WEB222 — I finally understand async flows after our session.",
    createdAt: "2026-03-16T14:00:00.000Z",
  },
  {
    id: "placeholder-tutor-3",
    learnerFirstName: "Chris",
    learnerLastName: "Evans",
    learnerProfileImageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 4,
    comment: "Good pacing and helpful feedback on my assignments.",
    createdAt: "2026-03-12T09:30:00.000Z",
  },
  {
    id: "placeholder-tutor-4",
    learnerFirstName: "Aisha",
    learnerLastName: "Khan",
    learnerProfileImageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    comment: "Encouraging tutor — I felt comfortable asking basic questions.",
    createdAt: "2026-03-09T11:15:00.000Z",
  },
  {
    id: "placeholder-tutor-5",
    learnerFirstName: "Sam",
    learnerLastName: "Rivera",
    learnerProfileImageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 4,
    comment: "Solid prep for the quiz; would have liked one more practice problem.",
    createdAt: "2026-03-06T16:45:00.000Z",
  },
  {
    id: "placeholder-tutor-6",
    learnerFirstName: "Taylor",
    learnerLastName: "Brooks",
    learnerProfileImageUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    comment: "Best tutoring session I’ve had this semester — thank you!",
    createdAt: "2026-03-02T08:00:00.000Z",
  },
];

export function normalizeTutorReceivedReview(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id =
    raw.id != null
      ? String(raw.id)
      : `row-${raw.tutorId}-${raw.createdAt}-${raw.rating}`;

  let learnerFirstName = raw.learnerFirstName ?? raw.learner?.firstName ?? "";
  let learnerLastName = raw.learnerLastName ?? raw.learner?.lastName ?? "";
  const combined = (raw.learnerName ?? "").trim();
  if (combined && (!learnerFirstName || !learnerLastName)) {
    const parts = combined.split(/\s+/);
    if (!learnerFirstName) learnerFirstName = parts[0] ?? "";
    if (!learnerLastName && parts.length > 1) {
      learnerLastName = parts.slice(1).join(" ");
    }
  }

  const learnerProfileImageUrl =
    raw.learnerProfileImageUrl ??
    raw.learnerProfilePicture ??
    raw.learner?.profileImageUrl ??
    raw.learner?.profilePicture ??
    raw.learner?.avatar ??
    null;

  return {
    id,
    tutorId: raw.tutorId ?? null,
    learnerFirstName,
    learnerLastName,
    learnerProfileImageUrl,
    rating: Math.min(5, Math.max(0, Number(raw.rating) || 0)),
    comment: raw.comment ?? raw.text ?? "",
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
  };
}

export function mergeTutorReceivedReviews(apiList, cachedList) {
  const map = new Map();
  for (const c of cachedList) {
    const n = normalizeTutorReceivedReview(c);
    if (n) map.set(n.id, n);
  }
  for (const a of apiList) {
    const n = normalizeTutorReceivedReview(a);
    if (n) map.set(n.id, { ...map.get(n.id), ...n });
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export function tutorReviewerDisplayName(r) {
  const n = [r.learnerFirstName, r.learnerLastName].filter(Boolean).join(" ").trim();
  return n || "Student";
}

export function tutorReviewerAvatarSrc(r) {
  if (r.learnerProfileImageUrl) return r.learnerProfileImageUrl;
  const name = tutorReviewerDisplayName(r);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=f5e6dc&color=7A0000&size=128`;
}

/**
 * All reviews for a tutor (newest first), merged from API + local cache.
 */
export async function fetchMergedTutorReviewsForTutor(tutorId) {
  let apiRows = [];
  if (tutorId != null) {
    try {
      const data = await getTutorReviews(tutorId);
      apiRows = Array.isArray(data) ? data : data?.content ?? [];
    } catch {
      apiRows = [];
    }
  }
  const cached =
    tutorId != null ? getCachedTutorReceivedReviews(tutorId) : [];
  const merged = mergeTutorReceivedReviews(apiRows, cached);
  if (merged.length > 0 || tutorId == null) return merged;

  // Keep placeholder layout, but use real learner names from backend sessions when possible.
  try {
    const slots = await getTutorSessions(tutorId);
    const list = Array.isArray(slots) ? slots : [];
    const learnerIds = [
      ...new Set(
        list
          .flatMap((s) => (Array.isArray(s?.learnerIds) ? s.learnerIds : []))
          .filter(Boolean)
      ),
    ];

    if (learnerIds.length > 0) {
      const learners = await Promise.all(
        learnerIds.slice(0, 6).map(async (id) => {
          try {
            return await getLearnerById(id);
          } catch {
            return null;
          }
        })
      );
      const now = Date.now();
      const backendPlaceholders = learners
        .filter(Boolean)
        .map((l, i) =>
          normalizeTutorReceivedReview({
            id: `placeholder-backend-${l.id ?? i}`,
            tutorId,
            learnerFirstName: l.firstName ?? "",
            learnerLastName: l.lastName ?? "",
            rating: 4,
            comment: "No written review yet.",
            createdAt: new Date(now - i * 86400000).toISOString(),
          })
        )
        .filter(Boolean);
      if (backendPlaceholders.length > 0) return backendPlaceholders;
    }
  } catch {
    // Fall through to static placeholders below.
  }

  return TUTOR_PLACEHOLDER_REVIEWS_RAW.map((row) =>
    normalizeTutorReceivedReview(row)
  ).filter(Boolean);
}

/** Most recent reviews for dashboard widgets (newest first). */
export async function fetchRecentTutorReviewsForDashboard(
  tutorId,
  limit = 3
) {
  if (tutorId == null) return [];
  const list = await fetchMergedTutorReviewsForTutor(tutorId);
  return list.slice(0, Math.max(0, limit));
}
