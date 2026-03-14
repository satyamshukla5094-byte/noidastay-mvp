"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    email: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Alpha keyboard validation for names
    if (name === "firstName" || name === "lastName") {
      setFormData(prev => ({ ...prev, [name]: value.replace(/[^a-zA-Z\s]/g, '') }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    try {
      // Generate a temporary password since the design doesn't include it.
      const tempPassword = `noidastay-${Date.now().toString(36)}`;
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            dob: formData.dob,
          },
        },
      });
      if (error) {
        console.warn("Supabase sign-up failed (MVP env):", error.message);
      }
    } catch (err) {
      console.warn("Supabase sign-up exception:", err);
    } finally {
      // After sign-up, send user to role selection / verification flow
      router.push("/profile");
    }
  };

  const isFormValid = formData.firstName && formData.lastName && formData.dob && formData.email.includes("@");

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center border-b border-gray-100 sticky top-0 bg-white z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-900" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 mr-5">Finish signing up</h1>
      </header>

      <div className="flex-1 px-6 py-6 max-w-md mx-auto w-full flex flex-col">
        <form onSubmit={handleContinue} className="flex flex-col gap-5 flex-1">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Legal name</h2>
            <div className="border border-gray-400 rounded-xl overflow-hidden focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all">
              <div className="p-3 border-b border-gray-400 relative">
                <span className="text-xs text-gray-500 absolute top-2 left-3">First name on ID</span>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full mt-3 outline-none text-gray-900 bg-transparent text-base"
                  required
                />
              </div>
              <div className="p-3 relative bg-white z-10">
                <span className="text-xs text-gray-500 absolute top-2 left-3">Last name on ID</span>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full mt-3 outline-none text-gray-900 bg-transparent text-base"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Make sure this matches the name on your government ID.</p>
          </div>

          <div className="flex flex-col gap-1 mt-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Date of birth</h2>
            <div className="border border-gray-400 rounded-xl overflow-hidden focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all">
              <div className="p-3 relative">
                <span className="text-xs text-gray-500 absolute top-2 left-3">Date</span>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full mt-3 outline-none text-gray-900 bg-transparent text-base"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">To sign up, you need to be at least 18. Your birthday won't be shared with other people who use NoidaStay.</p>
          </div>

          <div className="flex flex-col gap-1 mt-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Email</h2>
            <div className="border border-gray-400 rounded-xl overflow-hidden focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all">
              <div className="p-3 relative">
                <span className="text-xs text-gray-500 absolute top-2 left-3">Email address</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full mt-3 outline-none text-gray-900 bg-transparent text-base"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">We'll email you trip confirmations and receipts.</p>
          </div>

          <p className="text-xs text-gray-500 mt-4 mb-2">
            By selecting <strong>Agree and continue</strong>, I agree to NoidaStay's <span className="underline font-medium text-gray-900 cursor-pointer">Terms of Service</span>, <span className="underline font-medium text-gray-900 cursor-pointer">Payments Terms of Service</span>, and <span className="underline font-medium text-gray-900 cursor-pointer">Nondiscrimination Policy</span> and acknowledge the <span className="underline font-medium text-gray-900 cursor-pointer">Privacy Policy</span>.
          </p>

          <button 
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3.5 rounded-xl font-semibold text-white transition-colors mt-auto mb-8 ${isFormValid ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            Agree and continue
          </button>
        </form>
      </div>
    </main>
  );
}
