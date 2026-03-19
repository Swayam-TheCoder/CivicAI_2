/**
 * API service layer — all backend communication goes through here.
 * Token is stored in memory (no localStorage) for Vercel/SSR safety.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── In-memory token store (never touches localStorage) ─────────────────────
let _accessToken = null;
let _refreshToken = null;

export const tokenStore = {
  setTokens:      (access, refresh) => { _accessToken = access; _refreshToken = refresh; },
  getAccessToken: () => _accessToken,
  getRefreshToken:() => _refreshToken,
  clear:          () => { _accessToken = null; _refreshToken = null; },
};

// ── Core fetch wrapper ─────────────────────────────────────────────────────
async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };

  if (_accessToken) headers["Authorization"] = `Bearer ${_accessToken}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Token expired → try silent refresh once
  if (res.status === 401 && _refreshToken && !options._retry) {
    const refreshed = await silentRefresh();
    if (refreshed) {
      return request(path, { ...options, _retry: true });
    } else {
      tokenStore.clear();
      window.dispatchEvent(new Event("auth:logout"));
      throw new Error("Session expired. Please log in again.");
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

async function silentRefresh() {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken: _refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    tokenStore.setTokens(data.data.accessToken, data.data.refreshToken);
    return true;
  } catch { return false; }
}

// Multipart upload (no JSON content-type header)
async function upload(path, formData) {
  const headers = {};
  if (_accessToken) headers["Authorization"] = `Bearer ${_accessToken}`;
  const res = await fetch(`${BASE_URL}${path}`, { method: "POST", headers, body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

// ── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login:    (body) => request("/auth/login",    { method: "POST", body: JSON.stringify(body) }),
  logout:   ()     => request("/auth/logout",   { method: "POST" }),
  getMe:    ()     => request("/auth/me"),
  updateMe: (body) => request("/auth/me", { method: "PATCH", body: JSON.stringify(body) }),
  changePassword: (body) => request("/auth/me/password", { method: "PATCH", body: JSON.stringify(body) }),
};

// ── Issues ─────────────────────────────────────────────────────────────────
export const issuesApi = {
  list:      (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([,v]) => v !== "" && v != null))
    ).toString();
    return request(`/issues${q ? `?${q}` : ""}`);
  },
  get:       (id)   => request(`/issues/${id}`),
  create:    (form) => upload("/issues", form),
  update:    (id, body) => request(`/issues/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete:    (id)   => request(`/issues/${id}`, { method: "DELETE" }),
  vote:      (id)   => request(`/issues/${id}/vote`, { method: "POST" }),
  stats:     ()     => request("/issues/stats"),
  nearby:    (lng, lat, radius = 2000) => request(`/issues/nearby?lng=${lng}&lat=${lat}&radius=${radius}`),
  myReports: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/issues/my/reports${q ? `?${q}` : ""}`);
  },
};

// ── AI ─────────────────────────────────────────────────────────────────────
export const aiApi = {
  analyzeBase64: (imageBase64, mimeType = "image/jpeg") =>
    request("/ai/analyze", { method: "POST", body: JSON.stringify({ imageBase64, mimeType }) }),
  analyzeFile: (file) => {
    const form = new FormData();
    form.append("photo", file);
    return upload("/ai/analyze", form);
  },
};

export default request;
