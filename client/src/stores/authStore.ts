import { create } from "zustand";
import axios from "axios";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  _initialized: boolean;

  login: (user: User, accessToken: string) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  _initialized: false,

  login: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true }),

  logout: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),

  setAccessToken: (accessToken) => set({ accessToken }),

  setUser: (user) => set({ user }),

  initialize: async () => {
    if (get()._initialized) return;
    set({ _initialized: true });

    try {
      const { data } = await axios.post<{ accessToken: string }>(
        "/api/auth/refresh",
        {},
        { withCredentials: true }
      );

      const accessToken = data.accessToken;
      set({ accessToken, isAuthenticated: true });

      const userRes = await axios.get<User>("/api/users/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });

      set({ user: userRes.data });
    } catch {
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },
}));
