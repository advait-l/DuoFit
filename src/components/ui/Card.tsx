import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export default function Card({ children, className = "", padding = true, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`rounded-2xl bg-white shadow-sm border border-gray-100 ${padding ? "p-4" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
