"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User, ShieldCheck, ArrowRight, Calendar } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [referrerCode, setReferrerCode] = useState("");
  const [role, setRole] = useState<"student" | "owner">("student");
  const [userId, setUserId] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string>("");

  useEffect(() => {
    async function checkProfile() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }
      
      setUserId(session.user.id);

      // Check if profile exists and has enough data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*, referral_code")
        .eq("id", session.user.id)
        .single();

      if (profile?.referral_code) {
        setReferralCode(profile.referral_code);
      }

      // If profile has a first name, they might already be onboarded
      if (profile && profile.first_name) {
        router.push("/profile");
      } else {
        setLoading(false);
      }
    }
    
    checkProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !dob || !userId) return;

    setSubmitting(true);
    const supabase = createClient();

    const generatedCode = referralCode || `${firstName.slice(0, 3).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
    const updates: any = {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      dob,
      role,
      referral_code: generatedCode,
      updated_at: new Date().toISOString(),
    };

    if (referrerCode) {
      const { data: referrer } = await supabase.from("profiles").select("id").eq("referral_code", referrerCode).single();
      if (referrer?.id) {
        updates.referred_by = referrer.id;
      }
    }

    const { error } = await supabase.from("profiles").upsert(updates, { onConflict: "id" });

    if (error) {
      console.error("Error saving profile:", error.message);
      setSubmitting(false);
      alert("Failed to save profile. Please try again.");
    } else {
      if (role === "student") {
        router.push(`/?welcome=${encodeURIComponent(firstName)}`);
      } else {
        router.push("/owner/verify");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 px-6 py-12 max-w-md mx-auto w-full flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Profile</h1>
          <p className="text-gray-500">
            Let's get to know you better. Please provide some basic details to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
          {/* Personal Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all"
                />
                <Calendar className="absolute right-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referral code (optional)</label>
              <input
                type="text"
                value={referrerCode}
                onChange={(e) => setReferrerCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                placeholder="Enter friend’s referral code"
              />
            </div>

            {referralCode && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                Your referral code: <strong>{referralCode}</strong>
              </div>
            )}
          </div>

          <div className="w-full h-px bg-gray-100 my-4"></div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Choose your role</label>
            
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`w-full flex items-center p-4 border-2 rounded-xl transition-all ${
                role === "student"
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-200 bg-white"
              }`}
            >
              <div className={`p-3 rounded-full mr-4 ${role === "student" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                <User className="h-6 w-6" />
              </div>
              <div className="text-left flex-1">
                <h3 className={`font-semibold ${role === "student" ? "text-emerald-900" : "text-gray-900"}`}>I'm a Student</h3>
                <p className={`text-sm ${role === "student" ? "text-emerald-700" : "text-gray-500"}`}>Looking for a place to stay</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole("owner")}
              className={`w-full flex items-center p-4 border-2 rounded-xl transition-all ${
                role === "owner"
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-200 bg-white"
              }`}
            >
              <div className={`p-3 rounded-full mr-4 ${role === "owner" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="text-left flex-1">
                <h3 className={`font-semibold ${role === "owner" ? "text-emerald-900" : "text-gray-900"}`}>I'm a PG Owner</h3>
                <p className={`text-sm ${role === "owner" ? "text-emerald-700" : "text-gray-500"}`}>Want to list my properties</p>
              </div>
            </button>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-70"
            >
              {submitting ? "Saving..." : "Continue"}
              {!submitting && <ArrowRight className="h-5 w-5" />}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
