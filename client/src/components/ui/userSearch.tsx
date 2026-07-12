import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import api from "@/lib/axios";
import type { User } from "@/types";

interface UserSearchProps {
  label: string;
  onSelect: (user: User | null) => void;
  placeholder?: string;
}

export function UserSearch({ label, onSelect, placeholder = "Buscar usuario..." }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    setSelectedUser(null);
    onSelect(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get<User[]>(`/users/search?q=${encodeURIComponent(value)}`);
        setResults(res.data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (user: User) => {
    setSelectedUser(user);
    setQuery(user.name);
    setOpen(false);
    onSelect(user);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedUser(null);
    setResults([]);
    setOpen(false);
    onSelect(null);
  };

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={selectedUser ? selectedUser.name : placeholder}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-8 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
          {query && (
            <button type="button" onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        )}
        {open && results.length > 0 && (
          <div className="absolute z-50 mt-1 w-full max-w-[calc(100vw-3rem)] rounded-lg border bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
            {results.map((user) => (
              <button type="button" key={user.id} onClick={() => handleSelect(user)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {open && results.length === 0 && query.length >= 2 && !loading && (
          <div className="absolute z-50 mt-1 w-full max-w-[calc(100vw-3rem)] rounded-lg border bg-white p-3 text-center text-sm text-gray-500 shadow-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
            No se encontraron usuarios. Se guardará el nombre en texto.
          </div>
        )}
      </div>
    </div>
  );
}
