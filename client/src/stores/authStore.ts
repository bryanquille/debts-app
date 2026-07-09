// stores/authStore.ts — Store de autenticación con Zustand
//
// Zustand es una librería minimalista para manejar estado global.
// A diferencia de Redux, no requiere providers, actions ni reducers.
// Solo defines un hook con estado y funciones, y lo usas donde sea.
//
// Este store maneja:
// - user: datos del usuario autenticado (null si no hay sesión)
// - accessToken: token JWT para autenticar requests
// - login, logout, setAccessToken: funciones para modificar el estado

import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  // Funciones
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  login: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }),

  setAccessToken: (accessToken) =>
    set({ accessToken }),

  setUser: (user) =>
    set({ user }),
}));