const STORAGE_KEY = "scholarly_tutor_received_reviews";

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

function writeRaw(list, tutorIdForEvent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(
    new CustomEvent("scholarly-tutor-reviews-changed", {
      detail: { tutorId: tutorIdForEvent ?? list[0]?.tutorId ?? null },
    })
  );
}


export function getCachedTutorReceivedReviews(tutorId) {
  if (tutorId == null) return [];
  return readRaw().filter((r) => String(r.tutorId) === String(tutorId));
}

export function appendTutorReceivedReviewCache(entry) {
  const tutorId = entry?.tutorId;
  if (tutorId == null) return;

  const list = readRaw();
  const id =
    entry.id != null ? String(entry.id) : `local-${tutorId}-${Date.now()}`;
  const normalized = {
    id,
    tutorId,
    learnerFirstName: entry.learnerFirstName ?? "",
    learnerLastName: entry.learnerLastName ?? "",
    learnerName: entry.learnerName ?? "",
    learnerProfileImageUrl: entry.learnerProfileImageUrl ?? null,
    rating: Number(entry.rating) || 0,
    comment: entry.comment ?? "",
    createdAt: entry.createdAt ?? new Date().toISOString(),
  };
  const withoutDup = list.filter((r) => String(r.id) !== id);
  writeRaw([normalized, ...withoutDup], tutorId);
}
