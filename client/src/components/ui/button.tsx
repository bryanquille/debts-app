import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-blue-400",
  secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400 disabled:bg-gray-100 disabled:text-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:disabled:bg-gray-600 dark:disabled:text-gray-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300 dark:bg-red-500 dark:hover:bg-red-600",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-200 focus:ring-gray-400 dark:text-gray-300 dark:hover:bg-gray-700",
  outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:border-blue-400 focus:ring-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
};

const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button ref={ref}
        className={cn("inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed", variants[variant], sizes[size], className)}
        disabled={disabled || loading} {...props}
      >
        {loading && (
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
