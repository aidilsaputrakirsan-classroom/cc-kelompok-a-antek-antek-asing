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
  changePassword(oldPassword, newPassword) {
    return request("/auth/change-password", {
      method: "POST",
      body: { old_password: oldPassword, new_password: newPassword },
    });
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
  departmentAnalytics() {
    return request("/dashboard/department-analytics");
  },
  responseTimeAnalytics() {
    return request("/dashboard/response-time-analytics");
  },
  // Pending users approval workflow
  pendingUsers({ skip = 0, limit = 20 } = {}) {
    const params = new URLSearchParams();
    params.append("skip", String(skip));
    params.append("limit", String(limit));
    return request(`/admin/pending-users?${params.toString()}`);
  },
  // Departments CRUD
  getDepartments() {
    return request("/admin/departments");
  },
  createDepartment(payload) {
    return request("/admin/departments", { method: "POST", body: payload });
  },
  updateDepartment(deptId, payload) {
    return request(`/admin/departments/${deptId}`, { method: "PUT", body: payload });
  },
  deleteDepartment(deptId) {
    return request(`/admin/departments/${deptId}`, { method: "DELETE" });
  },
  updateUserDepartment(userId, departmentId) {
    return request(`/admin/users/${userId}/department`, {
      method: "PUT",
      body: { department_id: departmentId },
    });
  },
  get(path) {
    return request(path);
  },
  post(path, payload) {
    return request(path, { method: "POST", body: payload });
  },
};

export const userApi = {
  updateUserAvatar(avatarIndex) {
    return request("/users/me/avatar", { method: "PUT", body: { avatar_index: avatarIndex } });
  },
  updateUserProfile(name, email) {
    return request("/auth/me", { method: "PUT", body: { name, email } });
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

// Generic API client for other services
export const apiClient = {
  get(path, options = {}) {
    const { params, ...rest } = options;
    let url = path;
    if (params) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        query.append(key, value);
      });
      url = `${path}?${query.toString()}`;
    }
    return request(url, { method: "GET", ...rest });
  },
  post(path, body, options = {}) {
    return request(path, { method: "POST", body, ...options });
  },
  put(path, body, options = {}) {
    return request(path, { method: "PUT", body, ...options });
  },
  patch(path, body, options = {}) {
    return request(path, { method: "PATCH", body, ...options });
  },
  delete(path, options = {}) {
    return request(path, { method: "DELETE", ...options });
  },
};

