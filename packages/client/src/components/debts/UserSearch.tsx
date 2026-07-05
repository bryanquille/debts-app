import { useState, useRef, useEffect } from "react";
import { useUserSearch } from "../../hooks/useUsers";

interface UserSearchProps {
  value: { id?: string; name: string };
  onChange: (value: { id?: string; name: string }) => void;
  placeholder?: string;
}

export function UserSearch({ value, onChange, placeholder = "Buscar usuario..." }: UserSearchProps) {
  const [query, setQuery] = useState(value.name || "");
  const [isOpen, setIsOpen] = useState(false);
  const [hasSelected, setHasSelected] = useState(!!value.id);
  const { data: results = [] } = useUserSearch(query);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setHasSelected(false);
    onChange({ name: e.target.value });
  };

  const handleSelect = (user: { id: string; name: string; email: string }) => {
    setQuery(`${user.name} (${user.email})`);
    setIsOpen(false);
    setHasSelected(true);
    onChange({ id: user.id, name: user.name });
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    setHasSelected(false);
    onChange({ name: "" });
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {hasSelected && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            Cambiar
          </button>
        )}
      </div>
      {isOpen && query.length >= 2 && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelect(user)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
            >
              <span className="font-medium">{user.name}</span>
              <span className="text-gray-500 text-sm ml-2">{user.email}</span>
            </button>
          ))}
        </div>
      )}
      {isOpen && query.length >= 2 && results.length === 0 && !hasSelected && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-3 text-sm text-gray-500">
          Usuario no encontrado. Se guardará como "{query}".
        </div>
      )}
    </div>
  );
}
