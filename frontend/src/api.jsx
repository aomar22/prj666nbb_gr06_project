// frontend/src/api.js
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function request(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    credentials: "include", // not required
    ...opts,
  });

  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }

  if (!res.ok) {
    // try to extract useful message
    const msg = json?.message || json?.error || (typeof json === "string" ? json : res.statusText);
    const err = new Error(msg || "Request failed");
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

export function registerLearner(payload) {
  return request("/api/auth/register-learner", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerTutor(payload) {
  return request("/api/auth/register-tutor", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export default { registerLearner, registerTutor, login };
