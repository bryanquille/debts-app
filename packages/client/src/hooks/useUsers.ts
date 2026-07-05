import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface SearchUser {
  id: string;
  name: string;
  email: string;
}

export function useUserSearch(q: string) {
  return useQuery<SearchUser[]>({
    queryKey: ["users", "search", q],
    queryFn: async () => {
      if (q.length < 2) return [];
      const res = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
      return res.data;
    },
    enabled: q.length >= 2,
  });
}
