import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";
const TOKEN_KEY = "eticket_access_token";

export const tokenStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: async ({ email, name, password }) => {
    const response = await api.post("/auth/register", { email, name, password });
    return response.data;
  },
  login: async ({ email, password }) => {
    const payload = new URLSearchParams({
      username: email,
      password,
      grant_type: "password",
    });

    const response = await api.post("/auth/login", payload.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
  },
  me: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

export const categoryApi = {
  list: async () => {
    const response = await api.get("/categories");
    return response.data;
  },
  create: async (payload) => {
    const response = await api.post("/categories", payload);
    return response.data;
  },
  update: async (catId, payload) => {
    const response = await api.put(`/categories/${catId}`, payload);
    return response.data;
  },
};

export const ticketApi = {
  list: async (params = {}) => {
    const response = await api.get("/tickets", { params });
    return response.data;
  },
  detail: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await api.post("/tickets", payload);
    return response.data;
  },
  updateByEmployee: async (ticketId, payload) => {
    const response = await api.put(`/tickets/${ticketId}/employee`, payload);
    return response.data;
  },
  updateByAdmin: async (ticketId, payload) => {
    const response = await api.put(`/tickets/${ticketId}/admin`, payload);
    return response.data;
  },
};

export const adminApi = {
  listUsers: async (params = {}) => {
    const response = await api.get("/users", { params });
    return response.data;
  },
  updateUserRole: async (userId, role) => {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
  },
  dashboard: async () => {
    const response = await api.get("/dashboard");
    return response.data;
  },
};
