// frontend/src/api.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
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

// Book a slot for a learner
export async function bookSlot(slotId, learnerId) {
  return authRequest(
    `/api/availability/book/${slotId}?learnerId=${learnerId}`,
    { method: "PATCH" }
  );
}

// Fetch sessions for the logged-in Learner
export async function getLearnerSessions(learnerId) {
  // Uses the dedicated bookings endpoint
  return authRequest(`/api/availability/learner/${learnerId}/bookings`, { method: "GET" });
}

// Fetch sessions for the logged-in Tutor
export async function getTutorSessions(tutorId) {
  // Tutor 'all' endpoint requires a date range. We'll fetch 1 month past to 6 months future.
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  const end = new Date();
  end.setMonth(end.getMonth() + 6);
  
  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];

  return authRequest(`/api/availability/tutor/${tutorId}/all?startDate=${startStr}&endDate=${endStr}`, { method: "GET" });
}

// Cancel a booked session for a Learner
export async function cancelLearnerBooking(slotId, learnerId) {
  return authRequest(`/api/availability/cancel/${slotId}?learnerId=${learnerId}`, { method: "PATCH" });
}

// Delete a slot for a Tutor
export async function deleteTutorSlot(slotId, force = false) {
  return authRequest(`/api/availability/slot/${slotId}?force=${force}`, { method: "DELETE" });
}

// Reschedule a session for a Learner
export async function rescheduleLearnerBooking(currentSlotId, learnerId, newSlotId) {
  return authRequest(`/api/availability/reschedule/${currentSlotId}?learnerId=${learnerId}&newSlotId=${newSlotId}`, { method: "PATCH" });
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
      json?.message ||
      json?.error ||
      (typeof json === "string" ? json : null) ||
      (json && typeof json === "object" ? Object.values(json).filter(Boolean).join("; ") : null) ||
      res.statusText ||
      "Request failed";
    const err = new Error(msg);
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
 * Learner profile by id (tutor dashboard — session cards).
 * GET /api/learners/{id}
 */
export async function getLearnerById(learnerId) {
  return authRequest(`/api/learners/${encodeURIComponent(learnerId)}`, { method: "GET" });
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
  if (params.availableFrom != null && String(params.availableFrom).trim()) searchParams.set("availableFrom", params.availableFrom.trim());
  if (params.availableTo != null && String(params.availableTo).trim()) searchParams.set("availableTo", params.availableTo.trim());
  ["courses", "teachingMode"].forEach((key) => {
    const list = params[key];
    if (Array.isArray(list) && list.length) {
      list.forEach((v) => searchParams.append(key, String(v)));
    }
  });
  const query = searchParams.toString();
  return authRequest(`/api/tutors/search${query ? `?${query}` : ""}`);
}

/**
 * Fetch the authenticated user's profile settings
 * GET /api/users/settings
 */
export async function getUserSettings() {
  return authRequest(`/api/users/settings`, { 
    method: "GET" 
  });
}

/**
 * Update the authenticated user's profile settings
 * PATCH /api/users/settings
 * @param {Object} payload - { campus, program, coursesOffered, about, teachingMode, sessionType }
 */
export async function updateUserSettings(payload) {
  return authRequest(`/api/users/settings`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Change the authenticated user's password
 * PATCH /api/users/password
 * @param {Object} payload - { currentPassword, newPassword }
 */
export async function changePassword(payload) {
  return authRequest(`/api/users/password`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Get all reviews for a tutor (public)
 * GET /api/reviews/tutor/{tutorId}
 */
export async function getTutorReviews(tutorId) {
  return authRequest(`/api/reviews/tutor/${tutorId}`);
}

/**
 * Submit a review for a tutor (learner only)
 * POST /api/reviews
 * @param {string} tutorId
 * @param {number} rating - 1-5
 * @param {string} [comment]
 */
export async function submitReview(tutorId, rating, comment) {
  const payload = { tutorId, rating };
  if (comment && comment.trim()) payload.comment = comment.trim();
  return authRequest(`/api/reviews`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Get completed sessions with review status for the authenticated learner
 * GET /api/reviews/my-sessions
 */
export async function getMySessions() {
  return authRequest(`/api/reviews/my-sessions`);
}

/**
 * Reviews for the authenticated user (role-aware):
 * LEARNER → reviews they wrote; TUTOR → reviews received.
 * GET /api/reviews/my-reviews
 * Items: { id, tutorId, learnerId, learnerName, rating, comment, createdAt }
 */
export async function getMyReviews() {
  return authRequest(`/api/reviews/my-reviews`, { method: "GET" });
}

/**
 * Learner alias — same as getMyReviews() when logged in as LEARNER.
 */
export async function getLearnerMyReviews() {
  return getMyReviews();
}

/**
 * Tutor profile by id (for enriching learner "my reviews" with tutor names).
 * GET /api/tutors/{id}
 */
export async function getTutorById(tutorId) {
  return authRequest(`/api/tutors/${encodeURIComponent(tutorId)}`, { method: "GET" });
}

export async function getDirectChatHistory(otherUserId) {
  return authRequest(`/api/chat/history/direct/${encodeURIComponent(otherUserId)}`, {
    method: "GET",
  });
}

export async function markDirectChatAsRead(otherUserId) {
  return authRequest(`/api/chat/read/direct/${encodeURIComponent(otherUserId)}`, {
    method: "POST",
  });
}

export async function getDirectConversations() {
  return authRequest("/api/chat/conversations/direct", { method: "GET" });
}

export async function getGroupChatHistory(slotId) {
  return authRequest(`/api/chat/history/slot/${encodeURIComponent(slotId)}`, { method: "GET" });
}

export async function markGroupChatAsRead(slotId) {
  return authRequest(`/api/chat/read/slot/${encodeURIComponent(slotId)}`, { method: "POST" });
}

export function createChatClient({ onMessage, onConnect, onError }) {
  const token = getToken();

  const client = new Client({
    webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
    reconnectDelay: 5000,
    connectHeaders: token
      ? { Authorization: `Bearer ${token}` }
      : {},
    debug: () => {},
    onConnect: () => {
      client.subscribe("/user/queue/messages", (frame) => {
        try {
          const body = JSON.parse(frame.body);
          onMessage?.(body);
        } catch (err) {
          console.error("Failed to parse chat message", err);
        }
      });

      onConnect?.(client);
    },
    onStompError: (frame) => {
      console.error("STOMP error", frame);
      onError?.(frame);
    },
    onWebSocketError: (event) => {
      console.error("WebSocket error", event);
      onError?.(event);
    },
  });

  client.activate();
  return client;
}

export function sendChatMessage(client, payload) {
  if (!client || !client.connected) {
    throw new Error("Chat connection is not active");
  }

  client.publish({
    destination: "/app/chat.send",
    body: JSON.stringify(payload),
  });
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
  getDirectChatHistory,
  markDirectChatAsRead,
  getDirectConversations,
  getGroupChatHistory,
  markGroupChatAsRead,
  createChatClient,
  sendChatMessage,
};
