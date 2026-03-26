"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/checklist",
    label: "Checklist",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" />
        {active && <circle cx="9" cy="11" r="0" fill="currentColor" />}
      </svg>
    ),
  },
  {
    href: "/meal-log",
    label: "Meals",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 11l1-1a4 4 0 015.66 0L11 11a4 4 0 005.66 0L18 9" strokeLinecap="round" />
        <path d="M3 7l1-1a4 4 0 015.66 0L11 7a4 4 0 005.66 0L18 5" strokeLinecap="round" />
        <path d="M3 15l1-1a4 4 0 015.66 0L11 15a4 4 0 005.66 0L18 13" strokeLinecap="round" />
        {active && <line x1="3" y1="20" x2="21" y2="20" strokeLinecap="round" />}
      </svg>
    ),
  },
  {
    href: "/rewards",
    label: "Rewards",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-3 text-xs font-medium transition-colors ${
                active ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {icon(active)}
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
