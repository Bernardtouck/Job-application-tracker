// src/api/axios.ts

import axios from "axios";
import { getToken, removeToken } from "../services/auth";

const API = axios.create({
  baseURL: "http://localhost:3000",
});

// Add JWT token to headers if exists
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

// handle 401 errors globally (e.g., token expired)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired - logout user and redirect to login page
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default API;