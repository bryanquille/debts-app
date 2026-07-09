// lib/axios.ts — Instancia de Axios preconfigurada
//
// Axios es un cliente HTTP que usaremos para comunicarnos con el backend.
// Esta instancia tiene:
// - baseURL: apunta al backend (el proxy de Vite redirige /api)
// - Interceptor: agrega automáticamente el token JWT a cada request
// - Interceptor: si el token expira (401), intenta refrescarlo

import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Necesario para cookies (refresh token)
});

// Interceptor de request: agrega el access token al header
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response: si recibimos 401, intentamos refrescar el token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado refrescar aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          "/api/auth/refresh",
          {},
          { withCredentials: true }
        );
        const newToken = data.accessToken;

        // Actualizar el store con el nuevo token
        useAuthStore.getState().setAccessToken(newToken);

        // Reintentar la request original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        // Si no se pudo refrescar, cerrar sesión
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;