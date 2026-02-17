// frontend/src/api.js
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Token management helpers
export function getToken() {
  return localStorage.getItem("scholarly_token");
}

export function setToken(token) {
  localStorage.setItem("scholarly_token", token);
}

export function removeToken() {
  localStorage.removeItem("scholarly_token");
}

export function getUser() {
  if (import.meta.env.VITE_DISABLE_AUTH === "true") {
    return {
      id: 1,
      email: "dev-mode@seneca.ca",
      firstName: "Debug",
      lastName: "User",
      role: "LEARNER", // Change to "TUTOR" to test tutor pages
      isOnboarded: true, // Set to false to test onboarding flow
    };
  }
  try {
    const raw = localStorage.getItem("scholarly_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem("scholarly_user", JSON.stringify(user));
}

export function removeUser() {
  localStorage.removeItem("scholarly_user");
}

export function clearAuth() {
  removeToken();
  removeUser();
  localStorage.removeItem("scholarly_initial_user");
}

export async function createTutorSchedule(tutorId, schedule) {
  return authRequest(`/api/availability/tutor/${tutorId}`, {
    method: "POST",
    body: JSON.stringify(schedule),
  });
}

export async function replaceTutorSchedule(tutorId, schedule, startDate, endDate) {
  const qs = new URLSearchParams({ startDate, endDate }).toString();
  return authRequest(`/api/availability/tutor/${tutorId}/schedule?${qs}`, {
    method: "PUT",
    body: JSON.stringify(schedule),
  });
}

// Fetch ALL slots
export async function getTutorAllSlots(tutorId, startDate, endDate) {
  return authRequest(
    `/api/availability/tutor/${tutorId}/all?startDate=${startDate}&endDate=${endDate}`,
    { method: "GET" }
  );
}

// Base request without auth (for public routes)
async function publicRequest(path, opts = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...opts,
  });

  return handleResponse(res);
}

// Request with auth (for private routes)
async function authRequest(path, opts = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...opts,
  });

  return handleResponse(res);
}

async function handleResponse(res) {
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!res.ok) {
    const msg =
      json?.message || json?.error || (typeof json === "string" ? json : res.statusText);
    const err = new Error(msg || "Request failed");
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

/**
 * Register a new user (learner or tutor) - PUBLIC ROUTE
 * @param {Object} payload - { email, password, role: "LEARNER" | "TUTOR" }
 */
export function register(payload) {
  return publicRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Login user - PUBLIC ROUTE
 * @param {Object} payload - { email, password }
 * @returns {Object} - { token, email, role, isOnboarded, firstName, lastName, campus, id }
 */
export function login(payload) {
  return publicRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Verify email with verification code - PUBLIC ROUTE
 * @param {Object} payload - { email, code }
 */
export function verifyEmail(payload) {
  return publicRequest("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Resend verification code - PUBLIC ROUTE
 * @param {Object} payload - { email }
 */
export function resendVerification(payload) {
  return publicRequest("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Complete user onboarding - PRIVATE ROUTE (requires JWT token)
 * For Learner: { firstName, lastName, campus, program }
 * For Tutor: { firstName, lastName, campus, coursesOffered }
 * @param {Object} payload - onboarding data
 */
export function onboardUser(payload) {
  return authRequest("/api/auth/onboarding", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Search learners by course - for Tutor dashboard (Find Students).
 * GET /api/learners/search?course=...
 * @param {string} course - Course code or name (e.g. "DBS311", "Computer Science")
 * @returns {Promise<Array>} List of LearnerProfileDTO
 */
export function searchLearnersByCourse(course) {
  if (!course || !String(course).trim()) {
    return Promise.resolve([]);
  }
  const params = new URLSearchParams({ course: course.trim() });
  return authRequest(`/api/learners/search?${params.toString()}`);
}

/**
 * Search tutors with filters and pagination - for Learner dashboard (Find Tutors).
 * GET /api/tutors/search?q=...&courses=...&campus=...&page=0&size=10&sortBy=rating&sortDirection=desc
 * @param {Object} params
 * @param {string} [params.q] - Free-text search (courses, program, about)
 * @param {string[]} [params.courses] - Course codes (tutors offering ANY of these)
 * @param {string} [params.campus] - Campus filter
 * @param {string} [params.program] - Program filter
 * @param {number} [params.minRating] - Minimum rating
 * @param {string[]} [params.teachingMode] - ONLINE, IN_PERSON
 * @param {string} [params.sessionType] - INDIVIDUAL OR GROUP
 * @param {number} [params.page=0]
 * @param {number} [params.size=10]
 * @param {string} [params.sortBy=rating]
 * @param {string} [params.sortDirection=desc]
 * @returns {Promise<{ content: Array, totalElements: number, totalPages: number, ... }>} Spring Page of TutorSearchResponseDTO
 */
export function searchTutors(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.q != null && String(params.q).trim()) searchParams.set("q", params.q.trim());
  ["campus", "program"].forEach((key) => {
    const val = params[key];
    if (Array.isArray(val) && val.length) val.forEach((v) => searchParams.append(key, String(v)));
    else if (val != null && String(val).trim()) searchParams.set(key, String(val).trim());
  });
  if (params.minRating != null) searchParams.set("minRating", String(params.minRating));
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.size != null) searchParams.set("size", String(params.size));
  if (params.sortBy != null) searchParams.set("sortBy", params.sortBy);
  if (params.sortDirection != null) searchParams.set("sortDirection", params.sortDirection);
  if (params.sessionType != null && String(params.sessionType).trim()) searchParams.set("sessionType", params.sessionType.trim());
  ["courses", "teachingMode"].forEach((key) => {
    const list = params[key];
    if (Array.isArray(list) && list.length) {
      list.forEach((v) => searchParams.append(key, String(v)));
    }
  });
  const query = searchParams.toString();
  return authRequest(`/api/tutors/search${query ? `?${query}` : ""}`);
}

export default {
  register,
  login,
  verifyEmail,
  resendVerification,
  onboardUser,
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  clearAuth,
  createTutorSchedule,
  replaceTutorSchedule,
  searchLearnersByCourse,
  searchTutors,
};
