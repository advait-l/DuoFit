import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, id, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors placeholder:text-gray-400 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        } ${className}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
