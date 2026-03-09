import { api } from "@/boot/axios";

export const usersService = {
  async getTop(limit = 5) {
    const { data } = await api.get("/api/users/top", { params: { limit } });
    return data;
  },
  async register(payload) {
    const { data } = await api.post("/api/auth/register", payload);
    return data;
  },
  async login(payload) {
    const { data } = await api.post("/api/auth/login", payload);
    return data;
  },
  async logout() {
    return api.post("/api/auth/logout");
  },
  async getMe() {
    const { data } = await api.get("/api/users/me");
    return data;
  },
  async updateMe(payload) {
    const { data } = await api.put("/api/users/me", payload);
    return data;
  },
  async getByUsername(username) {
    const { data } = await api.get(`/api/users/username/${encodeURIComponent(username)}`);
    return data;
  },
  async search(q, limit = 20, page = 1) {
    const { data } = await api.get("/api/users/search", {
      params: { q, limit, page }
    });
    return data;
  }
};
