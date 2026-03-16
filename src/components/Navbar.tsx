"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, LogIn, LogOut, ChevronDown } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
  };

  const displayName =
    user?.user_metadata?.full_name ||
    `${user?.user_metadata?.first_name ?? ""} ${user?.user_metadata?.last_name ?? ""}`.trim() ||
    user?.email?.split("@")[0] ||
    "Profile";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold text-emerald-600 tracking-tight">
          NoidaStay
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/search" className="hover:text-gray-900 transition-colors">Search</Link>
          <Link href="/favorites" className="hover:text-gray-900 transition-colors">Favorites</Link>
          <Link href="/verify" className="hover:text-gray-900 transition-colors">Verify</Link>
          <Link href="/my-stay" className="rounded-full border border-purple-200 px-3 py-1 text-purple-700 hover:bg-purple-50 transition-colors">My Stay</Link>
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-24 bg-gray-100 rounded-full animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                  {initials || <User className="h-4 w-4" />}
                </div>
                <span className="text-sm font-medium text-gray-800 max-w-[100px] truncate hidden sm:block">
                  {displayName}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    My Profile
                  </Link>
                  <Link
                    href="/favorites"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    My Favorites
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
