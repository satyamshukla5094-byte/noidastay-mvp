"use client";

import { useState } from "react";
import Link from "next/link";
import { User, ShieldCheck, Settings, ShieldAlert, BadgeInfo, LogOut, ChevronRight, Search, Heart, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [role, setRole] = useState<"customer" | "owner">("customer");

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Header */}
      <header className="px-6 py-8 bg-white border-b border-gray-100 flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <button onClick={handleLogout} className="text-gray-500 hover:text-gray-900 transition-colors p-2">
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold">
            T
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Test User</h2>
            <p className="text-gray-500 text-sm">test@noidastay.com</p>
          </div>
        </div>
      </header>

      {/* Role Toggle */}
      <div className="px-6 py-6 border-b border-gray-100 bg-white">
        <div className="bg-gray-100 p-1 rounded-xl flex items-center shadow-inner">
          <button 
            onClick={() => setRole("customer")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === 'customer' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Customer
          </button>
          <button 
            onClick={() => setRole("owner")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === 'owner' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Owner
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col gap-8 bg-white">
        {role === "customer" ? (
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
            
            <button className="flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                <span className="text-gray-700 font-medium">Personal Information</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
            
            <button className="flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                <span className="text-gray-700 font-medium">Login & Security</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
            
            <button className="flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                <span className="text-gray-700 font-medium">App Settings</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-8">Legal</h3>
            
            <button className="flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <BadgeInfo className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                <span className="text-gray-700 font-medium">Terms of Service</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button className="flex items-center justify-between py-4 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                <span className="text-gray-700 font-medium">Privacy Policy</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
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
             <Link href="/dashboard" className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors w-full sm:w-auto mt-2">
               Go to Dashboard
             </Link>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 pb-safe">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between text-xs font-medium text-gray-500">
          <Link href="/" className="flex flex-col items-center gap-1 hover:text-gray-900 transition-colors">
            <Search className="h-6 w-6" />
            <span>Explore</span>
          </Link>
          <button className="flex flex-col items-center gap-1 hover:text-gray-900 transition-colors">
            <Heart className="h-6 w-6" />
            <span>Favorites</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-gray-900 transition-colors">
            <Bell className="h-6 w-6" />
            <span>Updates</span>
          </button>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-emerald-600 transition-colors">
            <User className="h-6 w-6" />
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
