// TIP: create a .env file at the root with: VITE_API_URL=http://localhost:3000

import axios from "axios";
import { getToken, removeToken } from "../services/auth";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

// ── Request: attach JWT ──
API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response: handle 401 globally ──
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      // Guard: don't redirect if already on login page (avoids infinite redirect loop)
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default API;