import { getTutorReviews } from "../api";
import { getCachedTutorReceivedReviews } from "./tutorReceivedReviewsCache";

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
  return r.learnerProfileImageUrl || null;
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
  return merged;
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
