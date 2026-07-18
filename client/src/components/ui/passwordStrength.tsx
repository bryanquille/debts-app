interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score === 0) return { score, label: "", color: "bg-gray-200" };
  if (score === 1) return { score, label: "Débil", color: "bg-red-500" };
  if (score === 2) return { score, label: "Regular", color: "bg-orange-500" };
  if (score === 3) return { score, label: "Buena", color: "bg-yellow-500" };
  return { score, label: "Fuerte", color: "bg-green-500" };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const { score, label, color } = getStrength(password);

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= score ? color : "bg-gray-200 dark:bg-gray-600"}`} />
        ))}
      </div>
      {label && (
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Fortaleza: <span className="font-medium">{label}</span>
        </p>
      )}
      <ul className="space-y-0.5">
        <li className={`text-xs ${password.length >= 10 ? "text-green-500" : "text-gray-500"}`}>
          {password.length >= 10 ? "✓" : "○"} Mínimo 10 caracteres
        </li>
        <li className={`text-xs ${/[A-Z]/.test(password) ? "text-green-500" : "text-gray-500"}`}>
          {/[A-Z]/.test(password) ? "✓" : "○"} Al menos una mayúscula
        </li>
        <li className={`text-xs ${/[0-9]/.test(password) ? "text-green-500" : "text-gray-500"}`}>
          {/[0-9]/.test(password) ? "✓" : "○"} Al menos un número
        </li>
        <li className={`text-xs ${/[^A-Za-z0-9]/.test(password) ? "text-green-500" : "text-gray-500"}`}>
          {/[^A-Za-z0-9]/.test(password) ? "✓" : "○"} Al menos un carácter especial
        </li>
      </ul>
    </div>
  );
}
