const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: isFormData
      ? { ...(options.headers || {}) }
      : { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  login: (username, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
  admins: () => request("/admin"),
  addAdmin: (username, password) =>
    request("/admin", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  removeAdmin: (id) => request(`/admin/${id}`, { method: "DELETE" }),
  events: () => request("/event"),
  addEvent: (event) => {
    const form = new FormData();
    Object.entries(event).forEach(([key, value]) => {
      if (key === "posterFile") {
        if (value) form.append("poster", value);
      } else if (value !== "") form.append(key, value);
    });
    return request("/event", { method: "POST", body: form });
  },
  updateEvent: (id, event) => {
    const form = new FormData();
    Object.entries(event).forEach(([key, value]) => {
      if (key === "posterFile") {
        if (value) form.append("poster", value);
      } else if (value !== "") form.append(key, value);
    });
    return request(`/event/${id}`, { method: "PUT", body: form });
  },
  removeEvent: (id) => request(`/event/${id}`, { method: "DELETE" }),
};
