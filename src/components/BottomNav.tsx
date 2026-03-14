"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, Bell, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: "/search", label: "Search", icon: Search },
    { href: "/favorites", label: "Favorite", icon: Heart },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 pb-safe md:hidden">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between text-xs font-medium text-gray-500">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? "text-emerald-600" : "hover:text-gray-900"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

