const STORAGE_KEY = "scholarly_learner_my_reviews";

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("scholarly-learner-reviews-changed"));
}

/**
 * Reviews the learner submitted from the UI (e.g. ViewTutorProfile + LeaveReviewModal).
 * Merges with API data on the My Reviews page by id.
 */
export function getCachedLearnerReviews() {
  return readRaw();
}

/**
 * Call after a successful submitReview() so My Reviews stays in sync when the backend
 * is unavailable or GET /api/reviews/my-reviews fails.
 */
export function appendCachedLearnerReview(entry) {
  const list = readRaw();
  const id = entry?.id != null ? String(entry.id) : `local-${Date.now()}`;
  const normalized = {
    id,
    tutorId: entry.tutorId ?? null,
    tutorFirstName: entry.tutorFirstName ?? "",
    tutorLastName: entry.tutorLastName ?? "",
    tutorProfileImageUrl: entry.tutorProfileImageUrl ?? null,
    rating: Number(entry.rating) || 0,
    comment: entry.comment ?? "",
    createdAt: entry.createdAt ?? new Date().toISOString(),
  };
  const withoutDup = list.filter((r) => String(r.id) !== id);
  writeRaw([normalized, ...withoutDup]);
}
