"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, ShieldCheck, Settings, ShieldAlert, BadgeInfo,
  LogOut, ChevronRight, Heart, Star, MessageCircle, ArrowLeft,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ActivitySummary {
  favoritesCount: number;
  reviewsCount: number;
  leadsCount: number;
}

function SkeletonLine({ w = "w-1/2" }: { w?: string }) {
  return <div className={`h-4 bg-gray-200 rounded animate-pulse ${w}`} />;
}

export default function ProfilePage() {
  const router = useRouter();
  const [role, setRole] = useState<"customer" | "owner">("customer");
  const [displayName, setDisplayName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [initials, setInitials] = useState<string>("?");
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<ActivitySummary | null>(null);
  const [kycStatus, setKycStatus] = useState<"pending" | "verified" | "rejected">("pending");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      setUserId(user.id);
      const metaFullName = (user.user_metadata?.full_name as string | undefined) ?? "";
      const firstName = (user.user_metadata?.first_name as string | undefined) ?? "";
      const lastName = (user.user_metadata?.last_name as string | undefined) ?? "";
      const derivedName =
        metaFullName || `${firstName} ${lastName}`.trim() || user.email?.split("@")[0] || "Guest";

      setDisplayName(derivedName);
      setEmail(user.email ?? "");

      const parts = derivedName.split(" ").filter(Boolean);
      setInitials(
        parts.length === 1
          ? parts[0]!.charAt(0).toUpperCase()
          : `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
      );

      // Load activity summary in parallel
      const [favsRes, reviewsRes, leadsRes] = await Promise.all([
        supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("student_id", user.id),
      ]);

      setActivity({
        favoritesCount: favsRes.count ?? 0,
        reviewsCount: reviewsRes.count ?? 0,
        leadsCount: leadsRes.count ?? 0,
      });
      const { data: profile } = await supabase.from("profiles").select("kyc_status").eq("id", user.id).single();
      setKycStatus((profile as any)?.kyc_status || "pending");
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Header */}
      <header className="px-6 py-8 bg-white border-b border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors p-2" aria-label="Sign out">
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <>
              <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex flex-col gap-2">
                <SkeletonLine w="w-32" />
                <SkeletonLine w="w-48" />
              </div>
            </>
          ) : (
            <>
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{displayName}</h2>
                {email && <p className="text-gray-500 text-sm">{email}</p>}
              </div>
            </>
          )}
        </div>
      </header>

      {/* KYC Status */}
      <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold">KYC Trust Layer</p>
            <h3 className="text-lg font-semibold text-blue-900">Student verification status</h3>
            <p className="text-sm text-blue-700">Your documents are encrypted and protected.</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${kycStatus === "verified" ? "bg-emerald-100 text-emerald-700" : kycStatus === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
            {kycStatus === "pending" ? "Pending review" : kycStatus === "verified" ? "Verified ✅" : "Rejected"}
          </span>
        </div>
        <div className="mt-3">
          <Link href="/profile/verify" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-100 transition">
            <ShieldCheck className="h-4 w-4" /> Review KYC Documents
          </Link>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="px-6 py-6 bg-white border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">My Activity</h3>
        <div className="grid grid-cols-3 gap-4">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center gap-2 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
                <div className="h-6 w-8 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-100 rounded" />
              </div>
            ))
          ) : (
            <>
              <Link href="/favorites" className="bg-red-50 rounded-2xl p-4 flex flex-col items-center gap-1 hover:bg-red-100 transition-colors">
                <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                <span className="text-2xl font-bold text-gray-900">{activity?.favoritesCount ?? 0}</span>
                <span className="text-xs text-gray-500 text-center">Saved PGs</span>
              </Link>
              <div className="bg-amber-50 rounded-2xl p-4 flex flex-col items-center gap-1">
                <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                <span className="text-2xl font-bold text-gray-900">{activity?.reviewsCount ?? 0}</span>
                <span className="text-xs text-gray-500 text-center">Reviews</span>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 flex flex-col items-center gap-1">
                <MessageCircle className="h-6 w-6 text-emerald-600" />
                <span className="text-2xl font-bold text-gray-900">{activity?.leadsCount ?? 0}</span>
                <span className="text-xs text-gray-500 text-center">Inquiries</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Role Toggle */}
      <div className="px-6 py-5 border-b border-gray-100 bg-white">
        <div className="bg-gray-100 p-1 rounded-xl flex items-center shadow-inner">
          <button
            onClick={() => {
              setRole("customer");
              if (typeof window !== "undefined") window.localStorage.setItem("noidastay_role", "tenant");
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === "customer" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            Customer
          </button>
          <button
            onClick={() => {
              setRole("owner");
              if (typeof window !== "undefined") window.localStorage.setItem("noidastay_role", "owner");
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === "owner" ? "bg-white shadow-sm text-emerald-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            Owner
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col gap-8 bg-white">
        {role === "customer" ? (
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
            {[
              { icon: User, label: "Personal Information" },
              { icon: ShieldCheck, label: "Login & Security" },
              { icon: Settings, label: "App Settings" },
            ].map(({ icon: Icon, label }) => (
              <button key={label} className="flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  <span className="text-gray-700 font-medium">{label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            ))}

            <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-8">Legal</h3>
            {[
              { icon: BadgeInfo, label: "Terms of Service" },
              { icon: ShieldAlert, label: "Privacy Policy" },
            ].map(({ icon: Icon, label }) => (
              <button key={label} className="flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group last:border-0">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  <span className="text-gray-700 font-medium">{label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col px-4 py-8 bg-emerald-50 rounded-2xl border border-emerald-100 items-center justify-center text-center gap-4">
            <div className="p-4 bg-emerald-100 rounded-full text-emerald-600 mb-2">
              <Settings className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Owner Dashboard</h3>
            <p className="text-gray-600 text-sm max-w-xs">
              Manage your properties, respond to leads, and get your properties verified here.
            </p>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors w-full sm:w-auto mt-2"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
