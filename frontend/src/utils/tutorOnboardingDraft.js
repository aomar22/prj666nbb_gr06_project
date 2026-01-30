//frontend/src/utils/tutorOnboardingDraft.js

const KEY = "tutorOnboardingDraft";

export function loadTutorDraft() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveTutorDraft(partial) {
  const current = loadTutorDraft() || {};
  const next = { ...current, ...partial };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearTutorDraft() {
  localStorage.removeItem(KEY);
}

export function getTutorDraftKey() {
  return KEY;
}
