const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOKEN_KEY = "ticketflow_auth_token";

let unauthorizedHandler = null;

function buildError(status, detail) {
  const error = new Error(detail || `Request gagal (${status})`);
  error.status = status;
  error.detail = detail;
  return error;
}

function normalizeDetail(detail) {
  if (Array.isArray(detail)) {
    return detail[0]?.msg || "Request tidak valid.";
  }
  return detail;
}

export const tokenStorage = {
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      return true;
    } catch {
      return false;
    }
  },
  clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Ignore storage errors in restricted browser contexts.
    }
  },
};

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function authHeaders() {
  const token = tokenStorage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const { body, isForm = false, headers = {}, ...rest } = options;
  const requestHeaders = {
    ...authHeaders(),
    ...headers,
  };

  const init = {
    ...rest,
    headers: requestHeaders,
  };

  if (body !== undefined) {
    if (isForm) {
      init.body = body;
    } else {
      requestHeaders["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`${API_URL}${path}`, init);

  if (response.status === 401) {
    tokenStorage.clearToken();
    if (typeof unauthorizedHandler === "function") {
      unauthorizedHandler();
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw buildError(response.status, normalizeDetail(errorData.detail));
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const authApi = {
  register(payload) {
    return request("/auth/register", { method: "POST", body: payload });
  },
  async login({ email, password }) {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    form.append("grant_type", "password");

    return request("/auth/login", {
      method: "POST",
      body: form.toString(),
      isForm: true,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },
  me() {
    return request("/auth/me");
  },
};

export const ticketApi = {
  list({ search = "", skip = 0, limit = 20 } = {}) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("skip", String(skip));
    params.append("limit", String(limit));
    return request(`/tickets?${params.toString()}`);
  },
  detail(id) {
    return request(`/tickets/${id}`);
  },
  create(payload) {
    return request("/tickets", { method: "POST", body: payload });
  },
  updateByEmployee(id, payload) {
    return request(`/tickets/${id}/employee`, { method: "PUT", body: payload });
  },
  updateByAdmin(id, payload) {
    return request(`/tickets/${id}/admin`, { method: "PUT", body: payload });
  },
  remove(id) {
    return request(`/tickets/${id}`, { method: "DELETE" });
  },
};

export const categoryApi = {
  list() {
    return request("/categories");
  },
  create(payload) {
    return request("/categories", { method: "POST", body: payload });
  },
  update(id, payload) {
    return request(`/categories/${id}`, { method: "PUT", body: payload });
  },
  remove(id) {
    return request(`/categories/${id}`, { method: "DELETE" });
  },
};

export const adminApi = {
  listUsers({ skip = 0, limit = 20 } = {}) {
    const params = new URLSearchParams();
    params.append("skip", String(skip));
    params.append("limit", String(limit));
    return request(`/users?${params.toString()}`);
  },
  updateUserRole(userId, role) {
    return request(`/users/${userId}/role`, { method: "PUT", body: { role } });
  },
  dashboard() {
    return request("/dashboard");
  },
};

export async function checkHealth() {
  try {
    const data = await request("/health");
    return data.status === "healthy";
  } catch {
    return false;
  }
}
