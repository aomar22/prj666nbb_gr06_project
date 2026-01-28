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
  if (import.meta.env.VITE_DISABLE_AUTH === 'true') {
    return {
      email: "dev-mode@seneca.ca",
      firstName: "Debug",
      lastName: "User",
      role: "TUTOR", // or "LEARNER" depending on what you want to test
      isOnboarded: false // Set to false so you can actually see the onboarding pages!
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
};
